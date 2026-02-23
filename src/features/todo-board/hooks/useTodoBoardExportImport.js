
import { useCallback } from 'react'
import { api } from '../../../config/api'
import { DEFAULT_COLUMNS } from '../../../shared/constants/todo-board'

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

/**
 * @param {Object} deps 
 */
export function useTodoBoardExportImport(deps) {
  const { todos, columns, theme, setTheme, notifications, setColumns } = deps

  const handleExportData = useCallback(() => {
    const exportData = {
      todos,
      columns,
      theme,
      notifications: notifications ?? [],
      exportDate: new Date().toISOString(),
      version: '1.0',
    }
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `todo-board-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [todos, columns, theme, notifications])

  const handleImportData = useCallback(
    (event) => {
      const file = event.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result)
          if (!confirm('Импорт данных перезапишет текущие данные. Продолжить?')) return
          if (importedData.todos) {
            localStorage.setItem('todos', JSON.stringify(importedData.todos))
          }
          if (importedData.columns) {
            localStorage.setItem('todoBoardColumns', JSON.stringify(importedData.columns))
          }
          if (importedData.theme) {
            localStorage.setItem('appTheme', importedData.theme)
            setTheme?.(importedData.theme)
          }
          if (importedData.notifications) {
            localStorage.setItem('todoBoardNotifications', JSON.stringify(importedData.notifications))
          }
          setTimeout(() => window.location.reload(), 1000)
        } catch (error) {}
      }
      reader.readAsText(file)
      event.target.value = ''
    },
    [setTheme]
  )

  const handleClearAllData = useCallback(() => {
    if (
      !confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить!') ||
      !confirm('Последнее предупреждение! Все задачи и колонки будут удалены. Продолжить?')
    ) {
      return
    }
    localStorage.removeItem('todos')
    localStorage.removeItem('todoBoardColumns')
    setTimeout(() => window.location.reload(), 1000)
  }, [])

  const handleResetColumns = useCallback(async () => {
    if (!confirm('Вы уверены, что хотите сбросить колонки к значениям по умолчанию?')) return
    const defaultColumns = [...DEFAULT_COLUMNS]
    try {
      const columnsData = defaultColumns.map((col, i) => ({
        column_id: col.id,
        title: col.title,
        status: col.status,
        color: col.color,
        background_image: col.backgroundImage,
        order_index: col.orderIndex ?? i.toString(),
      }))
      const response = await api.updateTodoColumns(columnsData)
      if (response?.length > 0) {
        const sorted = [...response].sort(
          (a, b) => parseInt(a.order_index || '0', 10) - parseInt(b.order_index || '0', 10)
        )
        const mapped = sorted.map(mapApiColumnToState)
        setColumns(mapped)
        localStorage.setItem('todoBoardColumns', JSON.stringify(mapped))
      }
    } catch (error) {
      setColumns(defaultColumns)
      localStorage.setItem('todoBoardColumns', JSON.stringify(defaultColumns))
    }
  }, [setColumns])

  return {
    handleExportData,
    handleImportData,
    handleClearAllData,
    handleResetColumns,
  }
}
