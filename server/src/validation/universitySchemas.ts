import { z } from 'zod';

export const searchUniversitiesSchema = {
  query: z.object({
    q: z.string().optional(),
    country: z.string().optional(),
    maxTuition: z.string().transform((val) => (val ? Number(val) : undefined)).optional(),
    minGpa: z.string().transform((val) => (val ? Number(val) : undefined)).optional(),
    page: z.string().transform((val) => (val ? Number(val) : 1)).optional().default('1'),
  }),
};
