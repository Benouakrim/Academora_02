import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileFormValues } from '@/lib/validations/profile'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { useUserStore } from '@/store/useUserStore'
import { Badge } from '@/components/ui/badge'
import { X, Plus, AlertTriangle, Upload, Loader2 } from 'lucide-react'
import ImageUpload from '@/components/common/ImageUpload'
import { useState, useEffect, useCallback } from 'react'

type Props = {
  initialData?: Record<string, any> | null
}

function TagInput({ 
  value = [], 
  onChange, 
  placeholder 
}: { 
  value: string[], 
  onChange: (val: string[]) => void, 
  placeholder: string 
}) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (input.trim() && !value.includes(input.trim())) {
        onChange([...value, input.trim()])
        setInput('')
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(tag => (
          <Badge key={tag} variant="secondary" className="px-2 py-1 text-sm gap-1">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" onClick={() => {
          if (input.trim() && !value.includes(input.trim())) {
            onChange([...value, input.trim()])
            setInput('')
          }
        }}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Press Enter to add</p>
    </div>
  )
}

export default function ProfileForm({ initialData }: Props) {
  const { fetchProfile } = useUserStore()
  const [showAccountTypeWarning, setShowAccountTypeWarning] = useState(false)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.profileImage || null)
  const [imageUploading, setImageUploading] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      gpa: initialData?.gpa ?? undefined,
      satScore: initialData?.satScore ?? undefined,
      actScore: initialData?.actScore ?? undefined,
      maxBudget: initialData?.financialProfile?.maxBudget ?? initialData?.maxBudget ?? 50000,
      householdIncome: initialData?.financialProfile?.householdIncome ?? undefined,
      familySize: initialData?.financialProfile?.familySize ?? undefined,
      savings: initialData?.financialProfile?.savings ?? undefined,
      investments: initialData?.financialProfile?.investments ?? undefined,
      expectedFamilyContribution: initialData?.financialProfile?.expectedFamilyContribution ?? undefined,
      eligibleForPellGrant: initialData?.financialProfile?.eligibleForPellGrant ?? false,
      eligibleForStateAid: initialData?.financialProfile?.eligibleForStateAid ?? false,
      preferredMajor: initialData?.preferredMajor ?? '',
      firstName: initialData?.firstName ?? '',
      lastName: initialData?.lastName ?? '',
      dreamJobTitle: initialData?.dreamJobTitle ?? '',
      careerGoals: initialData?.careerGoals ?? [],
      hobbies: initialData?.hobbies ?? [],
      preferredLearningStyle: initialData?.preferredLearningStyle ?? '',
      // Onboarding fields
      accountType: initialData?.accountType ?? undefined,
      personaRole: initialData?.personaRole ?? '',
      focusArea: initialData?.focusArea ?? '',
      primaryGoal: initialData?.primaryGoal ?? '',
      organizationName: initialData?.organizationName ?? '',
    },
  })

  const { isDirty } = form.formState

  // Handle unsaved changes warning on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty || profileImage) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, profileImage])

  // Handle image selection and validation
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    const maxSizeInBytes = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSizeInBytes) {
      toast.error('Image size must be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    setProfileImage(file)
  }, [])

  // Upload profile image
  const uploadProfileImage = useCallback(async () => {
    if (!profileImage) return

    try {
      setImageUploading(true)
      const formData = new FormData()
      formData.append('image', profileImage)

      const response = await api.post('/user/upload-profile-image', formData)

      setProfileImage(null)
      toast.success('Profile image uploaded successfully')
      await fetchProfile()

      return response.data
    } catch (error) {
      toast.error('Failed to upload image')
      console.error('Image upload error:', error)
    } finally {
      setImageUploading(false)
    }
  }, [profileImage, fetchProfile])

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSubmitting(true)

      // Update profile with new avatar URL if changed
      const updateData = {
        ...values,
        ...(imagePreview && imagePreview !== initialData?.profileImage ? { avatarUrl: imagePreview } : {})
      }

      // Update profile
      await api.patch('/user/profile', updateData)
      toast.success('Profile updated successfully', {
        description: 'All changes have been saved.',
      })
      
      form.reset(values)
      setProfileImage(null)
      await fetchProfile()
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile', {
        description: 'Please try again or contact support.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Account & Goals</CardTitle>
              <CardDescription>Update your account type and primary goals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image Upload Section */}
              <div className="space-y-3 pb-6 border-b">
                <label className="text-sm font-medium">Profile Picture</label>
                <ImageUpload 
                  value={imagePreview}
                  onChange={(url) => {
                    setImagePreview(url)
                    if (url) {
                      // For profile images, we'll need to update the user store
                      // The actual URL will be used directly
                    }
                  }}
                  type="image"
                  allowUrl={true}
                  maxSizeMB={5}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Account Type</label>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {form.watch('accountType') || 'Not Set'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your account type
                    </p>
                  </div>
                </div>
              </div>

              {form.watch('accountType') === 'INDIVIDUAL' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Persona / Role</label>
                    <Select 
                      value={form.watch('personaRole') || ''} 
                      onValueChange={(v) => form.setValue('personaRole', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                        <SelectItem value="CAREER_CHANGER">Career Changer</SelectItem>
                        <SelectItem value="PARENT">Parent</SelectItem>
                        <SelectItem value="EDUCATOR">Educator</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Helps us personalize recommendations
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Focus Area / Field of Interest</label>
                    <Input 
                      {...form.register('focusArea')} 
                      placeholder="e.g., Computer Science, Business, Medicine"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your primary academic or professional interest
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary Goal</label>
                    <Select 
                      value={form.watch('primaryGoal') || ''} 
                      onValueChange={(v) => form.setValue('primaryGoal', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your main goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIND_UNIVERSITY">Find the Right University</SelectItem>
                        <SelectItem value="FIND_FINANCIAL_AID">Find Financial Aid</SelectItem>
                        <SelectItem value="CAREER_MATCHING">Career Guidance</SelectItem>
                        <SelectItem value="COMPARE_OPTIONS">Compare Options</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      What you're primarily looking to achieve
                    </p>
                  </div>
                </>
              )}

              {form.watch('accountType') === 'ORGANIZATION' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization Name</label>
                  <Input 
                    {...form.register('organizationName')} 
                    placeholder="e.g., ABC High School"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your school, university, or organization name
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>About You</CardTitle>
              <CardDescription>Help universities understand who you are beyond grades.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dream Job Title</label>
                  <Input {...form.register('dreamJobTitle')} placeholder="e.g. AI Researcher" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Learning Style</label>
                  <Select 
                    value={form.watch('preferredLearningStyle') || ''} 
                    onValueChange={(v) => form.setValue('preferredLearningStyle', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Visual">Visual</SelectItem>
                      <SelectItem value="Auditory">Auditory</SelectItem>
                      <SelectItem value="Reading/Writing">Reading/Writing</SelectItem>
                      <SelectItem value="Kinesthetic">Kinesthetic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Career Goals</label>
                <TagInput 
                  value={form.watch('careerGoals') || []}
                  onChange={(tags) => form.setValue('careerGoals', tags)}
                  placeholder="Add a goal (e.g. Start a business)"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hobbies & Interests</label>
                <TagInput 
                  value={form.watch('hobbies') || []}
                  onChange={(tags) => form.setValue('hobbies', tags)}
                  placeholder="Add a hobby (e.g. Robotics Club)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unsaved Changes Warning */}
      {(isDirty || profileImage) && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              You have unsaved changes
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
              {profileImage ? 'Your profile image and other changes will be saved.' : 'Save your changes to apply them.'}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            form.reset()
            setProfileImage(null)
            setImagePreview(initialData?.profileImage || null)
          }}
          disabled={!isDirty && !profileImage}
        >
          Discard Changes
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || (!isDirty && !profileImage)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </Button>
      </div>

      {/* Unsaved Changes Dialog for Navigation */}
      <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in your profile. Are you sure you want to leave without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction>Discard Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}
