import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Clock, RefreshCw, Search, Settings, AlertCircle, TrendingUp, UserCheck, RotateCcw, FileDown } from 'lucide-react'
import { format, parseISO, differenceInMinutes, subDays, isValid } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '../lib/utils'
import { attendanceApi } from '../config/attendance-api'
import * as XLSX from 'xlsx'

function normalizeAttendanceRow(row) {
  const checkIn = row.check_in ?? row.checkIn ?? row.entrance ?? row.first_seen
  const checkOut = row.check_out ?? row.checkOut ?? row.exit ?? row.last_seen
  const businessDate = row.business_date || (checkIn ? format(parseISO(checkIn), 'yyyy-MM-dd') : null)
  return {
    ...row,
    id: row.id ?? row.user_id ?? row.userId,
    user_id: row.user_id ?? row.userId ?? row.id,
    full_name: row.full_name ?? row.fullName ?? row.username ?? row.fio,
    check_in: checkIn,
    check_out: checkOut,
    business_date: businessDate,
  }
}

function getRowKey(row, index) {
  let date = row.business_date || ''
  if (!date && row.check_in) {
    try {
      date = format(parseISO(row.check_in), 'yyyy-MM-dd')
    } catch { date = '' }
  }
  const uid = row.user_id ?? row.id ?? index
  return `${date}_${uid}_${index}`
}

/**
 * Сводка по отчёту с устройства: много событий (проходов) → одна строка на человека на дату.
 * Берём первое время = приход, последнее время = уход. Один проход за день → выход не фиксируем.
 */
function deviceRecordsToRows(records) {
  if (!Array.isArray(records) || records.length === 0) return []
  const byKey = new Map()
  const nameFrom = (r) => (r.name ?? r.fio ?? r.label ?? r.employee_name ?? r.person_name ?? r.full_name ?? '').trim()
  for (const r of records) {
    const time = r.time ? String(r.time).trim() : null
    if (!time) continue
    const date = time.slice(0, 10)
    if (date.length !== 10) continue
    const key = `${r.person_id ?? ''}_${date}`
    const recName = nameFrom(r)
    if (!byKey.has(key)) {
      byKey.set(key, {
        person_id: r.person_id,
        name: recName,
        department: r.department ?? '',
        date,
        times: [],
      })
    } else {
      const g = byKey.get(key)
      if (!g.name && recName) g.name = recName
      byKey.set(key, g)
    }
    byKey.get(key).times.push(time)
  }
  const rows = []
  for (const g of byKey.values()) {
    g.times.sort()
    const checkIn = g.times[0]
    const checkOut = g.times.length > 1 ? g.times[g.times.length - 1] : null
    rows.push({
      user_id: g.person_id,
      full_name: g.name || `ID ${g.person_id}`,
      business_date: g.date,
      check_in: checkIn,
      check_out: checkOut,
      department: g.department,
    })
  }
  return rows.sort((a, b) => {
    const d = (a.business_date || '').localeCompare(b.business_date || '')
    if (d !== 0) return d
    return (a.full_name || '').localeCompare(b.full_name || '')
  })
}



const ATTENDANCE_SETTINGS_KEY = 'attendanceWorkDaySettings'
const DEFAULT_SETTINGS = {
  workDayStart: '09:00',
  workDayEnd: '18:00',
  lateThresholdMinutes: 15,
  standardHoursPerDay: 8,
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(ATTENDANCE_SETTINGS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch { }
  return { ...DEFAULT_SETTINGS }
}

function saveSettings(s) {
  try {
    localStorage.setItem(ATTENDANCE_SETTINGS_KEY, JSON.stringify(s))
  } catch { }
}

function timeToMinutes(str) {
  if (!str || typeof str !== 'string') return 0
  const [h, m] = str.trim().split(':').map(Number)
  if (Number.isNaN(h)) return 0
  return (h || 0) * 60 + (Number.isNaN(m) ? 0 : m)
}

function dateToMinutes(value) {
  if (!value) return 0
  try {
    const d = typeof value === 'string' ? parseISO(value) : new Date(value)
    if (isNaN(d.getTime())) return 0
    return d.getHours() * 60 + d.getMinutes()
  } catch { return 0 }
}

function getDurationMinutes(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  try {
    const start = typeof checkIn === 'string' ? parseISO(checkIn) : new Date(checkIn)
    const end = typeof checkOut === 'string' ? parseISO(checkOut) : new Date(checkOut)
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0
    return differenceInMinutes(end, start)
  } catch { return 0 }
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
  return row.full_name || row.fullName || row.username || row.name || row.fio || (row.department ? `${row.department} (${row.user_id ?? row.person_id ?? '—'})` : null) || `ID ${row.user_id ?? row.userId ?? row.person_id ?? '—'}`
}

function getStatusLabel(row) {
  const parts = []
  if (!row.check_out) parts.push('Без выхода')
  if (row._late) parts.push('Опоздание')
  if (row._overtime) parts.push('Переработка')
  return parts.length ? parts.join(', ') : '—'
}

function downloadAttendanceExcel(rows, dateFrom, dateTo) {
  const data = rows.map((row) => ({
    'ФИО сотрудника': getAttendanceDisplayName(row),
    'Пришёл': formatAttendanceTime(row.check_in),
    'Ушёл': row.check_out ? formatAttendanceTime(row.check_out) : 'Выход не зафиксирован',
    'Проработал': row.check_out ? formatDuration(row.check_in, row.check_out) : '—',
    'Статус': getStatusLabel(row),
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Посещаемость')
  const name = dateFrom === dateTo
    ? `посещаемость_${dateFrom}.xlsx`
    : `посещаемость_${dateFrom}_${dateTo}.xlsx`
  XLSX.writeFile(wb, name)
}

export const Attendance = () => {
  const { isAdmin, isIT } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [dateTo, setDateTo] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [settings, setSettings] = useState(loadSettings)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [settingsForm, setSettingsForm] = useState(() => loadSettings())
  const [filterBy, setFilterBy] = useState('all')
  const [loadError, setLoadError] = useState(null)

  const loadAttendance = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const params = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      const { records, error } = await attendanceApi.getAttendanceFromDevice(params)
      const rows = deviceRecordsToRows(records)
      const mapped = rows.map((r) => normalizeAttendanceRow(r))
      setAttendance(mapped)
      if (error) setLoadError(error)
    } catch (e) {
      setAttendance([])
      setLoadError(e?.message ?? 'Ошибка загрузки отчёта')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    loadAttendance()
  }, [dateFrom, dateTo])

  const displayAttendance = attendance

  const workStartMin = timeToMinutes(settings.workDayStart)
  const lateLimitMin = workStartMin + (settings.lateThresholdMinutes || 0)
  const standardMinutes = (settings.standardHoursPerDay || 8) * 60

  const rowsWithFlags = useMemo(() => {
    return displayAttendance.map((row) => {
      const checkInMin = dateToMinutes(row.check_in)
      const durationMin = getDurationMinutes(row.check_in, row.check_out)
      const _late = checkInMin > lateLimitMin
      const _overtime = durationMin > standardMinutes
      return { ...row, _late, _overtime, _durationMin: durationMin }
    })
  }, [displayAttendance, lateLimitMin, standardMinutes])

  const searchFiltered = useMemo(() => {
    if (!searchQuery.trim()) return rowsWithFlags
    const q = searchQuery.toLowerCase().trim()
    return rowsWithFlags.filter((row) =>
      getAttendanceDisplayName(row).toLowerCase().includes(q)
    )
  }, [rowsWithFlags, searchQuery])

  const filteredAttendance = useMemo(() => {
    if (filterBy === 'all') return searchFiltered
    if (filterBy === 'late') return searchFiltered.filter((r) => r._late)
    if (filterBy === 'overtime') return searchFiltered.filter((r) => r._overtime)
    if (filterBy === 'ontime') return searchFiltered.filter((r) => !r._late && !r._overtime)
    return searchFiltered
  }, [searchFiltered, filterBy])

  const stats = useMemo(() => {
    const list = searchFiltered
    const totalRecords = list.length
    const lateCount = list.filter((r) => r._late).length
    const overtimeCount = list.filter((r) => r._overtime).length
    const totalMinutes = list.reduce((acc, r) => acc + (r._durationMin || 0), 0)
    const avgMinutes = totalRecords ? Math.round(totalMinutes / totalRecords) : 0
    return {
      totalRecords,
      lateCount,
      overtimeCount,
      totalMinutes,
      avgMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      avgHours: (avgMinutes / 60).toFixed(1),
    }
  }, [searchFiltered])

  const dailyMiniReport = useMemo(() => {
    const byDate = new Map()
    for (const row of searchFiltered) {
      const d = row.business_date || (row.check_in ? format(parseISO(row.check_in), 'yyyy-MM-dd') : null)
      if (!d) continue
      if (!byDate.has(d)) byDate.set(d, { date: d, count: 0, noExit: 0 })
      const entry = byDate.get(d)
      entry.count += 1
      if (!row.check_out) entry.noExit += 1
    }
    return Array.from(byDate.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(({ date, count, noExit }) => {
        const parsed = parseISO(date)
        const label = isValid(parsed) ? format(parsed, 'dd.MM.yyyy', { locale: ru }) : date
        return { date, label, count, noExit }
      })
  }, [searchFiltered])

  if (!isAdmin && !isIT) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-lg text-muted-foreground">Доступ запрещен</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/">На главную</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-6 lg:px-8 w-full pt-16 lg:pt-4 sm:pt-6">
      <div
        className={cn(
          'flex flex-col gap-4 pl-12 lg:pl-0 transition-all duration-700',
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        )}
      >
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight">
            Посещаемость
          </h1>
          <p className="text-muted-foreground mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base">
            Время прихода и ухода сотрудников, отработанные часы
          </p>
        </div>
      </div>

      {/* Статистика — всегда видна (при загрузке и при пустом отчёте показываются текущие или нулевые значения) */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className={cn('transition-all duration-500', isMounted ? 'opacity-100' : 'opacity-0')} style={{ transitionDelay: '150ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Записей в отчёте</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground mt-1">за выбранный период</p>
          </CardContent>
        </Card>
        <Card className={cn('transition-all duration-500', isMounted ? 'opacity-100' : 'opacity-0')} style={{ transitionDelay: '200ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Опозданий</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lateCount}</div>
            <p className="text-xs text-muted-foreground mt-1">приход после {settings.workDayStart} + {settings.lateThresholdMinutes} мин</p>
          </CardContent>
        </Card>
        <Card className={cn('transition-all duration-500', isMounted ? 'opacity-100' : 'opacity-0')} style={{ transitionDelay: '250ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Переработок</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overtimeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">больше {settings.standardHoursPerDay} ч в день</p>
          </CardContent>
        </Card>
        <Card className={cn('transition-all duration-500', isMounted ? 'opacity-100' : 'opacity-0')} style={{ transitionDelay: '300ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего часов</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}</div>
            <p className="text-xs text-muted-foreground mt-1">в среднем {stats.avgHours} ч на запись</p>
          </CardContent>
        </Card>
      </div>

      <Card
        className={cn(
          'overflow-hidden transition-all duration-700',
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}
        style={{ transitionDelay: '200ms' }}
      >
        <CardHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Clock className="h-5 w-5" />
            Отчёт по посещаемости
            {searchQuery.trim() ? ` (${filteredAttendance.length} из ${displayAttendance.length})` : ` (${displayAttendance.length})`}
          </CardTitle>
          <CardDescription className="text-sm">
            Данные с устройства: по каждому сотруднику за день — первое время (приход), последнее (уход). Один проход за день — выход не фиксируется.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {loadError && (
            <div className="mx-4 md:mx-6 mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {loadError}
            </div>
          )}
          {/* Фильтры */}
          <div className="px-4 md:px-6 pb-4 space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[180px] space-y-1.5">
                <Label className="text-xs text-muted-foreground">Поиск по ФИО</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Введите ФИО или имя..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Период с</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 w-[140px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">по</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 w-[140px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Тип</Label>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="h-9 w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все записи</SelectItem>
                    <SelectItem value="late">С опозданием</SelectItem>
                    <SelectItem value="overtime">С переработкой</SelectItem>
                    <SelectItem value="ontime">Вовремя</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={loadAttendance}
                disabled={loading}
                title="Обновить отчёт"
              >
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 shrink-0 gap-1.5"
                onClick={() => {
                  const today = format(new Date(), 'yyyy-MM-dd')
                  setDateFrom(today)
                  setDateTo(today)
                  setSearchQuery('')
                  setFilterBy('all')
                }}
                title="Сброс фильтров: текущая дата, все записи"
              >
                <RotateCcw className="h-4 w-4" />
                Сброс
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 shrink-0 gap-1.5"
                onClick={() => downloadAttendanceExcel(filteredAttendance, dateFrom, dateTo)}
                disabled={filteredAttendance.length === 0}
                title="Скачать отчёт в Excel"
              >
                <FileDown className="h-4 w-4" />
                Excel
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => {
                  setSettingsForm(loadSettings())
                  setSettingsDialogOpen(true)
                }}
                title="Настройки рабочего дня"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Источник: отчёт с устройства (attendance-from-device). Одна строка — один сотрудник за одну дату: первое событие = приход, последнее = уход.
            </p>
          </div>
          {dailyMiniReport.length > 0 && !loading && (
            <div className="px-4 md:px-6 pb-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Мини-отчёт по дням</p>
              <div className="flex flex-wrap gap-2">
                {dailyMiniReport.map((day) => (
                  <div
                    key={day.date}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs border',
                      day.noExit > 0 ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' : 'bg-muted/30 border-border'
                    )}
                  >
                    <span className="font-medium text-foreground">{day.label}</span>
                    <span className="text-muted-foreground">— {day.count} записей</span>
                    {day.noExit > 0 && (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">{day.noExit} без выхода</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {loading ? (
            <div
              className={cn(
                'text-center py-12 px-4 transition-all duration-700',
                isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              )}
              style={{ transitionDelay: '300ms' }}
            >
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : attendance.length === 0 ? (
            <div
              className={cn(
                'text-center py-12 px-4 transition-all duration-700',
                isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              )}
              style={{ transitionDelay: '300ms' }}
            >
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                Нет данных о посещаемости
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Убедитесь, что на бэкенде доступен эндпоинт <code className="bg-muted px-1.5 py-0.5 rounded text-xs">GET /attendance</code>
              </p>
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">По запросу никого не найдено</p>
              <p className="text-muted-foreground text-sm mt-1">Измените поиск или период</p>
            </div>
          ) : (
            <div className="hidden md:block -mx-4 md:mx-0 px-4 md:px-0">
              <div className="relative w-full">
                <div className="overflow-x-auto overflow-y-visible xl:overflow-x-visible scrollbar-hide">
                  <div className="w-full align-middle">
                    <div className="overflow-hidden border rounded-lg shadow-sm bg-card w-full">
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow className="bg-muted/50 border-b">
                            <TableHead className="font-semibold">ФИО сотрудника</TableHead>
                            <TableHead className="font-semibold">Пришёл</TableHead>
                            <TableHead className="font-semibold">Ушёл</TableHead>
                            <TableHead className="font-semibold">Проработал</TableHead>
                            <TableHead className="font-semibold w-[120px]">Статус</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAttendance.map((row, index) => (
                            <TableRow
                              key={getRowKey(row, index)}
                              className={cn(
                                'hover:bg-muted/50 transition-all duration-500',
                                isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4',
                                row._late && 'bg-red-500/10 dark:bg-red-500/20 border-l-4 border-l-red-500'
                              )}
                              style={{ transitionDelay: `${300 + index * 50}ms` }}
                            >
                              <TableCell className="font-medium py-3">
                                {getAttendanceDisplayName(row)}
                              </TableCell>
                              <TableCell className="py-3 text-muted-foreground">
                                {formatAttendanceTime(row.check_in)}
                              </TableCell>
                              <TableCell className="py-3 text-muted-foreground">
                                {row.check_out ? formatAttendanceTime(row.check_out) : (
                                  <span className="text-amber-600 dark:text-amber-400 font-medium" title="Сотрудник не отметился на выход в этот день">
                                    Выход не зафиксирован
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="py-3">
                                {row.check_out ? formatDuration(row.check_in, row.check_out) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="flex flex-wrap gap-1">
                                  {!row.check_out && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" title="Выход не зафиксирован в этот день">
                                      Без выхода
                                    </span>
                                  )}
                                  {row._late && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                      Опоздание
                                    </span>
                                  )}
                                  {row._overtime && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                      Переработка
                                    </span>
                                  )}
                                  {row.check_out && !row._late && !row._overtime && <span className="text-muted-foreground text-xs">—</span>}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile: карточки */}
          {!loading && filteredAttendance.length > 0 && (
            <div className="block md:hidden space-y-3 p-4 md:p-0">
              {filteredAttendance.map((row, index) => (
                <Card
                  key={getRowKey(row, index)}
                  className={cn(
                    'hover:shadow-md transition-all duration-500 border overflow-hidden',
                    isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4',
                    row._late && 'bg-red-500/10 dark:bg-red-500/20 border-l-4 border-red-500'
                  )}
                  style={{ transitionDelay: `${300 + index * 50}ms` }}
                >
                  <CardContent className="p-4">
                    <h3 className="font-bold text-base mb-3">{getAttendanceDisplayName(row)}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Пришёл:</span>
                        <span>{formatAttendanceTime(row.check_in)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ушёл:</span>
                        <span>{row.check_out ? formatAttendanceTime(row.check_out) : <span className="text-amber-600 dark:text-amber-400 font-medium">Выход не зафиксирован</span>}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground font-medium">Проработал:</span>
                        <span className="font-semibold">{row.check_out ? formatDuration(row.check_in, row.check_out) : '—'}</span>
                      </div>
                      {(!row.check_out || row._late || row._overtime) && (
                        <div className="flex flex-wrap gap-1 pt-2 border-t mt-2">
                          {!row.check_out && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                              Без выхода
                            </span>
                          )}
                          {row._late && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                              Опоздание
                            </span>
                          )}
                          {row._overtime && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                              Переработка
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Настройки рабочего дня
            </DialogTitle>
            <DialogDescription>
              Предел опоздания, норма часов и переработка. Используется для подсчёта статистики и фильтров.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Начало рабочего дня</Label>
                <Input
                  type="time"
                  value={settingsForm.workDayStart}
                  onChange={(e) => setSettingsForm((s) => ({ ...s, workDayStart: e.target.value || '09:00' }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Конец рабочего дня</Label>
                <Input
                  type="time"
                  value={settingsForm.workDayEnd}
                  onChange={(e) => setSettingsForm((s) => ({ ...s, workDayEnd: e.target.value || '18:00' }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Предел опоздания (минут)</Label>
              <Input
                type="number"
                min={0}
                max={120}
                value={settingsForm.lateThresholdMinutes}
                onChange={(e) =>
                  setSettingsForm((s) => ({
                    ...s,
                    lateThresholdMinutes: Math.max(0, parseInt(e.target.value, 10) || 0),
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Приход после начала дня + это количество минут считается опозданием
              </p>
            </div>
            <div className="space-y-2">
              <Label>Норма часов в день</Label>
              <Input
                type="number"
                min={1}
                max={24}
                step={0.5}
                value={settingsForm.standardHoursPerDay}
                onChange={(e) =>
                  setSettingsForm((s) => ({
                    ...s,
                    standardHoursPerDay: Math.max(1, Math.min(24, parseFloat(e.target.value) || 8)),
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Работа больше этого времени считается переработкой
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={() => {
                setSettings(settingsForm)
                saveSettings(settingsForm)
                setSettingsDialogOpen(false)
              }}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
