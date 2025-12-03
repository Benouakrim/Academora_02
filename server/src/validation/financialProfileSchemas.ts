import { z } from 'zod';

export const updateFinancialProfileSchema = {
  body: z.object({
    // Core Financials
    maxBudget: z.number().positive().optional(),
    householdIncome: z.number().nonnegative().optional(),
    familySize: z.number().int().positive().optional(),
    
    // Extended Financials
    savings: z.number().nonnegative().optional(),
    investments: z.number().nonnegative().optional(),
    expectedFamilyContribution: z.number().nonnegative().optional(),
    eligibleForPellGrant: z.boolean().optional(),
    eligibleForStateAid: z.boolean().optional(),
  }),
};
