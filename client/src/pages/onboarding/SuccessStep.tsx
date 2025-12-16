import type { UseFormReturn } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { 
  Rocket, 
  DollarSign, 
  Target, 
  Search, 
  Scale, 
  Users, 
  BookOpen,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { OnboardingFormValues } from '@/lib/validations/onboarding'
import { useUser } from '@clerk/clerk-react'
import { useOnboardingStore } from '@/store/useOnboardingStore'

type SuccessStepProps = {
  form: UseFormReturn<OnboardingFormValues>
  isSubmitting?: boolean
}

const GOAL_CONFIG = {
  FIND_FINANCIAL_AID: {
    title: 'Discover Financial Aid Opportunities',
    description: 'Let us help you find scholarships and funding options tailored to your profile',
    icon: DollarSign,
    ctaText: 'Explore Financial Aid',
    ctaLink: '/dashboard/matching-engine?focus=aid',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  CAREER_MATCHING: {
    title: 'Find Your Perfect Career Path',
    description: 'Match with universities and programs aligned with your career goals',
    icon: Target,
    ctaText: 'Start Career Matching',
    ctaLink: '/dashboard/matching-engine',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  UNIVERSITY_DISCOVERY: {
    title: 'Discover Universities',
    description: 'Explore thousands of universities and find your perfect match',
    icon: Search,
    ctaText: 'Browse Universities',
    ctaLink: '/search',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  COMPARE_UNIVERSITIES: {
    title: 'Compare Universities',
    description: 'Make informed decisions by comparing universities side-by-side',
    icon: Scale,
    ctaText: 'Start Comparing',
    ctaLink: '/compare',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  NETWORK_BUILDING: {
    title: 'Build Your Network',
    description: 'Connect with students, alumni, and professionals',
    icon: Users,
    ctaText: 'Explore Community',
    ctaLink: '/dashboard', // Changed from /groups - feature hidden for launch
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  RESEARCH: {
    title: 'Access Educational Resources',
    description: 'Dive into articles, guides, and expert insights',
    icon: BookOpen,
    ctaText: 'Read Articles',
    ctaLink: '/blog',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
  OTHER: {
    title: 'Explore Academora',
    description: 'Start your journey with personalized recommendations',
    icon: Sparkles,
    ctaText: 'Go to Dashboard',
    ctaLink: '/dashboard',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
}

export function SuccessStep({ form, isSubmitting }: SuccessStepProps) {
  const navigate = useNavigate()
  const { user } = useUser()
  const { reset: resetOnboardingStore } = useOnboardingStore()
  const primaryGoal = form.watch('primaryGoal') || 'OTHER'
  const goalConfig = GOAL_CONFIG[primaryGoal as keyof typeof GOAL_CONFIG] || GOAL_CONFIG.OTHER
  
  const GoalIcon = goalConfig.icon
  const firstName = user?.firstName || 'there'

  const handleContinue = () => {
    // Reset the onboarding store before navigating away
    resetOnboardingStore()
    console.log('[Onboarding] Store reset - navigating to:', goalConfig.ctaLink)
    navigate(goalConfig.ctaLink)
  }

  const handleQuickNavigate = (path: string) => {
    // Reset the onboarding store before navigating away
    resetOnboardingStore()
    navigate(path)
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto text-center">
      {/* Celebration Animation Area */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-32 w-32 rounded-full bg-primary/20 animate-ping" />
        </div>
        <div className="relative flex items-center justify-center">
          <div className={`h-24 w-24 rounded-full ${goalConfig.bgColor} flex items-center justify-center`}>
            <Rocket className="h-12 w-12 text-primary animate-bounce" />
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Welcome to Academora, {firstName}! 🎉
        </h1>
        <p className="text-xl text-muted-foreground">
          Your profile is all set up. Let's start your journey!
        </p>
      </div>

      {/* Goal-based CTA Card */}
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-8 pb-8 space-y-6">
          <div className={`mx-auto w-16 h-16 rounded-full ${goalConfig.bgColor} flex items-center justify-center`}>
            <GoalIcon className={`h-8 w-8 ${goalConfig.color}`} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">{goalConfig.title}</h3>
            <p className="text-muted-foreground">{goalConfig.description}</p>
          </div>

          <Button
            size="lg"
            onClick={handleContinue}
            disabled={isSubmitting}
            className="w-full md:w-auto px-8 text-base gap-2"
          >
            {goalConfig.ctaText}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col gap-2"
          onClick={() => handleQuickNavigate('/dashboard')}
        >
          <Target className="h-5 w-5" />
          <span className="text-xs">Dashboard</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col gap-2"
          onClick={() => handleQuickNavigate('/search')}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs">Search</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col gap-2"
          onClick={() => handleQuickNavigate('/dashboard/saved')}
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-xs">My List</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col gap-2"
          onClick={() => handleQuickNavigate('/dashboard/profile')}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs">Profile</span>
        </Button>
      </div>

      {/* Pro Tip */}
      <div className="bg-muted/50 rounded-lg p-6 text-left space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Pro Tip</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete your profile in the Settings to get even better recommendations. 
          Add your academic stats, interests, and preferences to unlock the full power of our matching engine!
        </p>
      </div>
    </div>
  )
}
