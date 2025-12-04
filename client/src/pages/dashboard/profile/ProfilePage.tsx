import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useUserStore } from '@/store/useUserStore'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, GraduationCap, DollarSign } from 'lucide-react'
import ProfileForm from './ProfileForm'
import AcademicProfileTab from './AcademicProfileTab'
import FinancialProfileTab from './FinancialProfileTab'

export default function ProfilePage() {
  const { profile, isLoading, error, fetchProfile } = useUserStore()
  const { isSignedIn } = useAuth()

  useEffect(() => {
    if (isSignedIn && !profile && !isLoading && !error) {
      fetchProfile()
    }
  }, [isSignedIn, profile, isLoading, error, fetchProfile])

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Your Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal, academic, and financial information
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      )}

      {!isLoading && (
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="academic" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Academic</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Financial</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <ProfileForm initialData={profile || undefined} />
          </TabsContent>

          <TabsContent value="academic">
            <AcademicProfileTab />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialProfileTab />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
