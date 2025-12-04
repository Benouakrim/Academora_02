import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { ProfileVisibilitySettings } from './usePublicProfile'

export interface PrivacySettings {
  username?: string;
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY';
  profileSettings: ProfileVisibilitySettings;
}

/**
 * Hook to fetch privacy settings for authenticated user
 */
export function usePrivacySettings() {
  return useQuery({
    queryKey: ['privacySettings'],
    queryFn: async () => {
      const { data } = await api.get('/user/profile/privacy');
      return data.data as PrivacySettings;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to update privacy settings
 */
export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      username?: string;
      profileVisibility?: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY';
      profileSettings?: Partial<ProfileVisibilitySettings>;
    }) => {
      const { data } = await api.patch('/user/profile/privacy', updates);
      return data.data as PrivacySettings;
    },
    onSuccess: () => {
      // Invalidate privacy settings cache
      queryClient.invalidateQueries({ queryKey: ['privacySettings'] });
    },
  });
}

/**
 * Hook to check username availability
 */
export function useCheckUsernameAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      const { data } = await api.post('/profiles/check-username', { username });
      return data;
    },
    onSuccess: (data, username) => {
      // Cache the result
      queryClient.setQueryData(['usernameAvailability', username], data.available);
    },
  });
}
