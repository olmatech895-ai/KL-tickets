import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Trash2 } from 'lucide-react'

export function ColumnBackgroundDialog({
  open,
  onOpenChange,
  columns,
  selectedColumnForBackground,
  columnImagePreview,
  onImageFileSelect,
  onSetBackground,
  onRemoveBackground,
  onCancel,
}) {
  const column = selectedColumnForBackground ? columns.find((c) => c.id === selectedColumnForBackground) : null

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) onCancel?.()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Установить фон колонки</DialogTitle>
          <DialogDescription>Выберите изображение для фона колонки</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="columnImageFile">Выберите изображение</Label>
            <Input
              id="columnImageFile"
              type="file"
              accept="image/*"
              onChange={onImageFileSelect}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500">Поддерживаются форматы: JPG, PNG, GIF, WebP (макс. 5MB)</p>
          </div>
          {column?.backgroundImage && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Текущий фон:</p>
              <div className="relative w-full h-32 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={column.backgroundImage} alt="Current background" className="w-full h-full object-cover" />
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="mt-2 w-full"
                onClick={() => {
                  onRemoveBackground(selectedColumnForBackground)
                  onOpenChange(false)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить фон
              </Button>
            </div>
          )}
          {columnImagePreview && (
            <div className="space-y-2">
              <Label>Предпросмотр</Label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-2">
                <img
                  src={columnImagePreview}
                  alt="Preview"
                  className="max-w-full max-h-48 object-contain mx-auto rounded"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button onClick={onSetBackground} disabled={!columnImagePreview}>
              Установить фон
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
