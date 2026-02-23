import { API_BASE_URL, getAuthToken } from '../../../config/api'

/**
 * @param {Object} todo 
 * @returns {number}
 */
export function getChecklistProgress(todo) {
  if (!todo || !todo.todoLists || todo.todoLists.length === 0) {
    return 0
  }
  const checkedCount = todo.todoLists.filter((item) => item.checked).length
  return Math.round((checkedCount / todo.todoLists.length) * 100)
}

/**
 * @param {Object} attachment
 * @returns {string|null}
 */
export function getAttachmentUrl(attachment) {
  if (attachment.url || attachment.dataUrl) return attachment.url || attachment.dataUrl
  if (attachment.filePath) {
    const path = String(attachment.filePath).trim()
    if (!path) return null
    if (path.startsWith('http')) return path
    const base = API_BASE_URL.replace(/\/api\/v1\/?$/, '')
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`
  }
  return null
}

/**
 * @param {Object} attachment
 * @returns {boolean}
 */
export function isAttachmentImage(attachment) {
  const t = (attachment.fileType || attachment.type || '').toString()
  return attachment.type === 'image' || t.startsWith('image/')
}

/**
 * Скачивает файл по URL с заголовком Authorization (чтобы работало для защищённых эндпоинтов).
 * При необходимости открывает в новой вкладке (для изображений).
 */
export async function downloadAttachmentWithAuth(attachment, options = {}) {
  const { openInNewTab = false } = options
  const url = getAttachmentUrl(attachment)
  if (!url) return false
  const token = getAuthToken()
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  try {
    const res = await fetch(url, { headers })
    if (!res.ok) return false
    const blob = await res.blob()
    const name = attachment.filename ?? attachment.name ?? 'file'
    const objectUrl = URL.createObjectURL(blob)
    if (openInNewTab) {
      window.open(objectUrl, '_blank', 'noopener')
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000)
    } else {
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = name
      a.rel = 'noopener'
      a.click()
      URL.revokeObjectURL(objectUrl)
    }
    return true
  } catch {
    return false
  }
}
