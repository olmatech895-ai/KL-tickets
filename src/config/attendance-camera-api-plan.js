
export const ATTENDANCE_CAMERA_API_BASE = ''

export const STREAM_ENDPOINTS = {
  root: 'GET /',
  entrance: 'GET /stream/entrance',
  exit: 'GET /stream/exit',
  stream: 'GET /stream',
}

export const REPORT_ENDPOINTS = {
  report: 'GET /report',
  settings: 'GET /settings',
  stats: 'GET /report/stats',
  dates: 'GET /report/dates',
  user: 'GET /report/user',
}

export const MANAGEMENT_ENDPOINTS = {
  scan: 'POST /scan',
  sessionStart: 'POST /session/start',
  sessionStop: 'POST /session/stop',
  sessionStatus: 'GET /session/status',
}

export const USERS_ENDPOINTS = {
  list: 'GET /users',
  add: 'POST /users',
  photo: 'GET /photos/{filename}',
  reorder: 'PATCH /users/reorder',
  delete: 'DELETE /users/{user_id}',
}

