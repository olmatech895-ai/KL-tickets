/**
 * Диалог подтверждения удаления колонки
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

export function DeleteColumnDialog({ open, onOpenChange, columnToDelete, todosCountInColumn, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Подтвердите удаление</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить колонку &quot;{columnToDelete?.title}&quot;?
            {columnToDelete && todosCountInColumn > 0 && (
              <span className="block mt-2 text-destructive">
                В этой колонке есть задачи. Они будут перемещены в первую колонку.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (columnToDelete) {
                onConfirm(columnToDelete.id)
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
