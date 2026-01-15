import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from './ui/sheet'
import {
  Home,
  Settings,
  Package,
  CheckSquare,
  Ticket,
  FileText,
  HelpCircle,
  Menu,
  LogOut,
  Users,
  Shield,
  Sun,
  Moon,
  Plus,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useTheme } from '../context/ThemeContext'

export const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, logout, isAdmin, isIT } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname.startsWith('/admin')
    }
    return location.pathname === path
  }

  const menuItems = [
    {
      id: 'home',
      label: 'Главная',
      icon: Home,
      path: '/',
      visible: true,
    },
    {
      id: 'admin',
      label: 'Админ-панель',
      icon: Settings,
      path: '/admin',
      visible: isAdmin,
    },
    {
      id: 'inventory',
      label: 'Инвентаризация',
      icon: Package,
      path: '/inventory',
      visible: isAdmin || isIT,
    },
    {
      id: 'todos',
      label: 'Список дел',
      icon: CheckSquare,
      path: '/todos',
      visible: isAdmin || isIT,
    },
    {
      id: 'tickets',
      label: 'Все тикеты',
      icon: Ticket,
      path: '/tickets',
      visible: isAdmin || isIT,
    },
    {
      id: 'rules',
      label: 'Правила',
      icon: FileText,
      path: '/rules',
      visible: !isIT && !isAdmin, // Скрыть для IT отдела и админа
    },
    {
      id: 'help',
      label: 'Подсказки',
      icon: HelpCircle,
      path: '/help',
      visible: !isIT && !isAdmin, // Скрыть для IT отдела и админа
    },
  ].filter((item) => item.visible)

  const SidebarContent = ({ onLinkClick }) => (
    <div className="flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b flex-shrink-0">
        <Link
          to="/"
          onClick={onLinkClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Ticket className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Тикет-система</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 lg:p-6 border-b flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {isAdmin ? (
              <Shield className="h-5 w-5 text-primary" />
            ) : (
              <Users className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.role === 'admin'
                ? 'Администратор'
                : user?.role === 'it'
                ? 'IT Отдел'
                : 'Пользователь'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 lg:p-6 overflow-y-auto min-h-0 scrollbar-hide">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <Button
                key={item.id}
                variant={active ? 'default' : 'ghost'}
                asChild
                className={cn(
                  'w-full justify-start',
                  active && 'bg-primary text-primary-foreground'
                )}
                onClick={onLinkClick}
              >
                <Link to={item.path}>
                  <Icon className="h-4 w-4 mr-3" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </nav>

      {/* Theme Toggle and Logout */}
      <div className="p-4 lg:p-6 border-t flex-shrink-0 space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 mr-3" />
          ) : (
            <Moon className="h-4 w-4 mr-3" />
          )}
          <span>{theme === 'dark' ? 'Светлая тема' : 'Темная тема'}</span>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          <span>Выход</span>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 border-r bg-card fixed left-0 top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 bg-background/90 backdrop-blur-sm border shadow-lg hover:bg-background h-10 w-10"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Меню</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col">
          <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}

