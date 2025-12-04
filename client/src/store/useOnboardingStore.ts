import { create } from 'zustand'
import type { OnboardingFormValues } from '@/lib/validations/onboarding'

type OnboardingState = {
  currentStep: number
  totalSteps: number
  formData: Partial<OnboardingFormValues>
  isLoading: boolean
  error: string | null
}

type OnboardingActions = {
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  updateFormData: (data: Partial<OnboardingFormValues>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState: OnboardingState = {
  currentStep: 0,
  totalSteps: 2, // Step 0: Account Type, Step 1: Details
  formData: {},
  isLoading: false,
  error: null,
}

export const useOnboardingStore = create<OnboardingState & OnboardingActions>((set) => ({
  ...initialState,

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1),
      error: null,
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
      error: null,
    })),

  goToStep: (step) =>
    set((state) => ({
      currentStep: Math.max(0, Math.min(step, state.totalSteps - 1)),
      error: null,
    })),

  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error }),

  reset: () => set(initialState),
}))
