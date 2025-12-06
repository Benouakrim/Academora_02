import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUserStore } from '@/store/useUserStore'
import { api } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { Star, Zap, DollarSign } from 'lucide-react'

type MatchResult = {
  university: {
    id: string
    slug: string
    name: string
    country: string
    tuitionOutState: number | null
    logoUrl: string | null
    ROIPercentage?: number | null
    employmentRate?: number | null
    averageGrantAid?: number | null
  }
  matchScore: number
  matchReason?: string
}

interface MiniCardProps {
  item: MatchResult
  reason?: string
}

function MiniCard({ item, reason }: MiniCardProps) {
  const u = item.university
  const matchPercentage = Math.round(item.matchScore * 100)
  
  // Generate match reason based on university data
  const getMatchReason = (): string => {
    if (reason) return reason
    
    const reasons = []
    if (u.tuitionOutState && (u.tuitionOutState / 1000) < 30) reasons.push('Affordable tuition')
    if (u.employmentRate && u.employmentRate > 0.85) reasons.push('Strong employment')
    if (u.ROIPercentage && u.ROIPercentage > 80) reasons.push('Excellent ROI')
    if (u.averageGrantAid && u.averageGrantAid > 20000) reasons.push('Strong financial aid')
    
    return reasons.length > 0 ? reasons[0] : 'Great fit for your goals'
  }

  return (
    <div className="space-y-2 p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
          {u.logoUrl ? (
            <img src={u.logoUrl} alt={u.name} className="h-full w-full object-contain" />
          ) : (
            <span className="text-xs text-muted-foreground">Logo</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate text-sm">{u.name}</div>
          <div className="text-xs text-muted-foreground truncate">{u.country}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold">{matchPercentage}%</span>
          </div>
        </div>
      </div>
      
      {/* Match Reason */}
      <Badge variant="secondary" className="text-xs">
        {getMatchReason()}
      </Badge>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {u.tuitionOutState && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <DollarSign className="w-3 h-3" />
            ${(u.tuitionOutState / 1000).toFixed(0)}k/yr
          </div>
        )}
        {u.employmentRate && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Zap className="w-3 h-3" />
            {Math.round(u.employmentRate * 100)}% employed
          </div>
        )}
      </div>

      {/* Action Button */}
      <Link to={`/university/${u.slug}`} className="block w-full">
        <Button size="sm" variant="outline" className="w-full text-xs">
          View Details
        </Button>
      </Link>
    </div>
  )
}

export default function RecommendedWidget() {
  const { profile } = useUserStore()

  const canMatch = Boolean(profile?.gpa && profile?.maxBudget && (profile as any)?.preferredMajor)

  const { data, isLoading } = useQuery({
    queryKey: ['match', profile?.gpa, profile?.maxBudget, (profile as any)?.preferredMajor],
    enabled: canMatch,
    queryFn: async () => {
      const payload = {
        gpa: profile!.gpa!,
        maxBudget: profile!.maxBudget!,
        interests: [(profile as any).preferredMajor as string],
        preferredCountry: undefined as string | undefined,
      }
      const { data } = await api.post<MatchResult[]>('/match', payload)
      return data.slice(0, 3)
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Top Matches for You</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Personalized universities based on your profile
        </p>
      </CardHeader>
      <CardContent>
        {!canMatch && (
          <div className="text-sm text-muted-foreground space-y-3">
            <p>Complete your profile (GPA, Budget, Major) to see recommendations.</p>
            <Link to="/dashboard/profile">
              <Button size="sm" variant="default" className="w-full">
                Complete Profile
              </Button>
            </Link>
          </div>
        )}
        {canMatch && isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}
        {canMatch && data && data.length > 0 && (
          <div className="space-y-3">
            {data.map((m) => (
              <MiniCard key={m.university.id} item={m} reason={m.matchReason} />
            ))}
          </div>
        )}
        {canMatch && data && data.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No matches yet. Try adjusting your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
