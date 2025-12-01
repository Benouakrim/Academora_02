import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useUserStore } from '@/store/useUserStore'
import { Skeleton } from '@/components/ui/skeleton'
import ProfileForm from './ProfileForm'

export default function ProfilePage() {
  const { profile, isLoading, error, fetchProfile } = useUserStore()
  const { isSignedIn } = useAuth()

  useEffect(() => {
    if (isSignedIn && !profile && !isLoading && !error) {
      fetchProfile()
    }
  }, [isSignedIn, profile, isLoading, error, fetchProfile])

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Your Academic Profile</h1>
        <p className="text-muted-foreground mt-1">This information is used to calculate your match scores and financial aid.</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-56 w-full" />
        </div>
      )}
      {!isLoading && <ProfileForm initialData={profile || undefined} />}
    </div>
  )
}
