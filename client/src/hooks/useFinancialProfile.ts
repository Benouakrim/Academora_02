import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { FinancialProfile } from '@/types/financialProfile'

/**
 * Query key factory for financial profile queries
 */
export const financialProfileKeys = {
  all: ['financialProfile'] as const,
  detail: () => [...financialProfileKeys.all, 'detail'] as const,
}

/**
 * Hook to fetch the user's financial profile
 * Returns null if profile doesn't exist (404)
 */
export function useFinancialProfile() {
  return useQuery({
    queryKey: financialProfileKeys.detail(),
    queryFn: async () => {
      try {
        const { data } = await api.get<FinancialProfile>('/financial-profile')
        return data
      } catch (error: any) {
        // Return null if profile doesn't exist (404)
        if (error.response?.status === 404) {
          return null
        }
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404
      if (error.response?.status === 404) return false
      return failureCount < 2
    },
  })
}
