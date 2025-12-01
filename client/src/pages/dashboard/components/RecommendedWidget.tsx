import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/useUserStore'
import { api } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'

type MatchResult = {
  university: {
    id: string
    slug: string
    name: string
    country: string
    tuitionOutState: number | null
    logoUrl: string | null
  }
  matchScore: number
}

function MiniCard({ item }: { item: MatchResult }) {
  const u = item.university
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      <div className="h-12 w-12 rounded bg-muted overflow-hidden flex items-center justify-center">
        {u.logoUrl ? (
          <img src={u.logoUrl} alt={u.name} className="h-full w-full object-contain" />
        ) : (
          <span className="text-xs text-muted-foreground">Logo</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{u.name}</div>
        <div className="text-xs text-muted-foreground truncate">{u.country}</div>
      </div>
      <Link to={`/university/${u.slug}`}>
        <Button size="sm" variant="outline">View</Button>
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
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Matches for You</CardTitle>
      </CardHeader>
      <CardContent>
        {!canMatch && (
          <div className="text-sm text-muted-foreground">
            Complete your profile (GPA, Budget, Major) to see recommendations.
          </div>
        )}
        {canMatch && isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}
        {canMatch && data && data.length > 0 && (
          <div className="space-y-3">
            {data.map((m) => (
              <MiniCard key={m.university.id} item={m} />
            ))}
          </div>
        )}
        {canMatch && data && data.length === 0 && (
          <div className="text-sm text-muted-foreground">No matches yet. Try broadening your criteria.</div>
        )}
      </CardContent>
    </Card>
  )
}
