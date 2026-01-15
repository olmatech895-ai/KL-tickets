import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../config/api'
import { wsService } from '../services/websocket'

const TicketsContext = createContext(null)

export const useTickets = () => {
  const context = useContext(TicketsContext)
  if (!context) {
    throw new Error('useTickets must be used within TicketsProvider')
  }
  return context
}

// Функция для преобразования данных из API в формат frontend
const transformTicketFromAPI = (ticket) => {
  // Ensure comments array exists and is properly formatted
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

// Функция для преобразования данных из frontend в формат API
const transformTicketToAPI = (ticket) => ({
  title: ticket.title,
  description: ticket.description,
  priority: ticket.priority,
  category: ticket.category,
})

export const TicketsProvider = ({ children }) => {
  const { user, loading: authLoading, isIT, isAdmin } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false) // Start with false, will be set to true when loading
  const [notificationCallback, setNotificationCallback] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Загружаем тикеты только если пользователь авторизован и еще не загружали
    if (!authLoading && user && !isInitialized) {
      console.log('🔄 Initializing tickets context for user:', user.id)
      setIsInitialized(true)
      loadTickets()
      
      // Setup WebSocket
      const cleanup = setupWebSocket()
      
      // Cleanup on unmount or user change
      return () => {
        console.log('🧹 Cleaning up tickets context')
        cleanup()
        setIsInitialized(false)
        // Disconnect only if user is logging out
        if (!user) {
          wsService.disconnect()
        }
      }
    } else if (!authLoading && !user) {
      console.log('🧹 User logged out, clearing tickets')
      setTickets([])
      setLoading(false)
      setIsInitialized(false)
      wsService.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]) // Only depend on user.id, not the whole user object

  const setupWebSocket = () => {
    if (!user) {
      console.log('⚠️ Cannot setup WebSocket: no user')
      return () => {}
    }

    // Get token from localStorage
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.log('⚠️ Cannot setup WebSocket: no token')
      return () => {}
    }

    // Don't reconnect if already connected
    if (wsService.isConnected()) {
      console.log('⚠️ WebSocket already connected, skipping setup')
      return () => {}
    }

    console.log('🔌 Setting up WebSocket connection...')

    // Connect WebSocket (only if not already connected)
    if (!wsService.isConnected() && !wsService.isConnecting) {
      wsService.connect(token)
    }

    // Subscribe to WebSocket events
    const unsubscribeTicketCreated = wsService.on('ticket_created', (data) => {
      console.log('🎫 WebSocket: ticket_created event received', data)
      const transformedTicket = transformTicketFromAPI(data.ticket)
      
      setTickets(prevTickets => {
        // Check if ticket already exists (prevent duplicates)
        const exists = prevTickets.some(t => t.id === transformedTicket.id)
        if (exists) {
          console.log(`⚠️ Ticket ${transformedTicket.id} already exists, updating instead of adding`)
          return prevTickets.map(t => t.id === transformedTicket.id ? transformedTicket : t)
        }
        console.log(`✅ Adding new ticket ${transformedTicket.id} to state`)
        return [...prevTickets, transformedTicket]
      })
      
      // Show notification for IT and Admin users
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
      console.log('📨 WebSocket: comment_added event received in TicketsContext', data)
      console.log('📨 Event data structure:', {
        hasTicket: !!data.ticket,
        ticketId: data.ticket_id,
        ticketDataId: data.ticket?.id,
        commentsInTicket: data.ticket?.comments?.length
      })
      
      if (data.ticket) {
        const transformedTicket = transformTicketFromAPI(data.ticket)
        console.log('📨 Transformed ticket ID:', transformedTicket.id)
        console.log('📨 Transformed comments count:', transformedTicket.comments?.length)
        console.log('📨 Transformed comments:', transformedTicket.comments)
        
        // Use functional update to ensure we get the latest state
        setTickets(prevTickets => {
          console.log('📨 Current tickets in state:', prevTickets.length)
          const existingTicket = prevTickets.find(t => t.id === transformedTicket.id)
          console.log('📨 Existing ticket found:', !!existingTicket)
          console.log('📨 Existing ticket comments count:', existingTicket?.comments?.length)
          
          if (existingTicket) {
            console.log('📨 Updating ticket with new comments')
            console.log('📨 Old comments:', existingTicket.comments?.length)
            console.log('📨 New comments:', transformedTicket.comments?.length)
            
            // Create a new array to ensure React detects the change
            const updated = prevTickets.map(t => {
              if (t.id === transformedTicket.id) {
                console.log('📨 Replacing ticket:', t.id)
                // Return completely new object to ensure React detects change
                return {
                  ...transformedTicket,
                  comments: [...transformedTicket.comments] // Ensure comments array is new
                }
              }
              return t
            })
            
            const updatedTicket = updated.find(t => t.id === transformedTicket.id)
            console.log('📨 Updated ticket comments count:', updatedTicket?.comments?.length)
            console.log('📨 Updated tickets array length:', updated.length)
            console.log('✅ State updated, React should re-render')
            
            return updated
          } else {
            console.warn('⚠️ Ticket not found in state:', transformedTicket.id)
            console.warn('⚠️ Available ticket IDs:', prevTickets.map(t => t.id))
            // Add ticket if it doesn't exist (shouldn't happen, but just in case)
            return [...prevTickets, transformedTicket]
          }
        })
      } else {
        console.warn('⚠️ comment_added event missing ticket data:', data)
      }
    })

    const unsubscribeError = wsService.on('error', (data) => {
      console.error('❌ WebSocket error event:', data)
    })

    const unsubscribeDisconnected = wsService.on('disconnected', (data) => {
      console.log('🔌 WebSocket disconnected event:', data)
    })

    // Return cleanup function
    return () => {
      console.log('🧹 Cleaning up WebSocket listeners')
      unsubscribeTicketCreated()
      unsubscribeTicketUpdated()
      unsubscribeTicketDeleted()
      unsubscribeCommentAdded()
      unsubscribeError()
      unsubscribeDisconnected()
      // Don't disconnect here, let the service handle it
    }
  }

  const loadTickets = useCallback(async () => {
    // Prevent multiple simultaneous loads - but only if actually loading
    if (loading) {
      console.log('⚠️ Tickets already loading, skipping')
      return
    }
    
    try {
      console.log('📥 Loading tickets from API...')
      setLoading(true)
      const ticketsData = await api.getTickets()
      console.log(`📥 Received ${ticketsData.length} tickets from API`)
      const transformedTickets = ticketsData.map(transformTicketFromAPI)
      console.log(`✅ Loaded and transformed ${transformedTickets.length} tickets`)
      setTickets(transformedTickets)
      console.log(`✅ Tickets state updated, total tickets: ${transformedTickets.length}`)
    } catch (error) {
      console.error('❌ Failed to load tickets:', error)
      setTickets([])
    } finally {
      setLoading(false)
      console.log('✅ Loading completed')
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
      // Don't add ticket here - WebSocket event will handle it to avoid duplicates
      // setTickets(prevTickets => [...prevTickets, transformedTicket])
      return transformedTicket
    } catch (error) {
      console.error('Failed to create ticket:', error)
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
      console.error('Failed to update ticket:', error)
      throw error
    }
  }, [])

  const addComment = async (ticketId, commentText) => {
    try {
      const updatedTicket = await api.addComment(ticketId, { text: commentText })
      const transformedTicket = transformTicketFromAPI(updatedTicket)
      console.log('✅ Comment added via API, updating state:', transformedTicket.comments?.length, 'comments')
      
      // Update tickets state immediately for better UX
      // WebSocket will also send an event, but we update here to ensure UI updates
      setTickets(prevTickets => {
        const updated = prevTickets.map(t => 
          t.id === ticketId ? transformedTicket : t
        )
        console.log('📝 Updated tickets state, ticket has', updated.find(t => t.id === ticketId)?.comments?.length, 'comments')
        return updated
      })
      
      return transformedTicket
    } catch (error) {
      console.error('Failed to add comment:', error)
      throw error
    }
  }

  const assignTicket = async (ticketId, userId) => {
    try {
      await updateTicket(ticketId, { assignedTo: userId })
    } catch (error) {
      console.error('Failed to assign ticket:', error)
      throw error
    }
  }

  const getTicketsForUser = useCallback(() => {
    if (!user) return []
    
    // API уже возвращает правильные тикеты в зависимости от роли
    // Admin и IT видят все тикеты (включая закрытые)
    // Обычные пользователи видят только свои тикеты
    if (user.role === 'admin' || user.role === 'it') {
      return tickets // Все тикеты, включая закрытые
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

