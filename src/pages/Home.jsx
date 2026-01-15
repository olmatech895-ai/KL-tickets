import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTickets } from '../context/TicketsContext'
import { ToastContainer } from '../components/ui/toast'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Plus, Ticket, Clock, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'

export const Home = () => {
  const { user, isAdmin, isIT } = useAuth()
  const { getTicketsForUser, createTicket, setNotificationHandler } = useTickets()
  const tickets = useMemo(() => getTicketsForUser(), [getTicketsForUser])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toasts, setToasts] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'other',
  })

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  }

  const showToast = (title, description, variant = 'default') => {
    const id = Date.now().toString()
    setToasts([...toasts, { id, title, description, variant }])
    setTimeout(() => {
      setToasts(toasts.filter((t) => t.id !== id))
    }, 5000)
  }

  useEffect(() => {
    if ((isIT || isAdmin) && setNotificationHandler) {
      setNotificationHandler(showToast)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIT, isAdmin]) // setNotificationHandler is stable, no need to include it

  const recentTickets = tickets
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
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

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.description) {
      return
    }
    try {
      await createTicket(formData)
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'other',
      })
      setDialogOpen(false)
    } catch (error) {
      console.error('Failed to create ticket:', error)
      // Можно добавить toast уведомление об ошибке
    }
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: 'other',
    })
    setDialogOpen(false)
  }

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 pt-16 lg:pt-4 sm:pt-6 pl-0 lg:pl-0">
        <div className="flex-1 min-w-0 space-y-2 pl-12 lg:pl-0">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold break-words bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Добро пожаловать, {user?.username}!
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            {isAdmin
              ? 'Панель администратора'
              : isIT
              ? 'Панель IT отдела'
              : 'Ваши тикеты'}
          </p>
        </div>
        {(!isIT || isAdmin) && (
          <Button 
            onClick={() => setDialogOpen(true)} 
            size="lg"
            className="w-full sm:w-auto flex-shrink-0 h-auto py-3 px-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Создать тикет
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Всего тикетов</CardTitle>
            <Ticket className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Всего заявок</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Открыто</CardTitle>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.open}</div>
            <p className="text-xs text-muted-foreground mt-1">Требуют внимания</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-2 hover:border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">В работе</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">В процессе</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow border-2 hover:border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Закрыто</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.closed}</div>
            <p className="text-xs text-muted-foreground mt-1">Завершено</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets Section */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl sm:text-2xl">Последние тикеты</CardTitle>
              <CardDescription className="mt-1 text-sm sm:text-base">
                {recentTickets.length === 0
                  ? 'У вас пока нет тикетов'
                  : 'Недавно созданные или обновленные тикеты'}
              </CardDescription>
            </div>
            {recentTickets.length > 0 && (
              <Link
                to="/tickets"
                className="text-sm text-primary hover:underline font-medium"
              >
                Все тикеты →
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentTickets.length === 0 ? (
            <div className="text-center py-12 sm:py-16 text-muted-foreground">
              {!isIT || isAdmin ? (
                <>
                  <Ticket className="h-16 w-16 mx-auto mb-6 opacity-50" />
                  <p className="text-lg mb-2">Создайте свой первый тикет</p>
                  <p className="text-sm mb-6">Начните работу с системой поддержки</p>
                  <Button onClick={() => setDialogOpen(true)} size="lg" className="shadow-md">
                    <Plus className="h-5 w-5 mr-2" />
                    Создать тикет
                  </Button>
                </>
              ) : (
                <div>
                  <Ticket className="h-16 w-16 mx-auto mb-6 opacity-50" />
                  <p className="text-lg">Нет доступных тикетов</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/ticket/${ticket.id}`}
                  className="block p-4 sm:p-5 border-2 rounded-xl hover:bg-accent/50 hover:border-primary/50 transition-all hover:shadow-md group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {getStatusIcon(ticket.status)}
                        <h3 className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors">
                          {ticket.title}
                        </h3>
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                            ticket.priority
                          )}`}
                        >
                          {getPriorityText(ticket.priority)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {ticket.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Статус:</span>
                          {getStatusText(ticket.status)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Создан:</span>
                          {format(new Date(ticket.createdAt), 'dd MMM yyyy')}
                        </span>
                        {ticket.assignedToName && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Назначен:</span>
                            {ticket.assignedToName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модальное окно создания тикета */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="text-2xl">Новая заявка</DialogTitle>
            <DialogDescription className="text-base">
              Заполните форму для создания новой заявки в IT отдел
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modal-title">Название тикета *</Label>
              <Input
                id="modal-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Краткое описание проблемы"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-description">Описание *</Label>
              <Textarea
                id="modal-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Подробное описание проблемы..."
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-priority">Приоритет</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger id="modal-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-category">Категория</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger id="modal-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardware">Оборудование</SelectItem>
                    <SelectItem value="software">Программное обеспечение</SelectItem>
                    <SelectItem value="network">Сеть</SelectItem>
                    <SelectItem value="account">Учетная запись</SelectItem>
                    <SelectItem value="other">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                Отмена
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Создать тикет
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ToastContainer toasts={toasts} setToasts={setToasts} />
    </div>
  )
}

