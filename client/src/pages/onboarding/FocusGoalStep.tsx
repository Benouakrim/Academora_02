import type { UseFormReturn } from 'react-hook-form'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OnboardingFormValues } from '@/lib/validations/onboarding'
import { cn } from '@/lib/utils'

type FocusGoalStepProps = {
  form: UseFormReturn<OnboardingFormValues>
}

const FOCUS_AREAS = [
  { value: 'COMPUTER_SCIENCE', label: 'Computer Science' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'ENGINEERING', label: 'Engineering' },
  { value: 'MEDICINE', label: 'Medicine' },
  { value: 'LAW', label: 'Law' },
  { value: 'ARTS', label: 'Arts' },
  { value: 'SCIENCES', label: 'Sciences' },
  { value: 'HUMANITIES', label: 'Humanities' },
  { value: 'SOCIAL_SCIENCES', label: 'Social Sciences' },
  { value: 'OTHER', label: 'Other' },
]

const PRIMARY_GOALS = [
  { value: 'FIND_FINANCIAL_AID', label: 'Find Financial Aid', icon: '💰' },
  { value: 'CAREER_MATCHING', label: 'Career Matching', icon: '🎯' },
  { value: 'UNIVERSITY_DISCOVERY', label: 'Discover Universities', icon: '🔍' },
  { value: 'COMPARE_UNIVERSITIES', label: 'Compare Universities', icon: '⚖️' },
  { value: 'NETWORK_BUILDING', label: 'Network Building', icon: '🤝' },
  { value: 'RESEARCH', label: 'Research', icon: '📚' },
  { value: 'OTHER', label: 'Other', icon: '✨' },
]

export function FocusGoalStep({ form }: FocusGoalStepProps) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">What's your focus?</h2>
        <p className="text-muted-foreground text-lg">
          Tell us about your primary interests and goals
        </p>
      </div>

      {/* Focus Area */}
      <div className="space-y-3">
        <Label htmlFor="focusArea" className="text-base font-semibold">
          Primary Focus Area
        </Label>
        <Select
          value={form.watch('focusArea') || ''}
          onValueChange={(value) => form.setValue('focusArea', value as 'COMPUTER_SCIENCE' | 'BUSINESS' | 'ENGINEERING' | 'MEDICINE' | 'LAW' | 'ARTS' | 'SCIENCES' | 'HUMANITIES' | 'SOCIAL_SCIENCES' | 'OTHER', { shouldValidate: true })}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select your area of interest" />
          </SelectTrigger>
          <SelectContent>
            {FOCUS_AREAS.map((area) => (
              <SelectItem key={area.value} value={area.value}>
                {area.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.focusArea && (
          <p className="text-sm text-destructive">{form.formState.errors.focusArea.message}</p>
        )}
      </div>

      {/* Primary Goal */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Primary Goal</Label>
        <p className="text-sm text-muted-foreground mb-4">
          What are you hoping to achieve with Academora?
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PRIMARY_GOALS.map((goal) => (
            <Card
              key={goal.value}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md border-2',
                form.watch('primaryGoal') === goal.value
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              )}
              onClick={() => form.setValue('primaryGoal', goal.value as 'FIND_FINANCIAL_AID' | 'CAREER_MATCHING' | 'UNIVERSITY_DISCOVERY' | 'COMPARE_UNIVERSITIES' | 'NETWORK_BUILDING' | 'RESEARCH' | 'OTHER', { shouldValidate: true })}
            >
              <CardContent className="p-4 text-center space-y-2">
                <span className="text-2xl">{goal.icon}</span>
                <p className="font-medium text-sm">{goal.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {form.formState.errors.primaryGoal && (
          <p className="text-sm text-destructive">{form.formState.errors.primaryGoal.message}</p>
        )}
      </div>
    </div>
  )
}
