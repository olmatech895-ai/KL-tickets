
import { parseISO, isSameDay } from 'date-fns'

/**
 * @param {Array} todosWithDueDate 
 * @param {Date} date
 */
export function getTodosForDate(todosWithDueDate, date) {
  return todosWithDueDate.filter((t) => isSameDay(parseISO(t.dueDate), date))
}

/**
 * @param {Array} dayTodos
 * @returns {{ allDay: Array, byHour: Record<number, Array> }}
 */
export function splitTodosByTime(dayTodos) {
  const isAllDay = (t) => t.allDay === true || (t.allDay !== false && !t.dueTime)
  const allDay = (dayTodos || []).filter(isAllDay)
  const byHour = {}
  for (let h = 0; h < 24; h++) byHour[h] = []
  ;(dayTodos || []).forEach((t) => {
    if (isAllDay(t)) return
    const [hh] = (t.dueTime || '').split(':').map(Number)
    if (hh >= 0 && hh <= 23) byHour[hh].push(t)
  })
  return { allDay, byHour }
}

/**
 * @param {Array} dayTodos 
 * @param {Array} calendarEvents 
 * @param {Date} date
 */
export function getPlannerItemsForDate(dayTodos, calendarEvents, date) {
  const dayEvents = (calendarEvents || []).filter(
    (e) => e.dueDate && isSameDay(parseISO(e.dueDate), date)
  )
  const eventItems = dayEvents.map((e) => ({ ...e, isCalendarEvent: true }))
  const todoItems = (dayTodos || []).map((t) => ({ ...t, isCalendarEvent: !!(t.calendarOnly || t.notifyWhenDue) }))
  return [...todoItems, ...eventItems]
}
