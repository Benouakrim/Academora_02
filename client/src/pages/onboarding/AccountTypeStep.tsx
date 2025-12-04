import type { UseFormReturn } from 'react-hook-form'
import { Building2, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import type { OnboardingFormValues } from '@/lib/validations/onboarding'
import { cn } from '@/lib/utils'

type AccountTypeStepProps = {
  form: UseFormReturn<OnboardingFormValues>
}

export function AccountTypeStep({ form }: AccountTypeStepProps) {
  const accountType = form.watch('accountType')

  const handleSelect = (type: 'INDIVIDUAL' | 'ORGANIZATION') => {
    form.setValue('accountType', type, { shouldValidate: true })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Welcome to Academora</h2>
        <p className="text-muted-foreground text-lg">
          Let's get started by understanding who you are
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Individual Card */}
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-lg border-2',
            accountType === 'INDIVIDUAL'
              ? 'border-primary shadow-md scale-[1.02]'
              : 'border-muted hover:border-primary/50'
          )}
          onClick={() => handleSelect('INDIVIDUAL')}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Individual</CardTitle>
            <CardDescription className="text-base">
              Student, parent, or professional
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <ul className="space-y-2 text-left">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Find universities that match your goals</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Discover financial aid opportunities</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Compare schools and track applications</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Organization Card */}
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-lg border-2',
            accountType === 'ORGANIZATION'
              ? 'border-primary shadow-md scale-[1.02]'
              : 'border-muted hover:border-primary/50'
          )}
          onClick={() => handleSelect('ORGANIZATION')}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Organization</CardTitle>
            <CardDescription className="text-base">
              University or educational institution
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <ul className="space-y-2 text-left">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Manage your institution's profile</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Respond to reviews and engage students</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Access analytics and insights</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Hidden input for form validation */}
      <input type="hidden" {...form.register('accountType')} />
      
      {form.formState.errors.accountType && (
        <p className="text-sm text-destructive text-center">
          {form.formState.errors.accountType.message}
        </p>
      )}
    </div>
  )
}
