import { cn } from '../lib/utils'

const STATUS_COLORS = {
  online: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]',
  offline: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]',
  unknown: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]',
}

const STATUS_LABELS = {
  online: 'Работает',
  offline: 'Нет связи',
  unknown: 'Неизвестно',
}

/**
 * Компонент отображает состояние камер в виде цветных точек.
 * @param {Object} props
 * @param {{ id: string, name?: string, status: 'online'|'offline'|'unknown' }[]} props.cameras - список камер
 * @param {boolean} [props.loading] - идёт загрузка
 * @param {string} [props.className] - класс контейнера
 * @param {boolean} [props.showLabels] - показывать подписи (онлайн/офлайн) под блоком
 */
export function CameraStatusDots({ cameras = [], loading = false, className, showLabels = true }) {
  if (loading) {
    return (
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        <span className="text-sm text-muted-foreground">Камеры: загрузка…</span>
        <span className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-full bg-muted animate-pulse"
              aria-hidden
            />
          ))}
        </span>
      </div>
    )
  }

  if (!cameras?.length) {
    return (
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        <span className="text-sm text-muted-foreground">Нет данных о камерах</span>
      </div>
    )
  }

  const byStatus = { online: 0, offline: 0, unknown: 0 }
  cameras.forEach((c) => {
    const s = c.status in byStatus ? c.status : 'unknown'
    byStatus[s] += 1
  })

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <div className="flex items-center gap-2 flex-wrap">
        {cameras.map((cam) => {
          const status = STATUS_COLORS[cam.status] ? cam.status : 'unknown'
          const label = cam.name
            ? `${cam.name}: ${STATUS_LABELS[status]}`
            : STATUS_LABELS[status]
          return (
            <span
              key={cam.id}
              title={label}
              className={cn(
                'h-3 w-3 rounded-full shrink-0 transition-all',
                STATUS_COLORS[status]
              )}
              aria-label={label}
            />
          )
        })}
      </div>
      {showLabels && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {byStatus.online > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              {byStatus.online} раб.
            </span>
          )}
          {byStatus.offline > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              {byStatus.offline} нет
            </span>
          )}
          {byStatus.unknown > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
              {byStatus.unknown} ?
            </span>
          )}
        </div>
      )}
    </div>
  )
}
