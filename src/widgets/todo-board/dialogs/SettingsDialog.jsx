import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Download, Upload, Settings, Trash2 } from 'lucide-react'

export function SettingsDialog({
  open,
  onOpenChange,
  theme,
  todosCount,
  columnsCount,
  onExport,
  onImport,
  onResetColumns,
  onClearAllData,
  onClose,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Настройки доски</DialogTitle>
          <DialogDescription>Управление настройками и данными доски задач</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-2">Экспорт и импорт данных</h3>
              <div className="space-y-2">
                <Button onClick={onExport} variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Экспортировать данные в JSON
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="settings-import-file-input"
                  />
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <label htmlFor="settings-import-file-input" className="cursor-pointer w-full flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Импортировать данные из JSON
                    </label>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
            <div>
              <h3 className="font-semibold text-sm mb-2">Управление данными</h3>
              <div className="space-y-2">
                <Button onClick={onResetColumns} variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Сбросить колонки к значениям по умолчанию
                </Button>
                <Button onClick={onClearAllData} variant="destructive" className="w-full justify-start">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить все данные
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
            <div>
              <h3 className="font-semibold text-sm mb-2">Информация</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Всего задач: <span className="font-medium">{todosCount}</span>
                </p>
                <p>
                  Колонок: <span className="font-medium">{columnsCount}</span>
                </p>
                <p>
                  Тема: <span className="font-medium">{theme === 'dark' ? 'Тёмная' : 'Светлая'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
