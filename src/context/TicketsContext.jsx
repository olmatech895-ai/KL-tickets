import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { api, getAuthToken } from '../config/api'
import { wsService } from '../services/websocket'

const TicketsContext = createContext(null)

export const useTickets = () => {
  const context = useContext(TicketsContext)
  if (!context) {
    throw new Error('useTickets must be used within TicketsProvider')
  }
  return context
}

const transformTicketFromAPI = (ticket) => {
  const comments = (ticket.comments || []).map(comment => ({
    id: comment.id,
    text: comment.text,
    authorId: comment.author_id,
    authorName: comment.author_name,
    createdAt: comment.created_at,
  }))
  
  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    status: ticket.status,
    category: ticket.category,
    createdBy: ticket.created_by,
    createdByName: ticket.created_by_name,
    createdByEmail: ticket.created_by_email,
    assignedTo: ticket.assigned_to,
    assignedToName: ticket.assigned_to_name,
    estimatedTime: ticket.estimated_time,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    comments: comments,
  }
}

const transformTicketToAPI = (ticket) => ({
  title: ticket.title,
  description: ticket.description,
  priority: ticket.priority,
  category: ticket.category,
})

export const TicketsProvider = ({ children }) => {
  const { user, loading: authLoading, isIT, isAdmin } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [notificationCallback, setNotificationCallback] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!authLoading && user && !isInitialized) {
      setIsInitialized(true)
      loadTickets()
      const cleanup = setupWebSocket()
      return () => {
        cleanup()
        setIsInitialized(false)
        if (!user) {
          wsService.disconnect()
        }
      }
    } else if (!authLoading && !user) {
      setTickets([])
      setLoading(false)
      setIsInitialized(false)
      wsService.disconnect()
    }
  }, [user?.id, authLoading])

  const setupWebSocket = () => {
    if (!user) {
      return () => {}
    }

    const token = getAuthToken()
    if (!token) {
      return () => {}
    }

    if (wsService.isConnected()) {
      return () => {}
    }

    if (!wsService.isConnected() && !wsService.isConnecting) {
      wsService.connect(token)
    }

    const unsubscribeTicketCreated = wsService.on('ticket_created', (data) => {
      const transformedTicket = transformTicketFromAPI(data.ticket)
      
      setTickets(prevTickets => {
        const exists = prevTickets.some(t => t.id === transformedTicket.id)
        if (exists) {
          return prevTickets.map(t => t.id === transformedTicket.id ? transformedTicket : t)
        }
        return [...prevTickets, transformedTicket]
      })
      
      if (notificationCallback && user) {
        const userRole = user.role || user.role?.value
        if ((userRole === 'it' || userRole === 'admin')) {
          const message = data.message || `Создан новый тикет: ${transformedTicket.title}`
          const priority = data.priority || transformedTicket.priority
          notificationCallback({
            title: 'Новый тикет',
            description: message,
            variant: priority === 'high' ? 'destructive' : 'default',
          })
        }
      }
    })

    const unsubscribeTicketUpdated = wsService.on('ticket_updated', (data) => {
      const transformedTicket = transformTicketFromAPI(data.ticket)
      setTickets(prevTickets => 
        prevTickets.map(t => t.id === transformedTicket.id ? transformedTicket : t)
      )
    })

    const unsubscribeTicketDeleted = wsService.on('ticket_deleted', (data) => {
      setTickets(prevTickets => 
        prevTickets.filter(t => t.id !== data.ticket_id)
      )
    })

    const unsubscribeCommentAdded = wsService.on('comment_added', (data) => {
      if (data.ticket) {
        const transformedTicket = transformTicketFromAPI(data.ticket)
        
        setTickets(prevTickets => {
          const existingTicket = prevTickets.find(t => t.id === transformedTicket.id)
          
          if (existingTicket) {
            const updated = prevTickets.map(t => {
              if (t.id === transformedTicket.id) {
                return {
                  ...transformedTicket,
                  comments: [...transformedTicket.comments]
                }
              }
              return t
            })
            
            return updated
          } else {
            return [...prevTickets, transformedTicket]
          }
        })
      }
    })

    const unsubscribeError = wsService.on('error', (data) => {
    })

    const unsubscribeDisconnected = wsService.on('disconnected', (data) => {
    })

    return () => {
      unsubscribeTicketCreated()
      unsubscribeTicketUpdated()
      unsubscribeTicketDeleted()
      unsubscribeCommentAdded()
      unsubscribeError()
      unsubscribeDisconnected()
    }
  }

  const loadTickets = useCallback(async () => {
    if (loading) {
      return
    }
    
    try {
      setLoading(true)
      const ticketsData = await api.getTickets()
      const transformedTickets = ticketsData.map(transformTicketFromAPI)
      setTickets(transformedTickets)
    } catch (error) {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [loading])

  const createTicket = useCallback(async (ticketData) => {
    try {
      const apiData = transformTicketToAPI({
        ...ticketData,
        priority: ticketData.priority || 'medium',
        category: ticketData.category || 'other',
      })
      const newTicket = await api.createTicket(apiData)
      const transformedTicket = transformTicketFromAPI(newTicket)
      return transformedTicket
    } catch (error) {
      throw error
    }
  }, [])

  const updateTicket = useCallback(async (ticketId, updates) => {
    try {
      const apiData = {}
      if (updates.title !== undefined) apiData.title = updates.title
      if (updates.description !== undefined) apiData.description = updates.description
      if (updates.priority !== undefined) apiData.priority = updates.priority
      if (updates.status !== undefined) apiData.status = updates.status
      if (updates.category !== undefined) apiData.category = updates.category
      if (updates.assignedTo !== undefined) apiData.assigned_to = updates.assignedTo
      if (updates.estimated_time !== undefined) apiData.estimated_time = updates.estimated_time

      const updatedTicket = await api.updateTicket(ticketId, apiData)
      const transformedTicket = transformTicketFromAPI(updatedTicket)
      setTickets(prevTickets => prevTickets.map(t => t.id === ticketId ? transformedTicket : t))
      return transformedTicket
    } catch (error) {
      throw error
    }
  }, [])

  const addComment = async (ticketId, commentText) => {
    try {
      const updatedTicket = await api.addComment(ticketId, { text: commentText })
      const transformedTicket = transformTicketFromAPI(updatedTicket)
      
      setTickets(prevTickets => {
        const updated = prevTickets.map(t => 
          t.id === ticketId ? transformedTicket : t
        )
        return updated
      })
      
      return transformedTicket
    } catch (error) {
      throw error
    }
  }

  const assignTicket = async (ticketId, userId) => {
    try {
      await updateTicket(ticketId, { assignedTo: userId })
    } catch (error) {
      throw error
    }
  }

  const getTicketsForUser = useCallback(() => {
    if (!user) return []
    
    if (user.role === 'admin' || user.role === 'it') {
      return tickets
    } else {
      return tickets.filter((t) => t.createdBy === user.id)
    }
  }, [user, tickets])

  const setNotificationHandler = useCallback((callback) => {
    setNotificationCallback(() => callback)
  }, [])

  const value = useMemo(() => ({
    tickets,
    loading,
    createTicket,
    updateTicket,
    addComment,
    assignTicket,
    getTicketsForUser,
    loadTickets,
    setNotificationHandler,
  }), [tickets, loading, createTicket, updateTicket, addComment, assignTicket, getTicketsForUser, loadTickets, setNotificationHandler])

  return (
    <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>
  )
}

