import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTickets } from '../context/TicketsContext'
import { wsService } from '../services/websocket'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { ArrowLeft, MessageSquare, User, Calendar, Tag, Clock, Mail, Phone } from 'lucide-react'
import { Input } from '../components/ui/input'
import { format } from 'date-fns'

export const TicketDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin, isIT } = useAuth()
  const { tickets, updateTicket, addComment, assignTicket } = useTickets()
  const [commentText, setCommentText] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [updateKey, setUpdateKey] = useState(0) // Force re-render key
  const commentsEndRef = useRef(null)

  // Use useMemo to ensure ticket reference updates when comments change
  const ticket = useMemo(() => {
    const found = tickets.find((t) => t.id === id)
    if (found) {
      console.log('🎫 Ticket found, comments:', found.comments?.length)
    }
    return found
  }, [tickets, id, updateKey])
  
  // Force re-render when ticket comments change
  useEffect(() => {
    if (ticket?.comments) {
      console.log('🔄 Ticket comments changed, count:', ticket.comments.length)
      setUpdateKey(prev => prev + 1)
    }
  }, [ticket?.comments?.length, ticket?.updatedAt])

  // Auto-scroll to bottom when new comment is added
  useEffect(() => {
    if (commentsEndRef.current && ticket?.comments?.length > 0) {
      console.log('📜 Auto-scrolling to bottom, comments:', ticket.comments.length)
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [ticket?.comments?.length, updateKey])

  // Auto-scroll to bottom when new comment is added
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [ticket?.comments?.length, updateKey])
  
  // Обновляем estimatedTime когда тикет загружается
  useEffect(() => {
    if (ticket) {
      setEstimatedTime(ticket.estimatedTime || '')
    }
  }, [ticket])

  // Subscribe to WebSocket updates for this ticket
  useEffect(() => {
    if (!id) return

    let subscribeTimeout = null

    // Function to subscribe when WebSocket is ready
    const subscribeWhenReady = () => {
      if (wsService.isConnected()) {
        console.log(`📌 Subscribing to ticket ${id}`)
        wsService.subscribeToTicket(id)
      } else {
        // Wait a bit and try again (max 5 seconds)
        subscribeTimeout = setTimeout(() => {
          if (wsService.isConnected()) {
            wsService.subscribeToTicket(id)
          } else {
            console.warn(`⚠️ WebSocket not connected, cannot subscribe to ticket ${id}`)
          }
        }, 1000)
      }
    }

    // Try to subscribe immediately
    subscribeWhenReady()

    // Listen for WebSocket connection to subscribe
    const unsubscribeConnected = wsService.on('connected', () => {
      console.log('✅ WebSocket connected, subscribing to ticket')
      wsService.subscribeToTicket(id)
    })

    // Listen for ticket updates
    const unsubscribeUpdated = wsService.on('ticket_updated', (data) => {
      if (data.ticket?.id === id) {
        console.log('📨 Ticket updated via WebSocket:', data.ticket.id)
        // Ticket will be updated via TicketsContext
      }
    })

    const unsubscribeCommentAdded = wsService.on('comment_added', (data) => {
      console.log('📨 Comment added event received in TicketDetail:', data)
      console.log('📨 Current ticket ID:', id)
      console.log('📨 Event ticket_id:', data.ticket_id)
      console.log('📨 Event ticket?.id:', data.ticket?.id)
      
      if (data.ticket_id === id || data.ticket?.id === id) {
        console.log('✅ Comment added to current ticket!')
        console.log('📨 New ticket data:', data.ticket)
        console.log('📨 Comments in new ticket:', data.ticket?.comments?.length)
        
        // Force component re-render - TicketsContext should already update the ticket
        // But we force a re-render to ensure UI updates
        setUpdateKey(prev => prev + 1)
        
        // Also try to reload ticket if needed (fallback)
        if (data.ticket) {
          console.log('📨 Ticket data received, should update via TicketsContext')
        }
      } else {
        console.log('⚠️ Comment added to different ticket, ignoring')
      }
    })

    // Listen for subscription confirmation
    const unsubscribeSubscribed = wsService.on('subscribed', (data) => {
      if (data.ticket_id === id) {
        console.log(`✅ Successfully subscribed to ticket ${id}`)
      }
    })

    // Cleanup on unmount
    return () => {
      if (subscribeTimeout) {
        clearTimeout(subscribeTimeout)
      }
      console.log(`📌 Unsubscribing from ticket ${id}`)
      if (wsService.isConnected()) {
        wsService.unsubscribeFromTicket(id)
      }
      unsubscribeUpdated()
      unsubscribeCommentAdded()
      unsubscribeConnected()
      unsubscribeSubscribed()
    }
  }, [id])

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Тикет не найден</p>
        <Button asChild className="mt-4">
          <Link to="/">Вернуться на главную</Link>
        </Button>
      </div>
    )
  }

  // Обычные пользователи могут видеть только свои тикеты
  if (!isAdmin && !isIT && ticket.createdBy !== user.id) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Доступ запрещен</p>
        <p className="text-sm text-muted-foreground mt-2">
          Вы можете просматривать только свои тикеты
        </p>
        <Button asChild className="mt-4">
          <Link to="/">Вернуться на главную</Link>
        </Button>
      </div>
    )
  }

  const canEdit = isAdmin || isIT || ticket.createdBy === user.id
  const canComment = isAdmin || isIT || ticket.createdBy === user.id

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTicket(id, { status: newStatus })
    } catch (error) {
      console.error('Failed to update ticket status:', error)
      // Можно добавить toast уведомление об ошибке
    }
  }

  const handleAssign = async () => {
    if (isIT || isAdmin) {
      try {
        await assignTicket(id, user.id)
        await handleStatusChange('in_progress')
      } catch (error) {
        console.error('Failed to assign ticket:', error)
        // Можно добавить toast уведомление об ошибке
      }
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (commentText.trim() && canComment) {
      try {
        await addComment(id, commentText)
        setCommentText('')
      } catch (error) {
        console.error('Failed to add comment:', error)
        // Можно добавить toast уведомление об ошибке
      }
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'Открытый'
      case 'in_progress':
        return 'Взять на разработку'
      case 'closed':
        return 'Закрыть тикет'
      default:
        return status
    }
  }

  const handleEstimatedTimeChange = async (value) => {
    setEstimatedTime(value)
    try {
      // Примечание: estimatedTime может не поддерживаться backend, это локальное поле
      await updateTicket(id, { estimatedTime: value })
    } catch (error) {
      console.error('Failed to update estimated time:', error)
      // Игнорируем ошибку, так как это может быть локальное поле
    }
  }

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return 'Высокий'
      case 'medium':
        return 'Средний'
      case 'low':
        return 'Низкий'
      default:
        return priority
    }
  }

  const getCategoryText = (category) => {
    switch (category) {
      case 'hardware':
        return 'Оборудование'
      case 'software':
        return 'Программное обеспечение'
      case 'network':
        return 'Сеть'
      case 'account':
        return 'Учетная запись'
      case 'other':
        return 'Другое'
      default:
        return category
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pt-16 lg:pt-4 sm:pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pl-0 lg:pl-0">
        <Button variant="ghost" asChild className="w-fit pl-12 lg:pl-0">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold break-words flex-1 pl-12 lg:pl-0">
          {ticket.title}
        </h1>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Description Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Описание</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-foreground">
                {ticket.description || 'Описание отсутствует'}
              </p>
            </CardContent>
          </Card>

          {/* Comments Card */}
          <Card className="flex flex-col h-[500px] sm:h-[600px] lg:h-[650px]">
            <CardHeader className="flex-shrink-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Комментарии ({ticket.comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 min-h-0 space-y-4">
              {/* Scrollable comments area */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-0 scrollbar-hide">
                {(!ticket.comments || ticket.comments.length === 0) ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-sm">
                      Комментариев пока нет
                    </p>
                  </div>
                ) : (
                  <>
                    {ticket.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border-l-4 border-primary/50 pl-4 py-3 bg-muted/30 rounded-r-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-sm text-foreground">
                            {comment.authorName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.createdAt), 'dd MMM yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap text-foreground leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    ))}
                    {/* Invisible element to scroll to */}
                    <div ref={commentsEndRef} />
                  </>
                )}
              </div>

              {/* Fixed input area at bottom */}
              <div className="flex-shrink-0 pt-4 border-t space-y-3">
                {canComment ? (
                  <form onSubmit={handleAddComment} className="space-y-3">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Добавить комментарий..."
                      rows={4}
                      className="resize-none"
                    />
                    <Button type="submit" className="w-full sm:w-auto">
                      Отправить комментарий
                    </Button>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Вы не можете комментировать этот тикет
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Status */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Статус
                </div>
                {canEdit && isIT && !isAdmin ? (
                  <Select
                    value={ticket.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Открытый</SelectItem>
                      <SelectItem value="in_progress">Взять на разработку</SelectItem>
                      <SelectItem value="closed">Закрыть тикет</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-medium text-base">{getStatusText(ticket.status)}</p>
                )}
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Приоритет
                </div>
                <p className="font-medium text-base">{getPriorityText(ticket.priority)}</p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Категория
                </div>
                <p className="font-medium text-base">{getCategoryText(ticket.category)}</p>
              </div>

              {/* Created By */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  Создал
                </div>
                <p className="font-medium text-base">{ticket.createdByName}</p>
                {(isIT || isAdmin) && ticket.createdByEmail && (
                  <div className="mt-2">
                    <a
                      href={`mailto:${ticket.createdByEmail}?subject=Тикет: ${encodeURIComponent(ticket.title)}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline transition-colors"
                    >
                      <Mail className="h-3 w-3" />
                      {ticket.createdByEmail}
                    </a>
                  </div>
                )}
              </div>

              {/* Assigned To */}
              {ticket.assignedToName && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <User className="h-4 w-4" />
                    Назначен
                  </div>
                  <p className="font-medium text-base">{ticket.assignedToName}</p>
                </div>
              )}

              {/* Created Date */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Создан
                </div>
                <p className="font-medium text-sm">
                  {format(new Date(ticket.createdAt), 'dd MMM yyyy HH:mm')}
                </p>
              </div>

              {/* Estimated Time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Время выполнения
                </div>
                {(isIT || isAdmin) ? (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Например: 15 минут"
                      value={estimatedTime}
                      onChange={(e) => {
                        const value = e.target.value
                        setEstimatedTime(value)
                        handleEstimatedTimeChange(value)
                      }}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Укажите примерное время выполнения задачи
                    </p>
                  </div>
                ) : (
                  <p className="font-medium text-base">
                    {ticket.estimatedTime || 'Не указано'}
                  </p>
                )}
              </div>

              {/* Action Button */}
              {isIT && !isAdmin && !ticket.assignedTo && ticket.status === 'open' && (
                <Button 
                  onClick={() => {
                    assignTicket(id, user.id, user.username)
                    handleStatusChange('in_progress')
                  }} 
                  className="w-full"
                >
                  Взять на разработку
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

