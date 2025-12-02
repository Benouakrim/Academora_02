import { z } from 'zod'

export const profileSchema = z.object({
  // Academics
  gpa: z.number().min(0).max(5).optional(),
  satScore: z.number().min(400).max(1600).optional(),
  actScore: z.number().min(1).max(36).optional(),

  // Financials
  maxBudget: z.number().min(0).max(500000).optional(),

  // Personal
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  
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
