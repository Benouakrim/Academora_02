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
import { X, Plus, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

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

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await api.patch('/user/profile', values)
      toast.success('Profile updated successfully')
      await fetchProfile()
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="academics" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Account & Goals</CardTitle>
              <CardDescription>Update your account type and primary goals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

        <TabsContent value="academics">
          <Card>
            <CardHeader>
              <CardTitle>Academic Profile</CardTitle>
              <CardDescription>Your stats help us find realistic matches.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">GPA (4.0 Scale)</label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...form.register('gpa', { valueAsNumber: true })} 
                    placeholder="3.8"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Intended Major</label>
                  <Input {...form.register('preferredMajor')} placeholder="Computer Science" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SAT Score</label>
                  <Input 
                    type="number" 
                    {...form.register('satScore', { valueAsNumber: true })} 
                    placeholder="1400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ACT Score</label>
                  <Input 
                    type="number" 
                    {...form.register('actScore', { valueAsNumber: true })} 
                    placeholder="32"
                  />
                </div>
              </div>
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

        <TabsContent value="financials">
          <Card>
            <CardHeader>
              <CardTitle>Financial Planning</CardTitle>
              <CardDescription>Used to calculate affordability scores and financial aid estimates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Max Annual Budget</label>
                  <span className="text-primary font-bold text-lg">
                    ${(form.watch('maxBudget') || 0).toLocaleString()}
                  </span>
                </div>
                <Slider
                  min={5000}
                  max={100000}
                  step={1000}
                  value={[form.watch('maxBudget') || 50000]}
                  onValueChange={(v) => form.setValue('maxBudget', v[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Includes tuition, room, board, and living expenses.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Household Income</label>
                  <Input 
                    type="number" 
                    {...form.register('householdIncome', { valueAsNumber: true })} 
                    placeholder="75000"
                  />
                  <p className="text-xs text-muted-foreground">Annual gross income</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Family Size</label>
                  <Input 
                    type="number" 
                    {...form.register('familySize', { valueAsNumber: true })} 
                    placeholder="4"
                  />
                  <p className="text-xs text-muted-foreground">Total household members</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Savings</label>
                  <Input 
                    type="number" 
                    {...form.register('savings', { valueAsNumber: true })} 
                    placeholder="25000"
                  />
                  <p className="text-xs text-muted-foreground">Available cash/savings</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Investments</label>
                  <Input 
                    type="number" 
                    {...form.register('investments', { valueAsNumber: true })} 
                    placeholder="50000"
                  />
                  <p className="text-xs text-muted-foreground">529, stocks, bonds, etc.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Expected Family Contribution (EFC)</label>
                  <Input 
                    type="number" 
                    {...form.register('expectedFamilyContribution', { valueAsNumber: true })} 
                    placeholder="12000"
                  />
                  <p className="text-xs text-muted-foreground">From FAFSA calculation</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="pellGrant"
                    {...form.register('eligibleForPellGrant')}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="pellGrant" className="text-sm font-medium cursor-pointer">
                    Eligible for Pell Grant
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="stateAid"
                    {...form.register('eligibleForStateAid')}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="stateAid" className="text-sm font-medium cursor-pointer">
                    Eligible for State Aid
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" size="lg" className="w-full md:w-auto">
          Save Profile
        </Button>
      </div>
    </form>
  )
}
