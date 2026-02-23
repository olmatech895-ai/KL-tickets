import { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from './AuthContext'
import { useTodos } from './TodoContext'
import { useTheme } from './ThemeContext'
import { useTodoBoardColumns } from '../features/todo-board/hooks/useTodoBoardColumns'
import { useTodoBoardDrag } from '../features/todo-board/hooks/useTodoBoardDrag'
import { useTodoBoardNotifications } from '../features/todo-board/hooks/useTodoBoardNotifications'
import { useTodoBoardPlanner } from '../features/todo-board/hooks/useTodoBoardPlanner'
import { useTodoBoardEditState } from '../features/todo-board/hooks/useTodoBoardEditState'
import { useTodoBoardEditHandlers } from '../features/todo-board/hooks/useTodoBoardEditHandlers'
import { useTodoBoardColumnHandlers } from '../features/todo-board/hooks/useTodoBoardColumnHandlers'
import { useTodoBoardCardHandlers } from '../features/todo-board/hooks/useTodoBoardCardHandlers'
import { useTodoBoardExportImport } from '../features/todo-board/hooks/useTodoBoardExportImport'
import { COLOR_PALETTE } from '../shared/constants/todo-board'

const TodoBoardContext = createContext(null)

export function useTodoBoard() {
  const ctx = useContext(TodoBoardContext)
  if (!ctx) throw new Error('useTodoBoard must be used within TodoBoardProvider')
  return ctx
}

export function TodoBoardProvider({ children }) {
  const { user, getAllUsers } = useAuth()
  const { theme, setTheme, toggleTheme } = useTheme()
  const {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    moveTodo,
    addComment,
    addTodoListItem,
    updateTodoListItem,
    deleteTodoListItem,
    addTodoAttachment,
    removeTodoAttachment,
    archiveTodo,
  } = useTodos()

  const [searchQuery, setSearchQuery] = useState('')
  const [createCardDialogOpen, setCreateCardDialogOpen] = useState(false)
  const [createColumnDialogOpen, setCreateColumnDialogOpen] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState(null)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [deleteColumnDialogOpen, setDeleteColumnDialogOpen] = useState(false)
  const [columnToDelete, setColumnToDelete] = useState(null)
  const [deleteTodoDialogOpen, setDeleteTodoDialogOpen] = useState(false)
  const [todoToDelete, setTodoToDelete] = useState(null)
  const [isMounted, setIsMounted] = useState(false)

  const todoAttachFileInputRef = useRef(null)
  const allUsers = useMemo(() => getAllUsers?.() ?? [], [getAllUsers])

  const { columns, setColumns, isSavingColumns, setIsSavingColumns } = useTodoBoardColumns(user)
  const drag = useTodoBoardDrag()
  const notifications = useTodoBoardNotifications()

  const filteredTodos = useMemo(() => {
    const active = todos.filter((t) => !t.isArchived)
    if (!searchQuery) return active
    const q = searchQuery.toLowerCase()
    return active.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    )
  }, [todos, searchQuery])

  const boardTodos = useMemo(
    () => filteredTodos.filter((t) => !t.calendarOnly),
    [filteredTodos]
  )

  const todosWithDueDate = useMemo(
    () => filteredTodos.filter((t) => t.dueDate),
    [filteredTodos]
  )

  const planner = useTodoBoardPlanner(todosWithDueDate, {
    onReminderDue: (item) =>
      notifications.sendNotification('Через 5 минут', item.title, 'info', item.id),
  })
  const editState = useTodoBoardEditState()

  const {
    selectedTodo,
    setSelectedTodo,
    setEditTitle,
    setEditDescription,
    setEditDueDate,
    setEditDueTime,
    openEditDialog,
    closeEditDialog,
  } = editState

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!selectedTodo) return
    const updated = todos.find((t) => t.id === selectedTodo.id)
    if (updated) {
      setSelectedTodo(updated)
      setEditTitle(updated.title)
      setEditDescription(updated.description ?? '')
      setEditDueDate(updated.dueDate ? new Date(updated.dueDate).toISOString().slice(0, 10) : '')
      setEditDueTime(updated.dueTime ?? '')
    }
  }, [todos, selectedTodo?.id, setSelectedTodo, setEditTitle, setEditDescription, setEditDueDate, setEditDueTime])

  const editHandlers = useTodoBoardEditHandlers({
    selectedTodo,
    updateTodo,
    addComment,
    addTodoListItem,
    updateTodoListItem,
    deleteTodoListItem,
    addTodoAttachment,
    removeTodoAttachment,
    sendNotification: notifications.sendNotification,
    user,
    allUsers,
    columns,
    editTitle: editState.editTitle,
    setEditTitle: editState.setEditTitle,
    editDescription: editState.editDescription,
    editDueDate: editState.editDueDate,
    setEditDueDate: editState.setEditDueDate,
    editDueTime: editState.editDueTime,
    setEditDueTime: editState.setEditDueTime,
    newTagName: editState.newTagName,
    setNewTagName: editState.setNewTagName,
    commentText: editState.commentText,
    setCommentText: editState.setCommentText,
    newChecklistItem: editState.newChecklistItem,
    setNewChecklistItem: editState.setNewChecklistItem,
    setTagsDialogOpen: editState.setTagsDialogOpen,
    setDatesDialogOpen: editState.setDatesDialogOpen,
    setParticipantsDialogOpen: editState.setParticipantsDialogOpen,
    setPriorityDialogOpen: editState.setPriorityDialogOpen,
    setAttachImageDialogOpen: editState.setAttachImageDialogOpen,
    selectedImageFile: editState.selectedImageFile,
    setSelectedImageFile: editState.setSelectedImageFile,
    setImagePreview: editState.setImagePreview,
    setColumnBackgroundDialogOpen: editState.setColumnBackgroundDialogOpen,
    setSelectedColumnForBackground: editState.setSelectedColumnForBackground,
    setColumnImageFile: editState.setColumnImageFile,
    setColumnImagePreview: editState.setColumnImagePreview,
    setAttachingFile: editState.setAttachingFile,
  })

  const columnHandlers = useTodoBoardColumnHandlers({
    columns,
    setColumns,
    todos,
    moveTodo,
    isSavingColumns,
    setIsSavingColumns,
    newColumnTitle,
    setNewColumnTitle,
    onAfterCreateColumn: () => {
      setCreateColumnDialogOpen(false)
    },
    selectedColumnForBackground: editState.selectedColumnForBackground,
    setSelectedColumnForBackground: editState.setSelectedColumnForBackground,
    columnImageFile: editState.columnImageFile,
    setColumnImageFile: editState.setColumnImageFile,
    columnImagePreview: editState.columnImagePreview,
    setColumnImagePreview: editState.setColumnImagePreview,
    setColumnBackgroundDialogOpen: editState.setColumnBackgroundDialogOpen,
  })

  const cardHandlers = useTodoBoardCardHandlers({
    addTodo,
    columns,
    moveTodo,
    archiveTodo,
    sendNotification: notifications.sendNotification,
    newCardTitle,
    setNewCardTitle,
    setCreateCardDialogOpen,
    setSelectedColumnId,
    onAfterCreateCard: undefined,
  })

  const exportImport = useTodoBoardExportImport({
    todos,
    columns,
    theme,
    setTheme,
    notifications: notifications.notifications,
    setColumns,
  })

  const handleNotificationClick = (notification) => {
    if (!notification.read) notifications.markNotificationAsRead(notification.id)
    if (notification.relatedTodoId) {
      const todo = todos.find((t) => t.id === notification.relatedTodoId)
      if (todo) {
        openEditDialog(todo)
        editState.setNotificationsPanelOpen(false)
      }
    }
  }

  const value = useMemo(
    () => ({
      // Auth / theme
      user,
      theme,
      setTheme,
      toggleTheme,
      allUsers,

      // Todos
      todos,
      filteredTodos,
      boardTodos,
      addTodo,
      updateTodo,
      deleteTodo,
      moveTodo,
      addComment,
addTodoListItem,
    updateTodoListItem,
    deleteTodoListItem,
    addTodoAttachment,
    removeTodoAttachment,
    archiveTodo,

      // Columns
      columns,
      setColumns,
      isSavingColumns,
      colorPalette: COLOR_PALETTE,

      // Search & UI
      searchQuery,
      setSearchQuery,
      isMounted,

      // Drag (horizontal scroll)
      scrollContainerRef: drag.scrollContainerRef,
      isDragging: drag.isDragging,
      onDragMouseDown: drag.handleMouseDown,
      onDragMouseMove: drag.handleMouseMove,
      onDragMouseUp: drag.handleMouseUp,
      onDragMouseLeave: drag.handleMouseLeave,

      // Notifications
      notifications: notifications.notifications,
      notificationsEnabled: notifications.notificationsEnabled,
      setNotificationsEnabled: notifications.setNotificationsEnabled,
      sendNotification: notifications.sendNotification,
      markNotificationAsRead: notifications.markNotificationAsRead,
      markAllNotificationsAsRead: notifications.markAllNotificationsAsRead,
      deleteNotification: notifications.deleteNotification,
      clearAllNotifications: notifications.clearAllNotifications,
      unreadNotificationsCount: notifications.unreadNotificationsCount,
      handleNotificationClick,

      // Dialogs state (create card/column, delete)
      createCardDialogOpen,
      setCreateCardDialogOpen,
      createColumnDialogOpen,
      setCreateColumnDialogOpen,
      selectedColumnId,
      setSelectedColumnId,
      newCardTitle,
      setNewCardTitle,
      newColumnTitle,
      setNewColumnTitle,
      deleteColumnDialogOpen,
      setDeleteColumnDialogOpen,
      columnToDelete,
      setColumnToDelete,
      deleteTodoDialogOpen,
      setDeleteTodoDialogOpen,
      todoToDelete,
      setTodoToDelete,

      ...editState,
      handleOpenEditDialog: openEditDialog,
      handleCloseEditDialog: closeEditDialog,
      todoAttachFileInputRef,

      ...editHandlers,

      ...columnHandlers,

      ...cardHandlers,

      ...planner,

      ...exportImport,
    }),
    [
      user,
      theme,
      setTheme,
      toggleTheme,
      allUsers,
      todos,
      filteredTodos,
      boardTodos,
      addTodo,
      updateTodo,
      deleteTodo,
      moveTodo,
      addComment,
      addTodoListItem,
      updateTodoListItem,
      deleteTodoListItem,
      addTodoAttachment,
      removeTodoAttachment,
      archiveTodo,
      columns,
      setColumns,
      isSavingColumns,
      searchQuery,
      setSearchQuery,
      isMounted,
      drag,
      notifications,
      createCardDialogOpen,
      setCreateCardDialogOpen,
      createColumnDialogOpen,
      setCreateColumnDialogOpen,
      selectedColumnId,
      setSelectedColumnId,
      newCardTitle,
      setNewCardTitle,
      newColumnTitle,
      setNewColumnTitle,
      deleteColumnDialogOpen,
      setDeleteColumnDialogOpen,
      columnToDelete,
      setColumnToDelete,
      deleteTodoDialogOpen,
      setDeleteTodoDialogOpen,
      todoToDelete,
      setTodoToDelete,
      editState,
      openEditDialog,
      closeEditDialog,
      editHandlers,
      columnHandlers,
      cardHandlers,
      planner,
      exportImport,
    ]
  )

  return (
    <TodoBoardContext.Provider value={value}>
      {children}
    </TodoBoardContext.Provider>
  )
}
