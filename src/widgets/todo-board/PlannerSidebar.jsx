/**
 * Виджет: левая панель планировщика (календарь + весь день + по часам)
 * FSD: widgets/todo-board
 */
import { Button } from '../../components/ui/button'
import { Calendar, ArrowLeft, PanelLeftClose, PanelLeftOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { format, startOfMonth, subMonths, addMonths, isSameMonth, isSameDay, isToday } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '../../lib/utils'

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function PlannerSidebar({
  theme,
  plannerSidebarCollapsed,
  setPlannerSidebarCollapsed,
  plannerMonth,
  setPlannerMonth,
  plannerSelectedDate,
  setPlannerSelectedDate,
  plannerAllDayOpen,
  setPlannerAllDayOpen,
  plannerByHourOpen,
  setPlannerByHourOpen,
  plannerCalendarDays,
  getPlannerItemsForDate,
  getPlannerItemsForDateByTime,
  getTodosForDateByTime,
  onDayClick,
  onTaskClick,
  onCalendarEventClick,
}) {
  return (
    <aside
      className={cn(
        'flex-shrink-0 flex flex-col border-r overflow-hidden transition-[width] duration-200 ease-out',
        plannerSidebarCollapsed ? 'w-12 min-w-[48px] md:w-14 md:min-w-[56px]' : 'w-[260px] min-w-[260px] md:w-[280px] md:min-w-[280px]',
        theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-slate-200'
      )}
    >
      {plannerSidebarCollapsed ? (
        <div className="flex flex-col items-center py-3 gap-2 h-full">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setPlannerSidebarCollapsed(false)}
            title="Развернуть планировщик"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </Button>
          <button
            type="button"
            onClick={() => setPlannerSidebarCollapsed(false)}
            className={cn(
              'flex flex-col items-center justify-center rounded-lg w-10 min-h-[56px] flex-1 min-h-0',
              theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-slate-100'
            )}
            title={plannerSelectedDate ? format(plannerSelectedDate, 'd MMMM yyyy', { locale: ru }) : 'Планировщик'}
          >
            <Calendar className="h-5 w-5 text-muted-foreground mb-1" />
            {plannerSelectedDate && (
              <span className="text-lg font-bold leading-none text-foreground">
                {format(plannerSelectedDate, 'd')}
              </span>
            )}
          </button>
        </div>
      ) : (
        <>
          <div className="p-2 border-b flex items-center justify-between gap-1 flex-shrink-0">
            <div className="flex items-center gap-0.5 flex-1 min-w-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setPlannerMonth((m) => subMonths(m, 1))}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold capitalize truncate">
                {format(plannerMonth, 'LLL yyyy', { locale: ru })}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setPlannerMonth((m) => addMonths(m, 1))}>
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setPlannerSidebarCollapsed(true)} title="Свернуть планировщик">
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-1.5 flex justify-center flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                setPlannerMonth(startOfMonth(new Date()))
                setPlannerSelectedDate(new Date())
              }}
            >
              Сегодня
            </Button>
          </div>
          {plannerSelectedDate && (
            <div className="px-2 py-1.5 border-b flex-shrink-0">
              <div className={cn('rounded-xl py-2.5 px-2 text-center', theme === 'dark' ? 'bg-gray-700/50' : 'bg-slate-100')}>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {format(plannerSelectedDate, 'EEE', { locale: ru })}
                </p>
                <p className="text-xl font-bold text-foreground leading-none">{format(plannerSelectedDate, 'd')}</p>
              </div>
            </div>
          )}
          <div className="flex-shrink-0 p-1.5">
            <div className="grid grid-cols-7 gap-px text-center text-[10px] font-medium">
              {WEEKDAY_LABELS.map((d) => (
                <div key={d} className={cn('py-0.5', theme === 'dark' ? 'text-gray-500' : 'text-slate-500')}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 mt-0.5">
              {plannerCalendarDays.map((day) => {
                const dayItems = getPlannerItemsForDate(day)
                const isCurrentMonth = isSameMonth(day, plannerMonth)
                const isSelected = plannerSelectedDate && isSameDay(day, plannerSelectedDate)
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => onDayClick(day)}
                    className={cn(
                      'flex flex-col items-center justify-center rounded text-[11px] transition-colors min-h-0 w-full aspect-square',
                      !isCurrentMonth && 'opacity-40',
                      isSelected && 'bg-primary text-primary-foreground font-semibold',
                      isCurrentMonth && !isSelected && (theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-slate-200'),
                      isToday(day) && !isSelected && 'ring-1 ring-primary font-medium'
                    )}
                  >
                    {format(day, 'd')}
                    {dayItems.length > 0 && <span className="w-0.5 h-0.5 rounded-full bg-current opacity-70 mt-0.5" />}
                  </button>
                )
              })}
            </div>
          </div>
          {plannerSelectedDate && (
            <div className="flex-1 flex flex-col min-h-0 border-t overflow-hidden">
              <div className="flex-shrink-0 border-b">
                <button
                  type="button"
                  className={cn('w-full px-3 py-2 flex items-center justify-between gap-2 text-left', theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-slate-100/80')}
                  onClick={() => setPlannerAllDayOpen((v) => !v)}
                >
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Весь день</span>
                  {plannerAllDayOpen ? <ChevronUp className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
                </button>
                {plannerAllDayOpen && (
                  <div className="px-3 pb-2 pt-0 space-y-1 max-h-16 overflow-y-auto">
                    {getPlannerItemsForDateByTime(plannerSelectedDate).allDay.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground">Нет задач на весь день</p>
                    ) : (
                      getPlannerItemsForDateByTime(plannerSelectedDate).allDay.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          className={cn('w-full text-left text-xs truncate rounded-lg px-2 py-1.5 transition-colors', theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-slate-100')}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (t.isCalendarEvent) onCalendarEventClick(t)
                            else onTaskClick(t)
                          }}
                        >
                          {t.title}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <button
                  type="button"
                  className={cn(
                    'w-full px-3 py-1.5 flex items-center justify-between gap-2 text-left flex-shrink-0 border-b',
                    theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-slate-100/80'
                  )}
                  onClick={() => setPlannerByHourOpen((v) => !v)}
                >
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">По часам</span>
                  {plannerByHourOpen ? <ChevronUp className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
                </button>
                {plannerByHourOpen && (
                  <div className="flex-1 overflow-y-auto min-h-0 pl-2 pr-2">
                    <div className="divide-y">
                      {Array.from({ length: 24 }, (_, h) => {
                        const byHour = getPlannerItemsForDateByTime(plannerSelectedDate).byHour[h] || []
                        return (
                          <div key={h} className="flex gap-2 py-1 pr-1">
                            <div className={cn('w-8 flex-shrink-0 text-[10px] font-medium pt-1 pl-1', theme === 'dark' ? 'text-gray-500' : 'text-slate-500')}>
                              {String(h).padStart(2, '0')}
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5 py-0.5 pl-0.5">
                              {byHour.map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  className={cn(
                                    'w-full text-left text-[11px] truncate rounded px-1.5 py-1 transition-colors',
                                    theme === 'dark' ? 'bg-primary/20 hover:bg-primary/30 text-primary-foreground' : 'bg-primary/15 hover:bg-primary/25 text-primary'
                                  )}
                                  onClick={() => {
                                    if (t.isCalendarEvent) onCalendarEventClick(t)
                                    else onTaskClick(t)
                                  }}
                                >
                                  {t.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  )
}
