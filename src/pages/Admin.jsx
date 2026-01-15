import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTickets } from '../context/TicketsContext'
import { PaginationControls } from '../components/PaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { ToastContainer } from '../components/ui/toast'
import {
  Users,
  Ticket,
  UserCheck,
  Ban,
  Trash2,
  Eye,
  Search,
  Shield,
  UserCheck as UserCheckIcon,
  LayoutDashboard,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '../lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

const formatDate = (dateString) => {
  if (!dateString) return 'Не указано'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Не указано'
    return format(date, 'dd.MM.yyyy')
  } catch {
    return 'Не указано'
  }
}

export const Admin = () => {
  const { user, toggleUserBlock, deleteUser, loadUsers, updateUserRole } = useAuth()
  const { tickets } = useTickets()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [toasts, setToasts] = useState([])
  const [ticketsPage, setTicketsPage] = useState(1)
  const ticketsPerPage = 10

  useEffect(() => {
    loadUsersList()
  }, [])

  const loadUsersList = async () => {
    const allUsers = await loadUsers()
    setUsers(allUsers)
  }

  const showToast = (title, description, variant = 'default') => {
    const id = Date.now().toString()
    setToasts([...toasts, { id, title, description, variant }])
    setTimeout(() => {
      setToasts(toasts.filter((t) => t.id !== id))
    }, 3000)
  }

  const handleBlockToggle = async (userId) => {
    try {
      const updatedUser = await toggleUserBlock(userId)
      await loadUsersList() // Reload users list
      showToast(
        'Успешно',
        `Пользователь ${updatedUser.blocked ? 'заблокирован' : 'разблокирован'}`,
        'default'
      )
    } catch (error) {
      showToast('Ошибка', error.message || 'Не удалось изменить статус пользователя', 'destructive')
    }
  }

  const handleDeleteClick = (userToDelete) => {
    if (userToDelete.id === user.id) {
      showToast('Ошибка', 'Вы не можете удалить свой собственный аккаунт', 'destructive')
      return
    }
    setUserToDelete(userToDelete)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    
    // Double check - prevent self-deletion
    if (userToDelete.id === user.id) {
      showToast('Ошибка', 'Вы не можете удалить свой собственный аккаунт', 'destructive')
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      return
    }
    
    try {
      await deleteUser(userToDelete.id)
      await loadUsersList() // Reload users list
      showToast('Успешно', `Пользователь ${userToDelete.username} удален`, 'default')
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (error) {
      console.error('Failed to delete user:', error)
      const errorMessage = error.message || error.detail || 'Не удалось удалить пользователя'
      showToast('Ошибка', errorMessage, 'destructive')
      // Don't close dialog on error so user can try again
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole)
      await loadUsersList()
      showToast('Успешно', 'Роль пользователя обновлена', 'default')
    } catch (error) {
      showToast('Ошибка', error.message || 'Не удалось изменить роль пользователя', 'destructive')
    }
  }

  const getUserTicketsCount = (userId) => {
    return tickets.filter((t) => t.createdBy === userId).length
  }

  const getUserAssignedTicketsCount = (userId) => {
    return tickets.filter((t) => t.assignedTo === userId).length
  }

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const paginatedTickets = useMemo(() => {
    const startIndex = (ticketsPage - 1) * ticketsPerPage
    const endIndex = startIndex + ticketsPerPage
    return tickets.slice(startIndex, endIndex)
  }, [tickets, ticketsPage, ticketsPerPage])

  const stats = {
    totalUsers: users.length,
    totalTickets: tickets.length,
    openTickets: tickets.filter((t) => t.status === 'open').length,
    blockedUsers: users.filter((u) => u.blocked).length,
    itUsers: users.filter((u) => u.role === 'it').length,
    adminUsers: users.filter((u) => u.role === 'admin').length,
    regularUsers: users.filter((u) => u.role === 'user' && !u.blocked).length,
  }

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto pt-16 lg:pt-4 sm:pt-6">
      <div className="pl-12 lg:pl-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Админ-панель</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Управление системой, пользователями и тикетами
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.adminUsers} админов, {stats.itUsers} IT, {stats.regularUsers} пользователей
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего тикетов</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.openTickets} открытых
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заблокировано</CardTitle>
            <Ban className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blockedUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Пользователей заблокировано
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IT специалистов</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.itUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Активных сотрудников
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="tickets">Все тикеты</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Управление пользователями</CardTitle>
              <CardDescription>
                Просмотр, блокировка и удаление пользователей системы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск пользователей..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Пользователи не найдены
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      className={cn(
                        'flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4',
                        u.blocked && 'bg-muted opacity-60'
                      )}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{u.username}</p>
                            {u.blocked && (
                              <span className="px-2 py-0.5 text-xs bg-destructive text-destructive-foreground rounded whitespace-nowrap">
                                Заблокирован
                              </span>
                            )}
                            {u.role === 'admin' && (
                              <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Роль:</span>
                              {u.id === user.id ? (
                                <span className="font-medium">
                                  {u.role === 'admin'
                                    ? 'Администратор'
                                    : u.role === 'it'
                                    ? 'IT Отдел'
                                    : 'Пользователь'}
                                </span>
                              ) : (
                                <Select
                                  value={u.role}
                                  onValueChange={(newRole) => handleRoleChange(u.id, newRole)}
                                >
                                  <SelectTrigger className="h-7 w-[140px] text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">Пользователь</SelectItem>
                                    <SelectItem value="it">IT Отдел</SelectItem>
                                    <SelectItem value="admin">Администратор</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            <span>
                              Создан: {formatDate(u.createdAt)}
                            </span>
                            <span>Тикетов: {getUserTicketsCount(u.id)}</span>
                            {u.role === 'it' && (
                              <span>Назначено: {getUserAssignedTicketsCount(u.id)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/user/${u.id}`)}
                        >
                          <Eye className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Просмотр</span>
                        </Button>
                        {u.id !== user.id && (
                          <>
                            <Button
                              variant={u.blocked ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleBlockToggle(u.id)}
                            >
                              {u.blocked ? (
                                <>
                                  <UserCheckIcon className="h-4 w-4 sm:mr-2" />
                                  <span className="hidden sm:inline">Разблокировать</span>
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 sm:mr-2" />
                                  <span className="hidden sm:inline">Заблокировать</span>
                                </>
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(u)}
                            >
                              <Trash2 className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Удалить</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Все тикеты системы</CardTitle>
              <CardDescription>
                Просмотр и управление всеми тикетами
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Тикетов пока нет
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {paginatedTickets.map((ticket) => (
                      <Link
                        key={ticket.id}
                        to={`/ticket/${ticket.id}`}
                        className="block"
                      >
                        <div className="p-4 border rounded-lg hover:bg-accent transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold mb-1">{ticket.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {ticket.description}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                                <span>Автор: {ticket.createdByName}</span>
                                <span>
                                  Создан: {formatDate(ticket.createdAt)}
                                </span>
                                <span>Статус: {ticket.status}</span>
                                {ticket.assignedToName && (
                                  <span>Назначен: {ticket.assignedToName}</span>
                                )}
                                <span>Комментариев: {ticket.comments.length}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {Math.ceil(tickets.length / ticketsPerPage) > 1 && (
                    <div className="mt-6">
                      <PaginationControls
                        currentPage={ticketsPage}
                        totalPages={Math.ceil(tickets.length / ticketsPerPage)}
                        onPageChange={setTicketsPage}
                        itemsPerPage={ticketsPerPage}
                      />
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        Показано {Math.min(ticketsPerPage, tickets.length - (ticketsPage - 1) * ticketsPerPage)} из {tickets.length} тикетов
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить пользователя{' '}
              <strong>{userToDelete?.username}</strong>? Это действие нельзя отменить.
              <br />
              <span className="text-destructive font-medium mt-2 block">
                Внимание: Будут удалены все тикеты, созданные этим пользователем, и все связанные данные.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer toasts={toasts} setToasts={setToasts} />
    </div>
  )
}
