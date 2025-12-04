import { z } from 'zod'

// Account type enum
export const accountTypeEnum = z.enum(['INDIVIDUAL', 'ORGANIZATION'])

// Individual-specific enums
export const personaRoleEnum = z.enum([
  'STUDENT',
  'PROFESSIONAL',
  'PARENT',
  'COUNSELOR',
  'EDUCATOR',
  'RESEARCHER',
])

export const focusAreaEnum = z.enum([
  'COMPUTER_SCIENCE',
  'BUSINESS',
  'ENGINEERING',
  'MEDICINE',
  'LAW',
  'ARTS',
  'SCIENCES',
  'HUMANITIES',
  'SOCIAL_SCIENCES',
  'OTHER',
])

export const primaryGoalEnum = z.enum([
  'FIND_FINANCIAL_AID',
  'CAREER_MATCHING',
  'UNIVERSITY_DISCOVERY',
  'COMPARE_UNIVERSITIES',
  'NETWORK_BUILDING',
  'RESEARCH',
  'OTHER',
])

// Step 1: Account Type Selection
export const accountTypeStepSchema = z.object({
  accountType: accountTypeEnum,
})

// Step 2: Individual Persona & Goals
export const personaRoleStepSchema = z.object({
  personaRole: personaRoleEnum,
  focusArea: focusAreaEnum,
  primaryGoal: primaryGoalEnum,
  academicLevel: z.string().optional(),
  location: z.string().optional(),
  interests: z.array(z.string()).optional(),
})

// Step 2: Organization Details
export const organizationStepSchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters').max(200),
  organizationType: z.string().optional(),
  size: z.string().optional(),
  goals: z.array(z.string()).optional(),
})

// Main onboarding form schema with conditional validation
export const onboardingFormSchema = z
  .object({
    // Step 1
    accountType: accountTypeEnum,
    
    // Step 2 - Individual fields (conditional)
    personaRole: personaRoleEnum.optional(),
    focusArea: focusAreaEnum.optional(),
    primaryGoal: primaryGoalEnum.optional(),
    academicLevel: z.string().optional(),
    location: z.string().optional(),
    interests: z.array(z.string()).optional(),
    
    // Step 2 - Organization fields (conditional)
    organizationName: z.string().optional(),
    organizationType: z.string().optional(),
    size: z.string().optional(),
    goals: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // If INDIVIDUAL, require individual fields
      if (data.accountType === 'INDIVIDUAL') {
        return (
          data.personaRole !== undefined &&
          data.focusArea !== undefined &&
          data.primaryGoal !== undefined
        )
      }
      // If ORGANIZATION, require organization fields
      if (data.accountType === 'ORGANIZATION') {
        return data.organizationName !== undefined && data.organizationName.length >= 2
      }
      return true
    },
    {
      message: 'Required fields are missing for the selected account type',
    }
  )

// Type exports
export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>
export type AccountTypeStepValues = z.infer<typeof accountTypeStepSchema>
export type PersonaRoleStepValues = z.infer<typeof personaRoleStepSchema>
export type OrganizationStepValues = z.infer<typeof organizationStepSchema>

// Helper type for backend payload
export type OnboardingPayload = {
  accountType: 'INDIVIDUAL' | 'ORGANIZATION'
  answers: {
    personaRole?: string
    focusArea?: string
    primaryGoal?: string
    academicLevel?: string
    location?: string
    interests?: string[]
    organizationName?: string
    organizationType?: string
    size?: string
    goals?: string[]
    additionalData?: Record<string, any>
  }
  version?: string
  completedAt?: string
}

// Helper to transform form values to backend payload
export function transformToPayload(values: OnboardingFormValues): OnboardingPayload {
  if (values.accountType === 'INDIVIDUAL') {
    return {
      accountType: 'INDIVIDUAL',
      answers: {
        personaRole: values.personaRole!,
        focusArea: values.focusArea!,
        primaryGoal: values.primaryGoal!,
        academicLevel: values.academicLevel,
        location: values.location,
        interests: values.interests,
      },
      version: '1.0',
      completedAt: new Date().toISOString(),
    }
  } else {
    return {
      accountType: 'ORGANIZATION',
      answers: {
        organizationName: values.organizationName!,
        organizationType: values.organizationType,
        size: values.size,
        goals: values.goals,
      },
      version: '1.0',
      completedAt: new Date().toISOString(),
    }
  }
}
