import { useNavigate } from 'react-router-dom'
import { useTodoBoard } from '../context/TodoBoardContext'
import {
  PlannerSidebar,
  TodoBoardHeader,
  KanbanArea,
  TodoBoardContextMenu,
  DeleteColumnDialog,
  DeleteTodoDialog,
  EditTodoDialog,
} from '../widgets/todo-board'
import {
  TagsDialog,
  DatesDialog,
  PriorityDialog,
  ParticipantsDialog,
  AttachImageDialog,
  ColumnBackgroundDialog,
  SettingsDialog,
  PlannerDateDialog,
  CalendarEventDialog,
  NotificationsPanel,
} from '../widgets/todo-board/dialogs'

export const TodoBoard = () => {
  const navigate = useNavigate()
  const board = useTodoBoard()

  const {
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    isMounted,
    setSettingsDialogOpen,
    handleExportData,
    handleImportData,
    plannerSidebarCollapsed,
    setPlannerSidebarCollapsed,
    plannerMonth,
    setPlannerMonth,
    plannerSelectedDate,
    setPlannerSelectedDate,
    plannerAllDayOpen,
    setPlannerAllDayOpen,
    plannerByHourOpen,
    setPlannerByHourOpen,
    plannerCalendarDays,
    getPlannerItemsForDate,
    getPlannerItemsForDateByTime,
    getTodosForDateByTime,
    setPlannerDateDialogOpen,
    handleOpenEditDialog,
    setSelectedCalendarEvent,
    columns,
    filteredTodos,
    boardTodos,
    isDragging,
    scrollContainerRef,
    onDragMouseDown,
    onDragMouseMove,
    onDragMouseUp,
    onDragMouseLeave,
    colorPalette,
    editingColumnId,
    editColumnTitle,
    setEditColumnTitle,
    setEditingColumnId,
    handleSaveColumnName,
    handleRenameColumn,
    createCardDialogOpen,
    setCreateCardDialogOpen,
    selectedColumnId,
    setSelectedColumnId,
    newCardTitle,
    setNewCardTitle,
    handleCreateCard,
    handleOpenColumnBackgroundDialog,
    handleUpdateColumnColor,
    handleRemoveColumnBackgroundImage,
    setColumnToDelete,
    setDeleteColumnDialogOpen,
    createColumnDialogOpen,
    setCreateColumnDialogOpen,
    newColumnTitle,
    setNewColumnTitle,
    handleCreateColumn,
    handleDragOver,
    handleDrop,
    handleDragStart,
    handleDragEnd,
    handleContextMenu,
    setContextMenu,
    handleArchiveTodo,
    setTodoToDelete,
    setDeleteTodoDialogOpen,
    editDialogOpen,
    handleCloseEditDialog,
    selectedTodo,
    allUsers,
    user,
    notificationsEnabled,
    setNotificationsEnabled,
    sendNotification,
    updateTodo,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    commentText,
    setCommentText,
    activeTab,
    setActiveTab,
    newChecklistItem,
    setNewChecklistItem,
    setTagsDialogOpen,
    setDatesDialogOpen,
    setParticipantsDialogOpen,
    setPriorityDialogOpen,
    setAttachImageDialogOpen,
    todoAttachFileInputRef,
    attachingFile,
    handleSaveTodo,
    handleOpenDatesDialog,
    handleRemoveTag,
    handleRemoveParticipant,
    handleAddCommentSubmit,
    handleAttachFileSelect,
    getChecklistProgress,
    getAttachmentUrl,
    isAttachmentImage,
    handleDownloadAttachment,
    handleRemoveAttachment,
    handleDeleteChecklist,
    handleToggleChecklistItem,
    handleDeleteChecklistItem,
    handleAddChecklistItem,
    tagsDialogOpen,
    newTagName,
    setNewTagName,
    handleAddTag,
    datesDialogOpen,
    editDueDate,
    editDueTime,
    setEditDueDate,
    setEditDueTime,
    handleSaveDate,
    plannerDateDialogOpen,
    plannerCreateType,
    setPlannerCreateType,
    plannerCreateColumnId,
    setPlannerCreateColumnId,
    plannerCreateTitle,
    setPlannerCreateTitle,
    plannerCreateTime,
    setPlannerCreateTime,
    plannerCreateNotify,
    setPlannerCreateNotify,
    addCalendarEvent,
    removeCalendarEvent,
    selectedCalendarEvent,
    priorityDialogOpen,
    handleChangePriority,
    participantsDialogOpen,
    handleAddParticipant,
    attachImageDialogOpen,
    selectedImageFile,
    setSelectedImageFile,
    imagePreview,
    setImagePreview,
    handleImageFileSelect,
    handleSetBackgroundImage,
    handleRemoveBackgroundImage,
    columnBackgroundDialogOpen,
    setColumnBackgroundDialogOpen,
    selectedColumnForBackground,
    setSelectedColumnForBackground,
    columnImagePreview,
    setColumnImageFile,
    setColumnImagePreview,
    handleColumnImageFileSelect,
    handleSetColumnBackgroundImage,
    settingsDialogOpen,
    todos,
    handleResetColumns,
    handleClearAllData,
    notificationsPanelOpen,
    setNotificationsPanelOpen,
    notifications,
    unreadNotificationsCount,
    markAllNotificationsAsRead,
    clearAllNotifications,
    deleteNotification,
    handleNotificationClick,
    deleteColumnDialogOpen,
    columnToDelete,
    handleDeleteColumn,
    deleteTodoDialogOpen,
    todoToDelete,
    deleteTodo,
    contextMenu,
  } = board

  return (
    <div
      className="h-screen flex flex-col bg-background transition-colors duration-300 overflow-hidden"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <TodoBoardHeader
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBack={() => navigate('/')}
        onArchive={() => navigate('/todos/archive')}
        onOpenSettings={() => setSettingsDialogOpen(true)}
        onExport={handleExportData}
        onImport={handleImportData}
        isMounted={isMounted}
      />

      <div className="h-[57px] flex-shrink-0" />

      <div className="flex-1 flex min-h-0">
        <PlannerSidebar
          theme={theme}
          plannerSidebarCollapsed={plannerSidebarCollapsed}
          setPlannerSidebarCollapsed={setPlannerSidebarCollapsed}
          plannerMonth={plannerMonth}
          setPlannerMonth={setPlannerMonth}
          plannerSelectedDate={plannerSelectedDate}
          setPlannerSelectedDate={setPlannerSelectedDate}
          plannerAllDayOpen={plannerAllDayOpen}
          setPlannerAllDayOpen={setPlannerAllDayOpen}
          plannerByHourOpen={plannerByHourOpen}
          setPlannerByHourOpen={setPlannerByHourOpen}
          plannerCalendarDays={plannerCalendarDays}
          getPlannerItemsForDate={getPlannerItemsForDate}
          getPlannerItemsForDateByTime={getPlannerItemsForDateByTime}
          getTodosForDateByTime={getTodosForDateByTime}
          onDayClick={(day) => {
            setPlannerSelectedDate(day)
            setPlannerDateDialogOpen(true)
          }}
          onTaskClick={handleOpenEditDialog}
          onCalendarEventClick={setSelectedCalendarEvent}
        />

        <KanbanArea
          columns={columns}
          filteredTodos={boardTodos}
          theme={theme}
          isMounted={isMounted}
          isDragging={isDragging}
          scrollContainerRef={scrollContainerRef}
          onMouseDown={onDragMouseDown}
          onMouseMove={onDragMouseMove}
          onMouseUp={onDragMouseUp}
          onMouseLeave={onDragMouseLeave}
          colorPalette={colorPalette}
          editingColumnId={editingColumnId}
          editColumnTitle={editColumnTitle}
          setEditColumnTitle={setEditColumnTitle}
          setEditingColumnId={setEditingColumnId}
          onSaveColumnName={handleSaveColumnName}
          onRenameColumn={handleRenameColumn}
          createCardDialogOpen={createCardDialogOpen}
          selectedColumnId={selectedColumnId}
          setCreateCardDialogOpen={setCreateCardDialogOpen}
          setSelectedColumnId={setSelectedColumnId}
          newCardTitle={newCardTitle}
          setNewCardTitle={setNewCardTitle}
          onCreateCard={handleCreateCard}
          onOpenColumnBackground={handleOpenColumnBackgroundDialog}
          onUpdateColumnColor={handleUpdateColumnColor}
          onRemoveColumnBackground={handleRemoveColumnBackgroundImage}
          onDeleteColumn={(col) => {
            setColumnToDelete(col)
            setDeleteColumnDialogOpen(true)
          }}
          createColumnDialogOpen={createColumnDialogOpen}
          setCreateColumnDialogOpen={setCreateColumnDialogOpen}
          newColumnTitle={newColumnTitle}
          setNewColumnTitle={setNewColumnTitle}
          onCreateColumn={handleCreateColumn}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          handleMouseDown={onDragMouseDown}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          handleContextMenu={handleContextMenu}
          onOpenEditDialog={handleOpenEditDialog}
          allUsers={allUsers}
        />
      </div>

      <TodoBoardContextMenu
        contextMenu={contextMenu}
        theme={theme}
        onClose={() => setContextMenu(null)}
        onArchive={handleArchiveTodo}
        onDelete={(todo) => {
          setTodoToDelete(todo)
          setDeleteTodoDialogOpen(true)
          setContextMenu(null)
        }}
      />

      <EditTodoDialog
        open={editDialogOpen}
        onOpenChange={handleCloseEditDialog}
        selectedTodo={selectedTodo}
        theme={theme}
        columns={columns}
        allUsers={allUsers}
        user={user}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
        sendNotification={sendNotification}
        updateTodo={updateTodo}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        commentText={commentText}
        setCommentText={setCommentText}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        newChecklistItem={newChecklistItem}
        setNewChecklistItem={setNewChecklistItem}
        setTagsDialogOpen={setTagsDialogOpen}
        setDatesDialogOpen={setDatesDialogOpen}
        setParticipantsDialogOpen={setParticipantsDialogOpen}
        setPriorityDialogOpen={setPriorityDialogOpen}
        setAttachImageDialogOpen={setAttachImageDialogOpen}
        setTodoToDelete={setTodoToDelete}
        setDeleteTodoDialogOpen={setDeleteTodoDialogOpen}
        todoAttachFileInputRef={todoAttachFileInputRef}
        attachingFile={attachingFile}
        handleSaveTodo={handleSaveTodo}
        handleOpenDatesDialog={handleOpenDatesDialog}
        handleRemoveTag={handleRemoveTag}
        handleRemoveParticipant={handleRemoveParticipant}
        handleAddCommentSubmit={handleAddCommentSubmit}
        handleAttachFileSelect={handleAttachFileSelect}
        getChecklistProgress={getChecklistProgress}
        getAttachmentUrl={getAttachmentUrl}
        isAttachmentImage={isAttachmentImage}
        handleDownloadAttachment={handleDownloadAttachment}
        handleRemoveAttachment={handleRemoveAttachment}
        handleDeleteChecklist={handleDeleteChecklist}
        handleToggleChecklistItem={handleToggleChecklistItem}
        handleDeleteChecklistItem={handleDeleteChecklistItem}
        handleAddChecklistItem={handleAddChecklistItem}
        onClose={handleCloseEditDialog}
      />

      <TagsDialog
        open={tagsDialogOpen}
        onOpenChange={setTagsDialogOpen}
        selectedTodo={selectedTodo}
        newTagName={newTagName}
        onNewTagNameChange={setNewTagName}
        onAddTag={handleAddTag}
        onCancel={() => setTagsDialogOpen(false)}
      />

      <DatesDialog
        open={datesDialogOpen}
        onOpenChange={setDatesDialogOpen}
        theme={theme}
        selectedTodo={selectedTodo}
        editDueDate={editDueDate}
        editDueTime={editDueTime}
        onEditDueDateChange={setEditDueDate}
        onEditDueTimeChange={setEditDueTime}
        onSave={handleSaveDate}
        onRemoveDate={() => { }}
        onCancel={() => setDatesDialogOpen(false)}
        updateTodo={updateTodo}
      />

      <PlannerDateDialog
        open={plannerDateDialogOpen}
        onOpenChange={setPlannerDateDialogOpen}
        theme={theme}
        plannerSelectedDate={plannerSelectedDate}
        columns={columns}
        getPlannerItemsForDate={getPlannerItemsForDate}
        plannerCreateType={plannerCreateType}
        setPlannerCreateType={setPlannerCreateType}
        plannerCreateColumnId={plannerCreateColumnId}
        setPlannerCreateColumnId={setPlannerCreateColumnId}
        plannerCreateTitle={plannerCreateTitle}
        setPlannerCreateTitle={setPlannerCreateTitle}
        plannerCreateTime={plannerCreateTime}
        setPlannerCreateTime={setPlannerCreateTime}
        plannerCreateNotify={plannerCreateNotify}
        setPlannerCreateNotify={setPlannerCreateNotify}
        onOpenEditDialog={(t) => {
          handleOpenEditDialog(t)
          setPlannerDateDialogOpen(false)
        }}
        setSelectedCalendarEvent={setSelectedCalendarEvent}
        addCalendarEvent={addCalendarEvent}
        onCreateCard={handleCreateCard}
        sendNotification={sendNotification}
      />

      <CalendarEventDialog
        open={!!selectedCalendarEvent}
        onOpenChange={(open) => !open && setSelectedCalendarEvent(null)}
        selectedCalendarEvent={selectedCalendarEvent}
        onRemove={async (event) => {
          if (event?.id != null && String(event.id).startsWith('cal-')) {
            removeCalendarEvent(event.id)
          } else {
            try {
              await deleteTodo(event.id)
              sendNotification('Удалено', 'Напоминание удалено', 'default')
            } catch {
              sendNotification('Ошибка', 'Не удалось удалить', 'destructive')
            }
          }
          setSelectedCalendarEvent(null)
        }}
        onClose={() => setSelectedCalendarEvent(null)}
      />

      <PriorityDialog
        open={priorityDialogOpen}
        onOpenChange={setPriorityDialogOpen}
        theme={theme}
        selectedTodo={selectedTodo}
        onChangePriority={handleChangePriority}
        onReset={() => setPriorityDialogOpen(false)}
        updateTodo={updateTodo}
      />

      <ParticipantsDialog
        open={participantsDialogOpen}
        onOpenChange={setParticipantsDialogOpen}
        selectedTodo={selectedTodo}
        allUsers={allUsers}
        onAddParticipant={handleAddParticipant}
        onRemoveParticipant={handleRemoveParticipant}
        onClose={() => setParticipantsDialogOpen(false)}
      />

      <AttachImageDialog
        open={attachImageDialogOpen}
        onOpenChange={setAttachImageDialogOpen}
        selectedTodo={selectedTodo}
        selectedImageFile={selectedImageFile}
        imagePreview={imagePreview}
        onImageFileSelect={handleImageFileSelect}
        onSetBackground={handleSetBackgroundImage}
        onRemoveBackground={handleRemoveBackgroundImage}
        onCancel={() => {
          setAttachImageDialogOpen(false)
          setSelectedImageFile(null)
          setImagePreview(null)
        }}
      />

      <ColumnBackgroundDialog
        open={columnBackgroundDialogOpen}
        onOpenChange={setColumnBackgroundDialogOpen}
        columns={columns}
        selectedColumnForBackground={selectedColumnForBackground}
        columnImagePreview={columnImagePreview}
        onImageFileSelect={handleColumnImageFileSelect}
        onSetBackground={handleSetColumnBackgroundImage}
        onRemoveBackground={handleRemoveColumnBackgroundImage}
        onCancel={() => {
          setColumnBackgroundDialogOpen(false)
          setSelectedColumnForBackground(null)
          setColumnImageFile(null)
          setColumnImagePreview(null)
        }}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        theme={theme}
        todosCount={todos.length}
        columnsCount={columns.length}
        onExport={handleExportData}
        onImport={handleImportData}
        onResetColumns={handleResetColumns}
        onClearAllData={handleClearAllData}
        onClose={() => setSettingsDialogOpen(false)}
      />

      <NotificationsPanel
        open={notificationsPanelOpen}
        onOpenChange={setNotificationsPanelOpen}
        theme={theme}
        notifications={notifications}
        unreadNotificationsCount={unreadNotificationsCount}
        markAllNotificationsAsRead={markAllNotificationsAsRead}
        clearAllNotifications={clearAllNotifications}
        deleteNotification={deleteNotification}
        onNotificationClick={handleNotificationClick}
      />

      <DeleteColumnDialog
        open={deleteColumnDialogOpen}
        onOpenChange={setDeleteColumnDialogOpen}
        columnToDelete={columnToDelete}
        todosCountInColumn={
          columnToDelete ? todos.filter((t) => t.status === columnToDelete.status).length : 0
        }
        onConfirm={() => {
          if (columnToDelete) {
            handleDeleteColumn(columnToDelete.id)
            setDeleteColumnDialogOpen(false)
            setColumnToDelete(null)
          }
        }}
        onCancel={() => {
          setDeleteColumnDialogOpen(false)
          setColumnToDelete(null)
        }}
      />

      <DeleteTodoDialog
        open={deleteTodoDialogOpen}
        onOpenChange={setDeleteTodoDialogOpen}
        todoToDelete={todoToDelete}
        onConfirm={async (todo) => {
          try {
            await deleteTodo(todo.id)
            sendNotification(
              'Карточка удалена',
              `Карточка "${todo.title}" полностью удалена`,
              'warning'
            )
            handleCloseEditDialog()
          } catch (_) { }
        }}
        onCancel={() => {
          setDeleteTodoDialogOpen(false)
          setTodoToDelete(null)
        }}
      />
    </div>
  )
}
