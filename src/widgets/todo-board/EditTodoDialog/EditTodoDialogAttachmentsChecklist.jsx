/**
 * Блок вложений и чек-листа в левой панели диалога редактирования
 */
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Paperclip, CheckSquare, Trash2, Plus, X, Download } from 'lucide-react'
import { cn } from '../../../lib/utils'

export function EditTodoDialogAttachmentsChecklist({
  theme,
  selectedTodo,
  todoAttachFileInputRef,
  attachingFile,
  newChecklistItem,
  setNewChecklistItem,
  getChecklistProgress,
  getAttachmentUrl,
  isAttachmentImage,
  onDownloadAttachment,
  onRemoveAttachment,
  onDeleteChecklist,
  onToggleChecklistItem,
  onDeleteChecklistItem,
  onAddChecklistItem,
}) {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm">Вложения</h3>
          <Button variant="outline" size="sm" disabled={attachingFile} onClick={() => todoAttachFileInputRef.current?.click()}>
            <Paperclip className="h-4 w-4 mr-1.5" />
            {attachingFile ? 'Загрузка...' : 'Прикрепить файл'}
          </Button>
        </div>
        {(() => {
          const list = (selectedTodo?.attachments || []).filter((a) => !a.isBackground)
          if (list.length === 0) return null
          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {list.map((attachment, index) => {
                const name = attachment.filename ?? attachment.name ?? 'Файл'
                const url = getAttachmentUrl(attachment)
                const isImage = isAttachmentImage(attachment) && url
                const key = attachment.id ?? `att-${index}`
                const handleDownload = () => onDownloadAttachment?.(attachment)
                const handleOpen = () => onDownloadAttachment?.(attachment, true)
                return (
                  <div key={key} className="relative group">
                    {isImage ? (
                      <div className="rounded-md border border-border overflow-hidden bg-muted/30 min-w-0">
                        <div className="relative">
                          <img
                            src={url}
                            alt={name}
                            className="w-full h-24 object-cover cursor-pointer"
                            onClick={handleOpen}
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 border-t border-border flex-nowrap min-w-0">
                          <span className="text-xs truncate flex-1 min-w-0">{name}</span>
                          <div className="flex items-center shrink-0 gap-0.5">
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleDownload} title="Скачать">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => attachment.id && onRemoveAttachment(attachment.id)} title="Удалить">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2 border border-border rounded-md bg-muted/30 min-w-0 flex-nowrap">
                        <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-xs truncate flex-1 min-w-0" title={name}>{name}</span>
                        <div className="flex items-center shrink-0 gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleDownload} title="Скачать">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => attachment.id && onRemoveAttachment(attachment.id)} title="Удалить">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            <h3 className="font-semibold">Чек-лист</h3>
          </div>
          {selectedTodo?.todoLists?.length > 0 && (
            <Button variant="ghost" size="sm" className="text-destructive" onClick={onDeleteChecklist}>
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить
            </Button>
          )}
        </div>
        {selectedTodo?.todoLists?.length > 0 && (
          <>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${getChecklistProgress(selectedTodo)}%` }} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{getChecklistProgress(selectedTodo)}%</p>
            </div>
            <div className="space-y-2">
              {selectedTodo.todoLists.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.checked || false}
                    onChange={(e) => onToggleChecklistItem(item.id, e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <span className={cn('flex-1', item.checked && 'line-through text-gray-500')}>{item.text}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDeleteChecklistItem(item.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="flex gap-2">
          <Input
            value={newChecklistItem}
            onChange={(e) => setNewChecklistItem(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter' && newChecklistItem.trim()) onAddChecklistItem() }}
            placeholder="Добавить элемент"
            className="flex-1"
          />
          <Button onClick={onAddChecklistItem} disabled={!newChecklistItem.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}
