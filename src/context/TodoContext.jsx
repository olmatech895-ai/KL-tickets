import { createContext, useContext, useState, useEffect } from 'react'
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

// Transform API data to frontend format
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
  }
}

// Transform frontend format to API format
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
  const [loading, setLoading] = useState(false) // Start with false, will be set to true when loading
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Загружаем todos только если пользователь авторизован и еще не загружали
    if (!authLoading && user && !isInitialized) {
      console.log('🔄 Initializing todos context for user:', user.id)
      setIsInitialized(true)
      
      // Reset loading state before loading
      setLoading(false)
      
      // Load todos
      loadTodos()
      
      // Setup WebSocket
      const cleanup = setupWebSocket()
      
      // Cleanup on unmount or user change
      return () => {
        console.log('🧹 Cleaning up todos context')
        cleanup()
        setIsInitialized(false)
        if (!user) {
          wsService.disconnect()
        }
      }
    } else if (!authLoading && !user) {
      console.log('🧹 User logged out, clearing todos')
      setTodos([])
      setLoading(false)
      setIsInitialized(false)
      wsService.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]) // Only depend on user.id, not the whole user object

  const setupWebSocket = () => {
    if (!user) {
      console.log('⚠️ Cannot setup WebSocket: no user')
      return () => {}
    }

    // Get token from localStorage
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.log('⚠️ Cannot setup WebSocket: no token')
      return () => {}
    }

    console.log('🔌 Setting up WebSocket connection for todos...')

    // Connect WebSocket only if not already connected and not connecting
    if (!wsService.isConnected() && !wsService.isConnecting) {
      wsService.connect(token)
    }

    // Subscribe to WebSocket events
    const unsubscribeTodoCreated = wsService.on('todo_created', (data) => {
      console.log('📝 WebSocket: todo_created event received', data)
      const transformedTodo = transformTodoFromAPI(data.todo)
      
      setTodos(prevTodos => {
        // Check if todo already exists
        const exists = prevTodos.some(t => t.id === transformedTodo.id)
        if (exists) {
          return prevTodos.map(t => t.id === transformedTodo.id ? transformedTodo : t)
        }
        return [...prevTodos, transformedTodo]
      })
    })

    const unsubscribeTodoUpdated = wsService.on('todo_updated', (data) => {
      console.log('📝 WebSocket: todo_updated event received', data)
      const transformedTodo = transformTodoFromAPI(data.todo)
      
      setTodos(prevTodos => 
        prevTodos.map(t => t.id === transformedTodo.id ? transformedTodo : t)
      )
    })

    const unsubscribeTodoDeleted = wsService.on('todo_deleted', (data) => {
      console.log('📝 WebSocket: todo_deleted event received', data)
      setTodos(prevTodos => 
        prevTodos.filter(t => t.id !== data.todo_id)
      )
    })

    const unsubscribeTodoCommentAdded = wsService.on('todo_comment_added', (data) => {
      console.log('📝 WebSocket: todo_comment_added event received', data)
      const transformedTodo = transformTodoFromAPI(data.todo)
      
      setTodos(prevTodos => 
        prevTodos.map(t => t.id === transformedTodo.id ? transformedTodo : t)
      )
    })

    const unsubscribeTodoListItemAdded = wsService.on('todo_list_item_added', (data) => {
      console.log('📝 WebSocket: todo_list_item_added event received', data)
      const transformedTodo = transformTodoFromAPI(data.todo)
      
      setTodos(prevTodos => 
        prevTodos.map(t => t.id === transformedTodo.id ? transformedTodo : t)
      )
    })

    const unsubscribeTodoListItemUpdated = wsService.on('todo_list_item_updated', (data) => {
      console.log('📝 WebSocket: todo_list_item_updated event received', data)
      const transformedTodo = transformTodoFromAPI(data.todo)
      
      setTodos(prevTodos => 
        prevTodos.map(t => t.id === transformedTodo.id ? transformedTodo : t)
      )
    })

    const unsubscribeTodoListItemDeleted = wsService.on('todo_list_item_deleted', (data) => {
      console.log('📝 WebSocket: todo_list_item_deleted event received', data)
      const transformedTodo = transformTodoFromAPI(data.todo)
      
      setTodos(prevTodos => 
        prevTodos.map(t => t.id === transformedTodo.id ? transformedTodo : t)
      )
    })

    // Return cleanup function
    return () => {
      unsubscribeTodoCreated()
      unsubscribeTodoUpdated()
      unsubscribeTodoDeleted()
      unsubscribeTodoCommentAdded()
      unsubscribeTodoListItemAdded()
      unsubscribeTodoListItemUpdated()
      unsubscribeTodoListItemDeleted()
    }
  }

  const loadTodos = async () => {
    // Prevent multiple simultaneous loads - but only if actually loading
    if (loading) {
      console.log('⚠️ Todos already loading, skipping')
      return
    }
    
    try {
      console.log('📥 Loading todos from API...')
      setLoading(true)
      const todosData = await api.getTodos()
      console.log(`📥 Received ${todosData.length} todos from API`)
      const transformedTodos = todosData.map(transformTodoFromAPI)
      console.log(`✅ Loaded and transformed ${transformedTodos.length} todos`)
      setTodos(transformedTodos)
      console.log(`✅ Todos state updated, total todos: ${transformedTodos.length}`)
    } catch (error) {
      console.error('❌ Failed to load todos:', error)
      setTodos([])
    } finally {
      setLoading(false)
      console.log('✅ Loading completed')
    }
  }

  const addTodo = async (todo) => {
    try {
      const apiData = transformTodoToAPI(todo)
      const createdTodo = await api.createTodo(apiData)
      const transformedTodo = transformTodoFromAPI(createdTodo)
      setTodos([...todos, transformedTodo])
      return transformedTodo
    } catch (error) {
      console.error('Failed to create todo:', error)
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
      console.error('Failed to add comment:', error)
      throw error
    }
  }

  const updateTodo = async (id, updates) => {
    try {
      // Transform updates to API format
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
        // Transform todoLists to API format (todo_lists)
        apiUpdates.todo_lists = updates.todoLists.map(item => ({
          id: item.id,
          text: item.text,
          checked: item.checked || false,
        }))
      }

      const updatedTodo = await api.updateTodo(id, apiUpdates)
      const transformedTodo = transformTodoFromAPI(updatedTodo)
      setTodos(todos.map(t => t.id === id ? transformedTodo : t))
      return transformedTodo
    } catch (error) {
      console.error('Failed to update todo:', error)
      throw error
    }
  }

  const deleteTodo = async (id) => {
    try {
      // Archive todo instead of deleting
      await api.archiveTodo(id)
      const updatedTodo = await api.getTodo(id)
      const transformedTodo = transformTodoFromAPI(updatedTodo)
      setTodos(todos.map(t => t.id === id ? transformedTodo : t))
    } catch (error) {
      console.error('Failed to archive todo:', error)
      throw error
    }
  }

  const restoreTodo = async (id) => {
    try {
      await api.restoreTodo(id)
      const updatedTodo = await api.getTodo(id)
      const transformedTodo = transformTodoFromAPI(updatedTodo)
      setTodos(todos.map(t => t.id === id ? transformedTodo : t))
    } catch (error) {
      console.error('Failed to restore todo:', error)
      throw error
    }
  }

  const permanentlyDeleteTodo = async (id) => {
    try {
      await api.deleteTodo(id)
      setTodos(todos.filter(t => t.id !== id))
    } catch (error) {
      console.error('Failed to delete todo:', error)
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
      console.error('Failed to add todo list item:', error)
      throw error
    }
  }

  const updateTodoListItem = async (todoId, itemId, updates) => {
    try {
      // If updating checked status
      if (updates.checked !== undefined) {
        const updatedTodo = await api.updateTodoListItem(todoId, itemId, updates.checked)
        const transformedTodo = transformTodoFromAPI(updatedTodo)
        setTodos(todos.map(t => t.id === todoId ? transformedTodo : t))
      } else {
        // For other updates, we need to update the whole todo
        const todo = todos.find(t => t.id === todoId)
        if (todo) {
          const updatedLists = todo.todoLists.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          )
          await updateTodo(todoId, { todoLists: updatedLists })
        }
      }
    } catch (error) {
      console.error('Failed to update todo list item:', error)
      throw error
    }
  }

  const deleteTodoListItem = async (todoId, itemId) => {
    try {
      const updatedTodo = await api.deleteTodoListItem(todoId, itemId)
      const transformedTodo = transformTodoFromAPI(updatedTodo)
      setTodos(todos.map(t => t.id === todoId ? transformedTodo : t))
    } catch (error) {
      console.error('Failed to delete todo list item:', error)
      throw error
    }
  }

  return (
    <TodoContext.Provider
      value={{
        todos,
        loading,
        addTodo,
        updateTodo,
        deleteTodo,
        restoreTodo,
        permanentlyDeleteTodo,
        moveTodo,
        getTodosByStatus,
        addComment,
        addTodoListItem,
        updateTodoListItem,
        deleteTodoListItem,
        loadTodos,
      }}
    >
      {children}
    </TodoContext.Provider>
  )
}




