import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { api, getAuthToken, API_BASE_URL } from '../config/api'
import { wsService } from '../services/websocket'

const TodoContext = createContext()

export const useTodos = () => {
  const context = useContext(TodoContext)
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider')
  }
  return context
}

const transformTodoFromAPI = (todo) => {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description || '',
    status: todo.status,
    assignedTo: todo.assigned_to || [],
    tags: todo.tags || [],
    comments: (todo.comments || []).map(comment => ({
      id: comment.id,
      text: comment.text,
      authorId: comment.author_id,
      authorName: comment.author_name,
      createdAt: comment.created_at,
    })),
    todoLists: (todo.todo_lists || []).map(item => ({
      id: item.id,
      text: item.text,
      checked: item.checked,
      createdAt: item.created_at,
    })),
    attachments: (todo.attachments || []).map(att => {
      const filePath = att.file_path ?? att.file_path_url
      const baseUrl = typeof API_BASE_URL === 'string' ? API_BASE_URL.replace(/\/api\/v1\/?$/, '') : ''
      const resolvedUrl = att.url ?? att.data_url ?? (filePath && (filePath.startsWith('http') ? filePath : baseUrl ? `${baseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}` : null))
      return {
        id: att.id,
        filename: att.filename ?? att.file_name ?? att.name,
        name: att.filename ?? att.file_name ?? att.name ?? 'Файл',
        filePath: filePath ?? null,
        fileType: att.file_type ?? att.fileType,
        fileSize: att.file_size ?? att.fileSize,
        isBackground: !!att.is_background,
        createdAt: att.created_at,
        url: resolvedUrl ?? null,
        dataUrl: att.data_url ?? att.url ?? null,
      }
    }),
    storyPoints: todo.story_points,
    inFocus: todo.in_focus || false,
    read: todo.read !== undefined ? todo.read : true,
    project: todo.project || null,
    dueDate: (() => {
      const d = todo.due_date || null
      if (!d) return null
      if (typeof d === 'string' && d.length >= 10) return d.slice(0, 10)
      return d
    })(),
    dueTime: (() => {
      const d = todo.due_date || null
      if (!d || typeof d !== 'string' || !d.includes('T')) return null
      const match = d.match(/T(\d{1,2}):(\d{2})/)
      return match ? `${match[1].padStart(2, '0')}:${match[2]}` : null
    })(),
    allDay: todo.all_day !== undefined ? !!todo.all_day : (() => {
      const d = todo.due_date || null
      if (!d || typeof d !== 'string') return true
      if (!d.includes('T')) return true
      const match = d.match(/T(\d{1,2}):(\d{2})/)
      if (!match) return true
      return match[1] === '00' && match[2] === '00'
    })(),
    createdBy: todo.created_by,
    createdAt: todo.created_at,
    updatedAt: todo.updated_at,
    backgroundImage: todo.background_image || null,
    isArchived: todo.is_archived || todo.archived || false,
    notifyWhenDue: !!todo.notify_when_due,
    calendarOnly: !!todo.calendar_only,
  }
}

const transformTodoToAPI = (todo) => {
  const data = {
    title: todo.title,
    description: todo.description || null,
    status: todo.status,
    assigned_to: todo.assignedTo || [],
    tags: todo.tags || [],
    story_points: todo.storyPoints || null,
    in_focus: todo.inFocus || false,
    project: todo.project || null,
    due_date: (() => {
      if (!todo.dueDate) return null
      if (todo.dueTime) return `${todo.dueDate}T${todo.dueTime}:00`
      return `${todo.dueDate}T00:00:00`
    })(),
    all_day: todo.allDay !== undefined ? !!todo.allDay : !todo.dueTime,
    notify_when_due: !!todo.notifyWhenDue,
    calendar_only: !!todo.calendarOnly,
    background_image: todo.backgroundImage || null,
  }
  if (todo.attachments != null) {
    data.attachments = todo.attachments.map((att) => ({
      id: att.id,
      filename: att.filename ?? att.name,
      file_type: att.fileType ?? att.type,
      file_size: att.fileSize ?? att.size,
      is_background: att.isBackground ?? false,
      data_url: att.url ?? att.dataUrl,
      file_path: att.filePath,
    }))
  }
  return data
}

export const TodoProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  const [todos, setTodos] = useState([])
  const [archivedTodos, setArchivedTodos] = useState([])
  const [loading, setLoading] = useState(false)
  const [archivedLoading, setArchivedLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const archivedLoadingRef = useRef(false)

  useEffect(() => {
    if (!authLoading && user && !isInitialized) {
      setIsInitialized(true)
      setLoading(false)
      loadTodos()
      const cleanup = setupWebSocket()
      return () => {
        cleanup()
        setIsInitialized(false)
        if (!user) {
          wsService.disconnect()
        }
      }
    } else if (!authLoading && !user) {
      setTodos([])
      setLoading(false)
      setIsInitialized(false)
      wsService.disconnect()
    }
  }, [user?.id, authLoading])

  const setupWebSocket = () => {
    if (!user) {
      return () => { }
    }

    const token = getAuthToken()
    if (!token) {
      return () => { }
    }

    if (!wsService.isConnected() && !wsService.isConnecting) {
      wsService.connect(token)
    }

    const unsubscribeTodoCreated = wsService.on('todo_created', (data) => {
      const transformedTodo = transformTodoFromAPI(data.todo)

      setTodos(prevTodos => {
        const exists = prevTodos.some(t => t.id === transformedTodo.id)
        if (exists) {
          return prevTodos.map(t => t.id === transformedTodo.id ? transformedTodo : t)
        }
        return [...prevTodos, transformedTodo]
      })
    })

    const unsubscribeTodoUpdated = wsService.on('todo_updated', (data) => {
      const transformedTodo = transformTodoFromAPI(data.todo)

      setTodos(prevTodos => {
        const exists = prevTodos.some(t => t.id === transformedTodo.id)
        if (exists) {
          return prevTodos.map(t => t.id === transformedTodo.id ? transformedTodo : t)
        } else {
          return [...prevTodos, transformedTodo]
        }
      })
    })

    const unsubscribeTodoDeleted = wsService.on('todo_deleted', (data) => {
      setTodos(prevTodos =>
        prevTodos.filter(t => t.id !== data.todo_id)
      )
    })

    const unsubscribeTodoCommentAdded = wsService.on('todo_comment_added', (data) => {
      const transformedTodo = transformTodoFromAPI(data.todo)

      setTodos(prevTodos =>
        prevTodos.map(t => t.id === transformedTodo.id ? transformedTodo : t)
      )
    })

    const unsubscribeTodoListItemAdded = wsService.on('todo_list_item_added', (data) => {
      const transformedTodo = transformTodoFromAPI(data.todo)

      setTodos(prevTodos =>
        prevTodos.map(t => t.id === transformedTodo.id ? transformedTodo : t)
      )
    })

    const unsubscribeTodoListItemUpdated = wsService.on('todo_list_item_updated', (data) => {
      const transformedTodo = transformTodoFromAPI(data.todo)

      setTodos(prevTodos =>
        prevTodos.map(t => t.id === transformedTodo.id ? transformedTodo : t)
      )
    })

    const unsubscribeTodoListItemDeleted = wsService.on('todo_list_item_deleted', (data) => {
      const transformedTodo = transformTodoFromAPI(data.todo)

      setTodos(prevTodos =>
        prevTodos.map(t => t.id === transformedTodo.id ? transformedTodo : t)
      )
    })

    const unsubscribeTodoArchived = wsService.on('todo_archived', (data) => {
      setTodos(prevTodos =>
        prevTodos.filter(t => t.id !== data.todo_id)
      )
    })

    const unsubscribeTodoRestored = wsService.on('todo_restored', (data) => {
      const transformedTodo = transformTodoFromAPI(data.todo)

      setTodos(prevTodos => {
        const exists = prevTodos.some(t => t.id === transformedTodo.id)
        if (exists) {
          return prevTodos.map(t => t.id === transformedTodo.id ? transformedTodo : t)
        }
        return [...prevTodos, transformedTodo]
      })
    })

    return () => {
      unsubscribeTodoCreated()
      unsubscribeTodoUpdated()
      unsubscribeTodoDeleted()
      unsubscribeTodoCommentAdded()
      unsubscribeTodoListItemAdded()
      unsubscribeTodoListItemUpdated()
      unsubscribeTodoListItemDeleted()
      unsubscribeTodoArchived()
      unsubscribeTodoRestored()
    }
  }

  const loadTodos = useCallback(async () => {
    if (loading) {
      return
    }

    try {
      setLoading(true)
      const todosData = await api.getTodos()
      const transformedTodos = todosData.map(transformTodoFromAPI)
      setTodos(transformedTodos)
    } catch (error) {
      setTodos([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadArchivedTodos = useCallback(async () => {
    if (archivedLoadingRef.current) {
      return
    }

    try {
      archivedLoadingRef.current = true
      setArchivedLoading(true)
      const todosData = await api.getArchivedTodos()

      if (!todosData) {
        setArchivedTodos([])
        return
      }

      if (!Array.isArray(todosData)) {
        setArchivedTodos([])
        return
      }

      const transformedTodos = todosData.map(transformTodoFromAPI)
      setArchivedTodos(transformedTodos)
    } catch (error) {
      if (error?.status === 404 || error?.isNetworkError) {
        setArchivedTodos([])
      } else {
        setArchivedTodos([])
      }
    } finally {
      archivedLoadingRef.current = false
      setArchivedLoading(false)
    }
  }, [])

  const addTodo = async (todo) => {
    try {
      const apiData = transformTodoToAPI(todo)
      const createdTodo = await api.createTodo(apiData)
      const transformedTodo = transformTodoFromAPI(createdTodo)
      setTodos([...todos, transformedTodo])
      return transformedTodo
    } catch (error) {
      throw error
    }
  }

  const addComment = async (todoId, commentText, authorId, authorName) => {
    try {
      const updatedTodo = await api.addTodoComment(todoId, { text: commentText })
      const transformedTodo = transformTodoFromAPI(updatedTodo)
      setTodos(todos.map(t => t.id === todoId ? transformedTodo : t))
      const comment = transformedTodo.comments[transformedTodo.comments.length - 1]
      return comment
    } catch (error) {
      if (error?.status === 403) {
        const forbiddenError = new Error('Вы не можете комментировать эту задачу')
        forbiddenError.status = 403
        throw forbiddenError
      }

      throw error
    }
  }

  const updateTodo = async (id, updates) => {
    try {
      const apiUpdates = {}
      if (updates.title !== undefined) apiUpdates.title = updates.title
      if (updates.description !== undefined) apiUpdates.description = updates.description
      if (updates.status !== undefined) apiUpdates.status = updates.status
      if (updates.assignedTo !== undefined) apiUpdates.assigned_to = updates.assignedTo
      if (updates.tags !== undefined) apiUpdates.tags = updates.tags
      if (updates.storyPoints !== undefined) apiUpdates.story_points = updates.storyPoints
      if (updates.inFocus !== undefined) apiUpdates.in_focus = updates.inFocus
      if (updates.read !== undefined) apiUpdates.read = updates.read
      if (updates.project !== undefined) apiUpdates.project = updates.project
      if (updates.dueDate !== undefined || updates.dueTime !== undefined) {
        const cur = todos.find((t) => t.id === id)
        const date = updates.dueDate !== undefined ? updates.dueDate : cur?.dueDate
        const time = updates.dueTime !== undefined ? updates.dueTime : cur?.dueTime
        apiUpdates.due_date = date ? (time ? `${date}T${time}:00` : `${date}T00:00:00`) : null
        apiUpdates.all_day = !time
      }
      if (updates.backgroundImage !== undefined) apiUpdates.background_image = updates.backgroundImage
      if (updates.notifyWhenDue !== undefined) apiUpdates.notify_when_due = !!updates.notifyWhenDue
      if (updates.calendarOnly !== undefined) apiUpdates.calendar_only = !!updates.calendarOnly
      if (updates.allDay !== undefined) apiUpdates.all_day = !!updates.allDay
      if (updates.todoLists !== undefined) {
        apiUpdates.todo_lists = updates.todoLists.map(item => ({
          id: item.id,
          text: item.text,
          checked: item.checked || false,
        }))
      }
      if (updates.attachments !== undefined) {
        apiUpdates.attachments = updates.attachments.map((att) => ({
          id: att.id,
          filename: att.filename ?? att.name,
          file_type: att.fileType ?? att.type,
          file_size: att.fileSize ?? att.size,
          is_background: att.isBackground ?? false,
          data_url: att.url ?? att.dataUrl,
          file_path: att.filePath,
        }))
      }

      const updatedTodo = await api.updateTodo(id, apiUpdates)
      let transformedTodo = transformTodoFromAPI(updatedTodo)
      if (updates.attachments?.length) {
        const fromApi = transformedTodo.attachments || []
        const withUrls = fromApi.map((att, i) => {
          const local = updates.attachments[i]
          const url = local?.url ?? local?.dataUrl ?? att.url ?? att.dataUrl
          return url ? { ...att, url, dataUrl: url } : att
        })
        const extra = updates.attachments.slice(fromApi.length).map((a) => ({
          id: a.id,
          name: a.name ?? a.filename ?? 'Файл',
          filename: a.filename ?? a.name,
          fileType: a.fileType ?? a.type,
          fileSize: a.fileSize ?? a.size,
          url: a.url ?? a.dataUrl,
          dataUrl: a.dataUrl ?? a.url,
          isBackground: a.isBackground ?? false,
        }))
        transformedTodo = { ...transformedTodo, attachments: [...withUrls, ...extra] }
      }
      setTodos(todos.map(t => t.id === id ? transformedTodo : t))
      return transformedTodo
    } catch (error) {
      if (error?.status === 403) {
        const forbiddenError = new Error('Вы не можете редактировать эту задачу')
        forbiddenError.status = 403
        throw forbiddenError
      }

      throw error
    }
  }

  const archiveTodo = async (id) => {
    try {
      await api.archiveTodo(id)
      setTodos(todos.filter(t => t.id !== id))
    } catch (error) {
      if (error?.status === 403) {
        const forbiddenError = new Error('Вы не можете архивировать эту задачу')
        forbiddenError.status = 403
        throw forbiddenError
      }

      throw error
    }
  }

  const restoreTodo = async (id) => {
    try {
      await api.restoreTodo(id)
      const updatedTodo = await api.getTodo(id)
      const transformedTodo = transformTodoFromAPI(updatedTodo)
      setTodos(prevTodos => {
        const exists = prevTodos.some(t => t.id === id)
        if (exists) {
          return prevTodos.map(t => t.id === id ? transformedTodo : t)
        }
        return [...prevTodos, transformedTodo]
      })
      return transformedTodo
    } catch (error) {
      throw error
    }
  }

  const deleteTodo = async (id) => {
    try {
      await api.deleteTodo(id)
      setTodos(todos.filter(t => t.id !== id))
    } catch (error) {
      if (error?.status === 403) {
        const forbiddenError = new Error('Вы не можете удалить эту задачу')
        forbiddenError.status = 403
        throw forbiddenError
      }

      throw error
    }
  }

  const permanentlyDeleteTodo = async (id) => {
    try {
      await api.deleteTodo(id)
      setTodos(todos.filter(t => t.id !== id))
    } catch (error) {

      if (error?.status === 403) {
        const forbiddenError = new Error('Вы не можете удалить эту задачу')
        forbiddenError.status = 403
        throw forbiddenError
      }

      throw error
    }
  }

  const moveTodo = async (id, newStatus) => {
    await updateTodo(id, { status: newStatus })
  }

  const getTodosByStatus = (status) => {
    return todos.filter((todo) => todo.status === status)
  }

  const addTodoListItem = async (todoId, itemText) => {
    try {
      const updatedTodo = await api.addTodoListItem(todoId, { text: itemText, checked: false })
      const transformedTodo = transformTodoFromAPI(updatedTodo)
      setTodos(todos.map(t => t.id === todoId ? transformedTodo : t))
      const item = transformedTodo.todoLists[transformedTodo.todoLists.length - 1]
      return item
    } catch (error) {
      throw error
    }
  }

  const updateTodoListItem = async (todoId, itemId, updates) => {
    try {
      if (updates.checked !== undefined) {
        const updatedTodo = await api.updateTodoListItem(todoId, itemId, updates.checked)
        const transformedTodo = transformTodoFromAPI(updatedTodo)
        setTodos(todos.map(t => t.id === todoId ? transformedTodo : t))
      } else {
        const todo = todos.find(t => t.id === todoId)
        if (todo) {
          const updatedLists = todo.todoLists.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          )
          await updateTodo(todoId, { todoLists: updatedLists })
        }
      }
    } catch (error) {
      throw error
    }
  }

  const deleteTodoListItem = async (todoId, itemId) => {
    try {
      const updatedTodo = await api.deleteTodoListItem(todoId, itemId)
      const transformedTodo = transformTodoFromAPI(updatedTodo)
      setTodos(todos.map(t => t.id === todoId ? transformedTodo : t))
    } catch (error) {
      throw error
    }
  }

  const addTodoAttachment = async (todoId, file, isBackground = false) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('is_background', String(!!isBackground))
    const response = await api.addTodoAttachment(todoId, formData)
    const isFullTodo = response && (response.status !== undefined || (response.title !== undefined && response.attachments instanceof Array))
    let transformedTodo
    if (isFullTodo) {
      transformedTodo = transformTodoFromAPI(response)
    } else {
      const current = todos.find((t) => t.id === todoId)
      if (!current) return null
      const newAtt = transformTodoFromAPI({ id: todoId, attachments: [response] }).attachments[0]
      if (!newAtt) return current
      const mergedAttachments = [...(current.attachments || []), newAtt]
      transformedTodo = { ...current, attachments: mergedAttachments }
    }
    setTodos(todos.map((t) => (t.id === todoId ? transformedTodo : t)))
    return transformedTodo
  }

  const removeTodoAttachment = async (todoId, attachmentId) => {
    const updatedTodo = await api.deleteTodoAttachment(todoId, attachmentId)
    const transformedTodo = transformTodoFromAPI(updatedTodo)
    setTodos(todos.map(t => t.id === todoId ? transformedTodo : t))
    return transformedTodo
  }

  return (
    <TodoContext.Provider
      value={{
        todos,
        archivedTodos,
        loading,
        archivedLoading,
        loadTodos,
        loadArchivedTodos,
        addTodo,
        updateTodo,
        archiveTodo,
        deleteTodo,
        restoreTodo,
        moveTodo,
        getTodosByStatus,
        addComment,
        addTodoListItem,
        updateTodoListItem,
        deleteTodoListItem,
        addTodoAttachment,
        removeTodoAttachment,
      }}
    >
      {children}
    </TodoContext.Provider>
  )
}




