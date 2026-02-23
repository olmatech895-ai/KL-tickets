/**
 * Диалог подтверждения удаления карточки
 */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'

export function DeleteTodoDialog({ open, onOpenChange, todoToDelete, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Подтвердите удаление</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить карточку &quot;{todoToDelete?.title}&quot;?
            <span className="block mt-2 text-destructive">
              Это действие нельзя отменить. Карточка будет полностью удалена.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (todoToDelete) {
                await onConfirm(todoToDelete)
                onCancel()
              }
            }}
          >
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
