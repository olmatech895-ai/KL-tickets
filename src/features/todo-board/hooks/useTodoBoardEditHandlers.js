
import { useCallback } from 'react'
import { format } from 'date-fns'
import { getChecklistProgress, getAttachmentUrl, isAttachmentImage, downloadAttachmentWithAuth } from '../lib/todo-board-utils'

/**
 * @param {Object} deps 
 */
export function useTodoBoardEditHandlers(deps) {
  const {
    selectedTodo,
    updateTodo,
    addComment,
    addTodoListItem,
    updateTodoListItem,
    deleteTodoListItem,
    addTodoAttachment,
    removeTodoAttachment,
    sendNotification,
    user,
    allUsers,
    editTitle,
    editDescription,
    editDueDate,
    setEditDueDate,
    editDueTime,
    setEditDueTime,
    newTagName,
    setNewTagName,
    commentText,
    setCommentText,
    newChecklistItem,
    setNewChecklistItem,
    setTagsDialogOpen,
    setDatesDialogOpen,
    setPriorityDialogOpen,
    setAttachImageDialogOpen,
    selectedImageFile,
    setSelectedImageFile,
    setImagePreview,
    setAttachingFile,
  } = deps

  const handleSaveTodo = useCallback(async () => {
    if (!selectedTodo || !editTitle?.trim()) return
    try {
      await updateTodo(selectedTodo.id, {
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate || null,
      })
    } catch (error) {
    }
  }, [selectedTodo, editTitle, editDescription, editDueDate, updateTodo])

  const handleAddTag = useCallback(() => {
    if (!selectedTodo || !newTagName?.trim()) return
    const tagName = newTagName.trim()
    if (selectedTodo.tags && selectedTodo.tags.includes(tagName)) return
    const newTags = [...(selectedTodo.tags || []), tagName]
    updateTodo(selectedTodo.id, { tags: newTags })
    sendNotification(
      'Метка добавлена',
      `Метка "${tagName}" добавлена к карточке "${selectedTodo.title}"`,
      'success',
      selectedTodo.id
    )
    setNewTagName('')
    setTagsDialogOpen(false)
  }, [selectedTodo, newTagName, updateTodo, sendNotification, setNewTagName, setTagsDialogOpen])

  const handleRemoveTag = useCallback(
    (tagToRemove) => {
      if (!selectedTodo) return
      const newTags = (selectedTodo.tags || []).filter((t) => t !== tagToRemove)
      updateTodo(selectedTodo.id, { tags: newTags })
    },
    [selectedTodo, updateTodo]
  )

  const handleSaveDate = useCallback(() => {
    if (!selectedTodo) return
    updateTodo(selectedTodo.id, {
      dueDate: editDueDate || null,
      dueTime: editDueTime?.trim() || null,
      allDay: !editDueTime?.trim(),
    })
    if (editDueDate) {
      const timeStr = editDueTime?.trim() ? ` в ${editDueTime.trim()}` : ''
      sendNotification(
        'Дата установлена',
        `Срок выполнения для "${selectedTodo.title}" установлен: ${format(new Date(editDueDate), 'dd MMMM yyyy')}${timeStr}`,
        'info',
        selectedTodo.id
      )
    } else {
      sendNotification(
        'Дата удалена',
        `Срок выполнения для "${selectedTodo.title}" удален`,
        'info',
        selectedTodo.id
      )
    }
    setDatesDialogOpen(false)
  }, [selectedTodo, editDueDate, editDueTime, updateTodo, sendNotification, setDatesDialogOpen])

  const handleOpenDatesDialog = useCallback(() => {
    if (selectedTodo?.dueDate) {
      setEditDueDate(new Date(selectedTodo.dueDate).toISOString().slice(0, 10))
      setEditDueTime(selectedTodo.dueTime || '')
    } else {
      setEditDueDate('')
      setEditDueTime('')
    }
    setDatesDialogOpen(true)
  }, [selectedTodo, setEditDueDate, setEditDueTime, setDatesDialogOpen])

  const handleAddParticipant = useCallback(
    (userId) => {
      if (!selectedTodo) return
      if (selectedTodo.assignedTo && selectedTodo.assignedTo.includes(userId)) return
      const assignedUser = allUsers.find((u) => u.id === userId)
      const newParticipants = [...(selectedTodo.assignedTo || []), userId]
      updateTodo(selectedTodo.id, { assignedTo: newParticipants })
      sendNotification(
        'Участник добавлен',
        `"${assignedUser?.username || 'Пользователь'}" добавлен к карточке "${selectedTodo.title}"`,
        'success',
        selectedTodo.id
      )
    },
    [selectedTodo, allUsers, updateTodo, sendNotification]
  )

  const handleRemoveParticipant = useCallback(
    (userId) => {
      if (!selectedTodo) return
      const removedUser = allUsers.find((u) => u.id === userId)
      const newParticipants = (selectedTodo.assignedTo || []).filter((id) => id !== userId)
      updateTodo(selectedTodo.id, { assignedTo: newParticipants })
      sendNotification(
        'Участник удален',
        `"${removedUser?.username || 'Пользователь'}" удален из карточки "${selectedTodo.title}"`,
        'info',
        selectedTodo.id
      )
    },
    [selectedTodo, allUsers, updateTodo, sendNotification]
  )

  const handleChangePriority = useCallback(
    (priority) => {
      if (!selectedTodo) return
      const priorityLabels = { high: 'Высокий', medium: 'Средний', low: 'Низкий' }
      updateTodo(selectedTodo.id, { priority })
      sendNotification(
        'Приоритет изменен',
        `Приоритет карточки "${selectedTodo.title}" изменен на "${priorityLabels[priority]}"`,
        'info',
        selectedTodo.id
      )
      setPriorityDialogOpen(false)
    },
    [selectedTodo, updateTodo, sendNotification, setPriorityDialogOpen]
  )

  const handleDeleteChecklist = useCallback(async () => {
    if (!selectedTodo) return
    if (confirm('Вы уверены, что хотите удалить весь чек-лист?')) {
      try {
        await updateTodo(selectedTodo.id, { todoLists: [] })
      } catch { }
    }
  }, [selectedTodo, updateTodo])

  const handleImageFileSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (!file || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return
      setSelectedImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    },
    [setSelectedImageFile, setImagePreview]
  )

  const handleSetBackgroundImage = useCallback(() => {
    if (!selectedTodo || !selectedImageFile) return
    const file = selectedImageFile
    const reader = new FileReader()
    reader.onloadend = () => {
      const imageDataUrl = reader.result
      const existingAttachments = (selectedTodo.attachments || []).filter((att) => !att.isBackground)
      updateTodo(selectedTodo.id, {
        backgroundImage: imageDataUrl,
        attachments: [
          ...existingAttachments,
          {
            id: Date.now().toString(),
            type: 'image',
            url: imageDataUrl,
            name: file.name,
            uploadedAt: new Date().toISOString(),
            isBackground: true,
          },
        ],
      })
      setSelectedImageFile(null)
      setImagePreview(null)
      setAttachImageDialogOpen(false)
    }
    reader.readAsDataURL(file)
  }, [selectedTodo, selectedImageFile, updateTodo, setSelectedImageFile, setImagePreview, setAttachImageDialogOpen])

  const handleRemoveBackgroundImage = useCallback(() => {
    if (!selectedTodo) return
    if (confirm('Вы уверены, что хотите удалить фоновое изображение?')) {
      const newAttachments = (selectedTodo.attachments || []).filter((att) => !att.isBackground)
      updateTodo(selectedTodo.id, { backgroundImage: null, attachments: newAttachments })
    }
  }, [selectedTodo, updateTodo])

  const handleRemoveAttachment = useCallback(
    async (attachmentId) => {
      if (!selectedTodo) return
      try {
        await removeTodoAttachment(selectedTodo.id, attachmentId)
      } catch { }
    },
    [selectedTodo, removeTodoAttachment]
  )

  const handleAttachFileSelect = useCallback(
    async (e) => {
      const file = e.target.files?.[0]
      if (!file || !selectedTodo) return
      e.target.value = ''
      setAttachingFile?.(true)
      try {
        await addTodoAttachment(selectedTodo.id, file, false)
      } catch { }
      setAttachingFile?.(false)
    },
    [selectedTodo, addTodoAttachment, setAttachingFile]
  )

  const handleDownloadAttachment = useCallback(async (attachment, openInNewTab = false) => {
    await downloadAttachmentWithAuth(attachment, { openInNewTab })
  }, [])

  const handleAddCommentSubmit = useCallback(async () => {
    if (!selectedTodo || !commentText?.trim() || !user) return
    try {
      await addComment(selectedTodo.id, commentText, user.id, user.username)
      sendNotification(
        'Новый комментарий',
        `Добавлен комментарий к карточке "${selectedTodo.title}"`,
        'info',
        selectedTodo.id
      )
      setCommentText('')
    } catch { }
  }, [selectedTodo, commentText, user, addComment, sendNotification, setCommentText])

  const handleAddChecklistItem = useCallback(async () => {
    if (!selectedTodo || !newChecklistItem?.trim()) return
    try {
      await addTodoListItem(selectedTodo.id, newChecklistItem)
      setNewChecklistItem('')
    } catch { }
  }, [selectedTodo, newChecklistItem, addTodoListItem, setNewChecklistItem])

  const handleToggleChecklistItem = useCallback(
    async (itemId, checked) => {
      if (!selectedTodo) return
      try {
        await updateTodoListItem(selectedTodo.id, itemId, { checked })
      } catch { }
    },
    [selectedTodo, updateTodoListItem]
  )

  const handleDeleteChecklistItem = useCallback(
    async (itemId) => {
      if (!selectedTodo) return
      try {
        await deleteTodoListItem(selectedTodo.id, itemId)
      } catch { }
    },
    [selectedTodo, deleteTodoListItem]
  )

  return {
    getChecklistProgress,
    getAttachmentUrl,
    isAttachmentImage,
    handleDownloadAttachment,
    handleSaveTodo,
    handleAddTag,
    handleRemoveTag,
    handleSaveDate,
    handleOpenDatesDialog,
    handleAddParticipant,
    handleRemoveParticipant,
    handleChangePriority,
    handleDeleteChecklist,
    handleImageFileSelect,
    handleSetBackgroundImage,
    handleRemoveBackgroundImage,
    handleRemoveAttachment,
    handleAttachFileSelect,
    handleAddCommentSubmit,
    handleAddChecklistItem,
    handleToggleChecklistItem,
    handleDeleteChecklistItem,
  }
}
