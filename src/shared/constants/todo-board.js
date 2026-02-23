

export const CALENDAR_EVENTS_KEY = 'todoBoardCalendarEvents'
export const CALENDAR_NOTIFIED_KEY = 'todoBoardCalendarNotified'

export const DEFAULT_COLUMNS = [
  { id: 'todo', title: 'К выполнению', status: 'todo', color: 'primary', backgroundImage: null, orderIndex: '0' },
  { id: 'in_progress', title: 'В работе', status: 'in_progress', color: 'warning', backgroundImage: null, orderIndex: '1' },
  { id: 'done', title: 'Выполнено', status: 'done', color: 'success', backgroundImage: null, orderIndex: '2' },
]

export const COLOR_PALETTE = {
  primary: { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary-foreground', header: 'bg-blue-500 text-white' },
  warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-700 dark:text-yellow-300', header: 'bg-yellow-500 text-white' },
  success: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-700 dark:text-green-300', header: 'bg-green-500 text-white' },
  danger: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-700 dark:text-red-300', header: 'bg-red-500 text-white' },
  info: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-700 dark:text-cyan-300', header: 'bg-cyan-500 text-white' },
  secondary: { bg: 'bg-secondary/10', border: 'border-secondary/30', text: 'text-secondary-foreground', header: 'bg-gray-500 text-white' },
  accent: { bg: 'bg-accent/10', border: 'border-accent/30', text: 'text-accent-foreground', header: 'bg-purple-500 text-white' },
  muted: { bg: 'bg-muted/10', border: 'border-muted/30', text: 'text-muted-foreground', header: 'bg-gray-400 text-white' },
}

export const TAG_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-red-100 text-red-700',
  'bg-yellow-100 text-yellow-700',
  'bg-green-100 text-green-700',
]
