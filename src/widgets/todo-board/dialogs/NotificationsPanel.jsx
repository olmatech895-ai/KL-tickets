import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { format, parseISO } from 'date-fns'
import { Trash2, X, Info, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { cn } from '../../../lib/utils'

function getNotificationIcon(type) {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Info className="h-4 w-4 text-blue-500" />
  }
}

export function NotificationsPanel({
  open,
  onOpenChange,
  theme,
  notifications,
  unreadNotificationsCount,
  markAllNotificationsAsRead,
  clearAllNotifications,
  deleteNotification,
  onNotificationClick,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-md max-h-[80vh] flex flex-col p-0 transition-colors',
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        )}
      >
        <DialogHeader
          className={cn(
            'px-6 pt-6 pb-4 border-b transition-colors',
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Уведомления</DialogTitle>
              <DialogDescription>
                {unreadNotificationsCount > 0
                  ? `${unreadNotificationsCount} непрочитанных`
                  : 'Нет непрочитанных уведомлений'}
              </DialogDescription>
            </div>
            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                {unreadNotificationsCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllNotificationsAsRead} className="text-xs">
                    Отметить все как прочитанные
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearAllNotifications}
                  className="h-8 w-8"
                  title="Очистить все"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0 scrollbar-hide">
          {notifications.length === 0 ? (
            <div
              className={cn(
                'text-center py-12 transition-colors',
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              )}
            >
              <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Нет уведомлений</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => onNotificationClick(notification)}
                className={cn(
                  'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                  !notification.read
                    ? theme === 'dark'
                      ? 'bg-blue-900/30 border-blue-700/50 hover:bg-blue-900/40'
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    : theme === 'dark'
                      ? 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={cn(
                          'font-semibold text-sm transition-colors',
                          !notification.read && 'font-bold',
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        )}
                      >
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p
                      className={cn(
                        'text-xs mt-1 break-words transition-colors',
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      )}
                    >
                      {notification.message}
                    </p>
                    <p
                      className={cn(
                        'text-xs mt-2 transition-colors',
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      )}
                    >
                      {format(parseISO(notification.createdAt), 'dd MMMM yyyy, HH:mm')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-6 w-6 flex-shrink-0 transition-colors',
                      theme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                        : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notification.id)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
