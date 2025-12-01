import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/useUserStore'

export default function WelcomeHeader() {
  const { user } = useUser()
  const { profile } = useUserStore()

  const firstName = user?.firstName || 'Student'
  const needsProfile = !profile?.gpa

  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-3xl font-semibold">Welcome back, {firstName}!</h1>
      <p className="text-muted-foreground mt-1">
        Here’s your journey overview. Keep going — you’ve got this.
      </p>
      {needsProfile && (
        <div className="mt-3">
          <Button variant="secondary" onClick={() => (window.location.href = '/dashboard/profile')}>
            Complete Profile
          </Button>
        </div>
      )}
    </div>
  )
}
