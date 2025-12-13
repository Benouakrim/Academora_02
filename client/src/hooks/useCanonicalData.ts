// client/src/hooks/useCanonicalData.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface CanonicalData {
  // Admissions metrics
  acceptanceRate?: number;
  avgGpa?: number;
  avgSatScore?: number;
  avgActScore?: number;
  satMath25?: number;
  satMath75?: number;
  satVerbal25?: number;
  satVerbal75?: number;
  actComposite25?: number;
  actComposite75?: number;
  minGpa?: number;

  // Financial metrics
  tuitionInState?: number;
  tuitionOutState?: number;
  tuitionInternational?: number;
  roomAndBoard?: number;
  booksAndSupplies?: number;
  costOfLiving?: number;
  averageNetPrice?: number;
  percentReceivingAid?: number;

  // Institutional metrics
  studentPopulation?: number;
  percentMale?: number;
  percentFemale?: number;
  diversityScore?: number;
  studentFacultyRatio?: number;
  graduationRate?: number;
  retentionRate?: number;
  employmentRate?: number;
  averageStartingSalary?: number;

  // Deadlines
  applicationDeadline?: string;
  earlyDecisionDeadline?: string;

  // General info
  websiteUrl?: string;
  logoUrl?: string;
  type?: string;
  classification?: string;
  setting?: string;
  slug?: string;
  name?: string;
}

/**
 * Fetches and caches canonical scalar data for a university.
 * This ensures that when a block loads, it has the current "source of truth" values
 * from the University table (not from MicroContent JSONB).
 *
 * Uses aggressive caching (5 minutes) as canonical data is assumed to change infrequently.
 */
export function useCanonicalData(universityId: string) {
  return useQuery<CanonicalData>({
    queryKey: ['university-canonical-data', universityId],
    queryFn: async () => {
      // NOTE: In a real implementation, this should call a dedicated, lightweight endpoint
      // that only returns necessary scalar fields, NOT the full university object.
      const res = await api.get(`/universities/${universityId}/canonical-metrics`);
      return res.data;
    },
    enabled: !!universityId,
    // Data is assumed to change infrequently, cache aggressively
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
