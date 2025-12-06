import type { UseFormReturn } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OnboardingFormValues } from '@/lib/validations/onboarding'

type LocationAdditionalStepProps = {
  form: UseFormReturn<OnboardingFormValues>
}

const PREFERRED_STUDY_MODES = [
  { value: 'ON_CAMPUS', label: 'On Campus' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'NO_PREFERENCE', label: 'No Preference' },
]

export function LocationAdditionalStep({ form }: LocationAdditionalStepProps) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Almost there!</h2>
        <p className="text-muted-foreground text-lg">
          Just a few more details to personalize your experience
        </p>
      </div>

      {/* Location */}
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
        <p className="text-xs text-muted-foreground">
          This helps us show universities and opportunities near you
        </p>
      </div>

      {/* Phone Number */}
      <div className="space-y-3">
        <Label htmlFor="phoneNumber" className="text-base font-semibold">
          Phone Number <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="e.g., +1 (555) 123-4567"
          {...form.register('phoneNumber')}
          className="h-12"
        />
        <p className="text-xs text-muted-foreground">
          We may use this to send important notifications
        </p>
      </div>

      {/* Preferred Study Mode */}
      <div className="space-y-3">
        <Label htmlFor="preferredStudyMode" className="text-base font-semibold">
          Preferred Study Mode <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <Select
          value={form.watch('preferredStudyMode') || ''}
          onValueChange={(value) => form.setValue('preferredStudyMode', value as 'ON_CAMPUS' | 'ONLINE' | 'HYBRID' | 'NO_PREFERENCE')}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select your preferred study mode" />
          </SelectTrigger>
          <SelectContent>
            {PREFERRED_STUDY_MODES.map((mode) => (
              <SelectItem key={mode.value} value={mode.value}>
                {mode.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          This helps us match you with the right programs
        </p>
      </div>
    </div>
  )
}
