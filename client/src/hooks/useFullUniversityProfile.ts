// client/src/hooks/useFullUniversityProfile.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';
import { MicroContentBlock } from '@/../../shared/types/microContentBlocks';

/**
 * University Profile: All scalar fields from the University table
 * Used by canonical blocks (headers, key stats, etc.)
 */
export interface UniversityProfile {
  id: string;
  slug: string;
  name: string;
  shortName?: string | null;
  tagline?: string | null;
  description?: string | null;
  
  // Academic Metrics
  avgGpa?: number | null;
  avgSat?: number | null;
  avgAct?: number | null;
  acceptanceRate?: number | null;
  
  // Tuition & Financial
  tuitionInState?: number | null;
  tuitionOutState?: number | null;
  feesAndInsurance?: number | null;
  onCampusHousing?: number | null;
  mealPlanCost?: number | null;
  booksAndSupplies?: number | null;
  miscPersonal?: number | null;
  
  // Demographics
  totalStudents?: number | null;
  graduateStudents?: number | null;
  undergraduateStudents?: number | null;
  studentTeacherRatio?: number | null;
  femaleStudentPercentage?: number | null;
  domesticStudentPercentage?: number | null;
  
  // Location
  city?: string | null;
  state?: string | null;
  country?: string | null;
  campusType?: string | null;
  
  // Rankings
  overallRanking?: number | null;
  
  // Media
  logoUrl?: string | null;
  bannerImageUrl?: string | null;
  
  // Relationships
  claimedBy?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Merged Profile Response: Combines university scalars with blocks
 * This is the response from the cached getFullProfile endpoint
 */
export interface MergedProfileResponse {
  university: UniversityProfile;
  microContent: MicroContentBlock[];
}

/**
 * User Profile: Essential user data for inverse blocks
 * Extracted from the client-side user store
 */
export interface ClientUserProfile {
  gpa?: number | null;
  sat?: number | null;
  act?: number | null;
  // Add other relevant user fields here as needed
}

/**
 * Hook: useFullUniversityProfile
 * 
 * Fetches the complete, merged university profile (canonical data + blocks)
 * from the cached backend endpoint (Prompt 9) and combines it with
 * client-side user data for inverse block rendering.
 * 
 * Benefits:
 * - Single API request instead of multiple
 * - Server-side caching (60 minute TTL)
 * - Client-side React Query caching
 * - Complete data needed for all block types
 * - User data integration for personalization
 * 
 * @param slug - The university slug (URL-friendly identifier)
 * @returns Query result with merged profile and user profile data
 */
export function useFullUniversityProfile(slug: string) {
  // 1. Fetch User Data from client store (for inverse blocks)
  const userProfile = useUserStore(state => {
    const profile = state.profile;
    return {
      gpa: profile?.gpa || null,
      sat: profile?.satScore || null,
      act: profile?.actScore || null,
      // Add other user fields as needed
    };
  });

  // 2. Fetch Merged Entity from Cached API (Prompt 9)
  // Route: GET /api/universities/:slug/profile/full
  const query = useQuery<MergedProfileResponse>({
    queryKey: ['university-full-profile', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug is required');
      const res = await api.get(`/universities/${slug}/profile/full`);
      return res.data.data;
    },
    enabled: !!slug,
    // Client-side cache for 5 minutes
    // Server-side cache is 60 minutes (from backend)
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1,
  });

  // 3. Return Merged Data
  return {
    ...query,
    // Extracted profile data (for easier access)
    profile: query.data,
    // User profile for inverse blocks
    userProfile,
    // Convenience accessors
    universityData: query.data?.university,
    blocks: query.data?.microContent || [],
  };
}
