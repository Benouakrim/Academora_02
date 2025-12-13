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
  // Academic Profile fields
  gpa?: number | null
  satScore?: number | null
  actScore?: number | null
  // Financial Profile fields (NEW: P28 - Inverse Block Enhancement)
  maxBudget?: number | null
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
    console.log('[UserStore] 🔄 Fetching user profile...')
    set({ isLoading: true, error: null })
    try {
      console.log('[UserStore] Making API request to /user/profile')
      const { data } = await api.get('/user/profile')
      console.log('[UserStore] ✅ Profile fetched successfully:', data)
      set({ profile: data, isLoading: false })
    } catch (err: any) {
      const status = err?.response?.status
      const errorData = err?.response?.data
      const message = errorData?.message || errorData?.error || err?.message || 'Failed to load profile'
      
      console.error('[UserStore] ❌ Failed to fetch profile:', {
        status,
        message,
        errorData,
        hasResponse: !!err?.response,
        isNetworkError: err?.code === 'ERR_NETWORK'
      })
      
      set({ error: message, isLoading: false })
      throw err // Re-throw to allow ProtectedRoute to handle it
    }
  },
}))

