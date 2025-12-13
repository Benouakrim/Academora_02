import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Historical metric record for a single year.
 * These fields align with UniversityMetricHistory table schema.
 */
export interface MetricHistoryRecord {
  year: number;
  ranking: number | null;
  acceptanceRate: number | null;
  tuitionCost: number | null;
  employmentRate: number | null;
  averageSalary: number | null;
  studentCount: number | null;
}

/**
 * Response structure from the metric history API endpoint.
 */
export interface MetricHistoryResponse {
  success: boolean;
  data: MetricHistoryRecord[];
  university: {
    id: string;
    slug: string;
    name: string;
  };
  yearsRequested: number;
  recordsFound: number;
}

/**
 * Hook to fetch historical metric data for a specific university.
 * 
 * This hook leverages React Query for automatic caching, stale time management,
 * and request deduplication. Historical data is considered stable and is cached
 * aggressively on the client (24-hour TTL).
 * 
 * Usage:
 * ```tsx
 * const { data, isLoading, isError } = useUniversityHistory(universityId, 5);
 * ```
 * 
 * @param universityId - The UUID of the university
 * @param years - Number of years of history to fetch (default: 5, max: 50)
 * @returns Query result with data, loading state, and error state
 */
export function useUniversityHistory(universityId: string, years: number = 5) {
  return useQuery<MetricHistoryRecord[]>({
    queryKey: ['universityHistory', universityId, years],
    queryFn: async () => {
      if (!universityId) return [];
      
      try {
        const res = await api.get<MetricHistoryResponse>(
          `/universities/${universityId}/history`,
          {
            params: { years },
          }
        );
        
        return res.data.data || [];
      } catch (error) {
        console.error(`Failed to fetch history for university ${universityId}:`, error);
        throw error;
      }
    },
    // Only run the query if we have a valid universityId
    enabled: !!universityId && universityId.length > 0,
    
    // Historical data is stable and can be cached aggressively
    // 24 hours = 86,400,000 ms
    staleTime: 24 * 60 * 60 * 1000,
    
    // Keep the data in cache for 7 days
    gcTime: 7 * 24 * 60 * 60 * 1000,
    
    // Retry failed requests up to 2 times with exponential backoff
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch data for a specific metric from a university's history.
 * 
 * This is a convenience hook that filters the full history to a specific metric.
 * 
 * Usage:
 * ```tsx
 * const { data: acceptanceRateHistory } = useUniversityMetricHistory(
 *   universityId,
 *   'acceptanceRate',
 *   5
 * );
 * ```
 * 
 * @param universityId - The UUID of the university
 * @param metric - The specific metric to extract
 * @param years - Number of years of history to fetch
 * @returns Filtered data for just the requested metric
 */
export function useUniversityMetricHistory(
  universityId: string,
  metric: keyof MetricHistoryRecord,
  years: number = 5
) {
  const { data, isLoading, isError } = useUniversityHistory(universityId, years);

  // Extract just the requested metric
  const filteredData = data?.map((record) => ({
    year: record.year,
    value: record[metric],
  })) || [];

  return { data: filteredData, isLoading, isError };
}
