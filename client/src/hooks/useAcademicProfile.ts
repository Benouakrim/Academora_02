import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  AcademicProfile,
  AcademicProfileResponse,
  AcademicProfileUpdateData,
  CompletenessResponse,
} from '@/types/academicProfile'

/**
 * Type guard to check if error is an Axios error with response
 */
function isAxiosErrorWith404(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as Record<string, unknown>).response === 'object' &&
    (error as Record<string, unknown>).response !== null &&
    'status' in ((error as Record<string, unknown>).response as Record<string, unknown>) &&
    ((error as Record<string, unknown>).response as Record<string, unknown>).status === 404
  )
}

/**
 * Query key factory for academic profile
 */
export const academicProfileKeys = {
  all: ['academicProfile'] as const,
  profile: () => [...academicProfileKeys.all, 'profile'] as const,
  completeness: () => [...academicProfileKeys.all, 'completeness'] as const,
}

/**
 * Hook to fetch the current user's academic profile
 * Handles 404 gracefully by returning null instead of throwing an error
 */
export function useAcademicProfile() {
  return useQuery<AcademicProfile | null, Error>({
    queryKey: academicProfileKeys.profile(),
    queryFn: async (): Promise<AcademicProfile | null> => {
      try {
        const { data } = await api.get<AcademicProfileResponse>('/academic-profile')
        return data.data
      } catch (error) {
        // If profile doesn't exist (404), return null instead of throwing
        if (isAxiosErrorWith404(error)) {
          return null
        }
        throw error
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 404
      if (isAxiosErrorWith404(error)) {
        return false
      }
      return failureCount < 2
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })
}

/**
 * Hook to fetch only the profile completeness score
 * Useful for progress indicators without fetching full profile
 */
export function useAcademicProfileCompleteness() {
  return useQuery<{ completeness: number; hasProfile: boolean }, Error>({
    queryKey: academicProfileKeys.completeness(),
    queryFn: async () => {
      const { data } = await api.get<CompletenessResponse>('/academic-profile/completeness')
      return data.data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to create or update the academic profile
 * Uses upsert logic on the backend
 */
export function useUpdateAcademicProfile() {
  const queryClient = useQueryClient()

  return useMutation<AcademicProfile, Error, AcademicProfileUpdateData>({
    mutationFn: async (profileData: AcademicProfileUpdateData) => {
      const { data } = await api.post<AcademicProfileResponse>(
        '/academic-profile',
        profileData
      )
      if (!data.data) {
        throw new Error('Failed to update academic profile')
      }
      return data.data
    },
    onSuccess: (updatedProfile) => {
      // Update the cache with the new profile data
      queryClient.setQueryData<AcademicProfile | null>(
        academicProfileKeys.profile(),
        updatedProfile
      )
      
      // Invalidate completeness to refetch
      queryClient.invalidateQueries({ queryKey: academicProfileKeys.completeness() })
      
      // Invalidate any related queries (e.g., matching, user profile)
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['matching'] })
    },
  })
}

/**
 * Hook to initialize an empty academic profile
 * Useful for first-time setup
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
    onSuccess: (newProfile) => {
      // Set the new profile in cache
      queryClient.setQueryData<AcademicProfile | null>(
        academicProfileKeys.profile(),
        newProfile
      )
      
      // Invalidate completeness
      queryClient.invalidateQueries({ queryKey: academicProfileKeys.completeness() })
    },
  })
}

/**
 * Hook to delete the academic profile
 * Rarely used, but available for account management
 */
export function useDeleteAcademicProfile() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.delete('/academic-profile')
    },
    onSuccess: () => {
      // Clear the profile from cache
      queryClient.setQueryData<AcademicProfile | null>(
        academicProfileKeys.profile(),
        null
      )
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: academicProfileKeys.all })
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['matching'] })
    },
  })
}

/**
 * Combined hook that provides both query and mutations
 * Convenience hook for components that need full CRUD operations
 */
export function useAcademicProfileManagement() {
  const profile = useAcademicProfile()
  const completeness = useAcademicProfileCompleteness()
  const update = useUpdateAcademicProfile()
  const initialize = useInitializeAcademicProfile()
  const deleteProfile = useDeleteAcademicProfile()

  return {
    // Query states
    profile: profile.data,
    isLoading: profile.isLoading,
    isError: profile.isError,
    error: profile.error,
    refetch: profile.refetch,
    
    // Completeness
    completeness: completeness.data?.completeness ?? 0,
    hasProfile: completeness.data?.hasProfile ?? false,
    
    // Mutations
    updateProfile: update.mutate,
    updateProfileAsync: update.mutateAsync,
    isUpdating: update.isPending,
    updateError: update.error,
    
    initializeProfile: initialize.mutate,
    initializeProfileAsync: initialize.mutateAsync,
    isInitializing: initialize.isPending,
    
    deleteProfile: deleteProfile.mutate,
    deleteProfileAsync: deleteProfile.mutateAsync,
    isDeleting: deleteProfile.isPending,
  }
}
