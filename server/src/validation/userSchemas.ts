import { z } from 'zod';

export const updateProfileSchema = {
  body: z.object({
    // Basic Info
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    
    // Academic Stats
    gpa: z.number().min(0).max(5.0).optional(),
    satScore: z.number().min(400).max(1600).optional(),
    actScore: z.number().min(1).max(36).optional(),
    
    // Preferences & Goals
    preferredMajor: z.string().min(2).max(100).optional(),
    dreamJobTitle: z.string().max(100).optional(),
    careerGoals: z.array(z.string()).optional(),
    hobbies: z.array(z.string()).optional(),
    languagesSpoken: z.array(z.string()).optional(),
    
    // Learning Style
    preferredLearningStyle: z.enum(['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic', 'Multimodal']).optional(),
    personalityType: z.string().max(50).optional(), // e.g., "INTJ" or "Extrovert"
    
    // Onboarding Relational Fields (optional for profile updates)
    accountType: z.enum(['INDIVIDUAL', 'ORGANIZATION']).optional(),
    personaRole: z.string().max(50).optional(),
    focusArea: z.string().max(100).optional(),
    primaryGoal: z.string().max(100).optional(),
    organizationName: z.string().max(200).optional(),
  }),
};

export const toggleSavedSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};
