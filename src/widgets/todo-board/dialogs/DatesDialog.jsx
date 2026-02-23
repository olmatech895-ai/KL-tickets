import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { format, parseISO } from 'date-fns'
import { cn } from '../../../lib/utils'

export function DatesDialog({
  open,
  onOpenChange,
  theme,
  selectedTodo,
  editDueDate,
  editDueTime,
  onEditDueDateChange,
  onEditDueTimeChange,
  onSave,
  onRemoveDate,
  onCancel,
  updateTodo,
}) {
  const handleRemove = () => {
    if (selectedTodo) {
      updateTodo(selectedTodo.id, { dueDate: null, dueTime: null })
      onEditDueDateChange('')
      onEditDueTimeChange('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Назначить дату</DialogTitle>
          <DialogDescription>Установите срок выполнения для этой карточки</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Срок выполнения</Label>
            <div className="flex gap-2">
              <Input
                id="dueDate"
                type="date"
                value={editDueDate}
                onChange={(e) => onEditDueDateChange(e.target.value)}
                className="flex-1"
              />
              <Input
                id="dueTime"
                type="time"
                value={editDueTime}
                onChange={(e) => onEditDueTimeChange(e.target.value)}
                className="w-[100px]"
                title="Время (оставьте пустым для «Весь день»)"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Без времени — задача в блоке «Весь день». С временем — отобразится в почасовой шкале.
            </p>
          </div>
          {selectedTodo && (selectedTodo.dueDate || selectedTodo.dueTime) && (
            <div className={cn('p-3 rounded-md', theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50')}>
              <p className="text-sm text-muted-foreground">
                Сейчас:{' '}
                {selectedTodo.dueDate && format(parseISO(selectedTodo.dueDate), 'dd MMMM yyyy')}
                {selectedTodo.dueTime && `, ${selectedTodo.dueTime}`}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleRemove}>
              Удалить дату
            </Button>
            <Button onClick={onSave}>Сохранить</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
