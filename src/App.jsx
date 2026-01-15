import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TicketsProvider } from './context/TicketsContext'
import { TodoProvider } from './context/TodoContext'
import { ThemeProvider } from './context/ThemeContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { TicketDetail } from './pages/TicketDetail'
import { AllTickets } from './pages/AllTickets'
import { Admin } from './pages/Admin'
import { UserDetail } from './pages/UserDetail'
import { Inventory } from './pages/Inventory'
import { TodoBoard } from './pages/TodoBoard'
import { Rules } from './pages/Rules'
import { Help } from './pages/Help'
import { useAuth } from './context/AuthContext'

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ticket/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <TicketDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <Layout>
              <AllTickets />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <Admin />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/user/:userId"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <UserDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute allowedRoles={['admin', 'it']}>
            <Layout>
              <Inventory />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/todos"
        element={
          <ProtectedRoute allowedRoles={['admin', 'it']}>
            <Layout>
              <TodoBoard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rules"
        element={
          <ProtectedRoute>
            <Layout>
              <Rules />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <Layout>
              <Help />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
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

export default App

