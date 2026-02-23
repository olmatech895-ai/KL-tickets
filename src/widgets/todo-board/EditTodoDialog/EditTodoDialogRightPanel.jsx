/**
 * Правая панель диалога: вкладки «Комментарии» и «Подробности»
 */
import { Button } from '../../../components/ui/button'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Send } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '../../../lib/utils'
import { getUserInitials } from '../../../shared/utils/user-display'

export function EditTodoDialogRightPanel({
  theme,
  selectedTodo,
  columns,
  user,
  activeTab,
  setActiveTab,
  commentText,
  setCommentText,
  onAddComment,
}) {
  const commentInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div
      className={cn(
        'w-96 border-l flex flex-col transition-colors',
        theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-50 border-gray-200'
      )}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList className="w-full rounded-none flex-shrink-0">
          <TabsTrigger value="comments" className="flex-1">
            Комментарии и события
          </TabsTrigger>
          <TabsTrigger value="details" className="flex-1">
            Показать подробности
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="flex-1 flex flex-col mt-0 p-0 overflow-hidden min-h-0">
          <div
            className={cn(
              'p-4 space-y-2 flex-shrink-0 border-b transition-colors',
              theme === 'dark' ? 'bg-gray-900/50 border-gray-700/50' : 'bg-white border-gray-200'
            )}
          >
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Напишите комментарий..."
              className="min-h-[80px] max-h-[120px] resize-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey && commentText.trim()) onAddComment()
              }}
            />
            <Button onClick={onAddComment} disabled={!commentText.trim()} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Отправить
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {selectedTodo?.comments?.length > 0 ? (
              selectedTodo.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {commentInitials(comment.authorName)}
                  </div>
                  <div className="flex-1 min-w-0 break-words">
                    <p className="text-sm break-words">
                      <span className="font-semibold">{comment.authorName || 'Пользователь'}</span> {comment.text}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                      {format(parseISO(comment.createdAt), 'dd MMMM yyyy, HH:mm')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">Нет комментариев</div>
            )}
            {selectedTodo?.status && (
              <div className="flex gap-3 pt-2 flex-shrink-0 border-t">
                <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  {getUserInitials(user?.username || 'User')}
                </div>
                <div className="flex-1 min-w-0 break-words">
                  <p className="text-sm break-words">
                    <span className="font-semibold">{user?.username || 'Пользователь'}</span> добавил(а) эту карточку в список{' '}
                    <span className="font-semibold">
                      {columns.find((col) => col.status === selectedTodo.status)?.title || selectedTodo.status}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">12 минут назад</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="details" className="p-4 mt-0">
          <div className="space-y-4">
            <div>
              <Label>Приоритет</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedTodo?.priority === 'high' ? 'Высокий' : selectedTodo?.priority === 'medium' ? 'Средний' : 'Низкий'}
              </p>
            </div>
            <div>
              <Label>Создано</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedTodo?.createdAt ? format(parseISO(selectedTodo.createdAt), 'dd MMMM yyyy, HH:mm') : '-'}
              </p>
            </div>
            <div>
              <Label>Обновлено</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedTodo?.updatedAt ? format(parseISO(selectedTodo.updatedAt), 'dd MMMM yyyy, HH:mm') : '-'}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
