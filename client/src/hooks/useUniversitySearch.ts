import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSearchStore, selectDebouncedCriteria, selectIsFetching } from '@/store/useSearchStore';
import { useEffect } from 'react';

// ========================================
// Types
// ========================================

export type University = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string | null;
  country: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  acceptanceRate: number | null;
  tuitionOutState: number | null;
  tuitionInternational: number | null;
  ranking: number | null;
  studentLifeScore: number | null;
  avgGpa: number | null;
  avgSatScore: number | null;
  avgActScore: number | null;
  diversityScore: number | null;
  safetyRating: number | null;
  employmentRate: number | null;
  alumniNetwork: number | null;
  internshipSupport: number | null;
};

export type ScoringReason = {
  code: string;
  message: string;
  impact: 'positive' | 'negative' | 'neutral';
  value?: number | string;
};

export type UniversityMatchResult = {
  university: University;
  matchScore: number;
  matchPercentage: number;
  breakdown: {
    academic: { score: number; reasons: ScoringReason[] };
    financial: { score: number; reasons: ScoringReason[] };
    social: { score: number; reasons: ScoringReason[] };
    location: { score: number; reasons: ScoringReason[] };
    future: { score: number; reasons: ScoringReason[] };
  };
  scoreBreakdown: {
    academic: { score: number; weight: number; contribution: number; reasons: ScoringReason[] };
    financial: { score: number; weight: number; contribution: number; reasons: ScoringReason[] };
    social: { score: number; weight: number; contribution: number; reasons: ScoringReason[] };
    location: { score: number; weight: number; contribution: number; reasons: ScoringReason[] };
    future: { score: number; weight: number; contribution: number; reasons: ScoringReason[] };
    total: number;
  };
};

export type DiscoveryResponse = {
  results: UniversityMatchResult[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    applied: number;
    available?: {
      countries: string[];
      majors: string[];
      settings: string[];
    };
  };
  restricted?: {
    reason: string;
    message: string;
    actualTotal: number;
    showing: number;
  };
};

// ========================================
// Hook: useUniversitySearch
// ========================================

/**
 * High-performance university search hook with centralized state management
 * Automatically subscribes to the search store and uses debounced criteria
 */
export function useUniversitySearch() {
  // Subscribe to debounced criteria from the store
  const debouncedCriteria = useSearchStore(selectDebouncedCriteria);
  const setIsFetching = useSearchStore((state) => state.setIsFetching);

  // Use React Query for efficient data fetching with caching
  const query = useQuery({
    queryKey: ['university-discovery', debouncedCriteria],
    queryFn: async (): Promise<DiscoveryResponse> => {
      setIsFetching(true);
      try {
        const { data } = await api.post<DiscoveryResponse>(
          '/matching/universities',
          debouncedCriteria
        );
        return data;
      } finally {
        setIsFetching(false);
      }
    },
    // Optimized cache settings for performance
    staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh longer
    gcTime: 1000 * 60 * 10, // 10 minutes - keep in cache longer (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Use cached data if available
    refetchOnReconnect: false, // Don't refetch on network reconnection
  });

  // Sync isFetching state with store
  useEffect(() => {
    setIsFetching(query.isFetching);
  }, [query.isFetching, setIsFetching]);

  return query;
}

// ========================================
// Legacy Hook (for backward compatibility)
// ========================================

export type SearchFilters = {
  search?: string;
  country?: string;
  major?: string;
  maxTuition?: number;
  minGpa?: number;
  climateZone?: string;
  setting?: string;
  minSafetyRating?: number;
  minPartySceneRating?: number;
  minAcceptanceRate?: number;
  minAvgSat?: number;
  requiredIelts?: number;
};

/**
 * Legacy search hook for backward compatibility
 * @deprecated Use useUniversitySearch() with useSearchStore instead
 */
export function useUniversitySearchLegacy(filters: SearchFilters) {
  return useQuery({
    queryKey: ['universities-legacy', filters],
    queryFn: async () => {
      const { search, ...restFilters } = filters;
      const filtersForBackend = {
        ...restFilters,
        ...(search && { q: search }),
        ...(restFilters.minAcceptanceRate && {
          minAcceptanceRate: restFilters.minAcceptanceRate,
        }),
      };

      const params = Object.fromEntries(
        Object.entries(filtersForBackend)
          .filter(([_, v]) => v !== undefined && v !== '' && v !== null)
          .map(([k, v]) => [k, typeof v === 'number' ? String(v) : v])
      );

      const { data } = await api.get<{
        data: University[];
        meta: { total: number; page: number; pageSize: number };
      }>('/universities', { params });
      return data.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}
