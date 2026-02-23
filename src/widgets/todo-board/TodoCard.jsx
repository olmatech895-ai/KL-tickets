/**
 * Карточка задачи в колонке канбана
 */
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Card, CardContent } from '../../components/ui/card'
import { Calendar, Flag, Paperclip } from 'lucide-react'
import { cn } from '../../lib/utils'
import { getUserInitials, getUserColor } from '../../shared/utils/user-display'

const TAG_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-red-100 text-red-700',
  'bg-yellow-100 text-yellow-700',
  'bg-green-100 text-green-700',
]

export function TodoCard({
  todo,
  theme,
  allUsers,
  transitionDelay,
  isMounted,
  onDragStart,
  onDragEnd,
  onContextMenu,
  onClick,
}) {
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, todo)}
      onDragEnd={onDragEnd}
      onContextMenu={(e) => onContextMenu(e, todo)}
      onClick={onClick}
      className={cn(
        'todo-card group cursor-pointer transition-all duration-500 relative overflow-hidden backdrop-blur-sm',
        theme === 'dark'
          ? 'bg-gray-700/60 border-gray-600/40 hover:shadow-xl hover:border-primary/60 hover:bg-gray-700/80 hover:scale-[1.02] hover:-translate-y-0.5'
          : 'bg-white/80 border-gray-200/60 hover:shadow-xl hover:border-primary/60 hover:bg-white/95 hover:scale-[1.02] hover:-translate-y-0.5',
        isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
      style={{
        backgroundImage: todo.backgroundImage ? `url(${todo.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transitionDelay,
      }}
    >
      {todo.backgroundImage && (
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 backdrop-blur-[2px] transition-all duration-300" />
      )}
      <CardContent className="p-3 relative z-10">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                'font-medium text-sm leading-tight transition-colors flex-1',
                todo.backgroundImage ? 'text-white drop-shadow-md' : theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              )}
            >
              {todo.title}
            </h4>
            {todo.priority && (
              <Flag
                className={cn(
                  'h-3.5 w-3.5 flex-shrink-0 mt-0.5',
                  todo.priority === 'high' && 'text-red-500 fill-red-500',
                  todo.priority === 'medium' && 'text-yellow-500 fill-yellow-500',
                  todo.priority === 'low' && 'text-blue-500 fill-blue-500',
                  todo.backgroundImage && 'drop-shadow-md'
                )}
              />
            )}
          </div>
          {todo.description && (
            <p
              className={cn(
                'text-xs line-clamp-2 transition-colors',
                todo.backgroundImage ? 'text-white/90 drop-shadow-md' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              )}
            >
              {todo.description}
            </p>
          )}
          {todo.dueDate && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs',
                todo.backgroundImage ? 'text-white/90' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )}
            >
              <Calendar className="h-3 w-3 shrink-0" />
              {format(parseISO(todo.dueDate), 'd MMM', { locale: ru })}
              {todo.dueTime && `, ${todo.dueTime}`}
            </div>
          )}
          {(() => {
            const files = (todo.attachments || []).filter((a) => !a.isBackground)
            if (files.length === 0) return null
            return (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs',
                  todo.backgroundImage ? 'text-white/90' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                )}
                title={files.length === 1 ? (files[0].name ?? files[0].filename ?? 'Файл') : `${files.length} вложений`}
              >
                <Paperclip className="h-3 w-3 shrink-0" />
                <span>{files.length === 1 ? '1 файл' : `${files.length} файлов`}</span>
              </div>
            )
          })()}
          {todo.tags && todo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {todo.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'px-2 py-0.5 rounded-md text-xs font-medium backdrop-blur-sm transition-all duration-200 hover:scale-105',
                    TAG_COLORS[idx % TAG_COLORS.length],
                    theme === 'dark' ? 'opacity-90' : 'opacity-95'
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {todo.assignedTo && todo.assignedTo.length > 0 && (
            <div className="flex items-center -space-x-1">
              {todo.assignedTo.slice(0, 3).map((userId) => {
                const assignedUser = allUsers.find((u) => u.id === userId)
                if (!assignedUser) return null
                return (
                  <div
                    key={userId}
                    className={cn(
                      'h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white',
                      getUserColor(userId, allUsers)
                    )}
                    title={assignedUser.username}
                  >
                    {getUserInitials(assignedUser.username)}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
