/**
 * Диалог редактирования карточки (полноэкранный): шапка + левая панель + правая панель
 */
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { EditTodoDialogHeader } from './EditTodoDialogHeader'
import { EditTodoDialogLeftPanel } from './EditTodoDialogLeftPanel'
import { EditTodoDialogRightPanel } from './EditTodoDialogRightPanel'

export function EditTodoDialog({
  open,
  onOpenChange,
  selectedTodo,
  theme,
  columns,
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
  setTodoToDelete,
  setDeleteTodoDialogOpen,
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
  onClose,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-0 flex flex-col [&>button]:hidden !translate-x-[-50%] !translate-y-[-50%] !left-1/2 !top-1/2 !mx-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Редактирование карточки</DialogTitle>
          <DialogDescription>Редактирование карточки {selectedTodo?.title || ''}</DialogDescription>
        </DialogHeader>
        {selectedTodo && (
          <>
            <EditTodoDialogHeader
              theme={theme}
              selectedTodo={selectedTodo}
              columns={columns}
              notificationsEnabled={notificationsEnabled}
              setNotificationsEnabled={setNotificationsEnabled}
              sendNotification={sendNotification}
              updateTodo={updateTodo}
              setAttachImageDialogOpen={setAttachImageDialogOpen}
              todoAttachFileInputRef={todoAttachFileInputRef}
              handleAttachFileSelect={handleAttachFileSelect}
              attachingFile={attachingFile}
              setTodoToDelete={setTodoToDelete}
              setDeleteTodoDialogOpen={setDeleteTodoDialogOpen}
              setPriorityDialogOpen={setPriorityDialogOpen}
              onClose={onClose}
            />
            <div className="flex-1 flex overflow-hidden">
              <EditTodoDialogLeftPanel
                theme={theme}
                selectedTodo={selectedTodo}
                allUsers={allUsers}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                editDescription={editDescription}
                setEditDescription={setEditDescription}
                newChecklistItem={newChecklistItem}
                setNewChecklistItem={setNewChecklistItem}
                setTagsDialogOpen={setTagsDialogOpen}
                setPriorityDialogOpen={setPriorityDialogOpen}
                setParticipantsDialogOpen={setParticipantsDialogOpen}
                handleOpenDatesDialog={handleOpenDatesDialog}
                handleSaveTodo={handleSaveTodo}
                handleRemoveTag={handleRemoveTag}
                handleRemoveParticipant={handleRemoveParticipant}
                getChecklistProgress={getChecklistProgress}
                getAttachmentUrl={getAttachmentUrl}
                isAttachmentImage={isAttachmentImage}
                onDownloadAttachment={handleDownloadAttachment}
                todoAttachFileInputRef={todoAttachFileInputRef}
                attachingFile={attachingFile}
                onRemoveAttachment={handleRemoveAttachment}
                onDeleteChecklist={handleDeleteChecklist}
                onToggleChecklistItem={handleToggleChecklistItem}
                onDeleteChecklistItem={handleDeleteChecklistItem}
                onAddChecklistItem={handleAddChecklistItem}
              />
              <EditTodoDialogRightPanel
                theme={theme}
                selectedTodo={selectedTodo}
                columns={columns}
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                commentText={commentText}
                setCommentText={setCommentText}
                onAddComment={handleAddCommentSubmit}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
