/**
 * Левая панель диалога редактирования: название, кнопки, приоритет, метки, даты, участники, описание, вложения, чек-лист
 */
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Radio, Calendar, Clock, Tag as TagIcon, UserPlus, Flag, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '../../../lib/utils'
import { getUserInitials, getUserColor } from '../../../shared/utils/user-display'
import { EditTodoDialogAttachmentsChecklist } from './EditTodoDialogAttachmentsChecklist'

const TAG_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-300',
  'bg-purple-100 text-purple-700 border-purple-300',
  'bg-red-100 text-red-700 border-red-300',
  'bg-yellow-100 text-yellow-700 border-yellow-300',
  'bg-green-100 text-green-700 border-green-300',
]

export function EditTodoDialogLeftPanel({
  theme,
  selectedTodo,
  allUsers,
  editTitle,
  setEditTitle,
  editDescription,
  setEditDescription,
  newChecklistItem,
  setNewChecklistItem,
  setTagsDialogOpen,
  setPriorityDialogOpen,
  setParticipantsDialogOpen,
  handleOpenDatesDialog,
  handleSaveTodo,
  handleRemoveTag,
  handleRemoveParticipant,
  getChecklistProgress,
  getAttachmentUrl,
  isAttachmentImage,
  onDownloadAttachment,
  todoAttachFileInputRef,
  attachingFile,
  onRemoveAttachment,
  onDeleteChecklist,
  onToggleChecklistItem,
  onDeleteChecklistItem,
  onAddChecklistItem,
}) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-start gap-3">
        <Radio className="h-6 w-6 mt-1 text-gray-400" />
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSaveTodo}
          className="text-2xl font-semibold border-0 p-0 focus-visible:ring-0 h-auto"
          placeholder="Название задачи"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setTagsDialogOpen(true)}>
          <TagIcon className="h-4 w-4 mr-2" />
          Метки
        </Button>
        <Button variant="outline" size="sm" onClick={handleOpenDatesDialog}>
          <Clock className="h-4 w-4 mr-2" />
          Даты
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPriorityDialogOpen(true)}>
          <Flag
            className={cn(
              'h-4 w-4 mr-2',
              selectedTodo?.priority === 'high' && 'text-red-500 fill-red-500',
              selectedTodo?.priority === 'medium' && 'text-yellow-500 fill-yellow-500',
              selectedTodo?.priority === 'low' && 'text-blue-500 fill-blue-500'
            )}
          />
          Приоритет
        </Button>
        <Button variant="outline" size="sm" onClick={() => setParticipantsDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Участники
        </Button>
      </div>

      {selectedTodo?.priority && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Приоритет</h3>
          <div className="flex items-center gap-2">
            <Flag
              className={cn(
                'h-4 w-4',
                selectedTodo.priority === 'high' && 'text-red-500 fill-red-500',
                selectedTodo.priority === 'medium' && 'text-yellow-500 fill-yellow-500',
                selectedTodo.priority === 'low' && 'text-blue-500 fill-blue-500'
              )}
            />
            <span
              className={cn(
                'text-sm font-medium px-2 py-1 rounded',
                selectedTodo.priority === 'high' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                selectedTodo.priority === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                selectedTodo.priority === 'low' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              )}
            >
              {selectedTodo.priority === 'high' ? 'Высокий' : selectedTodo.priority === 'medium' ? 'Средний' : 'Низкий'}
            </span>
          </div>
        </div>
      )}

      {selectedTodo?.tags?.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Метки</h3>
          <div className="flex flex-wrap gap-2">
            {selectedTodo.tags.map((tag, idx) => (
              <span key={idx} className={cn('px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-2', TAG_COLORS[idx % TAG_COLORS.length])}>
                {tag}
                <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-transparent p-0" onClick={() => handleRemoveTag(tag)}>
                  <X className="h-3 w-3" />
                </Button>
              </span>
            ))}
          </div>
        </div>
      )}

      {(selectedTodo?.dueDate || selectedTodo?.dueTime) && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Дата выполнения</h3>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {selectedTodo.dueDate && format(parseISO(selectedTodo.dueDate), 'dd MMMM yyyy')}
              {selectedTodo.dueTime && (selectedTodo.dueDate ? `, ${selectedTodo.dueTime}` : selectedTodo.dueTime)}
            </span>
          </div>
        </div>
      )}

      {selectedTodo?.assignedTo?.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Участники</h3>
          <div className="flex flex-wrap gap-2">
            {selectedTodo.assignedTo.map((userId) => {
              const assignedUser = allUsers.find((u) => u.id === userId)
              if (!assignedUser) return null
              return (
                <div
                  key={userId}
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white relative group',
                    getUserColor(userId, allUsers)
                  )}
                  title={assignedUser.username}
                >
                  {getUserInitials(assignedUser.username)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity p-0"
                    onClick={() => handleRemoveParticipant(userId)}
                  >
                    <X className="h-3 w-3 text-white" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-semibold">Описание</h3>
        <Textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          onBlur={handleSaveTodo}
          placeholder="Добавить более подробное описание..."
          className="min-h-[120px]"
        />
      </div>

      <EditTodoDialogAttachmentsChecklist
        theme={theme}
        selectedTodo={selectedTodo}
        todoAttachFileInputRef={todoAttachFileInputRef}
        attachingFile={attachingFile}
        newChecklistItem={newChecklistItem}
        setNewChecklistItem={setNewChecklistItem}
        getChecklistProgress={getChecklistProgress}
        getAttachmentUrl={getAttachmentUrl}
        isAttachmentImage={isAttachmentImage}
        onDownloadAttachment={onDownloadAttachment}
        onRemoveAttachment={onRemoveAttachment}
        onDeleteChecklist={onDeleteChecklist}
        onToggleChecklistItem={onToggleChecklistItem}
        onDeleteChecklistItem={onDeleteChecklistItem}
        onAddChecklistItem={onAddChecklistItem}
      />
    </div>
  )
}
