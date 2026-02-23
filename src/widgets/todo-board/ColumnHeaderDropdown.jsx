/**
 * Меню колонки: переименовать, фон, цвет, удалить
 */
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Edit2, Image as ImageIcon, Trash2, MoreVertical, X, Check } from 'lucide-react'
import { CreateCardDialog } from './CreateCardDialog'

export function ColumnHeaderDropdown({
  column,
  theme,
  colorPalette,
  editingColumnId,
  editColumnTitle,
  setEditColumnTitle,
  setEditingColumnId,
  onSaveColumnName,
  onRenameColumn,
  createCardDialogOpen,
  selectedColumnId,
  setCreateCardDialogOpen,
  setSelectedColumnId,
  newCardTitle,
  setNewCardTitle,
  onCreateCard,
  onOpenColumnBackground,
  onUpdateColumnColor,
  onRemoveColumnBackground,
  onDeleteColumn,
}) {
  const isEditing = editingColumnId === column.id
  const dialogOpen = createCardDialogOpen && selectedColumnId === column.id

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 flex-1">
        <Input
          value={editColumnTitle}
          onChange={(e) => setEditColumnTitle(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') onSaveColumnName(column.id)
            if (e.key === 'Escape') {
              setEditingColumnId(null)
              setEditColumnTitle('')
            }
          }}
          className="h-7 text-sm bg-white/20 border-white/30 text-white placeholder:text-white/70"
          placeholder="Название колонки"
          autoFocus
        />
        <Button size="sm" variant="ghost" onClick={() => onSaveColumnName(column.id)} className="h-7 px-2 text-white hover:bg-white/20">
          Сохранить
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setEditingColumnId(null)
            setEditColumnTitle('')
          }}
          className="h-7 px-2 text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <h3 className="font-semibold text-sm flex-1">{column.title}</h3>
      <div className="flex items-center gap-1">
        <CreateCardDialog
          open={dialogOpen}
          onOpenChange={setCreateCardDialogOpen}
          columnId={column.id}
          columnTitle={column.title}
          newCardTitle={newCardTitle}
          onNewCardTitleChange={setNewCardTitle}
          onCreateCard={onCreateCard}
          onCancel={() => {
            setCreateCardDialogOpen(false)
            setSelectedColumnId(null)
            setNewCardTitle('')
          }}
          onTriggerClick={(id) => {
            setSelectedColumnId(id)
            setCreateCardDialogOpen(true)
          }}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => onRenameColumn(column.id)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Переименовать
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onOpenColumnBackground(column.id)}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Установить фон
            </DropdownMenuItem>
            {column.backgroundImage && (
              <DropdownMenuItem onClick={() => onRemoveColumnBackground(column.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить фон
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Цвет колонки</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onUpdateColumnColor(column.id, 'primary')}>
              <div className="w-4 h-4 rounded bg-blue-500 mr-2 border border-gray-300" />
              Основной
              {column.color === 'primary' && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateColumnColor(column.id, 'secondary')}>
              <div className="w-4 h-4 rounded bg-green-500 mr-2 border border-gray-300" />
              Вторичный
              {column.color === 'secondary' && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateColumnColor(column.id, 'accent')}>
              <div className="w-4 h-4 rounded bg-purple-500 mr-2 border border-gray-300" />
              Акцент
              {column.color === 'accent' && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateColumnColor(column.id, 'muted')}>
              <div className="w-4 h-4 rounded bg-gray-400 mr-2 border border-gray-300" />
              Приглушенный
              {column.color === 'muted' && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDeleteColumn(column)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
