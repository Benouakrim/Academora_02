import type { UseFormReturn } from 'react-hook-form'
import { GraduationCap, Briefcase, Users, BookOpen, FlaskConical } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import type { OnboardingFormValues } from '@/lib/validations/onboarding'
import { cn } from '@/lib/utils'

type PersonaRoleOnlyStepProps = {
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

export function PersonaRoleOnlyStep({ form }: PersonaRoleOnlyStepProps) {
  const selectedPersona = form.watch('personaRole')

  const handlePersonaSelect = (value: string) => {
    form.setValue('personaRole', value as 'STUDENT' | 'PROFESSIONAL' | 'PARENT' | 'COUNSELOR' | 'EDUCATOR' | 'RESEARCHER', { shouldValidate: true })
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tell us about yourself</h2>
        <p className="text-muted-foreground text-lg">
          Let's start with who you are
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
    </div>
  )
}
