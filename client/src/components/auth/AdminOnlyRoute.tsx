import type { PropsWithChildren } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useIsAdmin } from '@/hooks/useIsAdmin'

/**
 * Route wrapper that only allows admin users to access.
 * Non-admin authenticated users are redirected to their dashboard.
 * Non-authenticated users are redirected to sign-in.
 */
export default function AdminOnlyRoute({ children }: PropsWithChildren) {
  const { isLoaded, isSignedIn } = useAuth()
  const { isAdmin, isLoading } = useIsAdmin()
  const location = useLocation()

  // Wait for auth to load
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  // Not signed in - redirect to sign-in
  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  // Signed in but not admin - redirect to dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  // Admin user - render the route
  return children ? <>{children}</> : <Outlet />
}
