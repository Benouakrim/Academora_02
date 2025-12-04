import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSearchStore } from '@/store/useSearchStore';
import type { DiscoveryCriteria } from '@/store/useSearchStore';
import { useEffect } from 'react';

/**
 * Hook to fetch and apply initial search criteria based on user's profile
 * Automatically pre-fills search filters with user's academic, financial, and location data
 * Only applies if store is at default state to avoid overwriting user edits
 * 
 * @returns React Query result with initial criteria
 */
export function useInitialSearchCriteria() {
  const setProfileCriteria = useSearchStore((state) => state.setProfileCriteria);

  const query = useQuery({
    queryKey: ['initial-search-criteria'],
    queryFn: async (): Promise<DiscoveryCriteria> => {
      const { data } = await api.get<DiscoveryCriteria>('/matching/initial-criteria');
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - profile data doesn't change often
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    retry: 1,
  });

  // Automatically apply initial criteria to search store when loaded
  // Only applies if store is at default state (no user edits)
  useEffect(() => {
    if (query.data) {
      setProfileCriteria(query.data);
    }
  }, [query.data, setProfileCriteria]);

  return query;
}

/**
 * Hook to manually fetch initial criteria without auto-applying
 * Useful when you want to preview or merge with existing criteria
 */
export function useFetchInitialCriteria() {
  return useQuery({
    queryKey: ['initial-search-criteria'],
    queryFn: async (): Promise<DiscoveryCriteria> => {
      const { data } = await api.get<DiscoveryCriteria>('/matching/initial-criteria');
      return data;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    enabled: false, // Manual trigger
  });
}

// ========================================
// Usage Examples
// ========================================

/**
 * Example 1: Auto-load user's profile data on search page mount
 */
export function SearchPageWithAutoLoad() {
  // Automatically fetches and applies user's profile data
  const { isLoading, error } = useInitialSearchCriteria();

  if (isLoading) {
    return <div>Loading your preferences...</div>;
  }

  if (error) {
    return <div>Using default filters</div>;
  }

  return (
    <div>
      {/* Search filters are now pre-filled from user's profile */}
      <SearchFilters />
      <SearchResults />
    </div>
  );
}

/**
 * Example 2: Manual trigger with merge option
 */
export function SearchPageWithManualLoad() {
  const { refetch: loadProfile } = useFetchInitialCriteria();
  const { criteria, setCriteria } = useSearchStore();

  const handleLoadProfile = async () => {
    const result = await loadProfile();
    if (result.data) {
      // Option A: Replace all criteria
      setCriteria(result.data);

      // Option B: Merge with existing (keeping user's manual changes)
      // setCriteria({
      //   ...result.data,
      //   searchText: criteria.searchText, // Keep current search
      //   page: criteria.page, // Keep current page
      // });
    }
  };

  return (
    <div>
      <button onClick={handleLoadProfile}>
        Load My Preferences
      </button>
      <SearchFilters />
      <SearchResults />
    </div>
  );
}

/**
 * Example 3: Reset to profile defaults button
 */
export function ResetToProfileButton() {
  const { refetch } = useFetchInitialCriteria();
  const setCriteria = useSearchStore((state) => state.setCriteria);

  const handleReset = async () => {
    const result = await refetch();
    if (result.data) {
      setCriteria(result.data);
    }
  };

  return (
    <button
      onClick={handleReset}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Reset to My Profile
    </button>
  );
}

/**
 * Example 4: Show what will be pre-filled before applying
 */
export function ProfilePreviewPanel() {
  const { data, isLoading } = useFetchInitialCriteria();

  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h3 className="font-semibold mb-2">Your Profile Preferences</h3>
      
      {/* Academic Info */}
      {data.academics && (
        <div className="mb-2">
          <strong>Academic:</strong>
          {data.academics.minGpa && ` GPA: ${data.academics.minGpa.toFixed(2)}+`}
          {data.academics.minSatScore && ` SAT: ${data.academics.minSatScore}+`}
          {data.academics.majors && ` Majors: ${data.academics.majors.join(', ')}`}
        </div>
      )}

      {/* Financial Info */}
      {data.financials && (
        <div className="mb-2">
          <strong>Financial:</strong>
          {data.financials.maxTuition && ` Max Budget: $${data.financials.maxTuition.toLocaleString()}`}
          {data.financials.needsFinancialAid && ' (Needs Aid)'}
        </div>
      )}

      {/* User Profile for Scoring */}
      {data.userProfile && (
        <div className="mb-2">
          <strong>Your Stats:</strong>
          {data.userProfile.gpa && ` GPA: ${data.userProfile.gpa.toFixed(2)}`}
          {data.userProfile.satScore && ` SAT: ${data.userProfile.satScore}`}
          {data.userProfile.preferredMajor && ` Major: ${data.userProfile.preferredMajor}`}
        </div>
      )}
    </div>
  );
}

// Stub components for examples
function SearchFilters() {
  return <div>Search Filters Component</div>;
}

function SearchResults() {
  return <div>Search Results Component</div>;
}
