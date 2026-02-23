
const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV
const BASE =
  isDev
    ? '/api-attendance'
    : ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ATTENDANCE_API_URL) ||
      'http://localhost:8000')

const DEFAULT_TIMEOUT = 15000
const CAMERA_PROBE_TIMEOUT = 4000

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE.replace(/\/$/, '')}${endpoint}`
  const timeout = options.timeout ?? DEFAULT_TIMEOUT
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, {
      ...options,
      signal: options.signal ?? controller.signal,
      headers: {
        Accept: 'application/json',
        ...options.headers,
      },
    })
    clearTimeout(timeoutId)
    if (res.status === 204) return null
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const text = await res.text()
      const data = text ? JSON.parse(text) : {}
      if (!res.ok) {
        const err = new Error(data.detail || data.message || `HTTP ${res.status}`)
        err.status = res.status
        throw err
      }
      return data
    }
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`)
      err.status = res.status
      throw err
    }
    return res
  } catch (e) {
    clearTimeout(timeoutId)
    throw e
  }
}

async function probeCamera(path) {
  const url = `${BASE.replace(/\/$/, '')}${path}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), CAMERA_PROBE_TIMEOUT)
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    clearTimeout(timeoutId)
    return res.ok
  } catch {
    clearTimeout(timeoutId)
    return false
  }
}

export async function getCameraStatus() {
  try {
    const [entranceOk, exitOk] = await Promise.all([
      probeCamera('/stream/entrance'),
      probeCamera('/stream/exit'),
    ])
    return [
      { id: 'entrance', name: 'Вход', status: entranceOk ? 'online' : 'offline' },
      { id: 'exit', name: 'Выход', status: exitOk ? 'online' : 'offline' },
    ]
  } catch {
    return [
      { id: 'entrance', name: 'Вход', status: 'unknown' },
      { id: 'exit', name: 'Выход', status: 'unknown' },
    ]
  }
}

/**
 * Отчёт с устройства (история проходов). Один запрос — все события за период.
 * Параметры: date_from, date_to (YYYY-MM-DD), max_records (1–10000, по умолчанию 2000).
 * Ответ: { records: [...], error: string | null }. Каждый record: person_id, name, department, time (ISO), checkpoint, attendance_status, label.
 * На фронте записи группируют по (person_id + дата): первое время = приход, последнее = уход.
 */
export async function getAttendanceFromDevice(params = {}) {
  const q = new URLSearchParams(params).toString()
  try {
    const data = await request(`/report/attendance-from-device${q ? `?${q}` : ''}`)
    return {
      records: Array.isArray(data?.records) ? data.records : [],
      error: data?.error ?? null,
    }
  } catch (e) {
    return { records: [], error: e?.message ?? 'Ошибка загрузки' }
  }
}

/**
 * Отчёт по посещаемости. Контракт API: docs/ATTENDANCE_API_DAILY_AND_CLOSE_DAY.md
 * Параметры: date_from, date_to (YYYY-MM-DD). Ответ: { rows: [] }, каждая строка — один сотрудник на одну дату (business_date).
 * При отсутствии выхода в этот день: last_seen/check_out = null.
 */
export async function getReport(params = {}) {
  const q = new URLSearchParams(params).toString()
  const data = await request(`/report${q ? `?${q}` : ''}`)
  const rows = data?.rows ?? []
  return Array.isArray(rows) ? rows : []
}

export async function getReportDatesList(params = {}) {
  const q = new URLSearchParams(params).toString()
  const data = await request(`/report/dates${q ? `?${q}` : ''}`)
  const dates = data?.dates ?? []
  return Array.isArray(dates) ? dates : []
}

export async function getReportHistory(params = {}) {
  const q = new URLSearchParams(params).toString()
  const data = await request(`/report/history${q ? `?${q}` : ''}`)
  const rows = data?.rows ?? []
  return Array.isArray(rows) ? rows : []
}

export async function getReportStats(params = {}) {
  const q = new URLSearchParams(params).toString()
  return request(`/report/stats${q ? `?${q}` : ''}`)
}

export async function getReportUser(params = {}) {
  const q = new URLSearchParams(params).toString()
  return request(`/report/user${q ? `?${q}` : ''}`)
}

export async function getSettings() {
  try {
    return await request('/settings')
  } catch {
    return null
  }
}

export async function getSessionStatus() {
  try {
    return await request('/session/status')
  } catch {
    return null
  }
}

export async function sessionStart() {
  return request('/session/start', { method: 'POST' })
}

export async function sessionStop() {
  return request('/session/stop', { method: 'POST' })
}

export async function postScan() {
  return request('/scan', { method: 'POST' })
}

/**
 * Нормализует строку отчёта из API под формат фронта. Ожидаемые поля от бэкенда:
 * user_id, user_name, fio, business_date (YYYY-MM-DD), first_seen (check_in), last_seen (check_out).
 * last_seen = null — выход не зафиксирован в этот день (не подставляем значение).
 */
export function mapReportRow(row) {
  const rawCheckOut = row.last_seen ?? row.last_exit ?? row.check_out
  return {
    id: row.user_name ?? row.user_id,
    user_id: row.user_id,
    user_name: row.user_name,
    full_name: (row.fio && row.fio.trim()) ? row.fio : (row.user_name ?? row.username),
    check_in: row.first_seen ?? row.first_entrance ?? row.check_in,
    check_out: rawCheckOut === undefined || rawCheckOut === null ? null : rawCheckOut,
    total_marks: row.total_marks,
    business_date: row.business_date ?? null,
    late_minutes: row.late_minutes,
    overtime_minutes: row.overtime_minutes,
  }
}

export const attendanceApi = {
  getCameraStatus,
  getAttendanceFromDevice,
  getReport,
  getReportDatesList,
  getReportHistory,
  getReportStats,
  getReportUser,
  getSettings,
  getSessionStatus,
  sessionStart,
  sessionStop,
  postScan,
  mapReportRow,
}

export default attendanceApi
