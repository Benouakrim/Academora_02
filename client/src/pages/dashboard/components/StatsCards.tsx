import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/store/useUserStore'
import { useProfileCompleteness } from '@/hooks/useProfileCompleteness'
import { BookOpen, Target, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

function ProgressBar({ value, colorClass = "bg-primary" }: { value: number, colorClass?: string }) {
  return (
    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
      <div 
        className={`h-full transition-all duration-1000 ease-out ${colorClass}`} 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }} 
      />
    </div>
  )
}

export default function StatsCards() {
  const { profile } = useUserStore()
  const { data: profileCompleteness, isLoading: loadingProfile } = useProfileCompleteness()

  const savedCount = Array.isArray((profile as any)?.savedUniversities) ? (profile as any).savedUniversities.length : 0
  const completionPct = profileCompleteness?.completionPercentage ?? 0

  // Estimate aid (mock calculation based on saved items for visual)
  const avgAid = (() => {
    const list = ((profile as any)?.savedUniversities || []) as any[]
    const withAid = list.map((it) => (it.university?.averageGrantAid ?? 0)).filter((x) => x > 0)
    if (!withAid.length) return null
    return Math.round(withAid.reduce((a, b) => a + b, 0) / withAid.length)
  })()

  if (loadingProfile) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Saved Unis */}
      <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Saved Universities</CardTitle>
          <BookOpen className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{savedCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {savedCount === 0 ? "Start exploring to add schools" : `${savedCount} school${savedCount !== 1 ? 's' : ''} saved`}
          </p>
        </CardContent>
      </Card>

      {/* Profile Completion */}
      <Card className="border-l-4 border-l-secondary shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Profile Strength</CardTitle>
          <Target className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{completionPct}%</div>
          <ProgressBar value={completionPct} colorClass="bg-secondary" />
          <p className="text-xs text-muted-foreground mt-2">
            {completionPct < 100 
              ? `${profileCompleteness?.missingFields?.join(', ') || 'Missing fields'}`
              : "Profile complete!"}
          </p>
        </CardContent>
      </Card>

      {/* Estimated Aid */}
      <Card className="border-l-4 border-l-accent shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Potential Aid</CardTitle>
          <TrendingUp className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {avgAid ? `$${(avgAid / 1000).toFixed(1)}k` : '—'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {avgAid ? "Avg. grant from your saved schools" : "Save schools to see aid estimates"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
