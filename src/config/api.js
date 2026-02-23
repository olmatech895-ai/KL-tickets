import { getStoredToken, setStoredToken, removeStoredToken } from '../lib/auth-storage'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const getAuthToken = () => getStoredToken()

export const setAuthToken = (token) => setStoredToken(token)

export const removeAuthToken = () => removeStoredToken()

const REQUEST_TIMEOUT_MS = 30000

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken()
  const controller = options.signal ? null : new AbortController()
  const timeoutId = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers,
    signal: options.signal || (controller ? controller.signal : undefined),
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    if (timeoutId) clearTimeout(timeoutId)

    if (response.status === 401) {
      removeAuthToken()
      window.location.href = '/login'
      const error = new Error('Unauthorized')
      error.status = 401
      throw error
    }

    const contentType = response.headers.get('content-type')
    let data = {}

    if (response.status === 204) {
      if (!response.ok) {
        try {
          const text = await response.text()
          if (text) {
            data = JSON.parse(text)
          }
        } catch {
        }
        const error = new Error(data.detail || data.message || 'Request failed')
        error.status = response.status
        error.detail = data.detail
        throw error
      }
      return null
    }

    if (contentType && contentType.includes('application/json')) {
      try {
        const text = await response.text()
        if (text) {
          data = JSON.parse(text)
        }
      } catch (e) {
        data = {}
      }
    }

    if (!response.ok) {
      const errorMessage = data.detail || data.message || `Request failed with status ${response.status}`
      const error = new Error(errorMessage)
      error.status = response.status
      error.detail = data.detail
      throw error
    }

    return data
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      const timeoutErr = new Error('Превышено время ожидания ответа сервера')
      timeoutErr.status = 408
      throw timeoutErr
    }
    if (error.message === 'Unauthorized' || error.status === 401) {
      throw error
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error('Ошибка сети. Проверьте подключение к серверу.')
      networkError.status = 0
      networkError.isNetworkError = true
      throw networkError
    }

    if (!error.status) {
      error.status = 0
    }

    throw error
  }
}

export const api = {
  register: async (data) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (response.access_token) {
      setAuthToken(response.access_token)
    }
    return response
  },

  login: async (data) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (response.access_token) {
      setAuthToken(response.access_token)
    }
    return response
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me', {
      method: 'GET',
    })
  },

  getUsers: async () => {
    return apiRequest('/users/', {
      method: 'GET',
    })
  },

  getUser: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: 'GET',
    })
  },

  createUser: async (data) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateUser: async (userId, data) => {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteUser: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    })
  },

  getTelegramLink: async () => {
    return apiRequest('/telegram/link', {
      method: 'GET',
    })
  },

  getTelegramStatus: async () => {
    return apiRequest('/telegram/status', {
      method: 'GET',
    })
  },

  /** Посещаемость: приход/уход сотрудников. Ожидает массив { user_id, full_name?, username?, check_in, check_out? } */
  getAttendance: async (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiRequest(`/attendance${q ? `?${q}` : ''}`, { method: 'GET' })
  },

  /** Состояние камер: массив { id, name?, status: 'online'|'offline'|'unknown' }. При 404/ошибке вернуть пустой массив. */
  getCameraStatus: async () => {
    try {
      const data = await apiRequest('/cameras/status', { method: 'GET' })
      return Array.isArray(data) ? data : (data?.cameras ?? [])
    } catch {
      return []
    }
  },

  getTickets: async () => {
    return apiRequest('/tickets/', {
      method: 'GET',
    })
  },

  getMyTickets: async () => {
    return apiRequest('/tickets/my', {
      method: 'GET',
    })
  },

  getTicket: async (ticketId) => {
    return apiRequest(`/tickets/${ticketId}`, {
      method: 'GET',
    })
  },

  createTicket: async (data) => {
    return apiRequest('/tickets/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateTicket: async (ticketId, data) => {
    return apiRequest(`/tickets/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteTicket: async (ticketId) => {
    return apiRequest(`/tickets/${ticketId}`, {
      method: 'DELETE',
    })
  },

  addComment: async (ticketId, data) => {
    return apiRequest(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getInventoryItems: async () => {
    return apiRequest('/inventory/')
  },

  getInventoryItem: async (itemId) => {
    return apiRequest(`/inventory/${itemId}`)
  },

  createInventoryItem: async (formData) => {
    const token = getAuthToken()
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    const response = await fetch(`${API_BASE_URL}/inventory/`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (response.status === 401) {
      removeAuthToken()
      throw new Error('Unauthorized')
    }

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Request failed')
    }
    return data
  },

  updateInventoryItem: async (itemId, formData) => {
    const token = getAuthToken()
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
      method: 'PUT',
      headers,
      body: formData,
    })

    if (response.status === 401) {
      removeAuthToken()
      throw new Error('Unauthorized')
    }

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Request failed')
    }
    return data
  },

  deleteInventoryItem: async (itemId) => {
    return apiRequest(`/inventory/${itemId}`, {
      method: 'DELETE',
    })
  },

  getTodos: async (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiRequest(`/todos${q ? `?${q}` : ''}`)
  },

  getArchivedTodos: async () => {
    return apiRequest('/todos/archived')
  },

  getMyTodos: async () => {
    return apiRequest('/todos/my')
  },

  getTodosByStatus: async (status) => {
    return apiRequest(`/todos/status/${status}`)
  },

  getTodo: async (todoId) => {
    return apiRequest(`/todos/${todoId}`)
  },

  createTodo: async (data) => {
    return apiRequest('/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateTodo: async (todoId, data) => {
    return apiRequest(`/todos/${todoId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteTodo: async (todoId) => {
    return apiRequest(`/todos/${todoId}`, {
      method: 'DELETE',
    })
  },

  archiveTodo: async (todoId) => {
    return apiRequest(`/todos/${todoId}/archive`, {
      method: 'POST',
    })
  },

  restoreTodo: async (todoId) => {
    return apiRequest(`/todos/${todoId}/restore`, {
      method: 'POST',
    })
  },

  addTodoComment: async (todoId, data) => {
    return apiRequest(`/todos/${todoId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  addTodoAttachment: async (todoId, formData) => {
    const token = getAuthToken()
    const headers = {}
    if (token) headers.Authorization = `Bearer ${token}`
    const response = await fetch(`${API_BASE_URL}/todos/${todoId}/attachments`, {
      method: 'POST',
      headers,
      body: formData,
    })
    if (response.status === 401) {
      removeAuthToken()
      throw new Error('Unauthorized')
    }
    const data = await response.json()
    if (!response.ok) throw new Error(data.detail || data.message || 'Request failed')
    return data
  },

  deleteTodoAttachment: async (todoId, attachmentId) => {
    return apiRequest(`/todos/${todoId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    })
  },

  addTodoListItem: async (todoId, data) => {
    return apiRequest(`/todos/${todoId}/todo-list-items`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateTodoListItem: async (todoId, itemId, checked) => {
    return apiRequest(`/todos/${todoId}/todo-list-items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ checked }),
    })
  },

  deleteTodoListItem: async (todoId, itemId) => {
    return apiRequest(`/todos/${todoId}/todo-list-items/${itemId}`, {
      method: 'DELETE',
    })
  },

  getTodoColumns: async () => {
    return apiRequest('/todos/columns')
  },

  updateTodoColumns: async (columns) => {
    return apiRequest('/todos/columns', {
      method: 'POST',
      body: JSON.stringify({ columns }),
    })
  },

  getKostaDailyMessages: async (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiRequest(`/chat/messages${q ? `?${q}` : ''}`, { method: 'GET' })
  },

  sendKostaDailyMessage: async (text, attachments = []) => {
    return apiRequest('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({
        text: text || '',
        attachments: attachments.map((a) => ({
          name: a.name,
          type: a.type,
          size: a.size,
          data_url: a.dataUrl,
        })),
      }),
    })
  },
}
