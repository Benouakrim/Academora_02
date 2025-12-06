import type { UseFormReturn } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { OnboardingFormValues } from '@/lib/validations/onboarding'
import { useState } from 'react'

type AcademicInterestsStepProps = {
  form: UseFormReturn<OnboardingFormValues>
}

const INTEREST_OPTIONS = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Environment',
  'Arts & Culture', 'Sports', 'Research', 'Entrepreneurship', 'Social Impact'
]

export function AcademicInterestsStep({ form }: AcademicInterestsStepProps) {
  const selectedInterests = form.watch('interests') || []
  const [customInterest, setCustomInterest] = useState('')

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
        <h2 className="text-3xl font-bold tracking-tight">Academic details</h2>
        <p className="text-muted-foreground text-lg">
          Share your academic level and interests
        </p>
      </div>

      {/* Academic Level */}
      <div className="space-y-3">
        <Label htmlFor="academicLevel" className="text-base font-semibold">
          Academic Level <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <Input
          id="academicLevel"
          placeholder="e.g., High School Senior, College Sophomore, Graduate Student"
          {...form.register('academicLevel')}
          className="h-12"
        />
        <p className="text-xs text-muted-foreground">
          This helps us provide more relevant recommendations
        </p>
      </div>

      {/* Interests */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Interests <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Select all that apply or add your own
        </p>
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
        <div className="flex gap-2 mt-4">
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
    </div>
  )
}
