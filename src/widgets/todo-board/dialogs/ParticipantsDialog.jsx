import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { UserPlus, X } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { getUserInitials, getUserColor } from '../../../shared/utils/user-display'

export function ParticipantsDialog({
  open,
  onOpenChange,
  selectedTodo,
  allUsers,
  onAddParticipant,
  onRemoveParticipant,
  onClose,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить участников</DialogTitle>
          <DialogDescription>Выберите участников для этой карточки</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {allUsers.map((userItem) => {
              const isAssigned = selectedTodo?.assignedTo?.includes(userItem.id)
              return (
                <div
                  key={userItem.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium',
                        getUserColor(userItem.id, allUsers)
                      )}
                    >
                      {getUserInitials(userItem.username)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{userItem.username}</p>
                      <p className="text-xs text-gray-500">{userItem.email || ''}</p>
                    </div>
                  </div>
                  <Button
                    variant={isAssigned ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => {
                      if (isAssigned) onRemoveParticipant(userItem.id)
                      else onAddParticipant(userItem.id)
                    }}
                  >
                    {isAssigned ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Удалить
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Добавить
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
