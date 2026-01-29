import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTodos } from '../context/TodoContext'
import { useTheme } from '../context/ThemeContext'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu'
import {
  ArrowLeft,
  Archive,
  ArchiveRestore,
  Trash2,
  Search,
  Sun,
  Moon,
  MoreVertical,
  Flag,
} from 'lucide-react'
import { cn } from '../lib/utils'

export const TodoArchive = () => {
  const navigate = useNavigate()
  const { user, getAllUsers } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const {
    archivedTodos,
    archivedLoading,
    loadArchivedTodos,
    restoreTodo,
    deleteTodo,
    loadTodos,
  } = useTodos()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)
  const [deleteTodoDialogOpen, setDeleteTodoDialogOpen] = useState(false)
  const [todoToDelete, setTodoToDelete] = useState(null)

  const allUsers = getAllUsers()

  useEffect(() => {
    setIsMounted(true)
    console.log('[TodoArchive] Компонент смонтирован, загружаем архивированные задачи')
    if (loadArchivedTodos) {
      loadArchivedTodos()
    } else {
      console.error('[TodoArchive] loadArchivedTodos не определена')
    }
  }, [])

  useEffect(() => {
    console.log('[TodoArchive] archivedTodos обновлены:', archivedTodos)
    console.log('[TodoArchive] archivedLoading:', archivedLoading)
  }, [archivedTodos, archivedLoading])

  const filteredTodos = useMemo(() => {
    console.log('[TodoArchive] Фильтрация todos. archivedTodos:', archivedTodos)
    console.log('[TodoArchive] Тип archivedTodos:', typeof archivedTodos, Array.isArray(archivedTodos))
    console.log('[TodoArchive] Длина archivedTodos:', archivedTodos?.length)
    
    if (!archivedTodos || !Array.isArray(archivedTodos)) {
      console.log('[TodoArchive] archivedTodos не массив или undefined:', archivedTodos)
      return []
    }
    
    if (archivedTodos.length === 0) {
      console.log('[TodoArchive] archivedTodos пустой массив')
      return []
    }
    
    let result
    if (!searchQuery) {
      result = archivedTodos
      console.log('[TodoArchive] Без поиска, возвращаем все:', result.length)
    } else {
      const query = searchQuery.toLowerCase()
      result = archivedTodos.filter((todo) => {
        const matches = todo.title?.toLowerCase().includes(query) ||
          todo.description?.toLowerCase().includes(query)
        return matches
      })
      console.log('[TodoArchive] С поиском "' + searchQuery + '", найдено:', result.length)
    }
    
    console.log('[TodoArchive] filteredTodos результат:', result)
    return result
  }, [archivedTodos, searchQuery])

  const handleContextMenu = (e, todo) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      todo,
      x: e.clientX,
      y: e.clientY,
    })
  }

  const handleRestoreTodo = async (todo) => {
    if (!todo) return
    try {
      await restoreTodo(todo.id)
      await loadArchivedTodos()
      await loadTodos()
      setContextMenu(null)
    } catch (error) {
      console.error('[TodoArchive] Ошибка восстановления задачи:', error)
      setContextMenu(null)
    }
  }

  const getUserInitials = (username) => {
    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserColor = (userId) => {
    const colors = [
      'bg-primary',
      'bg-secondary',
      'bg-accent',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
    ]
    const index = allUsers.findIndex((u) => u.id === userId) % colors.length
    return colors[index] || colors[0]
  }

  return (
    <div className="h-screen flex flex-col bg-background transition-colors duration-300 overflow-hidden">
      {/* Top Navigation Bar */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b px-4 py-3 flex items-center justify-between gap-4 flex-shrink-0 backdrop-blur-xl transition-all duration-700 shadow-lg shadow-black/5",
        theme === 'dark' 
          ? "bg-gray-900/70 border-gray-800/30 backdrop-blur-xl" 
          : "bg-white/70 border-gray-200/30 backdrop-blur-xl",
        isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      )}>
        {/* Back Button */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={() => navigate('/todos')}
            className={cn(
              "transition-all",
              theme === 'dark'
                ? "text-white hover:bg-gray-800/50"
                : "text-gray-700 hover:bg-gray-100/50"
            )}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Назад
          </Button>
          <div className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Архив задач</h1>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 flex-1 justify-center">
          <div className="relative flex-1 max-w-md">
            <Search className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors",
              theme === 'dark' ? "text-gray-400" : "text-gray-500"
            )} />
            <Input
              placeholder="Поиск в архиве"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-9 pr-4 transition-all duration-300 backdrop-blur-md",
                theme === 'dark'
                  ? "bg-gray-800/70 border-gray-700/40 text-white placeholder:text-gray-400 hover:bg-gray-800/80 focus:bg-gray-800/90 focus:border-primary/50 shadow-lg"
                  : "bg-white/70 border-gray-300/40 text-gray-900 placeholder:text-gray-500 hover:bg-white/80 focus:bg-white/90 focus:border-primary/50 shadow-lg"
              )}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
              "transition-all duration-300 backdrop-blur-sm",
              theme === 'dark'
                ? "text-white hover:bg-gray-800/60 hover:scale-110"
                : "text-gray-700 hover:bg-gray-100/60 hover:scale-110"
            )}
            title={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Spacer for fixed navigation */}
      <div className="h-[57px] flex-shrink-0"></div>

      {/* Archive Content */}
      <div className={cn(
        "flex-1 overflow-y-auto p-4 transition-all duration-700",
        theme === 'dark'
          ? "bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95"
          : "bg-gradient-to-br from-gray-50/95 via-blue-50/30 to-purple-50/30",
        isMounted ? 'opacity-100' : 'opacity-0'
      )}>
        {archivedLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <Archive className="h-16 w-16 mb-4 opacity-50 text-muted-foreground animate-pulse" />
            <p className="text-lg font-medium text-muted-foreground">Загрузка архива...</p>
          </div>
        ) : !filteredTodos || filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <Archive className="h-16 w-16 mb-4 opacity-50 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              {!archivedTodos || archivedTodos.length === 0 ? 'Архив пуст' : 'Ничего не найдено'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {!archivedTodos || archivedTodos.length === 0 
                ? 'Здесь будут отображаться архивированные задачи'
                : 'Попробуйте изменить поисковый запрос'}
            </p>
            {archivedTodos && (
              <p className="text-xs text-muted-foreground mt-4">
                Всего архивированных задач: {archivedTodos.length}, Отфильтровано: {filteredTodos?.length || 0}
              </p>
            )}
            {!archivedLoading && (!archivedTodos || archivedTodos.length === 0) && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Примечание:</strong> Эндпоинт для архивированных задач может быть недоступен. 
                  Убедитесь, что сервер запущен и эндпоинт <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">/api/v1/todos/archived</code> существует.
                </p>
              </div>
            )}
          </div>
        ) : filteredTodos && filteredTodos.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {console.log('[TodoArchive] Рендерим карточки, количество:', filteredTodos.length)}
            {filteredTodos.map((todo, index) => {
              console.log('[TodoArchive] Рендерим карточку:', todo.id, todo.title)
              return (
              <Card
                key={todo.id}
                onContextMenu={(e) => handleContextMenu(e, todo)}
                className={cn(
                  "group cursor-pointer transition-all duration-500 relative overflow-hidden backdrop-blur-sm hover:shadow-xl hover:scale-[1.02]",
                  theme === 'dark'
                    ? "bg-gray-700/60 border-gray-600/40 hover:border-primary/60 hover:bg-gray-700/80"
                    : "bg-white/80 border-gray-200/60 hover:border-primary/60 hover:bg-white/95",
                  isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                )}
                style={{
                  backgroundImage: todo.backgroundImage ? `url(${todo.backgroundImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                {todo.backgroundImage && (
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 backdrop-blur-[2px] transition-all duration-300"></div>
                )}
                <CardContent className="p-4 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={cn(
                        "font-medium text-sm leading-tight transition-colors flex-1",
                        todo.backgroundImage 
                          ? "text-white drop-shadow-md" 
                          : theme === 'dark' ? "text-gray-100" : "text-gray-900"
                      )}>
                        {todo.title}
                      </h4>
                      {todo.priority && (
                        <Flag className={cn(
                          "h-3.5 w-3.5 flex-shrink-0 mt-0.5",
                          todo.priority === 'high' && "text-red-500 fill-red-500",
                          todo.priority === 'medium' && "text-yellow-500 fill-yellow-500",
                          todo.priority === 'low' && "text-blue-500 fill-blue-500",
                          todo.backgroundImage && "drop-shadow-md"
                        )} />
                      )}
                    </div>
                    {todo.description && (
                      <p className={cn(
                        "text-xs line-clamp-2 transition-colors",
                        todo.backgroundImage 
                          ? "text-white/90 drop-shadow-md" 
                          : theme === 'dark' ? "text-gray-300" : "text-gray-600"
                      )}>
                        {todo.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Archive className="h-3 w-3" />
                        <span>Архивировано</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )
            })}
          </div>
        ) : null}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-[99]"
            onClick={() => setContextMenu(null)}
          />
          <div
            className={cn(
              "fixed z-[100] rounded-lg shadow-lg py-1 min-w-[180px]",
              theme === 'dark' 
                ? "bg-gray-800 border border-gray-700" 
                : "bg-white border border-gray-200"
            )}
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            <button
              onClick={() => handleRestoreTodo(contextMenu.todo)}
              className={cn(
                "w-full flex items-center px-3 py-2 text-sm transition-colors",
                theme === 'dark' 
                  ? "hover:bg-gray-700 text-gray-100" 
                  : "hover:bg-gray-100 text-gray-900"
              )}
            >
              <ArchiveRestore className="h-4 w-4 mr-2" />
              Восстановить
            </button>
            <div className={cn(
              "h-px my-1",
              theme === 'dark' ? "bg-gray-700" : "bg-gray-200"
            )} />
            <button
              onClick={() => {
                setTodoToDelete(contextMenu.todo)
                setDeleteTodoDialogOpen(true)
                setContextMenu(null)
              }}
              className={cn(
                "w-full flex items-center px-3 py-2 text-sm transition-colors text-destructive",
                theme === 'dark' 
                  ? "hover:bg-gray-700" 
                  : "hover:bg-gray-100"
              )}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить
            </button>
          </div>
        </>
      )}

      {/* Delete Todo Confirmation Dialog */}
      <Dialog open={deleteTodoDialogOpen} onOpenChange={setDeleteTodoDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Подтвердите удаление</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить карточку "{todoToDelete?.title}"?
              <span className="block mt-2 text-destructive">
                Это действие нельзя отменить.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteTodoDialogOpen(false)
                setTodoToDelete(null)
              }}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (todoToDelete) {
                  try {
                    await deleteTodo(todoToDelete.id)
                    setDeleteTodoDialogOpen(false)
                    setTodoToDelete(null)
                  } catch (error) {
                    console.error('[TodoArchive] Ошибка удаления задачи:', error)
                    setDeleteTodoDialogOpen(false)
                    setTodoToDelete(null)
                  }
                }
              }}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
