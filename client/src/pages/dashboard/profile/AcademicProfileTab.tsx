import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { GraduationCap, Plus } from 'lucide-react'
import { useAcademicProfile } from '@/hooks/useAcademicProfile'
import { useInitializeAcademicProfile } from '@/hooks/useAcademicProfileMutations'
import AcademicProfileForm from '@/components/profile/AcademicProfileForm'

export default function AcademicProfileTab() {
  const { data: profile, isLoading } = useAcademicProfile()
  const initializeProfile = useInitializeAcademicProfile()

  const handleInitialize = () => {
    initializeProfile.mutate()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Academic Profile Not Found
          </CardTitle>
          <CardDescription>
            Create your academic profile to get personalized university recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleInitialize} 
            disabled={initializeProfile.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            {initializeProfile.isPending ? 'Creating...' : 'Create Academic Profile'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const completeness = profile.completeness || 0

  return (
    <div className="space-y-6">
      {/* Completeness Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Profile Completeness</span>
            <Badge variant={completeness >= 70 ? 'default' : 'secondary'}>
              {completeness}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Academic Profile Form */}
      <AcademicProfileForm profile={profile} />
    </div>
  )
}
