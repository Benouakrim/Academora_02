export interface FinancialProfile {
  id: string
  userId: string
  maxBudget: number | null
  householdIncome: number | null
  familySize: number | null
  savings: number | null
  investments: number | null
  expectedFamilyContribution: number | null
  eligibleForPellGrant: boolean | null
  eligibleForStateAid: boolean | null
  createdAt: string
  updatedAt: string
}

export interface FinancialProfileUpdateData {
  maxBudget?: number | null
  householdIncome?: number | null
  familySize?: number | null
  savings?: number | null
  investments?: number | null
  expectedFamilyContribution?: number | null
  eligibleForPellGrant?: boolean | null
  eligibleForStateAid?: boolean | null
}

export interface FinancialProfileResponse {
  profile: FinancialProfile
  message?: string
}
