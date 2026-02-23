import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
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
  Clock,
} from 'lucide-react'
import { format, parseISO, differenceInMinutes, differenceInHours } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '../lib/utils'
import { attendanceApi } from '../config/attendance-api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

function normalizeAttendanceRow(row) {
  return {
    ...row,
    id: row.id ?? row.user_id ?? row.userId,
    user_id: row.user_id ?? row.userId ?? row.id,
    full_name: row.full_name ?? row.fullName ?? row.username,
    check_in: row.check_in ?? row.checkIn ?? row.entrance,
    check_out: row.check_out ?? row.checkOut ?? row.exit,
  }
}

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

const ADMIN_TABS = ['users', 'tickets', 'attendance']

export const Admin = () => {
  const { user, toggleUserBlock, deleteUser, loadUsers, updateUserRole } = useAuth()
  const { tickets } = useTickets()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab') || 'users'
  const activeTab = ADMIN_TABS.includes(tabFromUrl) ? tabFromUrl : 'users'
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [toasts, setToasts] = useState([])
  const [ticketsPage, setTicketsPage] = useState(1)
  const [isMounted, setIsMounted] = useState(false)
  const [attendance, setAttendance] = useState([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const ticketsPerPage = 10

  useEffect(() => {
    setIsMounted(true)
    loadUsersList()
    loadAttendance()
  }, [])

  const loadAttendance = async () => {
    setAttendanceLoading(true)
    try {
      const rows = await attendanceApi.getReport({})
      const mapped = (rows || []).map((r) => normalizeAttendanceRow(attendanceApi.mapReportRow(r)))
      setAttendance(mapped)
    } catch {
      setAttendance([])
    } finally {
      setAttendanceLoading(false)
    }
  }

  const formatAttendanceTime = (value) => {
    if (!value) return '—'
    try {
      const d = typeof value === 'string' ? parseISO(value) : new Date(value)
      if (isNaN(d.getTime())) return '—'
      return format(d, 'dd.MM.yyyy HH:mm', { locale: ru })
    } catch {
      return '—'
    }
  }

  const formatDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '—'
    try {
      const start = typeof checkIn === 'string' ? parseISO(checkIn) : new Date(checkIn)
      const end = typeof checkOut === 'string' ? parseISO(checkOut) : new Date(checkOut)
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return '—'
      const totalMin = differenceInMinutes(end, start)
      const h = Math.floor(totalMin / 60)
      const m = totalMin % 60
      if (h > 0 && m > 0) return `${h} ч ${m} мин`
      if (h > 0) return `${h} ч`
      return `${m} мин`
    } catch {
      return '—'
    }
  }

  const getAttendanceDisplayName = (row) => {
    return row.full_name || row.fullName || row.username || `ID ${row.user_id || row.userId || '—'}`
  }

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
      await loadUsersList()
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
      const errorMessage = error.message || error.detail || 'Не удалось удалить пользователя'
      showToast('Ошибка', errorMessage, 'destructive')
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
      <div className={`pl-12 lg:pl-0 transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Админ-панель</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Управление системой, пользователями и тикетами
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className={`hover:shadow-lg transition-all duration-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '100ms' }}>
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

        <Card className={`hover:shadow-lg transition-all duration-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '200ms' }}>
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

        <Card className={`hover:shadow-lg transition-all duration-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '300ms' }}>
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

        <Card className={`hover:shadow-lg transition-all duration-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '400ms' }}>
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

      <Tabs
        value={activeTab}
        onValueChange={(v) => setSearchParams({ tab: v })}
        className={`w-full transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        style={{ transitionDelay: '500ms' }}
      >
        <TabsList className="w-full sm:w-auto flex flex-wrap gap-1">
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="tickets">Все тикеты</TabsTrigger>
          <TabsTrigger value="attendance">Посещаемость</TabsTrigger>
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
                <p className={`text-muted-foreground text-center py-8 transition-all duration-700 ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`} style={{ transitionDelay: '600ms' }}>
                  Пользователи не найдены
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((u, index) => (
                    <div
                      key={u.id}
                      className={cn(
                        'flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4 transition-all duration-500 hover:shadow-md',
                        u.blocked && 'bg-muted opacity-60',
                        isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                      )}
                      style={{ transitionDelay: `${600 + index * 50}ms` }}
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
                <p className={`text-muted-foreground text-center py-8 transition-all duration-700 ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`} style={{ transitionDelay: '600ms' }}>
                  Тикетов пока нет
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {paginatedTickets.map((ticket, index) => (
                      <Link
                        key={ticket.id}
                        to={`/ticket/${ticket.id}`}
                        className={`block transition-all duration-500 ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                          }`}
                        style={{ transitionDelay: `${600 + index * 50}ms` }}
                      >
                        <div className="p-4 border rounded-lg hover:bg-accent transition-colors hover:shadow-md">
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

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Посещаемость
              </CardTitle>
              <CardDescription>
                Время прихода и ухода сотрудников, отработанные часы
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <p className="text-muted-foreground text-center py-8">Загрузка...</p>
              ) : attendance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Нет данных о посещаемости. Убедитесь, что на бэкенде доступен эндпоинт /attendance.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-medium">ФИО сотрудника</th>
                        <th className="text-left p-3 font-medium">Пришёл</th>
                        <th className="text-left p-3 font-medium">Ушёл</th>
                        <th className="text-left p-3 font-medium">Проработал</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((row, index) => (
                        <tr
                          key={row.id ?? row.user_id ?? index}
                          className={cn(
                            'border-b last:border-0 transition-colors hover:bg-muted/30',
                            isMounted ? 'opacity-100' : 'opacity-0'
                          )}
                        >
                          <td className="p-3 font-medium">{getAttendanceDisplayName(row)}</td>
                          <td className="p-3 text-muted-foreground">{formatAttendanceTime(row.check_in)}</td>
                          <td className="p-3 text-muted-foreground">{formatAttendanceTime(row.check_out)}</td>
                          <td className="p-3">{formatDuration(row.check_in, row.check_out)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!attendanceLoading && attendance.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={loadAttendance}
                >
                  Обновить
                </Button>
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
