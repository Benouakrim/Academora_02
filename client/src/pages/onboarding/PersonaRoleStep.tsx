import type { UseFormReturn } from 'react-hook-form'
import { GraduationCap, Briefcase, Users, BookOpen, FlaskConical, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { OnboardingFormValues } from '@/lib/validations/onboarding'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type PersonaRoleStepProps = {
  form: UseFormReturn<OnboardingFormValues>
}

const PERSONA_ROLES = [
  { value: 'STUDENT', label: 'Student', icon: GraduationCap, description: 'Currently studying or planning to study' },
  { value: 'PROFESSIONAL', label: 'Professional', icon: Briefcase, description: 'Working or career-focused' },
  { value: 'PARENT', label: 'Parent', icon: Users, description: 'Helping your child with education' },
  { value: 'COUNSELOR', label: 'Counselor', icon: BookOpen, description: 'Guiding students in their journey' },
  { value: 'EDUCATOR', label: 'Educator', icon: BookOpen, description: 'Teaching and mentoring' },
  { value: 'RESEARCHER', label: 'Researcher', icon: FlaskConical, description: 'Academic research' },
]

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

const INTEREST_OPTIONS = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Environment',
  'Arts & Culture', 'Sports', 'Research', 'Entrepreneurship', 'Social Impact'
]

export function PersonaRoleStep({ form }: PersonaRoleStepProps) {
  const selectedPersona = form.watch('personaRole')
  const selectedInterests = form.watch('interests') || []
  
  const [customInterest, setCustomInterest] = useState('')

  const handlePersonaSelect = (value: string) => {
    form.setValue('personaRole', value as any, { shouldValidate: true })
  }

  const handleInterestToggle = (interest: string) => {
    const current = selectedInterests
    if (current.includes(interest)) {
      form.setValue('interests', current.filter(i => i !== interest))
    } else {
      form.setValue('interests', [...current, interest])
    }
  }

  const handleAddCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      form.setValue('interests', [...selectedInterests, customInterest.trim()])
      setCustomInterest('')
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tell us about yourself</h2>
        <p className="text-muted-foreground text-lg">
          This helps us personalize your experience
        </p>
      </div>

      {/* Persona Role Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">I am a...</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PERSONA_ROLES.map((persona) => {
            const Icon = persona.icon
            return (
              <Card
                key={persona.value}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md border-2',
                  selectedPersona === persona.value
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                )}
                onClick={() => handlePersonaSelect(persona.value)}
              >
                <CardContent className="p-4 text-center space-y-2">
                  <Icon className={cn(
                    'h-8 w-8 mx-auto',
                    selectedPersona === persona.value ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{persona.label}</p>
                    <p className="text-xs text-muted-foreground">{persona.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        {form.formState.errors.personaRole && (
          <p className="text-sm text-destructive">{form.formState.errors.personaRole.message}</p>
        )}
      </div>

      {/* Focus Area */}
      <div className="space-y-3">
        <Label htmlFor="focusArea" className="text-base font-semibold">
          Primary Focus Area
        </Label>
        <Select
          value={form.watch('focusArea') || ''}
          onValueChange={(value) => form.setValue('focusArea', value as any, { shouldValidate: true })}
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
              onClick={() => form.setValue('primaryGoal', goal.value as any, { shouldValidate: true })}
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

      {/* Optional: Academic Level */}
      <div className="space-y-3">
        <Label htmlFor="academicLevel" className="text-base font-semibold">
          Academic Level <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <Input
          id="academicLevel"
          placeholder="e.g., High School Senior, College Sophomore"
          {...form.register('academicLevel')}
          className="h-12"
        />
      </div>

      {/* Optional: Interests */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Interests <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => (
            <Badge
              key={interest}
              variant={selectedInterests.includes(interest) ? 'default' : 'outline'}
              className="cursor-pointer hover:opacity-80 transition-opacity px-3 py-1.5"
              onClick={() => handleInterestToggle(interest)}
            >
              {interest}
            </Badge>
          ))}
        </div>
        
        {/* Custom interest input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom interest"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomInterest())}
            className="h-10"
          />
          <button
            type="button"
            onClick={handleAddCustomInterest}
            className="px-4 text-sm font-medium hover:underline text-primary"
          >
            Add
          </button>
        </div>

        {/* Display selected custom interests */}
        {selectedInterests.filter(i => !INTEREST_OPTIONS.includes(i)).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedInterests
              .filter(i => !INTEREST_OPTIONS.includes(i))
              .map((interest) => (
                <Badge
                  key={interest}
                  variant="default"
                  className="cursor-pointer hover:opacity-80 transition-opacity px-3 py-1.5"
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest} ×
                </Badge>
              ))}
          </div>
        )}
      </div>

      {/* Optional: Location */}
      <div className="space-y-3">
        <Label htmlFor="location" className="text-base font-semibold">
          Location <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <Input
          id="location"
          placeholder="e.g., New York, USA"
          {...form.register('location')}
          className="h-12"
        />
      </div>
    </div>
  )
}
