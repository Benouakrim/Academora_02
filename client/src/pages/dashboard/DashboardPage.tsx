import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import api from '@/lib/api'
import { useUserStore } from '@/store/useUserStore'
import DashboardHeader from './components/DashboardHeader'
import StatsCards from './components/StatsCards'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import RecommendedWidget from './components/RecommendedWidget'
import OnboardingStatusWidget from '@/components/dashboard/OnboardingStatusWidget'
import { Button } from '@/components/ui/button'
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

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/user/dashboard')
      return res.data
    }
  })

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader />
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Activity & Content */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t('dashboard_recent_activity')}</h2>
            </div>
            {isLoading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : (
              <ActivityFeed data={data} />
            )}
          </section>
        </div>

        {/* Right Column: Recommendations & Quick Actions */}
        <div className="space-y-8">
          {/* Onboarding Status Widget */}
          <OnboardingStatusWidget />

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t('dashboard_recommended')}</h2>
              <Link to="/search">
                <Button variant="link" size="sm" className="text-primary p-0">
                    {t('button_explore')} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <RecommendedWidget />
          </section>
          
          <section className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-3">{t('dashboard_next_steps')}</h3>
            <div className="space-y-3">
              <Link to="/dashboard/matching-engine">
                 <Button variant="default" className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white shadow-md">
                   <Zap className="w-4 h-4 mr-2" /> {t('button_launch_matching_engine')}
                 </Button>
              </Link>
              <Link to="/compare">
                 <Button variant="outline" className="w-full justify-start">{t('button_compare_schools')}</Button>
              </Link>
              <Link to="/dashboard/profile">
                 <Button variant="outline" className="w-full justify-start">{t('button_update_profile')}</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
