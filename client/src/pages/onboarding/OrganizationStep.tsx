import type { UseFormReturn } from 'react-hook-form'
import { Building2, Users, Target } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { OnboardingFormValues } from '@/lib/validations/onboarding'
import { useState } from 'react'

type OrganizationStepProps = {
  form: UseFormReturn<OnboardingFormValues>
}

const ORGANIZATION_TYPES = [
  { value: 'UNIVERSITY', label: 'University' },
  { value: 'COLLEGE', label: 'College' },
  { value: 'COMMUNITY_COLLEGE', label: 'Community College' },
  { value: 'VOCATIONAL_SCHOOL', label: 'Vocational School' },
  { value: 'RESEARCH_INSTITUTE', label: 'Research Institute' },
  { value: 'EDUCATION_COMPANY', label: 'Education Company' },
  { value: 'OTHER', label: 'Other' },
]

const SIZE_OPTIONS = [
  { value: 'SMALL', label: 'Small (< 1,000 students)' },
  { value: 'MEDIUM', label: 'Medium (1,000 - 10,000)' },
  { value: 'LARGE', label: 'Large (10,000 - 30,000)' },
  { value: 'VERY_LARGE', label: 'Very Large (> 30,000)' },
]

const GOAL_OPTIONS = [
  'Increase Visibility',
  'Recruit Students',
  'Manage Reviews',
  'Share Updates',
  'Connect with Alumni',
  'Research Collaboration',
]

export function OrganizationStep({ form }: OrganizationStepProps) {
  const selectedGoals = form.watch('goals') || []
  const [customGoal, setCustomGoal] = useState('')

  const handleGoalToggle = (goal: string) => {
    const current = selectedGoals
    if (current.includes(goal)) {
      form.setValue('goals', current.filter(g => g !== goal))
    } else {
      form.setValue('goals', [...current, goal])
    }
  }

  const handleAddCustomGoal = () => {
    if (customGoal.trim() && !selectedGoals.includes(customGoal.trim())) {
      form.setValue('goals', [...selectedGoals, customGoal.trim()])
      setCustomGoal('')
    }
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Organization Details</h2>
        <p className="text-muted-foreground text-lg">
          Help us understand your institution
        </p>
      </div>

      {/* Organization Name */}
      <div className="space-y-3">
        <Label htmlFor="organizationName" className="text-base font-semibold flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Organization Name *
        </Label>
        <Input
          id="organizationName"
          placeholder="e.g., Harvard University"
          {...form.register('organizationName')}
          className="h-12 text-base"
        />
        {form.formState.errors.organizationName && (
          <p className="text-sm text-destructive">
            {form.formState.errors.organizationName.message}
          </p>
        )}
      </div>

      {/* Organization Type */}
      <div className="space-y-3">
        <Label htmlFor="organizationType" className="text-base font-semibold flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Organization Type <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <Select
          value={form.watch('organizationType') || ''}
          onValueChange={(value) => form.setValue('organizationType', value)}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select organization type" />
          </SelectTrigger>
          <SelectContent>
            {ORGANIZATION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Size */}
      <div className="space-y-3">
        <Label htmlFor="size" className="text-base font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          Organization Size <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <Select
          value={form.watch('size') || ''}
          onValueChange={(value) => form.setValue('size', value)}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select size range" />
          </SelectTrigger>
          <SelectContent>
            {SIZE_OPTIONS.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Goals */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Target className="h-4 w-4" />
          Primary Goals <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((goal) => (
            <Badge
              key={goal}
              variant={selectedGoals.includes(goal) ? 'default' : 'outline'}
              className="cursor-pointer hover:opacity-80 transition-opacity px-3 py-1.5"
              onClick={() => handleGoalToggle(goal)}
            >
              {goal}
            </Badge>
          ))}
        </div>

        {/* Custom goal input */}
        <div className="flex gap-2 mt-3">
          <Input
            placeholder="Add custom goal"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomGoal())}
            className="h-10"
          />
          <button
            type="button"
            onClick={handleAddCustomGoal}
            className="px-4 text-sm font-medium hover:underline text-primary"
          >
            Add
          </button>
        </div>

        {/* Display selected custom goals */}
        {selectedGoals.filter(g => !GOAL_OPTIONS.includes(g)).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedGoals
              .filter(g => !GOAL_OPTIONS.includes(g))
              .map((goal) => (
                <Badge
                  key={goal}
                  variant="default"
                  className="cursor-pointer hover:opacity-80 transition-opacity px-3 py-1.5"
                  onClick={() => handleGoalToggle(goal)}
                >
                  {goal} ×
                </Badge>
              ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-muted/50 rounded-lg p-6 space-y-2">
        <h3 className="font-semibold text-sm">What's Next?</h3>
        <ul className="text-sm text-muted-foreground space-y-1.5">
          <li>• Access your organization dashboard</li>
          <li>• Claim and manage your institution profile</li>
          <li>• Engage with prospective students</li>
          <li>• Track analytics and insights</li>
        </ul>
      </div>
    </div>
  )
}
