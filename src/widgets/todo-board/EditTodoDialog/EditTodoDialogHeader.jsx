/**
 * Шапка диалога редактирования карточки: статус, уведомления, вложения, меню, закрыть
 */
import { Button } from '../../../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../../components/ui/dropdown-menu'
import { Volume2, Image as ImageIcon, Paperclip, MoreVertical, Trash2, Star, Flag, X } from 'lucide-react'
import { cn } from '../../../lib/utils'

export function EditTodoDialogHeader({
  theme,
  selectedTodo,
  columns,
  notificationsEnabled,
  setNotificationsEnabled,
  sendNotification,
  updateTodo,
  setAttachImageDialogOpen,
  todoAttachFileInputRef,
  handleAttachFileSelect,
  attachingFile,
  setTodoToDelete,
  setDeleteTodoDialogOpen,
  setPriorityDialogOpen,
  onClose,
}) {
  const toggleNotifications = () => {
    const newState = !notificationsEnabled
    setNotificationsEnabled(newState)
    if (newState) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission().then((p) => {
            if (p === 'granted') sendNotification('Уведомления включены', 'Теперь вы будете получать уведомления', 'success')
          })
        } else if (Notification.permission === 'granted') {
          sendNotification('Уведомления включены', 'Теперь вы будете получать уведомления', 'success')
        }
      }
    } else {
      sendNotification('Уведомления отключены', 'Вы больше не будете получать уведомления', 'info')
    }
  }

  const copyTodoInfo = () => {
    if (!selectedTodo) return
    const text = `Название: ${selectedTodo.title}\nОписание: ${selectedTodo.description || 'Нет описания'}\nСтатус: ${columns.find((col) => col.status === selectedTodo.status)?.title || selectedTodo.status}`
    if (navigator.clipboard) navigator.clipboard.writeText(text)
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 border-b transition-colors',
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      )}
    >
      <Select
        value={selectedTodo?.status}
        onValueChange={async (newStatus) => {
          try {
            await updateTodo(selectedTodo.id, { status: newStatus })
            const column = columns.find((col) => col.status === newStatus)
            if (column) {
              sendNotification(
                'Карточка перемещена',
                `"${selectedTodo.title}" перемещена в "${column.title}"`,
                'success',
                selectedTodo.id
              )
            }
          } catch (_) {}
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {columns.map((col) => (
            <SelectItem key={col.id} value={col.status}>
              {col.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleNotifications} title={notificationsEnabled ? 'Отключить уведомления' : 'Включить уведомления'}>
          <Volume2 className={cn('h-5 w-5', !notificationsEnabled && 'text-gray-400')} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setAttachImageDialogOpen(true)} title="Прикрепить изображение">
          <ImageIcon className="h-5 w-5" />
        </Button>
        <input ref={todoAttachFileInputRef} type="file" accept="*" className="hidden" onChange={handleAttachFileSelect} />
        <Button variant="ghost" size="icon" disabled={attachingFile} onClick={() => todoAttachFileInputRef.current?.click()} title="Прикрепить файл (документ)">
          <Paperclip className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Дополнительные опции">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setTodoToDelete(selectedTodo); setDeleteTodoDialogOpen(true) }}>
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить карточку
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                const wasInFocus = selectedTodo?.inFocus
                updateTodo(selectedTodo.id, { inFocus: !selectedTodo.inFocus })
                sendNotification(
                  wasInFocus ? 'Убрано из фокуса' : 'Добавлено в фокус',
                  wasInFocus ? `"${selectedTodo.title}" убрана из фокуса` : `"${selectedTodo.title}" добавлена в фокус`,
                  'info',
                  selectedTodo.id
                )
              }}
            >
              <Star className={cn('h-4 w-4 mr-2', selectedTodo?.inFocus && 'fill-yellow-400')} />
              {selectedTodo?.inFocus ? 'Убрать из фокуса' : 'Добавить в фокус'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPriorityDialogOpen(true)}>
              <Flag className="h-4 w-4 mr-2" />
              Изменить приоритет
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={copyTodoInfo}>
              <Paperclip className="h-4 w-4 mr-2" />
              Копировать информацию
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" onClick={onClose} title="Закрыть">
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
