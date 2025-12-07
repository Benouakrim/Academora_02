import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOnboardingStore } from '@/store/useOnboardingStore'
import { useCompleteOnboarding, useUpdateOnboarding } from '@/hooks/useOnboarding'
import { useUserStore } from '@/store/useUserStore'
import { api } from '@/lib/api'
import {
  onboardingFormSchema,
  transformToPayload,
  type OnboardingFormValues,
} from '@/lib/validations/onboarding'
import { AccountTypeStep } from './onboarding/AccountTypeStep'
import { PersonaRoleOnlyStep } from './onboarding/PersonaRoleOnlyStep'
import { FocusGoalStep } from './onboarding/FocusGoalStep'
import { AcademicInterestsStep } from './onboarding/AcademicInterestsStep'
import { LocationAdditionalStep } from './onboarding/LocationAdditionalStep'
import { OrganizationStep } from './onboarding/OrganizationStep'
import { SuccessStep } from './onboarding/SuccessStep'
import { toast } from 'sonner'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { profile, fetchProfile } = useUserStore()
  const [isSkipping, setIsSkipping] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  
  const {
    currentStep,
    totalSteps,
    formData,
    nextStep,
    prevStep,
    updateFormData,
  } = useOnboardingStore()

  const completeOnboardingMutation = useCompleteOnboarding()
  const updateOnboardingMutation = useUpdateOnboarding()

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: formData,
    mode: 'onChange',
  })

  const accountType = form.watch('accountType')

  // Load existing onboarding data if user is editing or resuming
  useEffect(() => {
    const loadExistingData = async () => {
      if (!profile) {
        setIsLoadingData(false)
        return
      }

      // If user has completed onboarding or has existing answers, pre-populate
      if (profile.onboarded || profile.onboardingAnswers) {
        setIsEditMode(true)
        try {
          const existingData = profile.onboardingAnswers?.answers || {}
          
          // Map existing data to form
          const formValues: Partial<OnboardingFormValues> = {
            accountType: (profile.accountType || existingData.accountType) as 'INDIVIDUAL' | 'ORGANIZATION',
          }

          if (profile.accountType === 'INDIVIDUAL') {
            formValues.personaRole = (profile.personaRole || existingData.personaRole) as 'STUDENT' | 'PROFESSIONAL' | 'PARENT' | 'COUNSELOR' | 'EDUCATOR' | 'RESEARCHER'
            formValues.focusArea = (profile.focusArea || existingData.focusArea) as 'COMPUTER_SCIENCE' | 'BUSINESS' | 'ENGINEERING' | 'MEDICINE' | 'LAW' | 'ARTS' | 'SCIENCES' | 'HUMANITIES' | 'SOCIAL_SCIENCES' | 'OTHER'
            formValues.primaryGoal = (profile.primaryGoal || existingData.primaryGoal) as 'FIND_FINANCIAL_AID' | 'CAREER_MATCHING' | 'UNIVERSITY_DISCOVERY' | 'COMPARE_UNIVERSITIES' | 'NETWORK_BUILDING' | 'RESEARCH' | 'OTHER'
          } else if (profile.accountType === 'ORGANIZATION') {
            formValues.organizationName = profile.organizationName || existingData.organizationName
          }

          // Update form and store with existing data
          form.reset(formValues as OnboardingFormValues)
          updateFormData(formValues)
          
          console.log('[OnboardingPage] Loaded existing data for editing/resume:', formValues)
        } catch (error) {
          console.error('[OnboardingPage] Error loading existing data:', error)
        }
      }
      
      setIsLoadingData(false)
    }

    loadExistingData()
  }, [profile, form, updateFormData])

  // Sync form data with store on changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData(value as Partial<OnboardingFormValues>)
    })
    return () => subscription.unsubscribe()
  }, [form, updateFormData])

  // Update total steps based on account type
  useEffect(() => {
    if (accountType === 'ORGANIZATION') {
      // Step 0: Account Type, Step 1: Organization Details, Step 2: Success
      useOnboardingStore.setState({ totalSteps: 3 })
    } else {
      // Step 0: Account Type, Steps 1-4: Individual Details, Step 5: Success
      useOnboardingStore.setState({ totalSteps: 6 })
    }
  }, [accountType])

  const handleSkip = async () => {
    setIsSkipping(true)
    try {
      await api.post('/onboarding/skip')
      toast.success('Onboarding skipped. You can resume anytime from your dashboard.')
      
      // Refetch profile to update state
      await fetchProfile()
      
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      console.error('[OnboardingPage] Error skipping onboarding:', error)
      toast.error(err?.response?.data?.message || 'Failed to skip onboarding')
    } finally {
      setIsSkipping(false)
    }
  }

  const handleNext = async () => {
    // Validate current step
    let fieldsToValidate: (keyof OnboardingFormValues)[] = []

    if (currentStep === 0) {
      fieldsToValidate = ['accountType']
    } else if (accountType === 'INDIVIDUAL') {
      // Individual flow validation
      if (currentStep === 1) {
        fieldsToValidate = ['personaRole']
      } else if (currentStep === 2) {
        fieldsToValidate = ['focusArea', 'primaryGoal']
      }
      // Steps 3 and 4 are optional (academic interests, location, etc.)
    } else if (accountType === 'ORGANIZATION' && currentStep === 1) {
      fieldsToValidate = ['organizationName']
    }

    const isValid = await form.trigger(fieldsToValidate)
    
    if (!isValid) {
      return
    }

    // If last data collection step, submit and move to success
    const isLastDataStep = accountType === 'INDIVIDUAL' ? currentStep === 4 : currentStep === 1
    
    if (isLastDataStep) {
      await handleSubmit()
    } else {
      nextStep()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      prevStep()
    }
  }

  const handleSubmit = async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error('Please fill in all required fields')
      return
    }

    const values = form.getValues()
    console.log('[Onboarding] Form values:', values)
    
    const payload = transformToPayload(values)
    console.log('[Onboarding] Payload to send:', payload)

    try {
      // Use update mutation if user has already completed onboarding
      if (isEditMode) {
        await updateOnboardingMutation.mutateAsync(payload)
        toast.success('Profile updated successfully! 🎉')
      } else {
        await completeOnboardingMutation.mutateAsync(payload)
        toast.success('Profile created successfully! 🎉')
      }

      // Refetch the user profile to update onboarded status
      await fetchProfile()

      // Move to success step
      nextStep()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      console.error('[Onboarding] Error:', err)
      toast.error(err?.response?.data?.message || 'Failed to complete onboarding')
    }
  }

  const renderStep = () => {
    if (currentStep === 0) {
      return <AccountTypeStep form={form} />
    }
    
    if (accountType === 'INDIVIDUAL') {
      if (currentStep === 1) {
        return <PersonaRoleOnlyStep form={form} />
      }
      if (currentStep === 2) {
        return <FocusGoalStep form={form} />
      }
      if (currentStep === 3) {
        return <AcademicInterestsStep form={form} />
      }
      if (currentStep === 4) {
        return <LocationAdditionalStep form={form} />
      }
      if (currentStep === 5) {
        const isSubmitting = completeOnboardingMutation.isPending || updateOnboardingMutation.isPending
        return <SuccessStep form={form} isSubmitting={isSubmitting} />
      }
    } else if (accountType === 'ORGANIZATION') {
      if (currentStep === 1) {
        return <OrganizationStep form={form} />
      }
      if (currentStep === 2) {
        const isSubmitting = completeOnboardingMutation.isPending || updateOnboardingMutation.isPending
        return <SuccessStep form={form} isSubmitting={isSubmitting} />
      }
    }

    return null
  }

  const progress = ((currentStep + 1) / totalSteps) * 100

  // Show loading spinner while checking for existing data
  if (isLoadingData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="p-8 md:p-12 shadow-lg">
          <form onSubmit={(e) => e.preventDefault()}>
            {renderStep()}

            {/* Navigation Buttons */}
            {!((accountType === 'INDIVIDUAL' && currentStep === 5) || (accountType === 'ORGANIZATION' && currentStep === 2)) && (
              <div className="flex justify-between items-center mt-12 pt-8 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0 || completeOnboardingMutation.isPending || isSkipping}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>

                <div className="flex gap-2">
                  {currentStep > 0 && !profile?.onboarded && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleSkip}
                      disabled={completeOnboardingMutation.isPending || isSkipping}
                    >
                      {isSkipping ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Skipping...
                        </>
                      ) : (
                        'Skip for now'
                      )}
                    </Button>
                  )}
                  
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={completeOnboardingMutation.isPending || isSkipping}
                    className="gap-2 min-w-[120px]"
                  >
                    {completeOnboardingMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : ((accountType === 'INDIVIDUAL' && currentStep === 4) || (accountType === 'ORGANIZATION' && currentStep === 1)) ? (
                      profile?.onboarded ? 'Update Profile' : 'Complete Setup'
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Your information is secure and will help us provide better recommendations
        </p>
      </div>
      </main>
      <Footer />
    </div>
  )
}
