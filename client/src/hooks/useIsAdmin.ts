import { useMemo } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useUserStore } from '@/store/useUserStore'

/**
 * Simple hook to check if the current user is an admin.
 * Unlike useAdmin, this hook does NOT redirect non-admins.
 * Use this for conditional rendering of UI elements.
 */
export function useIsAdmin() {
  const { isLoaded, user } = useUser()
  const profileRole = useUserStore((s) => s.profile?.role as string | undefined)

  const isAdmin = useMemo(() => {
    const role = user?.publicMetadata?.role as string | undefined
    const metaIsAdmin = user?.publicMetadata?.isAdmin as boolean | undefined
    
    return (
      role === 'admin' ||
      metaIsAdmin === true ||
      profileRole?.toUpperCase() === 'ADMIN'
    )
  }, [user?.publicMetadata?.role, user?.publicMetadata?.isAdmin, profileRole])

  return {
    isAdmin,
    isLoading: !isLoaded,
  }
}

export default useIsAdmin
