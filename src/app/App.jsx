import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { TicketsProvider } from '../context/TicketsContext'
import { TodoProvider } from '../context/TodoContext'
import { ThemeProvider } from '../context/ThemeContext'
import { ProtectedLayout } from '../components/ProtectedLayout'
import { Login } from '../pages/Login'
import { Home } from '../pages/Home'
import { TicketDetail } from '../pages/TicketDetail'
import { AllTickets } from '../pages/AllTickets'
import { Admin } from '../pages/Admin'
import { UserDetail } from '../pages/UserDetail'
import { Attendance } from '../pages/Attendance'
import { Inventory } from '../pages/Inventory'
import { TimeTracking } from '../pages/TimeTracking'
import { TodoBoardProvider } from '../context/TodoBoardContext'
import { TodoBoard } from '../pages/TodoBoard'
import { TodoArchive } from '../pages/TodoArchive'
import { KostaDaily } from '../pages/KostaDaily'
import { showKostaDaily } from '../config/feature-flags'
import { Rules } from '../pages/Rules'
import { Help } from '../pages/Help'
import { useAuth } from '../context/AuthContext'

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedLayout />}>
        <Route index element={<Home />} />
        <Route path="ticket/:id" element={<TicketDetail />} />
        <Route path="tickets" element={<AllTickets />} />
        <Route path="admin" element={<Admin />} />
        <Route path="admin/user/:userId" element={<UserDetail />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="time-tracking" element={<TimeTracking />} />
        <Route path="todos" element={<TodoBoardProvider><TodoBoard /></TodoBoardProvider>} />
        <Route path="todos/archive" element={<TodoArchive />} />
        <Route path="kosta-daily" element={showKostaDaily ? <KostaDaily /> : <Navigate to="/" replace />} />
        <Route path="rules" element={<Rules />} />
        <Route path="help" element={<Help />} />
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TicketsProvider>
          <TodoProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TodoProvider>
        </TicketsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
