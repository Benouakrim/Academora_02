import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/useUserStore'
import { api } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { Lightbulb, TrendingUp } from 'lucide-react'

interface DailyInsight {
  title: string
  description: string
  actionUrl?: string
  actionLabel?: string
}

export default function DailyInsightWidget() {
  const { profile } = useUserStore()

  const canGenerateInsight = Boolean(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Array.isArray((profile as any)?.savedUniversities) && 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (profile as any)?.savedUniversities.length >= 2
  )

  const { data, isLoading } = useQuery({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryKey: ['daily-insight', (profile as any)?.savedUniversities?.map((u: any) => u.university?.id)?.join(',')],
    enabled: canGenerateInsight,
    queryFn: async () => {
      if (!canGenerateInsight) return null

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const savedUnis = ((profile as any)?.savedUniversities || []) as any[]
      const universityIds = savedUnis.slice(0, 2).map(su => su.university?.id).filter(Boolean)

      if (universityIds.length < 2) return null

      try {
        const { data } = await api.post<{ insight: string }>('/compare/insights', {
          universityIds,
        })

        return {
          title: 'Daily University Insight',
          description: data.insight,
          actionUrl: '/compare',
          actionLabel: 'View Comparison',
        } as DailyInsight
      } catch {
        // Fallback insight if API fails
        return {
          title: 'Did You Know?',
          description: 'Comparing universities side-by-side can help you identify the best fit for your goals and budget. Check out your saved universities in the comparison tool.',
          actionUrl: '/compare',
          actionLabel: 'Go to Compare',
        } as DailyInsight
      }
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  })

  if (!canGenerateInsight) {
    return (
      <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Daily Insight
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Save 2 or more universities to unlock daily insights and personalized recommendations.
          </p>
          <Link to="/search">
            <Button size="sm" variant="default" className="w-full">
              Start Saving Universities
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          {data.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {data.description}
        </p>
        {data.actionUrl && data.actionLabel && (
          <Link to={data.actionUrl}>
            <Button size="sm" variant="default" className="w-full">
              <TrendingUp className="w-4 h-4 mr-2" />
              {data.actionLabel}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
