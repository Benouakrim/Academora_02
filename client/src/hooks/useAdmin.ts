import { useEffect, useMemo } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

export default function useAdmin() {
  const { isLoaded, isSignedIn, user } = useUser()
  const navigate = useNavigate()

  const role = user?.publicMetadata?.role as string | undefined
  const isAdmin = useMemo(() => role === 'admin', [role])
  const isLoading = !isLoaded

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn || !isAdmin) {
      navigate('/', { replace: true })
    }
  }, [isLoaded, isSignedIn, isAdmin, navigate])

  return { isLoading, isAdmin }
}
