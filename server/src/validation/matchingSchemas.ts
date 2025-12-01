import { z } from 'zod';

// Schema for matching request body
export const matchRequestSchema = {
  body: z.object({
    gpa: z.number().min(0).max(4),
    maxBudget: z.number().positive(),
    interests: z.array(z.string().min(1)).min(1),
    preferredCountry: z.string().optional(),
  }),
};
