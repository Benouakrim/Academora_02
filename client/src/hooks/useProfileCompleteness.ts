import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ProfileCompleteness {
  isComplete: boolean;
  hasFinancialProfile: boolean;
  hasAcademicProfile: boolean;
  hasIncome: boolean;
  hasGpa: boolean;
  hasSatScore: boolean;
  missingFields: string[];
  completionPercentage: number;
}

/**
 * Hook to check if user profile is complete for financial aid predictions
 */
export function useProfileCompleteness() {
  return useQuery({
    queryKey: ['profile-completeness'],
    queryFn: async () => {
      try {
        // Fetch both profiles
        const [financialRes, academicRes] = await Promise.all([
          api.get('/financial-profile'),
          api.get('/academic-profile'),
        ]);

        const financial = financialRes.data;
        const academic = academicRes.data;

        const hasFinancialProfile = Boolean(financial);
        const hasAcademicProfile = Boolean(academic);
        const hasIncome = financial?.householdIncome !== null && financial?.householdIncome !== undefined;
        const hasGpa = academic?.gpa !== null && academic?.gpa !== undefined;
        const hasSatScore = academic?.satScore !== null && academic?.satScore !== undefined;

        const missingFields: string[] = [];
        if (!hasIncome) missingFields.push('Household Income');
        if (!hasGpa) missingFields.push('GPA');

        // Calculate completion percentage (core fields only)
        const coreFields = [hasIncome, hasGpa];
        const completedFields = coreFields.filter(Boolean).length;
        const completionPercentage = Math.round((completedFields / coreFields.length) * 100);

        const isComplete = hasIncome && hasGpa;

        const result: ProfileCompleteness = {
          isComplete,
          hasFinancialProfile,
          hasAcademicProfile,
          hasIncome,
          hasGpa,
          hasSatScore,
          missingFields,
          completionPercentage,
        };

        return result;
      } catch (error: unknown) {
        // If profiles don't exist yet, return incomplete status
        if ((error as { response?: { status?: number } }).response?.status === 404) {
          return {
            isComplete: false,
            hasFinancialProfile: false,
            hasAcademicProfile: false,
            hasIncome: false,
            hasGpa: false,
            hasSatScore: false,
            missingFields: ['Household Income', 'GPA'],
            completionPercentage: 0,
          } as ProfileCompleteness;
        }
        throw error;
      }
    },
  });
}
