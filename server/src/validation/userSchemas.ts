import { z } from 'zod';

export const updateProfileSchema = {
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    gpa: z.number().min(0).max(4).optional(),
    satScore: z.number().min(400).max(1600).optional(),
    actScore: z.number().min(1).max(36).optional(),
    maxBudget: z.number().positive().optional(),
    preferredMajor: z.string().min(1).optional(),
  }),
};

export const toggleSavedSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};
