import { create } from 'zustand'
import { api } from '@/lib/api'

export interface UserProfile {
  id: string
  clerkId: string
  email: string
  firstName?: string | null
  lastName?: string | null
  avatarUrl?: string | null
  onboarded: boolean
  onboardingSkipped: boolean
  accountType?: string | null
  personaRole?: string | null
  focusArea?: string | null
  primaryGoal?: string | null
  organizationName?: string | null
  onboardingAnswers?: any
  [key: string]: any
}

type State = {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
}

type Actions = {
  fetchProfile: () => Promise<void>
  setProfile: (profile: UserProfile | null) => void
  reset: () => void
}

export const useUserStore = create<State & Actions>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  setProfile: (profile) => set({ profile }),

  reset: () => set({ profile: null, isLoading: false, error: null }),

  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get('/user/profile')
      set({ profile: data, isLoading: false })
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load profile'
      set({ error: message, isLoading: false })
    }
  },
}))

