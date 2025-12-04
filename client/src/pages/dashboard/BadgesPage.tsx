import { useBadges } from '@/hooks/useBadges'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Award, Lock, Calendar, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

export default function BadgesPage() {
  const { data, isLoading } = useBadges()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  const earnedBadges = data?.userBadges || []
  const allBadges = data?.allBadges || []
  const earnedBadgeIds = new Set(earnedBadges.map(ub => ub.badgeId))
  const lockedBadges = allBadges.filter(b => !earnedBadgeIds.has(b.id))

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-500 to-amber-600'
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-600'
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-600'
      case 'common': return 'bg-gradient-to-r from-gray-400 to-gray-600'
      default: return 'bg-primary'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'engagement': return '💬'
      case 'achievement': return '🏆'
      case 'milestone': return '🎯'
      case 'special': return '⭐'
      default: return '🎖️'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Award className="w-8 h-8 text-primary" />
            My Badges & Achievements
          </h1>
          <p className="text-muted-foreground mt-2">
            Unlock badges by exploring features, engaging with content, and reaching milestones
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <TrendingUp className="w-4 h-4 mr-2" />
          {earnedBadges.length} / {allBadges.length} Earned
        </Badge>
      </div>

      {/* Earned Badges Section */}
      {earnedBadges.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Earned Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {earnedBadges.map((userBadge) => (
              <Card 
                key={userBadge.id} 
                className="relative overflow-hidden border-2 hover:shadow-lg transition-all hover:scale-105"
              >
                <div className={`absolute top-0 left-0 right-0 h-2 ${getRarityColor(userBadge.badge.rarity)}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">{getCategoryIcon(userBadge.badge.category)}</div>
                    <Badge className={getRarityColor(userBadge.badge.rarity) + ' text-white'}>
                      {userBadge.badge.rarity}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{userBadge.badge.name}</CardTitle>
                  <CardDescription>{userBadge.badge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Earned {format(new Date(userBadge.awardedAt), 'MMM d, yyyy')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Locked Badges Section */}
      {lockedBadges.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-muted-foreground">Locked Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lockedBadges.map((badge) => (
              <Card 
                key={badge.id} 
                className="relative overflow-hidden opacity-60 hover:opacity-80 transition-opacity"
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gray-400" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl grayscale">
                      {getCategoryIcon(badge.category)}
                    </div>
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl text-muted-foreground">{badge.name}</CardTitle>
                  <CardDescription>{badge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-xs">
                    {badge.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {earnedBadges.length === 0 && allBadges.length === 0 && (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <Award className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-xl font-bold mb-2">No Badges Available Yet</h3>
              <p className="text-muted-foreground">
                Start exploring the platform to unlock your first badges!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
