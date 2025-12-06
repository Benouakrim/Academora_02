import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect, Suspense } from 'react'
import api from '@/lib/api'
import { useUserStore } from '@/store/useUserStore'
import DashboardHeader from './components/DashboardHeader'
import StatsCards from './components/StatsCards'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import RecommendedWidget from './components/RecommendedWidget'
import OnboardingStatusWidget from '@/components/dashboard/OnboardingStatusWidget'
import UniversityReadinessScore from './components/UniversityReadinessScore'
import DailyInsightWidget from './components/DailyInsightWidget'
import FinancialHealthBar from './components/FinancialHealthBar'
import DynamicNextSteps from './components/DynamicNextSteps'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile } = useUserStore()

  // Auto-redirect new users to onboarding
  useEffect(() => {
    if (profile && !profile.onboarded && !profile.onboardingSkipped) {
      navigate('/onboarding')
    }
  }, [profile, navigate])

  // Lazy-load activity feed data with staleTime
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: async () => {
      const res = await api.get('/user/dashboard')
      return res.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader />
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Activity & Insights */}
        <div className="lg:col-span-2 space-y-8">
          {/* University Readiness Score - Premium Widget */}
          <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
            <UniversityReadinessScore />
          </Suspense>

          {/* Daily Insight Widget */}
          <Suspense fallback={<Skeleton className="h-32 w-full rounded-lg" />}>
            <DailyInsightWidget />
          </Suspense>

          {/* Financial Health Bar */}
          <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
            <FinancialHealthBar />
          </Suspense>

          {/* Activity Feed */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t('dashboard_recent_activity')}</h2>
            </div>
            {activityLoading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : (
              <ActivityFeed data={activityData} />
            )}
          </section>
        </div>

        {/* Right Column: Recommendations & Quick Actions */}
        <div className="space-y-8">
          {/* Onboarding Status Widget */}
          <OnboardingStatusWidget />

          {/* Recommendations */}
          <section>
            <h3 className="text-lg font-bold mb-4">{t('dashboard_recommended')}</h3>
            <RecommendedWidget />
          </section>

          {/* Dynamic Next Steps */}
          <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
            <DynamicNextSteps />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
