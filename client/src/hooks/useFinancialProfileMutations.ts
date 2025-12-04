import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { financialProfileKeys } from './useFinancialProfile'
import type { FinancialProfile, FinancialProfileUpdateData } from '@/types/financialProfile'

/**
 * Hook to create a new financial profile
 */
export function useCreateFinancialProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: FinancialProfileUpdateData) => {
      const { data: profile } = await api.post<FinancialProfile>('/financial-profile', data)
      return profile
    },
    onSuccess: (newProfile) => {
      // Update the cache with the new profile
      queryClient.setQueryData(financialProfileKeys.detail(), newProfile)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: financialProfileKeys.all })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      
      toast.success('Financial profile created successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create financial profile'
      toast.error(message)
    },
  })
}

/**
 * Hook to update financial profile with optimistic updates and real-time sync
 */
export function useUpdateFinancialProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: FinancialProfileUpdateData) => {
      const { data: profile } = await api.put<FinancialProfile>('/financial-profile', data)
      return profile
    },
    onMutate: async (updatedData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: financialProfileKeys.detail() })

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<FinancialProfile>(financialProfileKeys.detail())

      // Optimistically update the cache
      if (previousProfile) {
        queryClient.setQueryData<FinancialProfile>(
          financialProfileKeys.detail(),
          { ...previousProfile, ...updatedData }
        )
      }

      return { previousProfile }
    },
    onSuccess: (updatedProfile) => {
      // Update cache with server response
      queryClient.setQueryData(financialProfileKeys.detail(), updatedProfile)
      
      // Invalidate related queries for real-time sync
      queryClient.invalidateQueries({ queryKey: financialProfileKeys.all })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['matching'] })
      queryClient.invalidateQueries({ queryKey: ['financialAid'] })
      
      toast.success('Financial profile updated successfully')
    },
    onError: (error: any, _, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(financialProfileKeys.detail(), context.previousProfile)
      }
      
      const message = error.response?.data?.message || 'Failed to update financial profile'
      toast.error(message)
    },
  })
}

/**
 * Hook to delete financial profile
 */
export function useDeleteFinancialProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.delete('/financial-profile')
    },
    onSuccess: () => {
      // Clear the cache
      queryClient.setQueryData(financialProfileKeys.detail(), null)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: financialProfileKeys.all })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      
      toast.success('Financial profile deleted successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete financial profile'
      toast.error(message)
    },
  })
}

/**
 * Hook to initialize financial profile with default values
 */
export function useInitializeFinancialProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<FinancialProfile>('/financial-profile/initialize')
      return data
    },
    onSuccess: (newProfile) => {
      queryClient.setQueryData(financialProfileKeys.detail(), newProfile)
      queryClient.invalidateQueries({ queryKey: financialProfileKeys.all })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      
      toast.success('Financial profile initialized')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to initialize financial profile'
      toast.error(message)
    },
  })
}
