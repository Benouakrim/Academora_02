import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/store/useUserStore'
import { useProfileCompleteness } from '@/hooks/useProfileCompleteness'
import { ArrowRight, Zap, BarChart3, CheckCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function DynamicNextSteps() {
  const { profile } = useUserStore()
  const { data: profileCompleteness, isLoading } = useProfileCompleteness()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const savedCount = Array.isArray((profile as any)?.savedUniversities)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (profile as any).savedUniversities.length
    : 0
  const profileComplete = profileCompleteness?.isComplete ?? false

  const steps: Array<{ title: string; description: string; to: string; icon: React.ReactNode; condition: boolean }> = [
    {
      title: 'Complete Your Profile',
      description: 'Fill in your GPA, budget, and preferences for better matches',
      to: '/dashboard/profile',
      icon: <CheckCircle className="w-4 h-4" />,
      condition: !profileComplete,
    },
    {
      title: 'Search & Save Universities',
      description: 'Explore and save universities that match your criteria',
      to: '/search',
      icon: <ArrowRight className="w-4 h-4" />,
      condition: profileComplete && savedCount === 0,
    },
    {
      title: 'Compare Your Schools',
      description: `Compare your ${savedCount} saved ${savedCount === 1 ? 'school' : 'schools'} side-by-side`,
      to: '/compare',
      icon: <BarChart3 className="w-4 h-4" />,
      condition: profileComplete && savedCount >= 2,
    },
    {
      title: 'Launch Matching Engine',
      description: 'Discover universities you might not have considered',
      to: '/dashboard/matching-engine',
      icon: <Zap className="w-4 h-4" />,
      condition: profileComplete && savedCount >= 2,
    },
  ]

  const relevantSteps = steps.filter(s => s.condition)
  const primaryStep = relevantSteps[0]
  const secondarySteps = relevantSteps.slice(1, 3)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Next Steps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Primary CTA */}
        {primaryStep && (
          <Link to={primaryStep.to}>
            <Button variant="default" className="w-full justify-between group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
              <span className="flex items-center gap-2">
                {primaryStep.icon}
                {primaryStep.title}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        )}
        <p className="text-xs text-muted-foreground text-center">
          {primaryStep?.description}
        </p>

        {/* Divider */}
        {secondarySteps.length > 0 && <div className="my-2 border-t" />}

        {/* Secondary Options */}
        {secondarySteps.map((step, idx) => (
          <Link key={idx} to={step.to}>
            <Button variant="outline" className="w-full justify-start text-left h-auto py-3 px-4 flex-col items-start">
              <div className="flex items-center gap-2 w-full">
                {step.icon}
                <span className="font-medium text-sm">{step.title}</span>
              </div>
              <span className="text-xs text-muted-foreground mt-1 ml-6">{step.description}</span>
            </Button>
          </Link>
        ))}

        {/* Success State */}
        {!primaryStep && (
          <div className="text-center py-4 space-y-2">
            <CheckCircle className="w-8 h-8 mx-auto text-green-600" />
            <p className="text-sm font-semibold">You're All Set!</p>
            <p className="text-xs text-muted-foreground">
              Explore your saved universities or discover new matches.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
