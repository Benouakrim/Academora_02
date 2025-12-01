import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { setupInterceptors } from '@/lib/api'

export default function AuthProvider({ children }: PropsWithChildren) {
  const { getToken, isLoaded } = useAuth()

  useEffect(() => {
    // Set up axios interceptors once Clerk is ready
    if (isLoaded) {
      setupInterceptors(getToken)
    }
  }, [getToken, isLoaded])

  return children
}
