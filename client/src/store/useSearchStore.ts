import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ========================================
// Types matching backend DiscoveryCriteria
// ========================================

export type CampusSetting = 'URBAN' | 'SUBURBAN' | 'RURAL';

export type TestPolicy = 
  | 'TEST_REQUIRED'
  | 'TEST_OPTIONAL'
  | 'TEST_BLIND'
  | 'TEST_FLEXIBLE';

export interface AcademicFilters {
  minGpa?: number;
  maxGpa?: number;
  minSatScore?: number;
  maxSatScore?: number;
  minActScore?: number;
  maxActScore?: number;
  majors?: string[];
  testPolicy?: TestPolicy;
}

export interface FinancialFilters {
  minTuition?: number;
  maxTuition?: number;
  minGrantAid?: number;
  maxNetCost?: number;
  needsFinancialAid?: boolean;
}

export interface LocationFilters {
  countries?: string[];
  states?: string[];
  cities?: string[];
  settings?: CampusSetting[];
  climateZones?: string[];
  minSafetyRating?: number;
}

export interface SocialFilters {
  minStudentLifeScore?: number;
  minDiversityScore?: number;
  maxDiversityScore?: number;
  minPartyScene?: number;
  maxPartyScene?: number;
}

export interface FutureFilters {
  minEmploymentRate?: number;
  minAlumniNetwork?: number;
  minInternshipSupport?: number;
  needsVisaSupport?: boolean;
  minVisaDuration?: number;
}

export interface UserProfile {
  gpa?: number;
  satScore?: number;
  actScore?: number;
  preferredMajor?: string;
  maxBudget?: number;
}

export interface CategoryWeights {
  academic: number;  // 0-100
  financial: number; // 0-100
  location: number;  // 0-100
  social: number;    // 0-100
  future: number;    // 0-100
}

export type SortOption = 
  | 'matchPercentage'
  | 'tuition_asc'
  | 'tuition_desc'
  | 'ranking_asc'
  | 'ranking_desc'
  | 'acceptanceRate_asc'
  | 'acceptanceRate_desc'
  | 'name_asc'
  | 'name_desc';

export type ViewType = 'CARD' | 'LIST' | 'MAP';

export type ViewMode = 'BROWSE' | 'MATCH';

// Complete discovery criteria matching backend schema
export interface DiscoveryCriteria {
  searchText?: string;
  academics?: AcademicFilters;
  financials?: FinancialFilters;
  location?: LocationFilters;
  social?: SocialFilters;
  future?: FutureFilters;
  userProfile?: UserProfile;
  weights?: CategoryWeights;
  sortBy: SortOption;
  page: number;
  limit: number;
  includeReachSchools?: boolean;
  strictFiltering?: boolean;
}

// ========================================
// Search Store State & Actions
// ========================================

export interface SearchState {
  // --- Core Search State ---
  criteria: DiscoveryCriteria;
  
  // --- UI State ---
  viewType: ViewType;
  viewMode: ViewMode;
  isFetching: boolean;
  
  // --- Profile Pre-fill Tracking ---
  profileFilledFields: Set<string>;
  isProfileLoaded: boolean;
  
  // --- Debounced State ---
  debouncedCriteria: DiscoveryCriteria;
  debounceTimerId: number | null;
  
  // --- Actions ---
  setCriteria: (criteria: Partial<DiscoveryCriteria>) => void;
  setCriteriaDebounced: (criteria: Partial<DiscoveryCriteria>, delay?: number) => void;
  setSearchText: (searchText: string) => void;
  setSearchTextDebounced: (searchText: string, delay?: number) => void;
  setAcademicFilters: (filters: Partial<AcademicFilters>) => void;
  setFinancialFilters: (filters: Partial<FinancialFilters>) => void;
  setLocationFilters: (filters: Partial<LocationFilters>) => void;
  setSocialFilters: (filters: Partial<SocialFilters>) => void;
  setFutureFilters: (filters: Partial<FutureFilters>) => void;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  setWeights: (weights: Partial<CategoryWeights>) => void;
  setSortBy: (sortBy: SortOption) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setViewType: (viewType: ViewType) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setIsFetching: (isFetching: boolean) => void;
  resetFilters: () => void;
  clearDebounceTimer: () => void;
  setProfileCriteria: (criteria: Partial<DiscoveryCriteria>) => void;
  isFieldFromProfile: (fieldPath: string) => boolean;
  clearProfileTracking: () => void;
  hasCompleteProfile: () => boolean;
}

// Default initial state
const getDefaultCriteria = (): DiscoveryCriteria => ({
  searchText: '',
  sortBy: 'matchPercentage',
  page: 1,
  limit: 20,
  includeReachSchools: true,
  strictFiltering: false,
});

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      // --- Initial State ---
      criteria: getDefaultCriteria(),
      debouncedCriteria: getDefaultCriteria(),
      viewType: 'CARD',
      viewMode: 'BROWSE',
      isFetching: false,
      debounceTimerId: null,
      profileFilledFields: new Set<string>(),
      isProfileLoaded: false,

      // --- Actions ---
      
      /**
       * Update criteria immediately (no debounce)
       */
      setCriteria: (newCriteria) => {
        set((state) => ({
          criteria: { ...state.criteria, ...newCriteria },
          debouncedCriteria: { ...state.criteria, ...newCriteria }, // Update debounced immediately
        }));
      },

      /**
       * Update criteria with debouncing to prevent excessive API calls
       * @param newCriteria - Partial criteria to update
       * @param delay - Debounce delay in milliseconds (default: 300ms)
       */
      setCriteriaDebounced: (newCriteria, delay = 300) => {
        const state = get();
        
        // Clear existing timer
        if (state.debounceTimerId) {
          clearTimeout(state.debounceTimerId);
        }

        // Update criteria immediately for UI responsiveness
        const updatedCriteria = { ...state.criteria, ...newCriteria };
        set({ criteria: updatedCriteria });

        // Set new timer to update debounced criteria after delay
        const timerId = setTimeout(() => {
          set({ 
            debouncedCriteria: updatedCriteria,
            debounceTimerId: null,
          });
        }, delay);

        set({ debounceTimerId: timerId });
      },

      /**
       * Update search text immediately
       */
      setSearchText: (searchText) => {
        set((state) => ({
          criteria: { ...state.criteria, searchText, page: 1 },
          debouncedCriteria: { ...state.criteria, searchText, page: 1 },
        }));
      },

      /**
       * Update search text with debouncing (most common use case)
       */
      setSearchTextDebounced: (searchText, delay = 300) => {
        const state = get();
        
        // Clear existing timer
        if (state.debounceTimerId) {
          clearTimeout(state.debounceTimerId);
        }

        // Update criteria immediately for UI
        const updatedCriteria = { ...state.criteria, searchText, page: 1 };
        set({ criteria: updatedCriteria });

        // Set new timer
        const timerId = setTimeout(() => {
          set({ 
            debouncedCriteria: updatedCriteria,
            debounceTimerId: null,
          });
        }, delay);

        set({ debounceTimerId: timerId });
      },

      /**
       * Update academic filters with debouncing
       */
      setAcademicFilters: (filters) => {
        const state = get();
        const updatedAcademics = { ...state.criteria.academics, ...filters };
        state.setCriteriaDebounced({ academics: updatedAcademics, page: 1 });
      },

      /**
       * Update financial filters with debouncing
       */
      setFinancialFilters: (filters) => {
        const state = get();
        const updatedFinancials = { ...state.criteria.financials, ...filters };
        state.setCriteriaDebounced({ financials: updatedFinancials, page: 1 });
      },

      /**
       * Update location filters with debouncing
       */
      setLocationFilters: (filters) => {
        const state = get();
        const updatedLocation = { ...state.criteria.location, ...filters };
        state.setCriteriaDebounced({ location: updatedLocation, page: 1 });
      },

      /**
       * Update social filters with debouncing
       */
      setSocialFilters: (filters) => {
        const state = get();
        const updatedSocial = { ...state.criteria.social, ...filters };
        state.setCriteriaDebounced({ social: updatedSocial, page: 1 });
      },

      /**
       * Update future filters with debouncing
       */
      setFutureFilters: (filters) => {
        const state = get();
        const updatedFuture = { ...state.criteria.future, ...filters };
        state.setCriteriaDebounced({ future: updatedFuture, page: 1 });
      },

      /**
       * Update user profile for scoring
       */
      setUserProfile: (profile) => {
        const state = get();
        const updatedProfile = { ...state.criteria.userProfile, ...profile };
        state.setCriteriaDebounced({ userProfile: updatedProfile, page: 1 });
      },

      /**
       * Update category weights (immediate, no debounce)
       */
      setWeights: (weights) => {
        set((state) => {
          const currentWeights = state.criteria.weights || {
            academic: 40,
            financial: 30,
            location: 15,
            social: 10,
            future: 5,
          };
          const updatedWeights = { ...currentWeights, ...weights };
          
          return {
            criteria: { ...state.criteria, weights: updatedWeights, page: 1 },
            debouncedCriteria: { ...state.debouncedCriteria, weights: updatedWeights, page: 1 },
          };
        });
      },

      /**
       * Update sort option (immediate, no debounce)
       */
      setSortBy: (sortBy) => {
        set((state) => ({
          criteria: { ...state.criteria, sortBy },
          debouncedCriteria: { ...state.criteria, sortBy },
        }));
      },

      /**
       * Update page number (immediate, no debounce)
       */
      setPage: (page) => {
        set((state) => ({
          criteria: { ...state.criteria, page },
          debouncedCriteria: { ...state.criteria, page },
        }));
      },

      /**
       * Update results limit (immediate, no debounce)
       */
      setLimit: (limit) => {
        set((state) => ({
          criteria: { ...state.criteria, limit, page: 1 },
          debouncedCriteria: { ...state.criteria, limit, page: 1 },
        }));
      },

      /**
       * Change view type (Card, List, Map)
       */
      setViewType: (viewType) => {
        set({ viewType });
      },

      /**
       * Change view mode (Browse, Match)
       */
      setViewMode: (viewMode) => {
        set({ viewMode });
        // Auto-sort by match percentage when entering match mode
        if (viewMode === 'MATCH') {
          const state = get();
          if (state.criteria.sortBy !== 'matchPercentage') {
            set((state) => ({
              criteria: { ...state.criteria, sortBy: 'matchPercentage' },
              debouncedCriteria: { ...state.criteria, sortBy: 'matchPercentage' },
            }));
          }
        }
      },

      /**
       * Set fetching state
       */
      setIsFetching: (isFetching) => {
        set({ isFetching });
      },

      /**
       * Reset all filters to defaults
       */
      resetFilters: () => {
        const state = get();
        if (state.debounceTimerId) {
          clearTimeout(state.debounceTimerId);
        }
        const defaultCriteria = getDefaultCriteria();
        set({
          criteria: defaultCriteria,
          debouncedCriteria: defaultCriteria,
          debounceTimerId: null,
        });
      },

      /**
       * Clear debounce timer
       */
      clearDebounceTimer: () => {
        const state = get();
        if (state.debounceTimerId) {
          clearTimeout(state.debounceTimerId);
          set({ debounceTimerId: null });
        }
      },

      /**
       * Set criteria from profile and track which fields were pre-filled
       * Only applies if store is at default state to avoid overwriting user edits
       */
      setProfileCriteria: (profileCriteria) => {
        const state = get();
        const defaultCriteria = getDefaultCriteria();
        
        // Check if current criteria is at default state (user hasn't made edits)
        const isAtDefaultState = 
          !state.isProfileLoaded &&
          state.criteria.searchText === defaultCriteria.searchText &&
          !state.criteria.academics &&
          !state.criteria.financials &&
          !state.criteria.location &&
          !state.criteria.social &&
          !state.criteria.future;
        
        if (!isAtDefaultState) {
          console.log('[SearchStore] Skipping profile pre-fill - user has made edits');
          return;
        }

        // Track which fields are being filled from profile
        const filledFields = new Set<string>();
        
        // Track academics fields
        if (profileCriteria.academics) {
          Object.entries(profileCriteria.academics).forEach(([key, value]) => {
            if (value !== undefined) {
              filledFields.add(`academics.${key}`);
            }
          });
        }
        
        // Track financials fields
        if (profileCriteria.financials) {
          Object.entries(profileCriteria.financials).forEach(([key, value]) => {
            if (value !== undefined) {
              filledFields.add(`financials.${key}`);
            }
          });
        }
        
        // Track location fields
        if (profileCriteria.location) {
          Object.entries(profileCriteria.location).forEach(([key, value]) => {
            if (value !== undefined) {
              filledFields.add(`location.${key}`);
            }
          });
        }
        
        // Track social fields
        if (profileCriteria.social) {
          Object.entries(profileCriteria.social).forEach(([key, value]) => {
            if (value !== undefined) {
              filledFields.add(`social.${key}`);
            }
          });
        }
        
        // Track future fields
        if (profileCriteria.future) {
          Object.entries(profileCriteria.future).forEach(([key, value]) => {
            if (value !== undefined) {
              filledFields.add(`future.${key}`);
            }
          });
        }
        
        // Track weights
        if (profileCriteria.weights) {
          filledFields.add('weights');
        }

        console.log('[SearchStore] Applied profile criteria. Filled fields:', Array.from(filledFields));
        
        set({
          criteria: { ...state.criteria, ...profileCriteria },
          debouncedCriteria: { ...state.criteria, ...profileCriteria },
          profileFilledFields: filledFields,
          isProfileLoaded: true,
        });
      },

      /**
       * Check if a specific field was pre-filled from profile
       */
      isFieldFromProfile: (fieldPath: string) => {
        return get().profileFilledFields.has(fieldPath);
      },

      /**
       * Clear profile tracking (when user manually edits a filter)
       */
      clearProfileTracking: () => {
        set({ profileFilledFields: new Set<string>() });
      },

      /**
       * Check if user has a complete profile for match mode
       */
      hasCompleteProfile: () => {
        const state = get();
        const profile = state.criteria.userProfile;
        
        // Check if user has basic academic info and preferences
        return !!(
          profile &&
          (profile.gpa || profile.satScore || profile.actScore) &&
          profile.preferredMajor
        );
      },
    }),
    {
      name: 'academora-search-store',
      partialize: (state) => ({
        // Only persist criteria, viewType, and viewMode, not fetching states or timers
        criteria: state.criteria,
        debouncedCriteria: state.debouncedCriteria,
        viewType: state.viewType,
        viewMode: state.viewMode,
      }),
    }
  )
);

// ========================================
// Selectors (for optimized re-renders)
// ========================================

export const selectDebouncedCriteria = (state: SearchState) => state.debouncedCriteria;
export const selectCriteria = (state: SearchState) => state.criteria;
export const selectViewType = (state: SearchState) => state.viewType;
export const selectIsFetching = (state: SearchState) => state.isFetching;
export const selectPagination = (state: SearchState) => ({
  page: state.criteria.page,
  limit: state.criteria.limit,
});
export const selectSortBy = (state: SearchState) => state.criteria.sortBy;

// ========================================
// Utility Functions
// ========================================

/**
 * Count the number of active filters in the search criteria
 * Used to display filter count badge on mobile filter button
 */
export const countActiveFilters = (criteria: DiscoveryCriteria): number => {
  let count = 0;
  
  // Academic filters
  if (criteria.academics) {
    const ac = criteria.academics;
    if (ac.minGpa || ac.maxGpa) count++;
    if (ac.minSatScore || ac.maxSatScore) count++;
    if (ac.minActScore || ac.maxActScore) count++;
    if (ac.majors && ac.majors.length > 0) count++;
    if (ac.testPolicy) count++;
  }
  
  // Financial filters
  if (criteria.financials) {
    const fin = criteria.financials;
    if (fin.maxTuition && fin.maxTuition < 100000) count++;
    if (fin.minGrantAid && fin.minGrantAid > 0) count++;
    if (fin.maxNetCost && fin.maxNetCost < 100000) count++;
    if (fin.needsFinancialAid) count++;
  }
  
  // Location filters
  if (criteria.location) {
    const loc = criteria.location;
    if (loc.countries && loc.countries.length > 0) count++;
    if (loc.states && loc.states.length > 0) count++;
    if (loc.settings && loc.settings.length > 0) count++;
    if (loc.climateZones && loc.climateZones.length > 0) count++;
    if (loc.minSafetyRating && loc.minSafetyRating > 0) count++;
  }
  
  // Social filters
  if (criteria.social) {
    const soc = criteria.social;
    if (soc.minStudentLifeScore && soc.minStudentLifeScore > 0) count++;
    if (soc.minDiversityScore || soc.maxDiversityScore) count++;
    if (soc.minPartyScene || soc.maxPartyScene) count++;
  }
  
  // Future/Career filters
  if (criteria.future) {
    const fut = criteria.future;
    if (fut.minEmploymentRate && fut.minEmploymentRate > 0) count++;
    if (fut.minAlumniNetwork && fut.minAlumniNetwork > 0) count++;
    if (fut.minInternshipSupport && fut.minInternshipSupport > 0) count++;
    if (fut.needsVisaSupport) count++;
    if (fut.minVisaDuration) count++;
  }
  
  return count;
};
