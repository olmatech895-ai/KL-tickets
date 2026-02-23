import { useState, useEffect } from 'react'
import { api } from '../../../config/api'
import { wsService } from '../../../services/websocket'
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

export function useTodoBoardColumns(user) {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS)
  const [isSavingColumns, setIsSavingColumns] = useState(false)

  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('todoBoardColumns')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const withDefaults = parsed.map((col, i) => ({
            ...col,
            color: col.color || 'primary',
            backgroundImage: col.backgroundImage || null,
            orderIndex: col.orderIndex || i.toString(),
          }))
          setColumns(withDefaults)
        } catch {}
      }
      return
    }

    const loadColumns = async () => {
      try {
        const apiColumns = await api.getTodoColumns()
        if (apiColumns && Array.isArray(apiColumns) && apiColumns.length > 0) {
          const sorted = [...apiColumns].sort(
            (a, b) => parseInt(a.order_index || '0', 10) - parseInt(b.order_index || '0', 10)
          )
          const mapped = sorted.map(mapApiColumnToState)
          setColumns(mapped)
          localStorage.setItem('todoBoardColumns', JSON.stringify(mapped))
          return
        }
      } catch (e) {
      }
      const saved = localStorage.getItem('todoBoardColumns')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const withDefaults = parsed.map((col, i) => ({
            ...col,
            color: col.color || 'primary',
            backgroundImage: col.backgroundImage || null,
            orderIndex: col.orderIndex || i.toString(),
          }))
          setColumns(withDefaults)
        } catch {}
      }
    }

    loadColumns()
    const unsub = wsService.on('columns_updated', (data) => {
      if (data.columns && Array.isArray(data.columns)) {
        const sorted = [...data.columns].sort(
          (a, b) =>
            parseInt(a.order_index || a.orderIndex || '0', 10) -
            parseInt(b.order_index || b.orderIndex || '0', 10)
        )
        const mapped = sorted.map(mapApiColumnToState)
        setColumns(mapped)
        localStorage.setItem('todoBoardColumns', JSON.stringify(mapped))
      }
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (columns.length === 0 || isSavingColumns) return
    localStorage.setItem('todoBoardColumns', JSON.stringify(columns))
    const timeoutId = setTimeout(async () => {
      if (!user) return
      try {
        setIsSavingColumns(true)
        const payload = columns.map((col, i) => mapStateToApi(col, i))
        const response = await api.updateTodoColumns(payload)
        if (response && response.length > 0) {
          const sorted = [...response].sort(
            (a, b) => parseInt(a.order_index || '0', 10) - parseInt(b.order_index || '0', 10)
          )
          const mapped = sorted.map(mapApiColumnToState)
          setColumns(mapped)
          localStorage.setItem('todoBoardColumns', JSON.stringify(mapped))
        }
      } catch (err) {
      } finally {
        setIsSavingColumns(false)
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [columns, user])

  return { columns, setColumns, isSavingColumns, setIsSavingColumns }
}
