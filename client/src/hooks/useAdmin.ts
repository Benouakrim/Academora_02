import { useEffect, useMemo } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/useUserStore'

export default function useAdmin() {
  const { isLoaded, isSignedIn, user } = useUser()
  const navigate = useNavigate()

  const role = user?.publicMetadata?.role as string | undefined
  const metaIsAdmin = user?.publicMetadata?.isAdmin as boolean | undefined
  const profileRole = useUserStore((s) => (s.profile?.role as string | undefined))
  const isAdmin = useMemo(() => {
    // Accept either role === 'admin' or a boolean flag in publicMetadata
    // Fallback to DB profile role when available
    return (
      role === 'admin' ||
      metaIsAdmin === true ||
      profileRole?.toUpperCase() === 'ADMIN'
    )
  }, [role, metaIsAdmin, profileRole])
  const isLoading = !isLoaded

  useEffect(() => {
    if (!isLoaded) return
    // Only redirect signed-in non-admins; keep admins here
    if (!isSignedIn) {
      navigate('/', { replace: true })
      return
    }

    if (!isAdmin) {
      navigate('/', { replace: true })
    }
  }, [isLoaded, isSignedIn, isAdmin, navigate])

  return { isLoading, isAdmin }
}
