import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Label } from '../../../components/ui/label'
import { Flag, Check } from 'lucide-react'
import { cn } from '../../../lib/utils'

export function PriorityDialog({
  open,
  onOpenChange,
  theme,
  selectedTodo,
  onChangePriority,
  onReset,
  updateTodo,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Установить приоритет</DialogTitle>
          <DialogDescription>Выберите приоритет для этой карточки</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Выберите приоритет</Label>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant={selectedTodo?.priority === 'high' ? 'default' : 'outline'}
                className={cn(
                  'w-full justify-start',
                  selectedTodo?.priority === 'high' && 'bg-red-500 hover:bg-red-600 text-white border-red-500'
                )}
                onClick={() => onChangePriority('high')}
              >
                <Flag className="h-4 w-4 mr-2 fill-red-500 text-red-500" />
                <span className="font-medium">Высокий</span>
                {selectedTodo?.priority === 'high' && <Check className="h-4 w-4 ml-auto" />}
              </Button>
              <Button
                variant={selectedTodo?.priority === 'medium' ? 'default' : 'outline'}
                className={cn(
                  'w-full justify-start',
                  selectedTodo?.priority === 'medium' && 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500'
                )}
                onClick={() => onChangePriority('medium')}
              >
                <Flag className="h-4 w-4 mr-2 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">Средний</span>
                {selectedTodo?.priority === 'medium' && <Check className="h-4 w-4 ml-auto" />}
              </Button>
              <Button
                variant={selectedTodo?.priority === 'low' ? 'default' : 'outline'}
                className={cn(
                  'w-full justify-start',
                  selectedTodo?.priority === 'low' && 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500'
                )}
                onClick={() => onChangePriority('low')}
              >
                <Flag className="h-4 w-4 mr-2 fill-blue-500 text-blue-500" />
                <span className="font-medium">Низкий</span>
                {selectedTodo?.priority === 'low' && <Check className="h-4 w-4 ml-auto" />}
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            {selectedTodo?.priority && (
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedTodo) {
                    updateTodo(selectedTodo.id, { priority: 'medium' })
                    onOpenChange(false)
                  }
                }}
              >
                Сбросить
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
