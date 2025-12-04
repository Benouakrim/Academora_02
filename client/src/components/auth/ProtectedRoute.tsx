import type { PropsWithChildren } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useUserStore } from '@/store/useUserStore'
import { useEffect, useState } from 'react'

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()
  const { profile, fetchProfile, isLoading } = useUserStore()
  const [profileChecked, setProfileChecked] = useState(false)

  // Fetch user profile when authenticated
  useEffect(() => {
    if (isSignedIn && !profile && !isLoading) {
      fetchProfile().finally(() => setProfileChecked(true))
    } else if (profile) {
      setProfileChecked(true)
    }
  }, [isSignedIn, profile, isLoading, fetchProfile])

  if (!isLoaded) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />
  }

  // Wait for profile to be fetched before checking onboarding status
  if (!profileChecked || isLoading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
      </div>
    )
  }

  const isOnboardingPage = location.pathname === '/onboarding'

  // State machine for onboarding flow
  if (profile) {
    const { onboarded, onboardingSkipped } = profile

    // State: NOT_STARTED (!onboarded && !onboardingSkipped)
    // Force redirect to /onboarding unless already there
    if (!onboarded && !onboardingSkipped && !isOnboardingPage) {
      console.log('[ProtectedRoute] User has NOT_STARTED onboarding. Redirecting to /onboarding')
      return <Navigate to="/onboarding" replace />
    }

    // State: SKIPPED (!onboarded && onboardingSkipped) or COMPLETED (onboarded)
    // Allow access to all protected routes including /onboarding (for resume/edit)
    // No redirection needed

    // Prevent completed users from seeing the start page (optional logic)
    // If you want to allow editing, remove this check
    // For now, we allow access to /onboarding for both skipped and completed states
  }

  return children ? <>{children}</> : <Outlet />
}
