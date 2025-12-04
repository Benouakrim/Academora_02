import { z } from 'zod';

// Account types
const accountTypeEnum = z.enum(['INDIVIDUAL', 'ORGANIZATION']);

// Individual-specific fields
const personaRoleEnum = z.enum([
  'STUDENT',
  'PROFESSIONAL',
  'PARENT',
  'COUNSELOR',
  'EDUCATOR',
  'RESEARCHER',
]);

const focusAreaEnum = z.enum([
  'COMPUTER_SCIENCE',
  'BUSINESS',
  'ENGINEERING',
  'MEDICINE',
  'LAW',
  'ARTS',
  'SCIENCES',
  'HUMANITIES',
  'SOCIAL_SCIENCES',
  'OTHER',
]);

const primaryGoalEnum = z.enum([
  'FIND_FINANCIAL_AID',
  'CAREER_MATCHING',
  'UNIVERSITY_DISCOVERY',
  'COMPARE_UNIVERSITIES',
  'NETWORK_BUILDING',
  'RESEARCH',
  'OTHER',
]);

// Individual answers schema
const individualAnswersSchema = z.object({
  personaRole: personaRoleEnum,
  focusArea: focusAreaEnum,
  primaryGoal: primaryGoalEnum,
  // Additional step data can be included here
  academicLevel: z.string().optional(),
  location: z.string().optional(),
  interests: z.array(z.string()).optional(),
  // Store any other questionnaire data
  additionalData: z.record(z.any()).optional(),
});

// Organization answers schema
const organizationAnswersSchema = z.object({
  organizationName: z.string().min(2).max(200),
  organizationType: z.string().optional(),
  size: z.string().optional(),
  goals: z.array(z.string()).optional(),
  // Store any other questionnaire data
  additionalData: z.record(z.any()).optional(),
});

// Main onboarding schema with conditional validation
export const onboardingDataSchema = {
  body: z
    .object({
      accountType: accountTypeEnum,
      answers: z.union([individualAnswersSchema, organizationAnswersSchema]),
      // Metadata about the onboarding process
      version: z.string().optional(), // Onboarding version for tracking
      completedAt: z.string().datetime().optional(),
    })
    .refine(
      (data) => {
        // If accountType is INDIVIDUAL, ensure answers match individualAnswersSchema
        if (data.accountType === 'INDIVIDUAL') {
          return individualAnswersSchema.safeParse(data.answers).success;
        }
        // If accountType is ORGANIZATION, ensure answers match organizationAnswersSchema
        if (data.accountType === 'ORGANIZATION') {
          return organizationAnswersSchema.safeParse(data.answers).success;
        }
        return true;
      },
      {
        message: 'Answers must match the selected account type',
        path: ['answers'],
      }
    ),
};

// Export types for use in services/controllers
export type OnboardingPayload = z.infer<typeof onboardingDataSchema.body>;
export type IndividualAnswers = z.infer<typeof individualAnswersSchema>;
export type OrganizationAnswers = z.infer<typeof organizationAnswersSchema>;
