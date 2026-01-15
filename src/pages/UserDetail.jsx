import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTickets } from '../context/TicketsContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { ArrowLeft, User, Calendar, Ticket, Shield, Ban, UserCheck } from 'lucide-react'
import { format } from 'date-fns'

export const UserDetail = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { getAllUsers, updateUserRole, user: currentUser, loadUsers } = useAuth()
  const { tickets } = useTickets()
  const [userDetail, setUserDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  const showToast = (title, description, variant = 'default') => {
    // Simple toast notification
    console.log(`${title}: ${description}`)
    // You can replace this with a proper toast implementation if needed
  }

  useEffect(() => {
    const loadUser = async () => {
      try {
        const users = getAllUsers()
        const foundUser = users.find((u) => u.id === userId)
        if (foundUser) {
          setUserDetail(foundUser)
        }
      } catch (error) {
        console.error('Failed to load user:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [userId, getAllUsers])

  const handleRoleChange = async (newRole) => {
    try {
      await updateUserRole(userId, newRole)
      await loadUsers()
      const users = getAllUsers()
      const updatedUser = users.find((u) => u.id === userId)
      if (updatedUser) {
        setUserDetail(updatedUser)
      }
      showToast('Успешно', 'Роль пользователя обновлена', 'default')
    } catch (error) {
      showToast('Ошибка', error.message || 'Не удалось изменить роль пользователя', 'destructive')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Загрузка...</p>
      </div>
    )
  }

  if (!userDetail) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Пользователь не найден</p>
        <Button asChild className="mt-4">
          <Link to="/admin">Вернуться в админ-панель</Link>
        </Button>
      </div>
    )
  }

  const userTickets = tickets.filter((t) => t.createdBy === userId)
  const assignedTickets = tickets.filter((t) => t.assignedTo === userId)

  const stats = {
    totalCreated: userTickets.length,
    open: userTickets.filter((t) => t.status === 'open').length,
    inProgress: userTickets.filter((t) => t.status === 'in_progress').length,
    closed: userTickets.filter((t) => t.status === 'closed').length,
    assigned: assignedTickets.length,
  }

  const getRoleText = (role) => {
    switch (role) {
      case 'admin':
        return 'Администратор'
      case 'it':
        return 'IT Отдел'
      case 'user':
        return 'Пользователь'
      default:
        return role
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5 text-primary" />
      case 'it':
        return <UserCheck className="h-5 w-5 text-blue-500" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 px-4 md:px-6 lg:px-8 pt-16 lg:pt-4 sm:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pl-12 lg:pl-0">
        <Button variant="ghost" asChild className="w-fit">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Информация о пользователе</h1>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getRoleIcon(userDetail.role)}
                {userDetail.username}
              </CardTitle>
              <CardDescription>
                {getRoleText(userDetail.role)}
                {userDetail.blocked && (
                  <span className="ml-2 px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded">
                    Заблокирован
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Дата регистрации
                </div>
                <p className="font-medium">
                  {userDetail.createdAt && !isNaN(new Date(userDetail.createdAt).getTime())
                    ? format(new Date(userDetail.createdAt), 'dd MMMM yyyy, HH:mm')
                    : 'Не указано'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Shield className="h-4 w-4" />
                  Роль
                </div>
                {currentUser?.role === 'admin' && currentUser?.id !== userDetail.id ? (
                  <Select
                    value={userDetail.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Пользователь</SelectItem>
                      <SelectItem value="it">IT Отдел</SelectItem>
                      <SelectItem value="admin">Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-medium">{getRoleText(userDetail.role)}</p>
                )}
              </div>

              {userDetail.blocked && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Ban className="h-4 w-4 text-destructive" />
                    Статус
                  </div>
                  <p className="font-medium text-destructive">Аккаунт заблокирован</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Тикеты пользователя
              </CardTitle>
              <CardDescription>
                Все тикеты, созданные этим пользователем
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userTickets.length === 0 ? (
                <p className="text-muted-foreground">Пользователь еще не создал тикетов</p>
              ) : (
                <div className="space-y-2">
                  {userTickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      to={`/ticket/${ticket.id}`}
                      className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{ticket.title}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                            <span>Статус: {ticket.status}</span>
                            <span>
                              Создан:{' '}
                              {ticket.createdAt && !isNaN(new Date(ticket.createdAt).getTime())
                                ? format(new Date(ticket.createdAt), 'dd.MM.yyyy HH:mm')
                                : 'Не указано'}
                            </span>
                            <span>Комментариев: {ticket.comments.length}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {userDetail.role === 'it' && assignedTickets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Назначенные тикеты</CardTitle>
                <CardDescription>
                  Тикеты, назначенные этому IT специалисту
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {assignedTickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      to={`/ticket/${ticket.id}`}
                      className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{ticket.title}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                            <span>Статус: {ticket.status}</span>
                            <span>Автор: {ticket.createdByName}</span>
                            <span>Комментариев: {ticket.comments.length}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Создано тикетов
                </div>
                <div className="text-2xl font-bold">{stats.totalCreated}</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Открыто</span>
                  <span className="font-medium">{stats.open}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">В работе</span>
                  <span className="font-medium">{stats.inProgress}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Закрыто</span>
                  <span className="font-medium">{stats.closed}</span>
                </div>
              </div>

              {userDetail.role === 'it' && (
                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-1">
                    Назначено тикетов
                  </div>
                  <div className="text-2xl font-bold">{stats.assigned}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

