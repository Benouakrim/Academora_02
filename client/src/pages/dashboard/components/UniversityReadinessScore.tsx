import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUserStore } from '@/store/useUserStore'
import { useProfileCompleteness } from '@/hooks/useProfileCompleteness'
import { useCompareStore } from '@/hooks/useCompare'
import { Zap, TrendingUp, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'

interface ReadinessMetrics {
  profileScore: number
  savedSchoolsScore: number
  comparisonsScore: number
  totalScore: number
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export default function UniversityReadinessScore() {
  const { profile } = useUserStore()
  const { data: profileCompleteness, isLoading } = useProfileCompleteness()
  const savedUnis = useCompareStore((s) => s.selectedSlugs)

  const getMetrics = (): ReadinessMetrics => {
    // Profile Completeness Score (0-30 points)
    const profileScore = (profileCompleteness?.completionPercentage ?? 0) * 0.3

    // Saved Universities Score (0-35 points, max at 5 universities)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const savedCount = Array.isArray((profile as any)?.savedUniversities) 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (profile as any).savedUniversities.length 
      : 0
    const savedSchoolsScore = Math.min(35, (savedCount / 5) * 35)

    // Comparisons Score (0-35 points, max at 3 comparisons)
    const comparisonsCount = savedUnis.length
    const comparisonsScore = Math.min(35, (comparisonsCount / 3) * 35)

    const totalScore = Math.round(profileScore + savedSchoolsScore + comparisonsScore)

    let level: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner'
    if (totalScore >= 85) level = 'expert'
    else if (totalScore >= 65) level = 'advanced'
    else if (totalScore >= 45) level = 'intermediate'

    return { profileScore, savedSchoolsScore, comparisonsScore, totalScore, level }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'from-purple-500 to-pink-600'
      case 'advanced': return 'from-blue-500 to-cyan-600'
      case 'intermediate': return 'from-amber-500 to-orange-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getLevelDescription = (level: string) => {
    switch (level) {
      case 'expert': return 'You\'re a university research pro! Ready for deep analysis.'
      case 'advanced': return 'You\'re well-prepared. Consider running detailed comparisons.'
      case 'intermediate': return 'Good progress! Save more schools and explore more.'
      default: return 'Get started by updating your profile and saving universities.'
    }
  }

  const getUnlockedFeatures = (level: string) => {
    const features = {
      beginner: ['Profile Edit', 'Search & Save'],
      intermediate: ['Comparisons (2-3 schools)', 'Basic Insights'],
      advanced: ['Full Comparisons (5 schools)', 'Advanced Insights', 'ROI Analysis'],
      expert: ['All Features Unlocked', 'PDF Reports', 'Saved Comparisons', 'Activity History'],
    }
    return features[level as keyof typeof features] || features.beginner
  }

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-lg" />
  }

  const metrics = getMetrics()

  return (
    <Card className="relative overflow-hidden border-2">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getLevelColor(metrics.level)}`} />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${getLevelColor(metrics.level)}`}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg capitalize">{metrics.level} Researcher</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{getLevelDescription(metrics.level)}</p>
            </div>
          </div>
          <Badge variant="outline" className={`bg-gradient-to-r ${getLevelColor(metrics.level)} text-white border-0`}>
            {metrics.totalScore}/100
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getLevelColor(metrics.level)} transition-all duration-500`}
              style={{ width: `${metrics.totalScore}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {100 - metrics.totalScore} points to next level
          </p>
        </div>

        {/* Individual Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted p-3 text-center">
            <div className="text-lg font-bold text-primary">{Math.round(metrics.profileScore)}</div>
            <div className="text-xs text-muted-foreground">Profile</div>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <div className="text-lg font-bold text-secondary">{Math.round(metrics.savedSchoolsScore)}</div>
            <div className="text-xs text-muted-foreground">Saved</div>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <div className="text-lg font-bold text-accent">{Math.round(metrics.comparisonsScore)}</div>
            <div className="text-xs text-muted-foreground">Comparisons</div>
          </div>
        </div>

        {/* Unlocked Features */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">Unlocked Features</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {getUnlockedFeatures(metrics.level).map((feature, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                ✓ {feature}
              </Badge>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        {metrics.totalScore < 100 && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-primary">Next Step</p>
            </div>
            {metrics.totalScore < 30 && (
              <Link to="/dashboard/profile" className="block">
                <Button size="sm" variant="default" className="w-full">
                  Complete Your Profile
                </Button>
              </Link>
            )}
            {metrics.totalScore >= 30 && metrics.totalScore < 60 && (
              <Link to="/search" className="block">
                <Button size="sm" variant="default" className="w-full">
                  Save More Universities
                </Button>
              </Link>
            )}
            {metrics.totalScore >= 60 && metrics.totalScore < 85 && (
              <Link to="/compare" className="block">
                <Button size="sm" variant="default" className="w-full">
                  Run Detailed Comparisons
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
