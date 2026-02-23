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
  const { user, isAdmin, isIT } = useAuth()
  const { tickets, updateTicket, addComment, assignTicket } = useTickets()
  const [commentText, setCommentText] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [updateKey, setUpdateKey] = useState(0)
  const commentsEndRef = useRef(null)

  const ticket = useMemo(() => {
    const found = tickets.find((t) => t.id === id)
    return found
  }, [tickets, id, updateKey])

  useEffect(() => {
    if (ticket?.comments) {
      setUpdateKey(prev => prev + 1)
    }
  }, [ticket?.comments?.length, ticket?.updatedAt])

  useEffect(() => {
    if (commentsEndRef.current && ticket?.comments?.length > 0) {
      const t = setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return () => clearTimeout(t)
    }
  }, [ticket?.comments?.length, updateKey])

  useEffect(() => {
    if (ticket) {
      setEstimatedTime(ticket.estimatedTime || '')
    }
  }, [ticket])

  useEffect(() => {
    if (!id) return

    let subscribeTimeout = null

    const subscribeWhenReady = () => {
      if (wsService.isConnected()) {
        wsService.subscribeToTicket(id)
      } else {
        subscribeTimeout = setTimeout(() => {
          if (wsService.isConnected()) {
            wsService.subscribeToTicket(id)
          }
        }, 1000)
      }
    }

    subscribeWhenReady()

    const unsubscribeConnected = wsService.on('connected', () => {
      wsService.subscribeToTicket(id)
    })

    const unsubscribeUpdated = wsService.on('ticket_updated', (data) => {
      if (data.ticket?.id === id) {
      }
    })

    const unsubscribeCommentAdded = wsService.on('comment_added', (data) => {
      if (data.ticket_id === id || data.ticket?.id === id) {
        setUpdateKey(prev => prev + 1)
      }
    })

    const unsubscribeSubscribed = wsService.on('subscribed', (data) => {
      if (data.ticket_id === id) {
      }
    })

    return () => {
      if (subscribeTimeout) {
        clearTimeout(subscribeTimeout)
      }
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
    }
  }

  const handleAssign = async () => {
    if (isIT || isAdmin) {
      try {
        await assignTicket(id, user.id)
        await handleStatusChange('in_progress')
      } catch (error) {
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
      }
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'Открыт'
      case 'in_progress':
        return 'В работе'
      case 'closed':
        return 'Закрыт'
      default:
        return status
    }
  }

  const handleEstimatedTimeChange = async (value) => {
    setEstimatedTime(value)
    try {
      await updateTicket(id, { estimatedTime: value })
    } catch (error) {
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
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
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

          <Card className="flex flex-col h-[500px] sm:h-[600px] lg:h-[650px]">
            <CardHeader className="flex-shrink-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Комментарии ({ticket.comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 min-h-0 space-y-4">
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
                    <div ref={commentsEndRef} />
                  </>
                )}
              </div>

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

        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
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
                      <SelectItem value="open">Открыт</SelectItem>
                      <SelectItem value="in_progress">В работе</SelectItem>
                      <SelectItem value="closed">Закрыт</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-medium text-base">{getStatusText(ticket.status)}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Приоритет
                </div>
                <p className="font-medium text-base">{getPriorityText(ticket.priority)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Категория
                </div>
                <p className="font-medium text-base">{getCategoryText(ticket.category)}</p>
              </div>

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

