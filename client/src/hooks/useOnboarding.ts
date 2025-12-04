import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { OnboardingPayload } from '@/lib/validations/onboarding'

// Types
export type OnboardingStatus = {
  onboarded: boolean
  accountType: string | null
  personaRole: string | null
  focusArea: string | null
  primaryGoal: string | null
  organizationName: string | null
  onboardingAnswers: Record<string, unknown> | null
}

export type OnboardingResponse = {
  success: boolean
  message?: string
  user: Record<string, unknown>
}

// Get onboarding status
export function useOnboardingStatus() {
  return useQuery<{ success: boolean; status: OnboardingStatus }>({
    queryKey: ['onboarding', 'status'],
    queryFn: async () => {
      const { data } = await api.get('/onboarding/status')
      return data
    },
    retry: 1,
  })
}

// Complete onboarding mutation
export function useCompleteOnboarding() {
  const queryClient = useQueryClient()

  return useMutation<OnboardingResponse, Error, OnboardingPayload>({
    mutationFn: async (payload: OnboardingPayload) => {
      const { data } = await api.post('/onboarding', payload)
      return data
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'status'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
  })
}

// Update onboarding mutation (for re-onboarding)
export function useUpdateOnboarding() {
  const queryClient = useQueryClient()

  return useMutation<OnboardingResponse, Error, OnboardingPayload>({
    mutationFn: async (payload: OnboardingPayload) => {
      const { data } = await api.put('/onboarding', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'status'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
  })
}
