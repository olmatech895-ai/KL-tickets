import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../config/api'
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
    attachments: (todo.attachments || []).map(att => ({
      id: att.id,
      filename: att.filename,
      filePath: att.file_path,
      fileType: att.file_type,
      fileSize: att.file_size,
      isBackground: att.is_background,
      createdAt: att.created_at,
    })),
    storyPoints: todo.story_points,
    inFocus: todo.in_focus || false,
    read: todo.read !== undefined ? todo.read : true,
    project: todo.project || null,
    dueDate: todo.due_date || null,
    createdBy: todo.created_by,
    createdAt: todo.created_at,
    updatedAt: todo.updated_at,
    backgroundImage: todo.background_image || null,
    isArchived: todo.is_archived || todo.archived || false,
  }
}

const transformTodoToAPI = (todo) => {
  return {
    title: todo.title,
    description: todo.description || null,
    status: todo.status,
    assigned_to: todo.assignedTo || [],
    tags: todo.tags || [],
    story_points: todo.storyPoints || null,
    in_focus: todo.inFocus || false,
    project: todo.project || null,
    due_date: todo.dueDate || null,
    background_image: todo.backgroundImage || null,
  }
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
      return () => {}
    }

    const token = localStorage.getItem('auth_token')
    if (!token) {
      return () => {}
    }

    if (!wsService.isConnected() && !wsService.isConnecting) {
      wsService.connect(token)
    }

    const unsubscribeTodoCreated = wsService.on('todo_created', (data) => {
      console.log('[TodoContext] WebSocket: todo_created', data)
      const transformedTodo = transformTodoFromAPI(data.todo)
      
      setTodos(prevTodos => {
        const exists = prevTodos.some(t => t.id === transformedTodo.id)
        if (exists) {
          console.log('[TodoContext] Todo уже существует, обновляем:', transformedTodo.id)
          return prevTodos.map(t => t.id === transformedTodo.id ? transformedTodo : t)
        }
        console.log('[TodoContext] Добавляем новый todo:', transformedTodo.id)
        return [...prevTodos, transformedTodo]
      })
    })

    const unsubscribeTodoUpdated = wsService.on('todo_updated', (data) => {
      console.log('[TodoContext] WebSocket: todo_updated', data)
      const transformedTodo = transformTodoFromAPI(data.todo)
      
      setTodos(prevTodos => {
        const exists = prevTodos.some(t => t.id === transformedTodo.id)
        if (exists) {
          console.log('[TodoContext] Обновляем todo через WebSocket:', transformedTodo.id)
          return prevTodos.map(t => t.id === transformedTodo.id ? transformedTodo : t)
        } else {
          console.log('[TodoContext] Todo не найден в текущем списке, добавляем:', transformedTodo.id)
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
      console.log('[TodoContext] WebSocket: todo_archived', data)
      setTodos(prevTodos => 
        prevTodos.filter(t => t.id !== data.todo_id)
      )
    })

    const unsubscribeTodoRestored = wsService.on('todo_restored', (data) => {
      console.log('[TodoContext] WebSocket: todo_restored', data)
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
      console.log('[TodoContext] Загрузка todos...')
      const todosData = await api.getTodos()
      console.log('[TodoContext] Получены todos из API:', todosData)
      const transformedTodos = todosData.map(transformTodoFromAPI)
      console.log('[TodoContext] Преобразованные todos:', transformedTodos)
      setTodos(transformedTodos)
    } catch (error) {
      console.error('[TodoContext] Ошибка загрузки todos:', error)
      console.error('[TodoContext] Детали ошибки:', {
        message: error?.message,
        status: error?.status,
        detail: error?.detail,
        stack: error?.stack
      })
      setTodos([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadArchivedTodos = useCallback(async () => {
    if (archivedLoadingRef.current) {
      console.log('[TodoContext] Загрузка уже выполняется, пропускаем')
      return
    }
    
    try {
      archivedLoadingRef.current = true
      setArchivedLoading(true)
      console.log('[TodoContext] Загрузка архивированных todos...')
      const todosData = await api.getArchivedTodos()
      console.log('[TodoContext] Получены архивированные todos из API:', todosData)
      console.log('[TodoContext] Тип данных:', typeof todosData, Array.isArray(todosData))
      
      if (!todosData) {
        console.warn('[TodoContext] API вернул null или undefined')
        setArchivedTodos([])
        return
      }
      
      if (!Array.isArray(todosData)) {
        console.error('[TodoContext] API вернул не массив:', todosData)
        setArchivedTodos([])
        return
      }
      
      const transformedTodos = todosData.map(transformTodoFromAPI)
      console.log('[TodoContext] Преобразованные архивированные todos:', transformedTodos)
      console.log('[TodoContext] Количество архивированных задач:', transformedTodos.length)
      setArchivedTodos(transformedTodos)
    } catch (error) {
      console.error('[TodoContext] Ошибка загрузки архивированных todos:', error)
      console.error('[TodoContext] Детали ошибки:', {
        message: error?.message,
        status: error?.status,
        detail: error?.detail,
        stack: error?.stack
      })
      
      if (error?.status === 404 || error?.isNetworkError) {
        console.warn('[TodoContext] Эндпоинт /todos/archived недоступен или сервер не запущен. Используем фильтрацию из основного списка.')
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
      console.log('[TodoContext] Создание todo:', apiData)
      const createdTodo = await api.createTodo(apiData)
      console.log('[TodoContext] Todo создан:', createdTodo)
      const transformedTodo = transformTodoFromAPI(createdTodo)
      setTodos([...todos, transformedTodo])
      return transformedTodo
    } catch (error) {
      console.error('[TodoContext] Ошибка создания todo:', error)
      console.error('[TodoContext] Детали ошибки:', {
        message: error?.message,
        status: error?.status,
        detail: error?.detail
      })
      throw error
    }
  }

  const addComment = async (todoId, commentText, authorId, authorName) => {
    try {
      console.log('[TodoContext] Добавление комментария к todo:', { todoId, commentText })
      const updatedTodo = await api.addTodoComment(todoId, { text: commentText })
      console.log('[TodoContext] Комментарий добавлен, обновленный todo:', updatedTodo)
      const transformedTodo = transformTodoFromAPI(updatedTodo)
      setTodos(todos.map(t => t.id === todoId ? transformedTodo : t))
      const comment = transformedTodo.comments[transformedTodo.comments.length - 1]
      return comment
    } catch (error) {
      console.error('[TodoContext] Ошибка добавления комментария:', error)
      console.error('[TodoContext] Детали ошибки:', {
        message: error?.message,
        status: error?.status,
        detail: error?.detail
      })
      
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
      if (updates.dueDate !== undefined) apiUpdates.due_date = updates.dueDate
      if (updates.backgroundImage !== undefined) apiUpdates.background_image = updates.backgroundImage
      if (updates.todoLists !== undefined) {
        apiUpdates.todo_lists = updates.todoLists.map(item => ({
          id: item.id,
          text: item.text,
          checked: item.checked || false,
        }))
      }

      console.log('[TodoContext] Обновление todo:', { id, updates: apiUpdates })
      const updatedTodo = await api.updateTodo(id, apiUpdates)
      console.log('[TodoContext] Todo обновлен:', updatedTodo)
      const transformedTodo = transformTodoFromAPI(updatedTodo)
      setTodos(todos.map(t => t.id === id ? transformedTodo : t))
      return transformedTodo
    } catch (error) {
      console.error('[TodoContext] Ошибка обновления todo:', error)
      console.error('[TodoContext] Детали ошибки:', {
        message: error?.message,
        status: error?.status,
        detail: error?.detail
      })
      
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
      console.log('[TodoContext] Архивирование todo:', id)
      await api.archiveTodo(id)
      console.log('[TodoContext] Todo архивирован, удаляем из списка:', id)
      setTodos(todos.filter(t => t.id !== id))
    } catch (error) {
      console.error('[TodoContext] Ошибка архивирования todo:', error)
      console.error('[TodoContext] Детали ошибки:', {
        message: error?.message,
        status: error?.status,
        detail: error?.detail
      })
      
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
      console.log('[TodoContext] Восстановление todo из архива:', id)
      await api.restoreTodo(id)
      const updatedTodo = await api.getTodo(id)
      const transformedTodo = transformTodoFromAPI(updatedTodo)
      console.log('[TodoContext] Todo восстановлен, добавляем в список:', transformedTodo)
      setTodos(prevTodos => {
        const exists = prevTodos.some(t => t.id === id)
        if (exists) {
          return prevTodos.map(t => t.id === id ? transformedTodo : t)
        }
        return [...prevTodos, transformedTodo]
      })
      return transformedTodo
    } catch (error) {
      console.error('[TodoContext] Ошибка восстановления todo:', error)
      throw error
    }
  }

  const deleteTodo = async (id) => {
    try {
      console.log('[TodoContext] Полное удаление todo:', id)
      await api.deleteTodo(id)
      console.log('[TodoContext] Todo полностью удален:', id)
      setTodos(todos.filter(t => t.id !== id))
    } catch (error) {
      console.error('[TodoContext] Ошибка удаления todo:', error)
      console.error('[TodoContext] Детали ошибки:', {
        message: error?.message,
        status: error?.status,
        detail: error?.detail
      })
      
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
      console.log('[TodoContext] Полное удаление todo:', id)
      await api.deleteTodo(id)
      console.log('[TodoContext] Todo полностью удален:', id)
      setTodos(todos.filter(t => t.id !== id))
    } catch (error) {
      console.error('[TodoContext] Ошибка удаления todo:', error)
      console.error('[TodoContext] Детали ошибки:', {
        message: error?.message,
        status: error?.status,
        detail: error?.detail
      })
      
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
      }}
    >
      {children}
    </TodoContext.Provider>
  )
}




