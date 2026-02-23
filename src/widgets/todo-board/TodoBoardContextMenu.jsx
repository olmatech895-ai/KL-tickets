/**
 * Контекстное меню карточки: Архивировать / Удалить
 */
import { Archive, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export function TodoBoardContextMenu({ contextMenu, theme, onClose, onArchive, onDelete }) {
  if (!contextMenu) return null

  return (
    <>
      <div className="fixed inset-0 z-[99]" onClick={onClose} aria-hidden />
      <div
        className={cn(
          'fixed z-[100] rounded-lg shadow-lg py-1 min-w-[180px]',
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        )}
        style={{ left: contextMenu.x, top: contextMenu.y }}
      >
        <button
          onClick={() => onArchive(contextMenu.todo)}
          className={cn(
            'w-full flex items-center px-3 py-2 text-sm transition-colors',
            theme === 'dark' ? 'hover:bg-gray-700 text-gray-100' : 'hover:bg-gray-100 text-gray-900'
          )}
        >
          <Archive className="h-4 w-4 mr-2" />
          Архивировать
        </button>
        <div className={cn('h-px my-1', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200')} />
        <button
          onClick={() => onDelete(contextMenu.todo)}
          className={cn(
            'w-full flex items-center px-3 py-2 text-sm transition-colors text-destructive',
            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          )}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Удалить
        </button>
      </div>
    </>
  )
}
