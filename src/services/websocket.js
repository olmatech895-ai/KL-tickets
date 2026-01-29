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
    this.suppressErrors = false
    this.lastConnectionError = null
  }

  connect(token) {
    if (!token) {
      return
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts && this.suppressErrors) {
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
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
      const isHttps = apiUrl.startsWith('https://')
      const wsProtocol = isHttps ? 'wss:' : 'ws:'
      let wsHost = apiUrl.replace(/^https?:\/\//, '').replace(/\/api\/v1$/, '').replace(/\/$/, '')
      if (!wsHost) {
        wsHost = window.location.host
      }
      const wsUrl = `${wsProtocol}//${wsHost}/api/v1/ws?token=${encodeURIComponent(token)}`

      try {
        this.ws = new WebSocket(wsUrl)
      } catch (error) {
        this.isConnecting = false
        this.lastConnectionError = error
        if (!this.suppressErrors) {
          this.emit('error', { error, message: 'Failed to create WebSocket connection' })
        }
        return
      }

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
        this.lastConnectionError = error
        
        if (this.suppressErrors) {
          return
        }
        
        const errorDetails = {
          error,
          url: wsUrl,
          readyState: this.ws?.readyState,
          timestamp: new Date().toISOString()
        }
        
        let errorMessage = 'WebSocket connection error'
        
        if (this.ws?.readyState === WebSocket.CLOSED || this.ws?.readyState === WebSocket.CLOSING) {
          const closeCode = this.ws?.closeCode || 'unknown'
          errorMessage = `WebSocket connection failed. Close code: ${closeCode}`
        } else if (wsUrl.startsWith('wss://')) {
          errorMessage = 'WebSocket SSL/TLS connection failed. Possible causes: invalid certificate, server not configured for WSS, or proxy issues.'
        } else {
          errorMessage = 'WebSocket connection failed. Possible causes: server not running, wrong URL, or network issues.'
        }
        
        errorDetails.message = errorMessage
        this.emit('error', errorDetails)
      }

      this.ws.onclose = (event) => {
        this.isConnecting = false
        this.stopPingInterval()
        
        const closeDetails = {
          code: event.code,
          reason: event.reason || 'No reason provided',
          wasClean: event.wasClean,
          url: wsUrl,
          timestamp: new Date().toISOString()
        }
        
        let closeMessage = `WebSocket closed. Code: ${event.code}`
        
        switch (event.code) {
          case 1000:
            closeMessage = 'WebSocket closed normally'
            break
          case 1001:
            closeMessage = 'WebSocket going away (server shutdown or browser navigation)'
            break
          case 1002:
            closeMessage = 'WebSocket protocol error'
            break
          case 1003:
            closeMessage = 'WebSocket unsupported data type'
            break
          case 1006:
            closeMessage = 'WebSocket abnormal closure (connection lost without close frame). Possible causes: server not running, network issue, or SSL/TLS problem'
            break
          case 1008:
            closeMessage = 'WebSocket closed due to policy violation'
            break
          case 1011:
            closeMessage = 'WebSocket server error'
            break
          case 1012:
            closeMessage = 'WebSocket service restart'
            break
          case 1013:
            closeMessage = 'WebSocket try again later'
            break
          case 1014:
            closeMessage = 'WebSocket bad gateway'
            break
          case 1015:
            closeMessage = 'WebSocket TLS handshake failed'
            break
          default:
            if (event.code >= 4000 && event.code < 5000) {
              closeMessage = `WebSocket application error: ${event.code}`
            }
        }
        
        closeDetails.message = closeMessage
        
        if (event.code === 1006 && this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.suppressErrors = true
        }
        
        if (!this.suppressErrors) {
          this.emit('disconnected', closeDetails)
        }
        
        if (event.code === 1000 || event.code === 1008) {
          this.suppressErrors = false
          this.reconnectAttempts = 0
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
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.suppressErrors = true
        }
      }
    } catch (error) {
      this.isConnecting = false
      this.lastConnectionError = error
      
      if (!this.suppressErrors) {
        this.emit('error', { error })
      }
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
