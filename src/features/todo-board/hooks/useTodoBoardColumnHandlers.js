import { useState, useCallback } from 'react'
import { api } from '../../../config/api'

function mapApiColumnToState(col) {
  return {
    id: col.column_id || col.id,
    title: col.title,
    status: col.status,
    color: col.color || 'primary',
    backgroundImage: col.background_image || col.backgroundImage || null,
    orderIndex: col.order_index || col.orderIndex || '0',
  }
}

function mapStateToApi(col, index) {
  return {
    column_id: col.id,
    title: col.title,
    status: col.status,
    color: col.color || 'primary',
    background_image: col.backgroundImage || null,
    order_index: col.orderIndex || index.toString(),
  }
}

/**
 * @param {Object} deps 
 */
export function useTodoBoardColumnHandlers(deps) {
  const {
    columns,
    setColumns,
    todos,
    moveTodo,
    setIsSavingColumns,
    newColumnTitle,
    setNewColumnTitle,
    onAfterCreateColumn,
    selectedColumnForBackground,
    setSelectedColumnForBackground,
    columnImageFile,
    setColumnImageFile,
    columnImagePreview,
    setColumnImagePreview,
    setColumnBackgroundDialogOpen,
  } = deps

  const [editingColumnId, setEditingColumnId] = useState(null)
  const [editColumnTitle, setEditColumnTitle] = useState('')

  const handleCreateColumn = useCallback(async () => {
    if (!newColumnTitle?.trim()) return
    const newColumn = {
      id: `column-${Date.now()}`,
      title: newColumnTitle.trim(),
      status: `custom_${Date.now()}`,
      color: 'primary',
      backgroundImage: null,
      orderIndex: columns.length.toString(),
    }
    try {
      setIsSavingColumns?.(true)
      const updatedColumns = [...columns, newColumn]
      const columnsData = updatedColumns.map((col, index) => mapStateToApi(col, index))
      const response = await api.updateTodoColumns(columnsData)
      if (response?.length > 0) {
        const sorted = [...response].sort(
          (a, b) => parseInt(a.order_index || '0', 10) - parseInt(b.order_index || '0', 10)
        )
        const mapped = sorted.map(mapApiColumnToState)
        setColumns(mapped)
        localStorage.setItem('todoBoardColumns', JSON.stringify(mapped))
      } else {
        setColumns(updatedColumns)
        localStorage.setItem('todoBoardColumns', JSON.stringify(updatedColumns))
      }
      setNewColumnTitle?.('')
      onAfterCreateColumn?.()
    } catch (error) {
      error;
    } finally {
      setIsSavingColumns?.(false)
    }
  }, [
    columns,
    newColumnTitle,
    setColumns,
    setNewColumnTitle,
    onAfterCreateColumn,
    setIsSavingColumns,
  ])

  const handleUpdateColumnColor = useCallback(
    (columnId, color) => {
      setColumns((prevColumns) => {
        const updated = prevColumns.map((col) =>
          col.id === columnId
            ? { ...col, color, orderIndex: col.orderIndex || prevColumns.indexOf(col).toString() }
            : col
        )
        localStorage.setItem('todoBoardColumns', JSON.stringify(updated))
        return updated
      })
    },
    [setColumns]
  )

  const handleDeleteColumn = useCallback(
    (columnId) => {
      const column = columns.find((col) => col.id === columnId)
      if (!column) return
      todos
        .filter((todo) => todo.status === column.status)
        .forEach((todo) => {
          if (columns.length > 1) moveTodo(todo.id, columns[0].status)
        })
      const remainingColumns = columns
        .filter((col) => col.id !== columnId)
        .map((col, index) => ({ ...col, orderIndex: index.toString() }))
      setColumns(remainingColumns)
    },
    [columns, todos, moveTodo, setColumns]
  )

  const handleRenameColumn = useCallback(
    (columnId) => {
      const column = columns.find((col) => col.id === columnId)
      if (!column) return
      setEditingColumnId(columnId)
      setEditColumnTitle(column.title)
    },
    [columns]
  )

  const handleSaveColumnName = useCallback(
    (columnId) => {
      if (!editColumnTitle?.trim()) return
      setColumns(
        columns.map((col) =>
          col.id === columnId
            ? { ...col, title: editColumnTitle, orderIndex: col.orderIndex || columns.indexOf(col).toString() }
            : col
        )
      )
      setEditingColumnId(null)
      setEditColumnTitle('')
    },
    [columns, editColumnTitle, setColumns]
  )

  const handleOpenColumnBackgroundDialog = useCallback(
    (columnId) => {
      setSelectedColumnForBackground?.(columnId)
      setColumnImageFile?.(null)
      setColumnImagePreview?.(null)
      setColumnBackgroundDialogOpen?.(true)
    },
    [setSelectedColumnForBackground, setColumnImageFile, setColumnImagePreview, setColumnBackgroundDialogOpen]
  )

  const handleSetColumnBackgroundImage = useCallback(() => {
    if (!selectedColumnForBackground || !columnImageFile) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const imageDataUrl = reader.result
      setColumns((cols) =>
        cols.map((col) =>
          col.id === selectedColumnForBackground
            ? { ...col, backgroundImage: imageDataUrl, orderIndex: col.orderIndex || cols.indexOf(col).toString() }
            : col
        )
      )
      setColumnImageFile?.(null)
      setColumnImagePreview?.(null)
      setColumnBackgroundDialogOpen?.(false)
      setSelectedColumnForBackground?.(null)
    }
    reader.readAsDataURL(columnImageFile)
  }, [
    selectedColumnForBackground,
    columnImageFile,
    setColumns,
    setColumnImageFile,
    setColumnImagePreview,
    setColumnBackgroundDialogOpen,
    setSelectedColumnForBackground,
  ])

  const handleColumnImageFileSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (!file || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return
      setColumnImageFile?.(file)
      const reader = new FileReader()
      reader.onloadend = () => setColumnImagePreview?.(reader.result)
      reader.readAsDataURL(file)
    },
    [setColumnImageFile, setColumnImagePreview]
  )

  const handleRemoveColumnBackgroundImage = useCallback(
    (columnId) => {
      if (!confirm('Вы уверены, что хотите удалить фоновое изображение колонки?')) return
      setColumns((cols) =>
        cols.map((col) =>
          col.id === columnId
            ? { ...col, backgroundImage: null, orderIndex: col.orderIndex || cols.indexOf(col).toString() }
            : col
        )
      )
    },
    [setColumns]
  )

  return {
    editingColumnId,
    setEditingColumnId,
    editColumnTitle,
    setEditColumnTitle,
    handleCreateColumn,
    handleUpdateColumnColor,
    handleDeleteColumn,
    handleRenameColumn,
    handleSaveColumnName,
    handleOpenColumnBackgroundDialog,
    handleSetColumnBackgroundImage,
    handleColumnImageFileSelect,
    handleRemoveColumnBackgroundImage,
  }
}
