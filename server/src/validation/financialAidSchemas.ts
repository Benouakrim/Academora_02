import { z } from 'zod';

export const predictRequestSchema = {
  body: z.object({
    universityId: z.string().uuid(),
    familyIncome: z.number().positive(),
    gpa: z.number().min(0).max(4),
    satScore: z.number().min(400).max(1600).optional(),
    inState: z.boolean(),
  }),
};
