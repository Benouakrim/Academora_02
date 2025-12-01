import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/store/useUserStore'
import { cn } from '@/lib/utils'

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-2 rounded bg-muted overflow-hidden">
      <div className={cn('h-full bg-primary transition-all')} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

export default function StatsCards() {
  const { profile } = useUserStore()

  const savedCount = Array.isArray((profile as any)?.savedUniversities) ? (profile as any).savedUniversities.length : 0

  const completionFields = [
    Number.isFinite(profile?.gpa) ? 1 : 0,
    Number.isFinite(profile?.satScore as any) ? 1 : 0,
    Number.isFinite(profile?.maxBudget as any) ? 1 : 0,
    profile?.preferredMajor ? 1 : 0,
  ]
  const completionPct = (completionFields.reduce((a, b) => a + b, 0) / completionFields.length) * 100

  // Try to compute a placeholder Estimated Aid from saved items if present; else show dash
  const avgAid = (() => {
    const list = ((profile as any)?.savedUniversities || []) as any[]
    const withAid = list.map((it) => (it.estimatedAid ?? it.aid ?? null)).filter((x) => typeof x === 'number') as number[]
    if (!withAid.length) return null
    return Math.round(withAid.reduce((a, b) => a + b, 0) / withAid.length)
  })()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Saved Universities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">{savedCount}</div>
          <p className="text-sm text-muted-foreground mt-1">Total saved to your list</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Complete your profile to improve matches</span>
            <span className="text-sm font-medium">{Math.round(completionPct)}%</span>
          </div>
          <ProgressBar value={completionPct} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estimated Aid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">{avgAid != null ? `$${(avgAid / 1000).toFixed(0)}k` : '—'}</div>
          <p className="text-sm text-muted-foreground mt-1">Average of saved choices</p>
        </CardContent>
      </Card>
    </div>
  )
}
