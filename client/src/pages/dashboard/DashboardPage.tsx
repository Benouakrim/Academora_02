import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import WelcomeHeader from './components/WelcomeHeader'
import StatsCards from './components/StatsCards'
import RecommendedWidget from './components/RecommendedWidget'
import { useUserStore } from '@/store/useUserStore'

export default function DashboardPage() {
  const { profile, isLoading, error, fetchProfile } = useUserStore()
  const { isSignedIn } = useAuth()

  useEffect(() => {
    if (isSignedIn && !profile && !isLoading && !error) {
      fetchProfile()
    }
  }, [isSignedIn, profile, isLoading, error, fetchProfile])

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
      <WelcomeHeader />
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecommendedWidget />
        {/* Reserved for next widgets: Recent Activity, Checklist, etc. */}
        <div className="border rounded-lg p-6 bg-card text-muted-foreground">
          More tools coming soon...
        </div>
      </div>
    </div>
  )
}
