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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '../../../lib/utils'

export function PlannerDateDialog({
  open,
  onOpenChange,
  theme,
  plannerSelectedDate,
  columns,
  getPlannerItemsForDate,
  plannerCreateType,
  setPlannerCreateType,
  plannerCreateColumnId,
  setPlannerCreateColumnId,
  plannerCreateTitle,
  setPlannerCreateTitle,
  plannerCreateTime,
  setPlannerCreateTime,
  plannerCreateNotify,
  setPlannerCreateNotify,
  onOpenEditDialog,
  setSelectedCalendarEvent,
  addCalendarEvent,
  onCreateCard,
  sendNotification,
}) {
  const items = plannerSelectedDate ? getPlannerItemsForDate(plannerSelectedDate) : []
  const sortedColumns = [...(columns || [])].sort(
    (a, b) => parseInt(a.orderIndex || '0', 10) - parseInt(b.orderIndex || '0', 10)
  )

  const handleCreate = async () => {
    if (!plannerSelectedDate || !plannerCreateTitle.trim()) return
    const colId = plannerCreateColumnId ?? sortedColumns[0]?.id
    if (!colId) return
    const dueDate = format(plannerSelectedDate, 'yyyy-MM-dd')
    const dueTime = plannerCreateTime?.trim() || null
    const title = plannerCreateTitle.trim()
    if (plannerCreateType === 'calendar') {
      await onCreateCard(colId, {
        title,
        dueDate,
        dueTime,
        notifyWhenDue: plannerCreateNotify,
        calendarOnly: true,
      })
      setPlannerCreateTitle('')
      setPlannerCreateTime('')
      onOpenChange(false)
      sendNotification('Напоминание добавлено', `"${title}" в календарь`, 'info')
    } else {
      await onCreateCard(colId, { dueDate, dueTime, title, calendarOnly: false })
      setPlannerCreateTitle('')
      onOpenChange(false)
    }
  }

  const isDisabled =
    !plannerCreateTitle.trim() ||
    (plannerCreateType === 'board' && !plannerCreateColumnId) ||
    (plannerCreateType === 'calendar' && plannerCreateNotify && !plannerCreateTime?.trim())

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (o) {
          setPlannerCreateColumnId(sortedColumns[0]?.id ?? null)
          setPlannerCreateTime('')
          setPlannerCreateNotify(true)
        } else {
          setPlannerCreateTitle('')
          setPlannerCreateTime('')
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {plannerSelectedDate ? format(plannerSelectedDate, 'd MMMM yyyy', { locale: ru }) : 'Дата'}
          </DialogTitle>
          <DialogDescription>
            Задачи со сроком на эту дату. Создайте задачу, чтобы добавить её в календарь.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {plannerSelectedDate && (
            <>
              <div>
                <h4 className="text-sm font-medium mb-2">Задачи на эту дату</h4>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет задач</p>
                ) : (
                  <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                    {items.map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          )}
                          onClick={() => {
                            onOpenChange(false)
                            if (t.isCalendarEvent) setSelectedCalendarEvent(t)
                            else onOpenEditDialog(t)
                          }}
                        >
                          {t.title}
                          {t.isCalendarEvent && (
                            <span className="text-[10px] text-muted-foreground ml-1">(напоминание)</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="border-t pt-4 space-y-3">
                <h4 className="text-sm font-medium">Добавить на эту дату</h4>
                <div className="flex gap-2 p-1 rounded-lg border bg-muted/30">
                  <button
                    type="button"
                    className={cn(
                      'flex-1 py-1.5 rounded-md text-xs font-medium transition-colors',
                      plannerCreateType === 'calendar'
                        ? 'bg-primary text-primary-foreground'
                        : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-slate-200'
                    )}
                    onClick={() => setPlannerCreateType('calendar')}
                  >
                    Событие в календаре
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'flex-1 py-1.5 rounded-md text-xs font-medium transition-colors',
                      plannerCreateType === 'board'
                        ? 'bg-primary text-primary-foreground'
                        : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-slate-200'
                    )}
                    onClick={() => setPlannerCreateType('board')}
                  >
                    Задача на доску
                  </button>
                </div>
                <div className="space-y-2">
                  {plannerCreateType === 'board' && (
                    <>
                      <Label>Колонка</Label>
                      <Select
                        value={plannerCreateColumnId ?? sortedColumns[0]?.id ?? ''}
                        onValueChange={(v) => setPlannerCreateColumnId(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите колонку" />
                        </SelectTrigger>
                        <SelectContent>
                          {sortedColumns.map((col) => (
                            <SelectItem key={col.id} value={col.id}>
                              {col.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                  <Label>Название</Label>
                  <Input
                    value={plannerCreateTitle}
                    onChange={(e) => setPlannerCreateTitle(e.target.value)}
                    placeholder={
                      plannerCreateType === 'calendar'
                        ? 'Например: Позвонить в суд'
                        : 'Например: Судебное заседание'
                    }
                  />
                  <Label className="flex items-center gap-2">
                    Время
                    <span className="text-xs font-normal text-muted-foreground">
                      {plannerCreateType === 'calendar'
                        ? '(для напоминания укажите время)'
                        : '(необязательно — без времени «Весь день»)'}
                    </span>
                  </Label>
                  <Input
                    type="time"
                    value={plannerCreateTime}
                    onChange={(e) => setPlannerCreateTime(e.target.value)}
                    className="w-[120px]"
                  />
                  {plannerCreateType === 'calendar' && (
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={plannerCreateNotify}
                        onChange={(e) => setPlannerCreateNotify(e.target.checked)}
                        className="rounded border-input"
                      />
                      Уведомить, когда подойдёт время
                    </label>
                  )}
                  <Button className="w-full" disabled={isDisabled} onClick={handleCreate}>
                    {plannerCreateType === 'calendar' ? 'Создать напоминание' : 'Создать задачу'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
