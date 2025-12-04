import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/useUserStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Clock, Edit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function OnboardingStatusWidget() {
  const navigate = useNavigate()
  const { profile } = useUserStore()

  if (!profile) return null

  const { onboarded, onboardingSkipped } = profile

  // Determine status
  let status: 'completed' | 'skipped' | 'incomplete'
  let statusIcon: React.ReactNode
  let statusBadge: React.ReactNode
  let actionButton: React.ReactNode

  if (onboarded) {
    // State: COMPLETED
    status = 'completed'
    statusIcon = <CheckCircle2 className="h-5 w-5 text-green-600" />
    statusBadge = <Badge variant="default" className="bg-green-600">Completed</Badge>
    actionButton = (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => navigate('/onboarding')}
        className="w-full"
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit Profile Data
      </Button>
    )
  } else if (onboardingSkipped) {
    // State: SKIPPED
    status = 'skipped'
    statusIcon = <Clock className="h-5 w-5 text-amber-600" />
    statusBadge = <Badge variant="secondary" className="bg-amber-100 text-amber-800">Skipped</Badge>
    actionButton = (
      <Button 
        variant="default" 
        size="sm" 
        onClick={() => navigate('/onboarding')}
        className="w-full"
      >
        Resume Onboarding
      </Button>
    )
  } else {
    // State: NOT_STARTED / INCOMPLETE
    status = 'incomplete'
    statusIcon = <AlertCircle className="h-5 w-5 text-blue-600" />
    statusBadge = <Badge variant="secondary" className="bg-blue-100 text-blue-800">Incomplete</Badge>
    actionButton = (
      <Button 
        variant="default" 
        size="sm" 
        onClick={() => navigate('/onboarding')}
        className="w-full"
      >
        Continue Onboarding
      </Button>
    )
  }

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Onboarding Status</h3>
        {statusIcon}
      </div>
      
      <div className="mb-4">
        {statusBadge}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {status === 'completed' && 'Your profile is complete! You can edit it anytime.'}
        {status === 'skipped' && 'Complete your profile to get personalized recommendations.'}
        {status === 'incomplete' && 'Complete your profile to unlock all features.'}
      </p>

      {actionButton}
    </Card>
  )
}
