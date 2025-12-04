import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { UniversityDetail } from './useUniversityDetail'
import { toast } from 'sonner'

// 1. Store for managing selected IDs (persists on reload)
type CompareState = {
  selectedSlugs: string[]
  addUniversity: (slug: string) => void
  removeUniversity: (slug: string) => void
  clear: () => void
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      selectedSlugs: [],
      addUniversity: (slug) =>
        set((state) => {
          if (state.selectedSlugs.includes(slug)) return state
          if (state.selectedSlugs.length >= 5) return state // Max 5
          return { selectedSlugs: [...state.selectedSlugs, slug] }
        }),
      removeUniversity: (slug) =>
        set((state) => ({ selectedSlugs: state.selectedSlugs.filter((s) => s !== slug) })),
      clear: () => set({ selectedSlugs: [] }),
    }),
    { name: 'compare-storage' }
  )
)

// 2. Hook to fetch data for selected
export function useCompareData() {
  const slugs = useCompareStore((s) => s.selectedSlugs)

  return useQuery({
    queryKey: ['compare', slugs],
    queryFn: async () => {
      if (slugs.length === 0) return []
      // Use bulk endpoint for efficient single-request fetch
      const response = await api.get<UniversityDetail[]>('/compare', {
        params: { slugs: slugs.join(',') }
      })
      return response.data
    },
    enabled: slugs.length > 0,
  })
}

// 3. Hook to fetch comparison with financial aid predictions
export interface FinancialPrediction {
  tuition: number;
  housing: number;
  grossCost: number;
  efc: number;
  needAid: number;
  meritAid: number;
  totalAid: number;
  netPrice: number;
  breakdown: string;
  eligibilityWarning?: boolean;
}

export interface ComparisonWithPredictions {
  universities: UniversityDetail[];
  predictions: Record<string, FinancialPrediction | null>;
  isProfileComplete: boolean;
  profileCompleteness: {
    hasFinancialProfile: boolean;
    hasAcademicProfile: boolean;
    hasIncome: boolean;
    hasGpa: boolean;
  };
}

export function useCompareWithPredictions() {
  const slugs = useCompareStore((s) => s.selectedSlugs)

  return useQuery<ComparisonWithPredictions>({
    queryKey: ['compare-predictions', slugs],
    queryFn: async () => {
      if (slugs.length === 0) {
        return {
          universities: [],
          predictions: {},
          isProfileComplete: false,
          profileCompleteness: {
            hasFinancialProfile: false,
            hasAcademicProfile: false,
            hasIncome: false,
            hasGpa: false,
          },
        }
      }

      const response = await api.post<ComparisonWithPredictions>(
        '/compare/with-predictions',
        { slugs }
      )
      return response.data
    },
    enabled: slugs.length > 0,
  })
}

// 4. Hook to analyze comparison and get smart recommendations
export interface SmartRecommendation {
  universityId: string;
  universityName: string;
  score: number;
  reason: string;
}

export interface ComparisonAnalysis {
  metrics: {
    averageCost: number;
    averageRanking: number;
    averageAcceptanceRate: number;
    costRange: { min: number; max: number };
    rankingRange: { min: number; max: number };
  };
  recommendations: {
    bestValue?: SmartRecommendation;
    mostPrestigious?: SmartRecommendation;
    mostAffordable?: SmartRecommendation;
    bestForInternational?: SmartRecommendation;
  };
}

export function useComparisonAnalysis(universityIds: string[]) {
  return useQuery<ComparisonAnalysis>({
    queryKey: ['comparison-analysis', universityIds],
    queryFn: async () => {
      const response = await api.post<ComparisonAnalysis>(
        '/compare/analyze',
        { universityIds }
      )
      return response.data
    },
    enabled: universityIds.length >= 2,
  })
}

// 5. Hooks for saved comparisons
export interface SavedComparison {
  id: string;
  name: string;
  description?: string;
  universityIds: string[];
  universities?: Array<{
    id: string;
    slug: string;
    name: string;
    shortName?: string;
    logoUrl?: string;
    city: string;
    country: string;
  }>;
  createdAt: string;
}

export function useSavedComparisons() {
  return useQuery<SavedComparison[]>({
    queryKey: ['saved-comparisons'],
    queryFn: async () => {
      const response = await api.get<SavedComparison[]>('/compare/saved')
      return response.data
    },
  })
}

export function useSavedComparison(id: string) {
  return useQuery({
    queryKey: ['saved-comparison', id],
    queryFn: async () => {
      const response = await api.get(`/compare/saved/${id}`)
      return response.data
    },
    enabled: Boolean(id),
  })
}

export function useSaveComparison() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      universityIds: string[];
    }) => {
      const response = await api.post('/compare/saved', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-comparisons'] })
      toast.success('Comparison saved successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save comparison')
    },
  })
}

export function useDeleteComparison() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/compare/saved/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-comparisons'] })
      toast.success('Comparison deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete comparison')
    },
  })
}

