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
import { cn } from '../../../lib/utils'

const TAG_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-red-100 text-red-700',
  'bg-yellow-100 text-yellow-700',
  'bg-green-100 text-green-700',
]

export function TagsDialog({
  open,
  onOpenChange,
  selectedTodo,
  newTagName,
  onNewTagNameChange,
  onAddTag,
  onCancel,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить метку</DialogTitle>
          <DialogDescription>Создайте новую метку для этой карточки</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tagName">Название метки</Label>
            <Input
              id="tagName"
              value={newTagName}
              onChange={(e) => onNewTagNameChange(e.target.value)}
              placeholder="Введите название метки..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newTagName.trim()) onAddTag()
              }}
            />
          </div>
          {selectedTodo?.tags?.length > 0 && (
            <div className="space-y-2">
              <Label>Существующие метки</Label>
              <div className="flex flex-wrap gap-2">
                {selectedTodo.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={cn('px-2 py-1 rounded text-xs font-medium', TAG_COLORS[idx % TAG_COLORS.length])}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button onClick={onAddTag} disabled={!newTagName.trim()}>
              Добавить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
