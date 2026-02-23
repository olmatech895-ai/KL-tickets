
import { useState, useCallback } from 'react'

/**
 * @param {Object} deps 
 */
export function useTodoBoardCardHandlers(deps) {
  const {
    addTodo,
    columns,
    moveTodo,
    archiveTodo,
    sendNotification,
    newCardTitle,
    setNewCardTitle,
    setCreateCardDialogOpen,
    setSelectedColumnId,
    onAfterCreateCard,
  } = deps

  const [draggedTodo, setDraggedTodo] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)

  const handleCreateCard = useCallback(
    async (columnId, options = {}) => {
      const { dueDate: dueDateOverride = null, dueTime: dueTimeOverride = null, title: titleOverride = null, notifyWhenDue = false, calendarOnly = false } =
        typeof options === 'string' ? { dueDate: options } : options
      const titleToUse = titleOverride ?? newCardTitle
      if (!titleToUse?.trim()) return

      const column = columns.find((col) => col.id === columnId)
      if (!column) return

      try {
        const newTodo = await addTodo({
          title: titleToUse,
          description: '',
          status: column.status,
          priority: 'medium',
          assignedTo: [],
          tags: [],
          comments: [],
          todoLists: [],
          attachments: [],
          storyPoints: null,
          inFocus: false,
          read: true,
          project: null,
          dueDate: dueDateOverride ?? null,
          dueTime: dueTimeOverride ?? null,
          notifyWhenDue,
          calendarOnly,
          allDay: dueTimeOverride == null || dueTimeOverride === '',
        })
        sendNotification(
          'Карточка создана',
          `"${titleToUse}" создана в колонке "${column.title}"`,
          'success',
          newTodo.id
        )
        setNewCardTitle?.('')
        setCreateCardDialogOpen?.(false)
        setSelectedColumnId?.(null)
        onAfterCreateCard?.()
      } catch (error) {
      }
    },
    [
      columns,
      newCardTitle,
      addTodo,
      sendNotification,
      setNewCardTitle,
      setCreateCardDialogOpen,
      setSelectedColumnId,
      onAfterCreateCard,
    ]
  )

  const handleDragStart = useCallback((e, todo) => {
    setDraggedTodo(todo)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', todo.id)
    e.currentTarget.style.opacity = '0.5'
  }, [])

  const handleDragEnd = useCallback((e) => {
    e.currentTarget.style.opacity = '1'
    setDraggedTodo(null)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    async (e, column) => {
      e.preventDefault()
      if (draggedTodo && draggedTodo.status !== column.status) {
        try {
          await moveTodo(draggedTodo.id, column.status)
          sendNotification(
            'Карточка перемещена',
            `"${draggedTodo.title}" перемещена в "${column.title}"`,
            'success',
            draggedTodo.id
          )
        } catch (error) { }
      }
      setDraggedTodo(null)
    },
    [draggedTodo, moveTodo, sendNotification]
  )

  const handleContextMenu = useCallback((e, todo) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ todo, x: e.clientX, y: e.clientY })
  }, [])

  const handleArchiveTodo = useCallback(
    async (todo) => {
      if (!todo) return
      try {
        await archiveTodo(todo.id)
        setContextMenu(null)
      } catch (error) {
        setContextMenu(null)
      }
    },
    [archiveTodo]
  )

  return {
    draggedTodo,
    contextMenu,
    setContextMenu,
    handleCreateCard,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleContextMenu,
    handleArchiveTodo,
  }
}
