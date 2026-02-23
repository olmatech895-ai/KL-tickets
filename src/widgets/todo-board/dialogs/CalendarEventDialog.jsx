import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

export function CalendarEventDialog({
  open,
  onOpenChange,
  selectedCalendarEvent,
  onRemove,
  onClose,
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Напоминание</DialogTitle>
          <DialogDescription>Событие только в календаре, не на доске.</DialogDescription>
        </DialogHeader>
        {selectedCalendarEvent && (
          <div className="space-y-3">
            <p className="font-medium">{selectedCalendarEvent.title}</p>
            <p className="text-sm text-muted-foreground">
              {selectedCalendarEvent.dueDate &&
                format(parseISO(selectedCalendarEvent.dueDate), 'dd MMMM yyyy', { locale: ru })}
              {selectedCalendarEvent.dueTime && `, ${selectedCalendarEvent.dueTime}`}
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="destructive" size="sm" onClick={() => onRemove(selectedCalendarEvent)}>
                Удалить
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Закрыть
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
