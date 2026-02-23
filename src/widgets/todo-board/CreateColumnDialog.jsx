/**
 * Диалог создания колонки
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
import { cn } from '../../lib/utils'

export function CreateColumnDialog({
  open,
  onOpenChange,
  newColumnTitle,
  onNewColumnTitleChange,
  onCreateColumn,
  onCancel,
  theme,
  isMounted,
  columnsLength,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'flex-shrink-0 w-80 h-fit backdrop-blur-md border-2 border-dashed transition-all duration-500 hover:scale-[1.02]',
            theme === 'dark'
              ? 'bg-gray-800/40 border-gray-600/40 hover:border-primary/60 hover:bg-primary/20 text-gray-300 hover:text-primary shadow-lg hover:shadow-xl'
              : 'bg-white/60 border-gray-300/50 hover:border-primary/60 hover:bg-primary/10 text-gray-600 hover:text-primary shadow-lg hover:shadow-xl',
            isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          )}
          style={{ transitionDelay: `${300 + columnsLength * 100}ms` }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавьте еще одну колонку
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать колонку</DialogTitle>
          <DialogDescription>Добавьте новую колонку на доску</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="columnTitle">Название колонки</Label>
            <Input
              id="columnTitle"
              value={newColumnTitle}
              onChange={(e) => onNewColumnTitleChange(e.target.value)}
              placeholder="Введите название..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newColumnTitle.trim()) onCreateColumn()
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button onClick={onCreateColumn} disabled={!newColumnTitle.trim()}>
              Добавить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
