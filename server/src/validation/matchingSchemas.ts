import { z } from 'zod';

// Schema for matching request body
export const matchRequestSchema = {
  body: z.object({
    gpa: z.number().min(0).max(5.0),
    satScore: z.number().min(400).max(1600).optional(),
    actScore: z.number().min(1).max(36).optional(),
    maxBudget: z.number().positive(),
    preferredMajor: z.string().min(2),
    preferredCountry: z.string().optional(),
    importanceFactors: z.object({
      academics: z.number().min(1).max(10),
      social: z.number().min(1).max(10),
      cost: z.number().min(1).max(10),
    }).default({ academics: 5, social: 5, cost: 5 }),
  }),
};
