/**
 * Колонка канбана: заголовок + карточки
 */
import { cn } from '../../lib/utils'
import { ColumnHeaderDropdown } from './ColumnHeaderDropdown'
import { TodoCard } from './TodoCard'

export function TodoColumn({
  column,
  columnTodos,
  columnIndex,
  theme,
  colorPalette,
  isMounted,
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
  onDragOver,
  onDrop,
  onColumnMouseDown,
  handleDragStart,
  handleDragEnd,
  handleContextMenu,
  onOpenEditDialog,
  allUsers,
}) {
  return (
    <div
      key={column.id}
      className={cn(
        'flex flex-col flex-shrink-0 w-80 h-full max-h-full rounded-xl shadow-lg relative overflow-hidden backdrop-blur-md transition-all duration-500 hover:shadow-xl',
        theme === 'dark' ? 'bg-gray-800/40 border border-gray-700/40 backdrop-blur-md' : 'bg-white/90 border border-gray-300/60 backdrop-blur-md',
        isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      )}
      style={{
        transitionDelay: `${300 + columnIndex * 100}ms`,
        backgroundColor: column.backgroundImage ? (theme === 'dark' ? 'rgba(31, 41, 55, 0.3)' : 'rgba(255, 255, 255, 0.3)') : undefined,
        backgroundImage: column.backgroundImage ? `url(${column.backgroundImage})` : undefined,
        backgroundSize: column.backgroundImage ? 'cover' : undefined,
        backgroundPosition: column.backgroundImage ? 'center' : undefined,
        backgroundRepeat: column.backgroundImage ? 'no-repeat' : undefined,
      }}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column)}
      onMouseDown={(e) => {
        const target = e.target
        if (target.closest('.todo-card') || target.closest('.column-header') || target.closest('button')) return
        onColumnMouseDown?.(e)
      }}
    >
      {column.backgroundImage && (
        <div
          className={cn(
            'absolute inset-0 backdrop-blur-md pointer-events-none transition-all duration-300',
            theme === 'dark' ? 'bg-black/30' : 'bg-white/40'
          )}
        />
      )}
      <div
        className={cn(
          'column-header p-3 border-b flex items-center justify-between rounded-t-xl relative z-10 backdrop-blur-sm transition-all duration-300',
          colorPalette[column.color]?.header || colorPalette.primary.header,
          'shadow-md'
        )}
      >
        <ColumnHeaderDropdown
          column={column}
          theme={theme}
          colorPalette={colorPalette}
          editingColumnId={editingColumnId}
          editColumnTitle={editColumnTitle}
          setEditColumnTitle={setEditColumnTitle}
          setEditingColumnId={setEditingColumnId}
          onSaveColumnName={onSaveColumnName}
          onRenameColumn={onRenameColumn}
          createCardDialogOpen={createCardDialogOpen}
          selectedColumnId={selectedColumnId}
          setCreateCardDialogOpen={setCreateCardDialogOpen}
          setSelectedColumnId={setSelectedColumnId}
          newCardTitle={newCardTitle}
          setNewCardTitle={setNewCardTitle}
          onCreateCard={onCreateCard}
          onOpenColumnBackground={onOpenColumnBackground}
          onUpdateColumnColor={onUpdateColumnColor}
          onRemoveColumnBackground={onRemoveColumnBackground}
          onDeleteColumn={onDeleteColumn}
        />
      </div>
      <div
        className={cn(
          'flex-1 overflow-y-auto p-3 space-y-2 min-h-0 scrollbar-hide relative z-10 transition-all duration-300',
          theme === 'dark' ? 'bg-transparent' : 'bg-transparent'
        )}
      >
        {columnTodos.map((todo, todoIndex) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            theme={theme}
            allUsers={allUsers}
            transitionDelay={`${400 + columnIndex * 100 + todoIndex * 50}ms`}
            isMounted={isMounted}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onContextMenu={handleContextMenu}
            onClick={() => onOpenEditDialog(todo)}
          />
        ))}
      </div>
    </div>
  )
}
