import { z } from 'zod';
import { CampusSetting, TestPolicy } from '@prisma/client';

export const matchRequestSchema = {
  body: z.object({
    // --- Academic Profile ---
    gpa: z.number().min(0).max(5.0),
    satScore: z.number().min(400).max(1600).optional(),
    actScore: z.number().min(1).max(36).optional(),
    englishProficiency: z.object({
      toefl: z.number().optional(),
      ielts: z.number().optional(),
    }).optional(),

    // --- Constraints ---
    maxBudget: z.number().positive(),
    preferredMajor: z.string().min(2),
    preferredCountry: z.string().optional(),
    
    // --- Lifestyle Preferences (New) ---
    preferredSetting: z.nativeEnum(CampusSetting).optional(),
    preferredClimate: z.enum(['Temperate', 'Tropical', 'Arid', 'Cold', 'Mediterranean', 'Maritime', 'Humid Subtropical', 'Continental']).optional(),
    
    // --- Future Goals (New) ---
    needsVisaSupport: z.boolean().default(false),
    minVisaMonths: z.number().optional(), // E.g., wants at least 24 months post-grad visa

    // --- Weights ---
    importanceFactors: z.object({
      academics: z.number().min(1).max(10),
      social: z.number().min(1).max(10),
      cost: z.number().min(1).max(10),
      location: z.number().min(1).max(10),
      future: z.number().min(1).max(10),
    }).default({ academics: 5, social: 5, cost: 5, location: 5, future: 5 }),
  }),
};

export type MatchRequest = z.infer<typeof matchRequestSchema['body']>;
