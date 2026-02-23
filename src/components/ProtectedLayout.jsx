import { Outlet, useLocation } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { Layout } from './Layout'

export const ProtectedLayout = () => {
  const { pathname } = useLocation()
  const requiredRole = undefined
  const allowedRoles =
    pathname.startsWith('/admin') || pathname.startsWith('/inventory') || pathname.startsWith('/attendance')
      ? ['admin', 'it']
      : undefined

  return (
    <ProtectedRoute requiredRole={requiredRole} allowedRoles={allowedRoles}>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  )
}
