/**
 * Область канбана: горизонтальный скролл, колонки, кнопка «Добавить колонку»
 */
import { cn } from '../../lib/utils'
import { TodoColumn } from './TodoColumn'
import { CreateColumnDialog } from './CreateColumnDialog'

export function KanbanArea({
  columns,
  filteredTodos,
  theme,
  isMounted,
  isDragging,
  scrollContainerRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
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
  createColumnDialogOpen,
  setCreateColumnDialogOpen,
  newColumnTitle,
  setNewColumnTitle,
  onCreateColumn,
  handleDragOver,
  handleDrop,
  handleMouseDown,
  handleDragStart,
  handleDragEnd,
  handleContextMenu,
  onOpenEditDialog,
  allUsers,
}) {
  const sortedColumns = [...columns].sort((a, b) => {
    const orderA = parseInt(a.orderIndex || '0', 10)
    const orderB = parseInt(b.orderIndex || '0', 10)
    return orderA - orderB
  })

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      className={cn(
        'flex-1 overflow-x-auto overflow-y-hidden p-4 scrollbar-hide transition-all duration-700 min-h-0 relative',
        isMounted ? 'opacity-100' : 'opacity-0',
        isDragging ? 'cursor-grabbing select-none' : 'cursor-grab',
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-200'
      )}
      style={{
        transitionDelay: '200ms',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        userSelect: isDragging ? 'none' : 'auto',
        touchAction: 'pan-x',
      }}
    >
      <div
        ref={scrollContainerRef}
        onMouseDown={onMouseDown}
        className={cn(
          'relative z-10 flex gap-4 h-full min-h-0',
          theme === 'dark' ? 'bg-gray-900/95' : 'bg-gray-200/95'
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          overflowY: 'hidden',
          overflowX: 'auto',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {sortedColumns.map((column, columnIndex) => {
          const columnTodos = filteredTodos.filter((todo) => todo.status === column.status)
          return (
            <TodoColumn
              key={column.id}
              column={column}
              columnTodos={columnTodos}
              columnIndex={columnIndex}
              theme={theme}
              colorPalette={colorPalette}
              isMounted={isMounted}
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
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onColumnMouseDown={handleMouseDown}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              handleContextMenu={handleContextMenu}
              onOpenEditDialog={onOpenEditDialog}
              allUsers={allUsers}
            />
          )
        })}
        <CreateColumnDialog
          open={createColumnDialogOpen}
          onOpenChange={setCreateColumnDialogOpen}
          newColumnTitle={newColumnTitle}
          onNewColumnTitleChange={setNewColumnTitle}
          onCreateColumn={onCreateColumn}
          onCancel={() => {
            setCreateColumnDialogOpen(false)
            setNewColumnTitle('')
          }}
          theme={theme}
          isMounted={isMounted}
          columnsLength={columns.length}
        />
      </div>
    </div>
  )
}
