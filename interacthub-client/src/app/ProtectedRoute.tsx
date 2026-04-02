import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import { ROUTES } from '../shared/constants/routes'

type ProtectedRouteProps = {
  requiredRoles?: string[]
}

export function ProtectedRoute({ requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, hasRole } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const isAllowed = requiredRoles.some((role) => hasRole(role))
    if (!isAllowed) {
      return <Navigate to={ROUTES.home} replace />
    }
  }

  return <Outlet />
}
