import { z } from 'zod';

export const predictRequestSchema = {
  body: z.object({
    universityId: z.string().uuid(),
    familyIncome: z.number().min(0),
    gpa: z.number().min(0).max(5.0),
    satScore: z.number().min(400).max(1600).optional(),
    actScore: z.number().min(1).max(36).optional(),
    
    // Updated from boolean to enum for better granularity
    residency: z.enum(['in-state', 'out-of-state', 'international']).default('out-of-state'),
  }),
};

export type PredictRequest = z.infer<typeof predictRequestSchema['body']>;
