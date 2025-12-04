import { z } from 'zod'

export const profileSchema = z.object({
  // Academics
  gpa: z.number().min(0).max(5).optional(),
  satScore: z.number().min(400).max(1600).optional(),
  actScore: z.number().min(1).max(36).optional(),

  // Financials - Basic
  maxBudget: z.number().min(0).max(500000).optional(),
  
  // Financials - Extended (FinancialProfile fields)
  householdIncome: z.number().min(0).optional(),
  familySize: z.number().min(1).optional(),
  savings: z.number().min(0).optional(),
  investments: z.number().min(0).optional(),
  expectedFamilyContribution: z.number().min(0).optional(),
  eligibleForPellGrant: z.boolean().optional(),
  eligibleForStateAid: z.boolean().optional(),

  // Personal
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  
  // Onboarding Relational Fields
  accountType: z.enum(['INDIVIDUAL', 'ORGANIZATION']).optional(),
  personaRole: z.string().optional(),
  focusArea: z.string().optional(),
  primaryGoal: z.string().optional(),
  organizationName: z.string().optional(),
  
  // Interests
  preferredMajor: z.string().min(2, "Major is too short").optional(),
  dreamJobTitle: z.string().optional(),
  careerGoals: z.array(z.string()).optional(),
  hobbies: z.array(z.string()).optional(),
  languagesSpoken: z.array(z.string()).optional(),
  
  // Style
  preferredLearningStyle: z.string().optional(),
  personalityType: z.string().optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
