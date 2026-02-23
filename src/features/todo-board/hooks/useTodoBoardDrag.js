import { useState, useCallback, useRef, useEffect } from 'react'

export function useTodoBoardDrag() {
  const [isDragging, setIsDragging] = useState(false)
  const scrollContainerRef = useRef(null)
  const dragStateRef = useRef({ startX: 0, scrollLeft: 0 })
  const isDraggingRef = useRef(false)

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    const target = e.target
    const container = scrollContainerRef.current
    if (!container) return

    const isClickable =
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('a') ||
      target.closest('[role="button"]') ||
      target.closest('[role="combobox"]') ||
      target.closest('[role="option"]') ||
      target.closest('[role="listbox"]') ||
      target.closest('label')
    const isTodoCard = target.closest('.todo-card')
    const isColumnHeader = target.closest('.column-header')
    if (isClickable || isTodoCard || isColumnHeader) return

    e.preventDefault()
    e.stopPropagation()
    dragStateRef.current = { startX: e.pageX, scrollLeft: container.scrollLeft }
    isDraggingRef.current = true
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current || !scrollContainerRef.current || !dragStateRef.current) return
    e.preventDefault()
    e.stopPropagation()
    const container = scrollContainerRef.current
    const deltaX = dragStateRef.current.startX - e.pageX
    container.scrollLeft = dragStateRef.current.scrollLeft + deltaX * 2
  }, [])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
    setIsDragging(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    isDraggingRef.current = false
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e) => {
      if (!isDraggingRef.current || !dragStateRef.current) return
      const container = scrollContainerRef.current
      if (!container) {
        isDraggingRef.current = false
        setIsDragging(false)
        return
      }
      e.preventDefault()
      e.stopPropagation()
      const deltaX = dragStateRef.current.startX - e.pageX
      container.scrollLeft = dragStateRef.current.scrollLeft + deltaX * 2
    }
    const onUp = () => {
      isDraggingRef.current = false
      setIsDragging(false)
    }
    document.addEventListener('mousemove', onMove, { passive: false, capture: true })
    document.addEventListener('mouseup', onUp, { capture: true })
    return () => {
      document.removeEventListener('mousemove', onMove, { capture: true })
      document.removeEventListener('mouseup', onUp, { capture: true })
    }
  }, [isDragging])

  return {
    scrollContainerRef,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  }
}
