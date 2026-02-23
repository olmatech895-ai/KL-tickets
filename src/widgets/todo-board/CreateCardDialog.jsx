/**
 * Диалог создания карточки в колонке
 */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Plus } from 'lucide-react'

export function CreateCardDialog({
  open,
  onOpenChange,
  columnId,
  columnTitle,
  newCardTitle,
  onNewCardTitleChange,
  onCreateCard,
  onCancel,
  onTriggerClick,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) onCancel?.()
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation()
            onTriggerClick?.(columnId)
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать карточку</DialogTitle>
          <DialogDescription>Добавьте новую задачу в колонку &quot;{columnTitle}&quot;</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-title">Название *</Label>
            <Input
              id="card-title"
              value={newCardTitle}
              onChange={(e) => onNewCardTitleChange(e.target.value)}
              placeholder="Введите название задачи"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newCardTitle.trim()) onCreateCard(columnId)
              }}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button onClick={() => onCreateCard(columnId)} disabled={!newCardTitle.trim()}>
              Создать
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
