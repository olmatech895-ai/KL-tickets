import { Link } from 'react-router-dom'
import { useTickets } from '../context/TicketsContext'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { PaginationControls } from '../components/PaginationControls'
import { ToastContainer } from '../components/ui/toast'
import { useState, useMemo, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, Ticket } from 'lucide-react'
import { format } from 'date-fns'

export const AllTickets = () => {
  const { getTicketsForUser, setNotificationHandler } = useTickets()
  const { isAdmin, isIT } = useAuth()
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [toasts, setToasts] = useState([])
  const itemsPerPage = 10

  // Получаем тикеты с учетом роли пользователя
  const userTickets = getTicketsForUser()

  const filteredTickets = useMemo(() => {
    return statusFilter === 'all'
      ? userTickets
      : userTickets.filter((t) => t.status === statusFilter)
  }, [userTickets, statusFilter])

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage)
  
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredTickets.slice(startIndex, endIndex)
  }, [filteredTickets, currentPage, itemsPerPage])

  // Сбрасываем на первую страницу при изменении фильтра
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter])

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

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto pt-16 lg:pt-4 sm:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pl-0 lg:pl-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold pl-12 lg:pl-0">
          {isAdmin || isIT ? 'Все тикеты' : 'Мои тикеты'}
        </h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Фильтр по статусу" />
          </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="open">Открытый</SelectItem>
              <SelectItem value="in_progress">Взять на разработку</SelectItem>
              <SelectItem value="closed">Закрыть тикет</SelectItem>
            </SelectContent>
        </Select>
      </div>

      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Тикеты не найдены</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4">
            {paginatedTickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/ticket/${ticket.id}`}
              className="block"
            >
              <Card className="hover:bg-accent/50 hover:shadow-md transition-all border-2">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {getStatusIcon(ticket.status)}
                        <h3 className="font-semibold text-base sm:text-lg break-words flex-1 min-w-0">{ticket.title}</h3>
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getPriorityColor(
                            ticket.priority
                          )}`}
                        >
                          {getPriorityText(ticket.priority)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {ticket.description}
                      </p>
                      <div className="flex flex-col gap-2 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Статус:</span>
                            {getStatusText(ticket.status)}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Создан:</span>
                            {format(new Date(ticket.createdAt), 'dd MMM yyyy')}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Автор:</span>
                            {ticket.createdByName}
                          </span>
                          {ticket.assignedToName && (
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Назначен:</span>
                              {ticket.assignedToName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Комментариев:</span>
                            {ticket.comments.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-6">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
              />
              <p className="text-sm text-muted-foreground text-center mt-4">
                Показано {paginatedTickets.length} из {filteredTickets.length} тикетов
              </p>
            </div>
          )}
        </>
      )}
      <ToastContainer toasts={toasts} setToasts={setToasts} />
    </div>
  )
}

