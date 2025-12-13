import type { PropsWithChildren } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useUserStore } from '@/store/useUserStore'
import { useEffect, useState } from 'react'
import AuthError from './AuthError'

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const location = useLocation()
  const { profile, fetchProfile, isLoading } = useUserStore()
  const [profileChecked, setProfileChecked] = useState(false)
  const [authError, setAuthError] = useState<{
    type: 'unauthorized' | 'network' | 'token' | 'server' | 'unknown'
    message?: string
  } | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3

  // Fetch user profile when authenticated
  useEffect(() => {
    const loadProfile = async () => {
      console.log('[ProtectedRoute] Loading profile...', {
        isSignedIn,
        hasProfile: !!profile,
        isLoading,
        retryCount
      })

      if (!isSignedIn || profile || isLoading) {
        if (profile) setProfileChecked(true)
        return
      }

      // Prevent infinite retry loop
      if (retryCount >= MAX_RETRIES) {
        console.error('[ProtectedRoute] Max retries reached. Showing error.')
        setAuthError({
          type: 'token',
          message: 'Failed to authenticate after multiple attempts. Please sign out and sign in again.'
        })
        setProfileChecked(true)
        return
      }

      try {
        // Verify token exists before attempting to fetch profile
        console.log('[ProtectedRoute] Checking for Clerk token...')
        const token = await getToken()
        
        if (!token) {
          console.error('[ProtectedRoute] No token available from Clerk')
          setAuthError({
            type: 'token',
            message: 'Authentication token not available. This may be a temporary issue with Clerk. Please try signing out and back in.'
          })
          setProfileChecked(true)
          return
        }

        console.log('[ProtectedRoute] Token exists, fetching profile...')
        await fetchProfile()
        console.log('[ProtectedRoute] Profile fetched successfully')
        setProfileChecked(true)
        setAuthError(null)
        setRetryCount(0) // Reset retry count on success
      } catch (err: unknown) {
        const error = err as Record<string, unknown>
        console.error('[ProtectedRoute] Error loading profile:', error)
        
        const status = (error?.response as Record<string, unknown> | undefined)?.status
        const isNetworkError = (error as Record<string, unknown>)?.code === 'ERR_NETWORK'
        
        // Determine error type
        if (isNetworkError) {
          setAuthError({
            type: 'network',
            message: 'Cannot connect to server. Please check your internet connection.'
          })
        } else if (status === 401) {
          const message = ((error?.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message || 'Your session is invalid. Please sign in again.'
          setAuthError({
            type: 'unauthorized',
            message: String(message)
          })
        } else if (status === 403) {
          setAuthError({
            type: 'unauthorized',
            message: 'Access denied. You may not have permission to access this resource.'
          })
        } else if (typeof status === 'number' && status >= 500) {
          setAuthError({
            type: 'server',
            message: 'Server error. Please try again later.'
          })
        } else {
          // Retry on unknown errors
          if (retryCount < MAX_RETRIES) {
            console.log(`[ProtectedRoute] Retrying... (${retryCount + 1}/${MAX_RETRIES})`)
            setRetryCount(prev => prev + 1)
            // Don't set profileChecked, let it retry
            return
          }
          
          const errorMsg = (error as Record<string, unknown>)?.message
          setAuthError({
            type: 'unknown',
            message: String(errorMsg) || 'An unexpected error occurred'
          })
        }
        
        setProfileChecked(true)
      }
    }

    loadProfile()
  }, [isSignedIn, profile, isLoading, fetchProfile, getToken, retryCount])

  // Show loading spinner while Clerk is initializing
  if (!isLoaded) {
    console.log('[ProtectedRoute] Waiting for Clerk to load...')
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
      </div>
    )
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    console.log('[ProtectedRoute] User not signed in, redirecting to /sign-in')
    return <Navigate to="/sign-in" replace />
  }

  // Show error if authentication failed
  if (authError) {
    console.log('[ProtectedRoute] Showing auth error:', authError.type)
    return (
      <AuthError 
        type={authError.type}
        message={authError.message}
        onRetry={() => {
          setAuthError(null)
          setProfileChecked(false)
          setRetryCount(0)
        }}
      />
    )
  }

  // Wait for profile to be fetched before checking onboarding status
  if (!profileChecked || isLoading) {
    console.log('[ProtectedRoute] Loading profile data...')
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
  }

  // Render protected content
  return children ? <>{children}</> : <Outlet />
}
