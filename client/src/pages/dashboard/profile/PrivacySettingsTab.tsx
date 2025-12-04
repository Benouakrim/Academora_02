import { useState } from 'react'
import { usePrivacySettings, useUpdatePrivacySettings, useCheckUsernameAvailability } from '@/hooks/usePrivacySettings'
import type { ProfileVisibilitySettings } from '@/hooks/usePublicProfile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Toggle } from '@/components/ui/toggle'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Lock, Globe, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { debounce } from '@/lib/utils'

export default function PrivacySettingsTab() {
  const { data: settings, isLoading, error } = usePrivacySettings()
  const { mutate: updatePrivacy, isPending: isUpdating } = useUpdatePrivacySettings()
  const { mutate: checkUsername } = useCheckUsernameAvailability()

  const [username, setUsername] = useState(() => settings?.username || '')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameError, setUsernameError] = useState('')
  const [usernameCheckPending, setUsernameCheckPending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [profileVisibility, setProfileVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY'>(() => settings?.profileVisibility || 'PRIVATE')
  const [profileSettings, setProfileSettings] = useState<ProfileVisibilitySettings>(() => settings?.profileSettings || {
      showEmail: false,
      showTestScores: false,
      showBadges: true,
      showAcademicInfo: true,
      showSavedCount: true,
      showReviews: true,
      showArticles: true,
      showHobbies: true,
      showLanguages: true,
      showCareerGoals: true,
    }
  )
  const [showPublishDialog, setShowPublishDialog] = useState(false)

  const validateUsername = (value: string) => {
    if (!value) {
      setUsernameError('Username is required')
      setUsernameAvailable(null)
      return
    }

    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
    if (!usernameRegex.test(value)) {
      setUsernameError('Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens')
      setUsernameAvailable(null)
      return
    }

    setUsernameError('')
    debouncedCheckUsername(value)
  }

  const debouncedCheckUsername = debounce((value: string) => {
    setUsernameCheckPending(true)
    checkUsername(value, {
      onSuccess: (data) => {
        setUsernameAvailable(data.available)
        if (!data.available) {
          setUsernameError('Username already taken')
        }
        setUsernameCheckPending(false)
      },
      onError: (error: Error) => {
        console.error('Username check error:', error)
        setUsernameCheckPending(false)
      },
    })
  }, 500)

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    validateUsername(value)
  }

  const handleToggleSetting = (key: keyof typeof profileSettings) => {
    setProfileSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSaveChanges = () => {
    if (!username) {
      toast.error('Username is required')
      return
    }

    if (!usernameAvailable && username !== settings?.username) {
      toast.error('Username is not available')
      return
    }

    updatePrivacy(
      {
        username,
        profileVisibility,
        profileSettings,
      },
      {
        onSuccess: () => {
          toast.success('Privacy settings updated successfully')
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to update privacy settings')
        },
      }
    )
  }

  const handlePublishProfile = () => {
    if (profileVisibility === 'PUBLIC') {
      toast.success('Your profile is now public!')
    } else {
      updatePrivacy(
        {
          profileVisibility: 'PUBLIC',
          profileSettings,
        },
        {
          onSuccess: () => {
            setProfileVisibility('PUBLIC')
            setShowPublishDialog(false)
            toast.success('Your profile is now public!')
            copyProfileUrl()
          },
        }
      )
    }
  }

  const profileUrl = username ? `${window.location.origin}/@${username}` : ''

  const copyProfileUrl = () => {
    if (profileUrl) {
      navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load privacy settings</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Username & Profile Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Public Profile
          </CardTitle>
          <CardDescription>
            Create your unique public profile URL that you can share with others
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="your_username"
                  className="pl-7"
                  disabled={isUpdating}
                />
                {usernameCheckPending && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                    Checking...
                  </span>
                )}
                {usernameAvailable === true && !usernameCheckPending && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-green-600">
                    ✓ Available
                  </span>
                )}
              </div>
            </div>
            {usernameError && (
              <p className="text-xs text-destructive">{usernameError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              3-20 characters, letters, numbers, underscores, and hyphens only
            </p>
          </div>

          {username && usernameAvailable === true && (
            <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
              <span className="text-sm flex-1 break-all">{profileUrl}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyProfileUrl}
                className="flex-shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Profile Visibility
          </CardTitle>
          <CardDescription>
            Control who can see your public profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              onClick={() => setProfileVisibility('PUBLIC')}
              className={cn(
                'p-4 border-2 rounded-lg cursor-pointer transition-colors',
                profileVisibility === 'PUBLIC'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Public</p>
                  <p className="text-xs text-muted-foreground">
                    Anyone can view your profile
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setProfileVisibility('PRIVATE')}
              className={cn(
                'p-4 border-2 rounded-lg cursor-pointer transition-colors',
                profileVisibility === 'PRIVATE'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Private</p>
                  <p className="text-xs text-muted-foreground">
                    Only you can view your profile
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What to Show */}
      {profileVisibility === 'PUBLIC' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              What to Show in Your Public Profile
            </CardTitle>
            <CardDescription>
              Choose which information visitors can see. Sensitive data like financial information is always hidden.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Academic Information */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <span>Academic Information</span>
                <Badge variant="secondary" className="text-xs">Default Visible</Badge>
              </h3>
              <div className="space-y-2 ml-4">
                <div className="flex items-center justify-between p-2 rounded hover:bg-secondary transition-colors">
                  <div>
                    <p className="text-sm font-medium">GPA & Academic Stats</p>
                    <p className="text-xs text-muted-foreground">Major, GPA, focus area</p>
                  </div>
                  <Toggle
                    pressed={profileSettings.showAcademicInfo}
                    onPressedChange={() => handleToggleSetting('showAcademicInfo')}
                    className="h-8 px-2"
                  >
                    {profileSettings.showAcademicInfo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Toggle>
                </div>

                <div className="flex items-center justify-between p-2 rounded hover:bg-secondary transition-colors">
                  <div>
                    <p className="text-sm font-medium">Test Scores</p>
                    <p className="text-xs text-muted-foreground">SAT, ACT, GRE scores</p>
                  </div>
                  <Toggle
                    pressed={profileSettings.showTestScores}
                    onPressedChange={() => handleToggleSetting('showTestScores')}
                    className="h-8 px-2"
                  >
                    {profileSettings.showTestScores ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Toggle>
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <span>Personal Information</span>
                <Badge variant="secondary" className="text-xs">Default Visible</Badge>
              </h3>
              <div className="space-y-2 ml-4">
                <div className="flex items-center justify-between p-2 rounded hover:bg-secondary transition-colors">
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-xs text-muted-foreground">Your email address</p>
                  </div>
                  <Toggle
                    pressed={profileSettings.showEmail}
                    onPressedChange={() => handleToggleSetting('showEmail')}
                    className="h-8 px-2"
                  >
                    {profileSettings.showEmail ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Toggle>
                </div>

                <div className="flex items-center justify-between p-2 rounded hover:bg-secondary transition-colors">
                  <div>
                    <p className="text-sm font-medium">Hobbies & Interests</p>
                    <p className="text-xs text-muted-foreground">Your hobbies and interests</p>
                  </div>
                  <Toggle
                    pressed={profileSettings.showHobbies}
                    onPressedChange={() => handleToggleSetting('showHobbies')}
                    className="h-8 px-2"
                  >
                    {profileSettings.showHobbies ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Toggle>
                </div>

                <div className="flex items-center justify-between p-2 rounded hover:bg-secondary transition-colors">
                  <div>
                    <p className="text-sm font-medium">Languages</p>
                    <p className="text-xs text-muted-foreground">Languages you speak</p>
                  </div>
                  <Toggle
                    pressed={profileSettings.showLanguages}
                    onPressedChange={() => handleToggleSetting('showLanguages')}
                    className="h-8 px-2"
                  >
                    {profileSettings.showLanguages ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Toggle>
                </div>

                <div className="flex items-center justify-between p-2 rounded hover:bg-secondary transition-colors">
                  <div>
                    <p className="text-sm font-medium">Career Goals</p>
                    <p className="text-xs text-muted-foreground">Your career aspirations</p>
                  </div>
                  <Toggle
                    pressed={profileSettings.showCareerGoals}
                    onPressedChange={() => handleToggleSetting('showCareerGoals')}
                    className="h-8 px-2"
                  >
                    {profileSettings.showCareerGoals ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Toggle>
                </div>
              </div>
            </div>

            <Separator />

            {/* Achievements & Activity */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <span>Achievements & Activity</span>
                <Badge variant="secondary" className="text-xs">Default Visible</Badge>
              </h3>
              <div className="space-y-2 ml-4">
                <div className="flex items-center justify-between p-2 rounded hover:bg-secondary transition-colors">
                  <div>
                    <p className="text-sm font-medium">Badges</p>
                    <p className="text-xs text-muted-foreground">Your earned badges</p>
                  </div>
                  <Toggle
                    pressed={profileSettings.showBadges}
                    onPressedChange={() => handleToggleSetting('showBadges')}
                    className="h-8 px-2"
                  >
                    {profileSettings.showBadges ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Toggle>
                </div>

                <div className="flex items-center justify-between p-2 rounded hover:bg-secondary transition-colors">
                  <div>
                    <p className="text-sm font-medium">Recent Reviews</p>
                    <p className="text-xs text-muted-foreground">Reviews you've written</p>
                  </div>
                  <Toggle
                    pressed={profileSettings.showReviews}
                    onPressedChange={() => handleToggleSetting('showReviews')}
                    className="h-8 px-2"
                  >
                    {profileSettings.showReviews ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Toggle>
                </div>

                <div className="flex items-center justify-between p-2 rounded hover:bg-secondary transition-colors">
                  <div>
                    <p className="text-sm font-medium">Recent Articles</p>
                    <p className="text-xs text-muted-foreground">Articles you've published</p>
                  </div>
                  <Toggle
                    pressed={profileSettings.showArticles}
                    onPressedChange={() => handleToggleSetting('showArticles')}
                    className="h-8 px-2"
                  >
                    {profileSettings.showArticles ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Toggle>
                </div>

                <div className="flex items-center justify-between p-2 rounded hover:bg-secondary transition-colors">
                  <div>
                    <p className="text-sm font-medium">Saved Universities Count</p>
                    <p className="text-xs text-muted-foreground">How many universities you saved</p>
                  </div>
                  <Toggle
                    pressed={profileSettings.showSavedCount}
                    onPressedChange={() => handleToggleSetting('showSavedCount')}
                    className="h-8 px-2"
                  >
                    {profileSettings.showSavedCount ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Toggle>
                </div>
              </div>
            </div>

            <Separator />

            <div className="p-3 bg-info/5 border border-info/20 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Always Hidden:</strong> Email (if toggled), financial information, test scores (unless enabled), and sensitive personal data are never shared without your consent.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4">
        <Button variant="outline">Cancel</Button>
        <Button
          onClick={handleSaveChanges}
          disabled={isUpdating || usernameError !== '' || (username !== settings?.username && usernameAvailable !== true)}
        >
          {isUpdating ? 'Saving...' : 'Save Privacy Settings'}
        </Button>
        {profileVisibility !== 'PUBLIC' && (
          <Button
            onClick={() => setShowPublishDialog(true)}
            disabled={isUpdating || usernameError !== '' || (username !== settings?.username && usernameAvailable !== true)}
            variant="default"
          >
            Publish Profile
          </Button>
        )}
      </div>

      {/* Publish Profile Dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Make Profile Public?</AlertDialogTitle>
            <AlertDialogDescription>
              Your profile will be visible to everyone. You can change this anytime in your privacy settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 p-3 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">Profile URL:</p>
            <p className="text-sm font-medium break-all">{profileUrl}</p>
          </div>
          <AlertDialogAction onClick={handlePublishProfile}>
            Yes, Make it Public
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
