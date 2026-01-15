import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/button'
import { LogOut, Ticket, Home } from 'lucide-react'

export const AdminLayout = ({ children }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal top bar with logo and logout */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Ticket className="h-6 w-6" />
              <span className="text-xl font-bold">Тикет-система</span>
              <span className="text-muted-foreground hidden sm:inline">• Админ-панель</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">На главную</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Выход</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-4 md:py-8">{children}</main>
    </div>
  )
}

