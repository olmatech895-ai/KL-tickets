import { useState, useCallback } from 'react'

export function useTodoBoardEditState() {
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editDueTime, setEditDueTime] = useState('')
  const [editTagInput, setEditTagInput] = useState('')
  const [commentText, setCommentText] = useState('')
  const [activeTab, setActiveTab] = useState('comments')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [tagsDialogOpen, setTagsDialogOpen] = useState(false)
  const [datesDialogOpen, setDatesDialogOpen] = useState(false)
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false)
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false)
  const [attachImageDialogOpen, setAttachImageDialogOpen] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [attachingFile, setAttachingFile] = useState(false)
  const [columnBackgroundDialogOpen, setColumnBackgroundDialogOpen] = useState(false)
  const [selectedColumnForBackground, setSelectedColumnForBackground] = useState(null)
  const [columnImageFile, setColumnImageFile] = useState(null)
  const [columnImagePreview, setColumnImagePreview] = useState(null)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false)
  const [plannerDateDialogOpen, setPlannerDateDialogOpen] = useState(false)
  const [plannerCreateColumnId, setPlannerCreateColumnId] = useState(null)
  const [plannerCreateTitle, setPlannerCreateTitle] = useState('')
  const [plannerCreateTime, setPlannerCreateTime] = useState('')
  const [plannerCreateType, setPlannerCreateType] = useState('calendar')
  const [plannerCreateNotify, setPlannerCreateNotify] = useState(true)
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null)

  const openEditDialog = useCallback((todo) => {
    setSelectedTodo(todo)
    setEditTitle(todo?.title ?? '')
    setEditDescription(todo?.description ?? '')
    setEditDueDate(todo?.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 10) : '')
    setEditDueTime(todo?.dueTime ?? '')
    setNewTagName('')
    setCommentText('')
    setNewChecklistItem('')
    setActiveTab('comments')
    setTagsDialogOpen(false)
    setDatesDialogOpen(false)
    setParticipantsDialogOpen(false)
    setPriorityDialogOpen(false)
    setEditDialogOpen(true)
  }, [])

  const closeEditDialog = useCallback(() => {
    setEditDialogOpen(false)
    setSelectedTodo(null)
    setEditTitle('')
    setEditDescription('')
    setEditDueDate('')
    setEditDueTime('')
    setEditTagInput('')
    setCommentText('')
    setNewChecklistItem('')
  }, [])

  return {
    selectedTodo,
    setSelectedTodo,
    editDialogOpen,
    setEditDialogOpen,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    editDueDate,
    setEditDueDate,
    editDueTime,
    setEditDueTime,
    editTagInput,
    setEditTagInput,
    commentText,
    setCommentText,
    activeTab,
    setActiveTab,
    newChecklistItem,
    setNewChecklistItem,
    newTagName,
    setNewTagName,
    tagsDialogOpen,
    setTagsDialogOpen,
    datesDialogOpen,
    setDatesDialogOpen,
    participantsDialogOpen,
    setParticipantsDialogOpen,
    priorityDialogOpen,
    setPriorityDialogOpen,
    attachImageDialogOpen,
    setAttachImageDialogOpen,
    selectedImageFile,
    setSelectedImageFile,
    imagePreview,
    setImagePreview,
    attachingFile,
    setAttachingFile,
    columnBackgroundDialogOpen,
    setColumnBackgroundDialogOpen,
    selectedColumnForBackground,
    setSelectedColumnForBackground,
    columnImageFile,
    setColumnImageFile,
    columnImagePreview,
    setColumnImagePreview,
    settingsDialogOpen,
    setSettingsDialogOpen,
    notificationsPanelOpen,
    setNotificationsPanelOpen,
    plannerDateDialogOpen,
    setPlannerDateDialogOpen,
    plannerCreateColumnId,
    setPlannerCreateColumnId,
    plannerCreateTitle,
    setPlannerCreateTitle,
    plannerCreateTime,
    setPlannerCreateTime,
    plannerCreateType,
    setPlannerCreateType,
    plannerCreateNotify,
    setPlannerCreateNotify,
    selectedCalendarEvent,
    setSelectedCalendarEvent,
    openEditDialog,
    closeEditDialog,
  }
}
