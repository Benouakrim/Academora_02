import { useState } from 'react';
import { Filter } from 'lucide-react';
import { useEffect } from 'react';
import { useUniversitySearch } from '@/hooks/useUniversitySearch';
import { useSearchStore, countActiveFilters } from '@/store/useSearchStore';
import { useInitialSearchCriteria } from '@/hooks/useInitialSearchCriteria';
import AdvancedFiltersModal from '@/components/search/AdvancedFiltersModal';
import SearchHeaderBar from '@/components/search/SearchHeaderBar';
import UniversityCardGrid from '@/components/search/UniversityCardGrid';
import UniversityCompactList from '@/components/search/UniversityCompactList';
import UniversityMapLayout from '@/components/search/UniversityMapLayout';
import PaginationControls from '@/components/search/PaginationControls';

import MatchModeEmptyState from '@/components/search/MatchModeEmptyState';
import CompareFloatingButton from '@/components/search/CompareFloatingButton';
import RecommendationsPanel from '@/components/search/RecommendationsPanel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/common/SEO';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function SearchPage() {
  // Scroll to top on page load/refresh
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // Load user's profile data to pre-fill filters
  const { isLoading: loadingProfile } = useInitialSearchCriteria();
  
  // Get search data using the new discovery engine
  const { data, isLoading, error } = useUniversitySearch();
  
  // Get state from store
  const { 
    criteria, 
    viewType, 
    viewMode,
    isFetching,
    isProfileLoaded,
    hasCompleteProfile,
  } = useSearchStore();

  // Advanced filter modal state
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  // Calculate active filters count
  const activeFiltersCount = countActiveFilters(criteria);

  // Check if profile is complete for match mode
  const isProfileComplete = hasCompleteProfile();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black relative">
      <SEO title="Search Universities - AcademOra" description="Find your dream university from our global database." />
      
      {/* Minimalist Search Header Bar - Fixed */}
      <SearchHeaderBar
        totalResults={data?.pagination.totalResults || 0}
        appliedFiltersCount={activeFiltersCount}
        isLoading={isLoading}
        isProfileLoaded={isProfileLoaded}
        loadingProfile={loadingProfile}
        onAdvancedFiltersClick={() => setAdvancedFiltersOpen(true)}
      />

      {/* Main Content Area */}
      <div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Advanced Filters Modal (triggered by Advanced Filters button) */}
          <AdvancedFiltersModal 
            open={advancedFiltersOpen} 
            onOpenChange={setAdvancedFiltersOpen}
          />

          {/* Recommendations Panel - Only in Match Mode with Results */}
          {viewMode === 'MATCH' && isProfileComplete && data && data.results.length > 0 && (
            <div className="mb-8">
              <RecommendationsPanel 
                results={data.results}
                userProfile={criteria.userProfile}
              />
            </div>
          )}

          {/* Results Area */}
          <main className="w-full">
            <ErrorBoundary
              fallback={
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-20 w-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                    <Filter className="h-10 w-10 text-red-600 opacity-50" />
                  </div>
                  <h3 className="text-lg font-semibold">Error loading search results</h3>
                  <p className="text-muted-foreground max-w-sm mt-2 mb-4">
                    An unexpected error occurred while loading universities. Try adjusting your filters.
                  </p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Refresh Page
                  </Button>
                </div>
              }
            >
              {error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-20 w-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                    <Filter className="h-10 w-10 text-red-600 opacity-50" />
                  </div>
                  <h3 className="text-lg font-semibold">Error loading universities</h3>
                  <p className="text-muted-foreground max-w-sm mt-2">
                    {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
                  </p>
                </div>
              ) : viewMode === 'MATCH' && !isProfileComplete ? (
                <MatchModeEmptyState />
              ) : data && data.results.length > 0 ? (
                <>
                  {/* Multi-View Rendering */}
                  {viewType === 'CARD' && (
                    <UniversityCardGrid 
                      results={data.results} 
                      isLoading={isLoading || isFetching}
                    />
                  )}
                  
                  {viewType === 'LIST' && (
                    isLoading || isFetching ? (
                      <div className="space-y-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 rounded-lg border">
                            <Skeleton className="h-16 w-16 rounded" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <UniversityCompactList results={data.results} />
                    )
                  )}
                  
                  {viewType === 'MAP' && (
                    <UniversityMapLayout results={data.results} />
                  )}
                  
                  {/* Pagination Controls - Only for Card and List views */}
                  {(viewType === 'CARD' || viewType === 'LIST') && (
                    <PaginationControls
                      totalResults={data.pagination.totalResults}
                      currentPage={data.pagination.currentPage}
                      limit={criteria.limit}
                      isLoading={isLoading || isFetching}
                    />
                  )}
                </>
              ) : isLoading || isFetching ? (
                viewType === 'CARD' ? (
                  <UniversityCardGrid results={[]} isLoading={true} />
                ) : (
                  <div className="space-y-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 rounded-lg border">
                        <Skeleton className="h-16 w-16 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-20 w-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                    <Filter className="h-10 w-10 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-lg font-semibold">No universities found</h3>
                  <p className="text-muted-foreground max-w-sm mt-2">
                    Try adjusting your filters or search query to see more results.
                  </p>
                </div>
              )}
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Floating Compare Button */}
      <CompareFloatingButton />
    </div>
  )
}
