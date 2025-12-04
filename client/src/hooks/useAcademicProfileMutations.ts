import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import type {
  AcademicProfile,
  AcademicProfileResponse,
  AcademicProfileUpdateData,
} from '@/types/academicProfile'
import { academicProfileKeys } from './useAcademicProfile'

/**
 * Hook to create a new academic profile
 * Creates an initial profile for the user
 */
export function useCreateAcademicProfile() {
  const queryClient = useQueryClient()

  return useMutation<AcademicProfile, Error, AcademicProfileUpdateData>({
    mutationFn: async (profileData: AcademicProfileUpdateData) => {
      const { data } = await api.post<AcademicProfileResponse>(
        '/academic-profile',
        profileData
      )
      if (!data.data) {
        throw new Error('Failed to create academic profile')
      }
      return data.data
    },
    onMutate: async (newProfile) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: academicProfileKeys.profile() })

      // Snapshot the previous value for rollback
      const previousProfile = queryClient.getQueryData<AcademicProfile | null>(
        academicProfileKeys.profile()
      )

      // Optimistically update to the new value
      queryClient.setQueryData<AcademicProfile | null>(
        academicProfileKeys.profile(),
        (old) => {
          if (!old) {
            // Create a temporary profile with the new data
            return {
              id: 'temp-id',
              userId: 'temp-user-id',
              ...newProfile,
              extracurriculars: newProfile.extracurriculars || [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as AcademicProfile
          }
          return { ...old, ...newProfile }
        }
      )

      // Show optimistic feedback
      toast.loading('Creating your academic profile...', { id: 'create-profile' })

      return { previousProfile }
    },
    onError: (error, _variables, context) => {
      // Rollback to previous value on error
      const ctx = context as { previousProfile?: AcademicProfile | null }
      if (ctx?.previousProfile !== undefined) {
        queryClient.setQueryData(
          academicProfileKeys.profile(),
          ctx.previousProfile
        )
      }
      
      toast.error('Failed to create profile', {
        id: 'create-profile',
        description: error.message || 'Please try again later',
      })
    },
    onSuccess: (createdProfile) => {
      // Update cache with the actual server response
      queryClient.setQueryData<AcademicProfile | null>(
        academicProfileKeys.profile(),
        createdProfile
      )

      // Real-time sync: Invalidate related queries to trigger background refetch
      queryClient.invalidateQueries({ queryKey: academicProfileKeys.completeness() })
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['matching'] })
      queryClient.invalidateQueries({ queryKey: ['financialAid'] })

      toast.success('Academic profile created! 🎓', {
        id: 'create-profile',
        description: `Profile is ${createdProfile.completeness || 0}% complete`,
      })
    },
    onSettled: () => {
      // Always refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: academicProfileKeys.profile() })
    },
  })
}

/**
 * Hook to update an existing academic profile
 * Supports partial updates with optimistic UI and real-time sync
 */
export function useUpdateAcademicProfile() {
  const queryClient = useQueryClient()

  return useMutation<AcademicProfile, Error, AcademicProfileUpdateData>({
    mutationFn: async (profileData: AcademicProfileUpdateData) => {
      const { data } = await api.put<AcademicProfileResponse>(
        '/academic-profile',
        profileData
      )
      if (!data.data) {
        throw new Error('Failed to update academic profile')
      }
      return data.data
    },
    onMutate: async (updatedFields) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: academicProfileKeys.profile() })

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<AcademicProfile | null>(
        academicProfileKeys.profile()
      )

      // Optimistically update the cache
      queryClient.setQueryData<AcademicProfile | null>(
        academicProfileKeys.profile(),
        (old) => {
          if (!old) return old
          return {
            ...old,
            ...updatedFields,
            updatedAt: new Date().toISOString(),
          }
        }
      )

      // Show optimistic feedback
      toast.loading('Saving changes...', { id: 'update-profile' })

      return { previousProfile }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      const ctx = context as { previousProfile?: AcademicProfile | null }
      if (ctx?.previousProfile !== undefined) {
        queryClient.setQueryData(
          academicProfileKeys.profile(),
          ctx.previousProfile
        )
      }

      toast.error('Failed to save changes', {
        id: 'update-profile',
        description: error.message || 'Please try again',
      })
    },
    onSuccess: (updatedProfile) => {
      // Update cache with server response
      queryClient.setQueryData<AcademicProfile | null>(
        academicProfileKeys.profile(),
        updatedProfile
      )

      // Real-time sync: Invalidate related queries immediately
      queryClient.invalidateQueries({ queryKey: academicProfileKeys.completeness() })
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['matching'] })
      queryClient.invalidateQueries({ queryKey: ['financialAid'] })

      toast.success('Changes saved! ✓', {
        id: 'update-profile',
        description: `Profile is ${updatedProfile.completeness || 0}% complete`,
      })
    },
    onSettled: () => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: academicProfileKeys.profile() })
    },
  })
}

/**
 * Hook to delete the academic profile
 * Includes optimistic updates and comprehensive cleanup
 */
export function useDeleteAcademicProfile() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.delete('/academic-profile')
    },
    onMutate: async () => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: academicProfileKeys.profile() })

      // Snapshot for rollback
      const previousProfile = queryClient.getQueryData<AcademicProfile | null>(
        academicProfileKeys.profile()
      )

      // Optimistically set to null
      queryClient.setQueryData<AcademicProfile | null>(
        academicProfileKeys.profile(),
        null
      )

      toast.loading('Deleting academic profile...', { id: 'delete-profile' })

      return { previousProfile }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      const ctx = context as { previousProfile?: AcademicProfile | null }
      if (ctx?.previousProfile !== undefined) {
        queryClient.setQueryData(
          academicProfileKeys.profile(),
          ctx.previousProfile
        )
      }

      toast.error('Failed to delete profile', {
        id: 'delete-profile',
        description: error.message || 'Please try again',
      })
    },
    onSuccess: () => {
      // Clear the profile from cache
      queryClient.setQueryData<AcademicProfile | null>(
        academicProfileKeys.profile(),
        null
      )

      // Real-time sync: Invalidate all related queries immediately
      queryClient.invalidateQueries({ queryKey: academicProfileKeys.all })
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['matching'] })
      queryClient.invalidateQueries({ queryKey: ['financialAid'] })

      toast.success('Academic profile deleted', {
        id: 'delete-profile',
        description: 'Your profile has been removed',
      })
    },
    onSettled: () => {
      // Ensure clean state
      queryClient.invalidateQueries({ queryKey: academicProfileKeys.all })
    },
  })
}

/**
 * Hook to initialize an empty academic profile
 * Useful for first-time setup flow
 */
export function useInitializeAcademicProfile() {
  const queryClient = useQueryClient()

  return useMutation<AcademicProfile, Error, void>({
    mutationFn: async () => {
      const { data } = await api.post<AcademicProfileResponse>(
        '/academic-profile/initialize'
      )
      if (!data.data) {
        throw new Error('Failed to initialize academic profile')
      }
      return data.data
    },
    onMutate: async () => {
      toast.loading('Setting up your profile...', { id: 'init-profile' })
    },
    onError: (error) => {
      toast.error('Failed to initialize profile', {
        id: 'init-profile',
        description: error.message || 'Please try again',
      })
    },
    onSuccess: (newProfile) => {
      // Set the new profile in cache
      queryClient.setQueryData<AcademicProfile | null>(
        academicProfileKeys.profile(),
        newProfile
      )

      // Real-time sync
      queryClient.invalidateQueries({ queryKey: academicProfileKeys.completeness() })
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })

      toast.success('Profile initialized! 🎓', {
        id: 'init-profile',
        description: 'Start filling out your academic information',
      })
    },
  })
}

/**
 * Hook to batch update multiple fields efficiently
 * Reduces API calls when updating multiple sections at once
 */
export function useBatchUpdateAcademicProfile() {
  const queryClient = useQueryClient()

  return useMutation<AcademicProfile, Error, AcademicProfileUpdateData[]>({
    mutationFn: async (updates: AcademicProfileUpdateData[]) => {
      // Merge all updates into a single object
      const mergedUpdates = updates.reduce((acc, update) => ({
        ...acc,
        ...update,
      }), {})

      const { data } = await api.put<AcademicProfileResponse>(
        '/academic-profile',
        mergedUpdates
      )
      if (!data.data) {
        throw new Error('Failed to update academic profile')
      }
      return data.data
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: academicProfileKeys.profile() })

      const previousProfile = queryClient.getQueryData<AcademicProfile | null>(
        academicProfileKeys.profile()
      )

      // Apply all updates optimistically
      const mergedUpdates = updates.reduce((acc, update) => ({
        ...acc,
        ...update,
      }), {})

      queryClient.setQueryData<AcademicProfile | null>(
        academicProfileKeys.profile(),
        (old) => {
          if (!old) return old
          return { ...old, ...mergedUpdates, updatedAt: new Date().toISOString() }
        }
      )

      toast.loading('Saving all changes...', { id: 'batch-update' })

      return { previousProfile }
    },
    onError: (error, _variables, context) => {
      const ctx = context as { previousProfile?: AcademicProfile | null }
      if (ctx?.previousProfile !== undefined) {
        queryClient.setQueryData(
          academicProfileKeys.profile(),
          ctx.previousProfile
        )
      }

      toast.error('Failed to save changes', {
        id: 'batch-update',
        description: error.message,
      })
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData<AcademicProfile | null>(
        academicProfileKeys.profile(),
        updatedProfile
      )

      // Real-time sync
      queryClient.invalidateQueries({ queryKey: academicProfileKeys.completeness() })
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['matching'] })

      toast.success('All changes saved! ✓', {
        id: 'batch-update',
        description: `Profile is ${updatedProfile.completeness || 0}% complete`,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: academicProfileKeys.profile() })
    },
  })
}
