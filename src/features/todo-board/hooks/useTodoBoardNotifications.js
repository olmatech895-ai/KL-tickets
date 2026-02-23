import { useState, useEffect, useCallback } from 'react'

const NOTIFICATIONS_STORAGE = 'todoBoardNotifications'
const NOTIFICATIONS_ENABLED_KEY = 'todoBoardNotificationsEnabled'

export function useTodoBoardNotifications() {
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY)
      return saved ? saved === 'true' : true
    } catch {
      return true
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE, JSON.stringify(notifications))
    } catch { }
  }, [notifications])

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, String(notificationsEnabled))
    } catch { }
  }, [notificationsEnabled])

  useEffect(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    setNotifications((prev) => {
      const filtered = prev.filter((n) => new Date(n.createdAt) >= thirtyDaysAgo)
      return filtered.length !== prev.length ? filtered : prev
    })
  }, [])

  const addNotification = useCallback((title, message, type = 'info', relatedTodoId = null) => {
    const newNotification = {
      id: String(Date.now()),
      title,
      message,
      type,
      relatedTodoId,
      read: false,
      createdAt: new Date().toISOString(),
    }
    setNotifications((prev) => [newNotification, ...prev])
    return newNotification
  }, [])

  const sendNotification = useCallback(
    (title, body, type = 'info', relatedTodoId = null) => {
      addNotification(title, body, type, relatedTodoId)
      if (
        notificationsEnabled &&
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        const n = new Notification(title, { body, icon: '/favicon.ico', badge: '/favicon.ico' })
        setTimeout(() => n.close(), 3000)
      }
    },
    [notificationsEnabled, addNotification]
  )

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif))
    )
  }, [])

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const deleteNotification = useCallback((notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }, [])

  const clearAllNotifications = useCallback(() => {
    if (typeof window !== 'undefined' && window.confirm('Вы уверены, что хотите удалить все уведомления?')) {
      setNotifications([])
    }
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    setNotifications,
    notificationsEnabled,
    setNotificationsEnabled,
    addNotification,
    sendNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    unreadNotificationsCount: unreadCount,
  }
}
