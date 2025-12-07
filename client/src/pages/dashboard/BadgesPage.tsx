import { useBadges } from '@/hooks/useBadges'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Award, Lock, Calendar, TrendingUp, MessageCircle, Trophy, Target, Sparkles } from 'lucide-react'
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
      case 'legendary': 
        return 'from-amber-500 via-yellow-500 to-orange-600'
      case 'epic': 
        return 'from-purple-500 via-pink-500 to-purple-600'
      case 'rare': 
        return 'from-blue-500 via-cyan-500 to-blue-600'
      case 'common': 
        return 'from-slate-400 to-slate-600'
      default: 
        return 'from-primary to-primary'
    }
  }

  const getCategoryIcon = (category: string) => {
    const iconClass = 'w-8 h-8'
    switch (category.toLowerCase()) {
      case 'engagement': 
        return <MessageCircle className={iconClass} />
      case 'achievement': 
        return <Trophy className={iconClass} />
      case 'milestone': 
        return <Target className={iconClass} />
      case 'special': 
        return <Sparkles className={iconClass} />
      default: 
        return <Award className={iconClass} />
    }
  }

  const getRarityTextColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'text-amber-600 dark:text-amber-400'
      case 'epic': return 'text-purple-600 dark:text-purple-400'
      case 'rare': return 'text-blue-600 dark:text-blue-400'
      case 'common': return 'text-slate-600 dark:text-slate-400'
      default: return 'text-primary'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Award className="w-8 h-8 text-primary" />
            Badges & Achievements
          </h1>
          <p className="text-muted-foreground mt-2">
            Unlock badges by exploring features, engaging with content, and reaching milestones
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 w-fit">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="font-semibold">{earnedBadges.length} / {allBadges.length}</span>
          <span className="text-sm text-muted-foreground">Earned</span>
        </div>
      </div>

      {/* Progress Bar */}
      {allBadges.length > 0 && (
        <div className="space-y-2">
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
              style={{ width: `${(earnedBadges.length / allBadges.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {Math.round((earnedBadges.length / allBadges.length) * 100)}% Complete
          </p>
        </div>
      )}

      {/* Earned Badges Section */}
      {earnedBadges.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Earned Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {earnedBadges.map((userBadge, index) => (
              <Card 
                key={userBadge.id}
                className="relative overflow-hidden border-2 hover:shadow-lg transition-all hover:scale-105 animate-slideInUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Rarity Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getRarityColor(userBadge.badge.rarity)}`} />
                
                {/* Glow Effect for Legendary */}
                {userBadge.badge.rarity.toLowerCase() === 'legendary' && (
                  <div className="absolute inset-0 opacity-0 hover:opacity-20 bg-gradient-to-r from-amber-500 to-orange-600 transition-opacity" />
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    {/* Icon with color */}
                    <div className={`text-3xl ${getRarityTextColor(userBadge.badge.rarity)}`}>
                      {getCategoryIcon(userBadge.badge.category)}
                    </div>
                    <Badge className={`bg-gradient-to-r ${getRarityColor(userBadge.badge.rarity)} text-white border-0 font-semibold`}>
                      {userBadge.badge.rarity}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mt-2">{userBadge.badge.name}</CardTitle>
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
                className="relative overflow-hidden opacity-50 hover:opacity-70 transition-opacity"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-muted" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-3xl text-muted-foreground grayscale">
                      {getCategoryIcon(badge.category)}
                    </div>
                    <Lock className="w-5 h-5 text-muted-foreground/60" />
                  </div>
                  <CardTitle className="text-xl text-muted-foreground mt-2">{badge.name}</CardTitle>
                  <CardDescription className="text-muted-foreground/75">{badge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
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
        <Card className="text-center py-12 border-dashed">
          <CardContent className="space-y-4">
            <Award className="w-16 h-16 mx-auto text-muted-foreground/50" />
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
