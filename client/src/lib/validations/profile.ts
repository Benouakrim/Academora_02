import { z } from 'zod'

export const profileSchema = z.object({
  // Academics
  gpa: z
    .number({ invalid_type_error: 'GPA must be a number' })
    .min(0, 'GPA cannot be negative')
    .max(4, 'GPA cannot exceed 4.0')
    .optional(),
  satScore: z
    .number({ invalid_type_error: 'SAT must be a number' })
    .min(0)
    .max(1600)
    .optional(),
  actScore: z
    .number({ invalid_type_error: 'ACT must be a number' })
    .min(0)
    .max(36)
    .optional(),

  // Financials
  familyIncome: z
    .number({ invalid_type_error: 'Income must be a number' })
    .min(0, 'Income must be positive')
    .optional(),
  interestedInAid: z.boolean().optional(),
  maxBudget: z
    .number({ invalid_type_error: 'Max budget must be a number' })
    .min(0)
    .max(100000)
    .optional(),

  // Interests
  preferredMajor: z.string().min(1, 'Preferred major is required').optional(),
  preferredCountry: z.string().optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
