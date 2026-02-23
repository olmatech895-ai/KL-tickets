
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { ArrowLeft, Search, Archive, Sun, Moon, MoreVertical, Settings, Download, Upload } from 'lucide-react'
import { cn } from '../../lib/utils'

export function TodoBoardHeader({
  theme,
  toggleTheme,
  searchQuery,
  onSearchChange,
  onBack,
  onArchive,
  onOpenSettings,
  onExport,
  onImport,
  isMounted,
}) {
  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b px-4 py-3 flex items-center justify-between gap-4 flex-shrink-0 backdrop-blur-xl transition-all duration-700 shadow-lg shadow-black/5',
        theme === 'dark' ? 'bg-gray-900/70 border-gray-800/30 backdrop-blur-xl' : 'bg-white/70 border-gray-200/30 backdrop-blur-xl',
        isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      )}
    >
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          onClick={onBack}
          className={cn('transition-all', theme === 'dark' ? 'text-white hover:bg-gray-800/50' : 'text-gray-700 hover:bg-gray-100/50')}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Назад
        </Button>
      </div>
      <div className="flex items-center gap-3 flex-1 justify-center">
        <div className="relative flex-1 max-w-md">
          <Search className={cn('absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4', theme === 'dark' ? 'text-gray-400' : 'text-gray-500')} />
          <Input
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              'pl-9 pr-4 transition-all duration-300 backdrop-blur-md',
              theme === 'dark'
                ? 'bg-gray-800/70 border-gray-700/40 text-white placeholder:text-gray-400 hover:bg-gray-800/80 focus:bg-gray-800/90 focus:border-primary/50 shadow-lg'
                : 'bg-white/70 border-gray-300/40 text-gray-900 placeholder:text-gray-500 hover:bg-white/80 focus:bg-white/90 focus:border-primary/50 shadow-lg'
            )}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          onClick={onArchive}
          className={cn('transition-all', theme === 'dark' ? 'text-white hover:bg-gray-800/50' : 'text-gray-700 hover:bg-gray-100/50')}
        >
          <Archive className="h-4 w-4 mr-2" />
          Архив
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className={cn(
            'transition-all duration-300 backdrop-blur-sm',
            theme === 'dark' ? 'text-white hover:bg-gray-800/60 hover:scale-110' : 'text-gray-700 hover:bg-gray-100/60 hover:scale-110'
          )}
          title={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className={cn('transition-all', theme === 'dark' ? 'text-white hover:bg-gray-800/50' : 'text-gray-700 hover:bg-gray-100/50')}>
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onOpenSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Настройки
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт данных
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => document.getElementById('import-file-input')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Импорт данных
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input type="file" accept=".json" onChange={(e) => { onImport(e); e.target.value = '' }} className="hidden" id="import-file-input" />
      </div>
    </div>
  )
}
