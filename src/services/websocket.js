class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.listeners = new Map()
    this.isConnecting = false
    this.token = null
    this.reconnectTimeout = null
    this.pingInterval = null
  }

  connect(token) {
    if (!token) {
      return
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    if (this.ws) {
      const state = this.ws.readyState
      if (state === WebSocket.CONNECTING) {
        this.ws.close()
      } else if (state === WebSocket.CLOSING || state === WebSocket.CLOSED) {
        this.ws = null
      }
    }

    if (this.isConnecting) {
      return
    }

    this.token = token
    this.isConnecting = true

    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://testdomen.uz/api/v1'
      const wsHost = apiUrl.replace(/^https?:\/\//, '').replace(/\/api\/v1$/, '')
      const wsUrl = `${wsProtocol}//${wsHost}/api/v1/ws?token=${encodeURIComponent(token)}`

      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.isConnecting = false
        this.reconnectAttempts = 0
        
        this.startPingInterval()
        
        this.emit('connected', {})
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
        }
      }

      this.ws.onerror = (error) => {
        this.emit('error', { error })
      }

      this.ws.onclose = (event) => {
        this.isConnecting = false
        this.stopPingInterval()
        this.emit('disconnected', { code: event.code, reason: event.reason })
        
        if (event.code === 1000 || event.code === 1008) {
          return
        }
        
        if (event.code !== 1000 && event.code !== 1008 && this.token && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000)
          
          const reconnectTimeout = setTimeout(() => {
            if (this.token && !this.isConnecting && this.ws?.readyState !== WebSocket.OPEN) {
              this.connect(this.token)
            }
          }, delay)
          
          this.reconnectTimeout = reconnectTimeout
        }
      }
    } catch (error) {
      this.isConnecting = false
      this.emit('error', { error })
    }
  }

  handleMessage(data) {
    const { type } = data

    switch (type) {
      case 'connected':
        this.emit('connected', data)
        break
      case 'subscribed':
        this.emit('subscribed', data)
        break
      case 'unsubscribed':
        this.emit('unsubscribed', data)
        break
      case 'pong':
        break
      case 'ticket_created':
      case 'ticket_updated':
      case 'ticket_deleted':
      case 'comment_added':
      case 'todo_created':
      case 'todo_updated':
      case 'todo_deleted':
      case 'todo_comment_added':
      case 'todo_list_item_added':
      case 'todo_list_item_updated':
      case 'todo_list_item_deleted':
      case 'columns_updated':
        this.emit(type, data)
        break
      default:
    }
  }

  subscribeToTicket(ticketId) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe_ticket',
        ticket_id: ticketId
      }))
    }
  }

  unsubscribeFromTicket(ticketId) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe_ticket',
        ticket_id: ticketId
      }))
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)

    return () => {
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
        }
      })
    }
  }

  startPingInterval() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  disconnect() {
    this.stopPingInterval()
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    
    if (this.ws) {
      const state = this.ws.readyState
      if (state === WebSocket.CONNECTING || state === WebSocket.OPEN) {
        this.ws.close(1000, 'Client disconnect')
      }
      this.ws = null
    }
    this.listeners.clear()
    this.token = null
    this.reconnectAttempts = 0
    this.isConnecting = false
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

export const wsService = new WebSocketService()
