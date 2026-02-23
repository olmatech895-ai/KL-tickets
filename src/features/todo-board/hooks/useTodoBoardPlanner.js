import { useState, useEffect, useMemo, useCallback } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { CALENDAR_EVENTS_KEY, CALENDAR_NOTIFIED_KEY } from '../../../shared/constants/todo-board'
import {
  getTodosForDate as getTodosForDateHelper,
  splitTodosByTime,
  getPlannerItemsForDate as getPlannerItemsForDateHelper,
} from '../lib/planner-helpers'

const STORAGE_KEY_COLLAPSED = 'todoBoardPlannerCollapsed'
const REMINDER_MINUTES_BEFORE = 5

/**
 * @param {Array} todosWithDueDate
 * @param {{ onReminderDue?: (item: { id: string|number, title: string }) => void }} options
 */
export function useTodoBoardPlanner(todosWithDueDate = [], options = {}) {
  const { onReminderDue } = options
  const [plannerMonth, setPlannerMonth] = useState(() => startOfMonth(new Date()))
  const [plannerSelectedDate, setPlannerSelectedDate] = useState(() => new Date())
  const [calendarEvents, setCalendarEvents] = useState(() => {
    try {
      const raw = localStorage.getItem(CALENDAR_EVENTS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [plannerSidebarCollapsed, setPlannerSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_COLLAPSED) === 'true'
    } catch {
      return false
    }
  })
  const [plannerAllDayOpen, setPlannerAllDayOpen] = useState(true)
  const [plannerByHourOpen, setPlannerByHourOpen] = useState(true)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COLLAPSED, plannerSidebarCollapsed.toString())
    } catch { }
  }, [plannerSidebarCollapsed])

  useEffect(() => {
    try {
      localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(calendarEvents))
    } catch { }
  }, [calendarEvents])

  useEffect(() => {
    if (!('Notification' in window)) return
    const notifyAt = REMINDER_MINUTES_BEFORE * 60 * 1000
    const checkAndNotify = () => {
      try {
        const raw = localStorage.getItem(CALENDAR_EVENTS_KEY)
        const events = raw ? JSON.parse(raw) : []
        const notifiedRaw = localStorage.getItem(CALENDAR_NOTIFIED_KEY)
        const notified = notifiedRaw ? JSON.parse(notifiedRaw) : []
        const now = new Date()
        let changed = false
        events.forEach((ev) => {
          if (!ev.notify || !ev.dueDate) return
          const due = ev.dueTime
            ? new Date(`${ev.dueDate}T${ev.dueTime}:00`)
            : new Date(ev.dueDate + 'T23:59:59')
          const dueMinus5 = new Date(due.getTime() - notifyAt)
          if (now < dueMinus5 || notified.includes(ev.id)) return
          if (Notification.permission === 'default') Notification.requestPermission()
          if (Notification.permission === 'granted') {
            new Notification(ev.title, {
              body: ev.dueTime ? `Через ${REMINDER_MINUTES_BEFORE} мин — ${ev.dueTime}` : 'Напоминание на этот день',
            })
            onReminderDue?.({ id: ev.id, title: ev.title })
            notified.push(ev.id)
            changed = true
          }
        })
        todosWithDueDate.forEach((t) => {
          if (!t.notifyWhenDue || !t.dueDate || notified.includes(t.id)) return
          const due = t.dueTime
            ? new Date(`${t.dueDate}T${t.dueTime}:00`)
            : new Date(t.dueDate + 'T23:59:59')
          const dueMinus5 = new Date(due.getTime() - notifyAt)
          if (now < dueMinus5) return
          if (Notification.permission === 'default') Notification.requestPermission()
          if (Notification.permission === 'granted') {
            new Notification(t.title, {
              body: t.dueTime ? `Через ${REMINDER_MINUTES_BEFORE} мин — ${t.dueTime}` : 'Напоминание на этот день',
            })
            onReminderDue?.({ id: t.id, title: t.title })
            notified.push(t.id)
            changed = true
          }
        })
        if (changed) localStorage.setItem(CALENDAR_NOTIFIED_KEY, JSON.stringify(notified))
      } catch { }
    }
    checkAndNotify()
    const id = setInterval(checkAndNotify, 60 * 1000)
    return () => clearInterval(id)
  }, [todosWithDueDate, onReminderDue])

  const addCalendarEvent = useCallback((event) => {
    const id = `cal-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const item = {
      id,
      title: event.title,
      dueDate: event.dueDate,
      dueTime: event.dueTime || null,
      notify: !!event.notify,
      createdAt: new Date().toISOString(),
    }
    setCalendarEvents((prev) => [...prev, item])
    return item
  }, [])

  const removeCalendarEvent = useCallback((id) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const plannerCalendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(plannerMonth), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(plannerMonth), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [plannerMonth])

  const getTodosForDate = useCallback(
    (date) => getTodosForDateHelper(todosWithDueDate, date),
    [todosWithDueDate]
  )

  const getTodosForDateByTime = useCallback(
    (date) => splitTodosByTime(getTodosForDate(date)),
    [getTodosForDate]
  )

  const getPlannerItemsForDate = useCallback(
    (date) =>
      getPlannerItemsForDateHelper(
        getTodosForDateHelper(todosWithDueDate, date),
        calendarEvents,
        date
      ),
    [todosWithDueDate, calendarEvents]
  )

  const getPlannerItemsForDateByTime = useCallback(
    (date) => splitTodosByTime(getPlannerItemsForDate(date)),
    [getPlannerItemsForDate]
  )

  return {
    plannerMonth,
    setPlannerMonth,
    plannerSelectedDate,
    setPlannerSelectedDate,
    calendarEvents,
    setCalendarEvents,
    plannerSidebarCollapsed,
    setPlannerSidebarCollapsed,
    plannerAllDayOpen,
    setPlannerAllDayOpen,
    plannerByHourOpen,
    setPlannerByHourOpen,
    addCalendarEvent,
    removeCalendarEvent,
    plannerCalendarDays,
    getTodosForDate,
    getTodosForDateByTime,
    getPlannerItemsForDate,
    getPlannerItemsForDateByTime,
  }
}
