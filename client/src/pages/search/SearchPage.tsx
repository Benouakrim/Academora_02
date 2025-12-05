import { useState } from 'react';
import { Filter } from 'lucide-react';
import { useUniversitySearch } from '@/hooks/useUniversitySearch';
import { useSearchStore, countActiveFilters } from '@/store/useSearchStore';
import { useInitialSearchCriteria } from '@/hooks/useInitialSearchCriteria';
import SearchFiltersComponent from '@/components/search/SearchFilters';
import SearchHeaderBar from '@/components/search/SearchHeaderBar';
import UniversityCardGrid from '@/components/search/UniversityCardGrid';
import UniversityCompactList from '@/components/search/UniversityCompactList';
import UniversityMapLayout from '@/components/search/UniversityMapLayout';
import PaginationControls from '@/components/search/PaginationControls';
import CategoryWeightPanel from '@/components/search/CategoryWeightPanel';
import MatchModeEmptyState from '@/components/search/MatchModeEmptyState';
import CompareFloatingButton from '@/components/search/CompareFloatingButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/common/SEO';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function SearchPage() {
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

  // Mobile filter sheet state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Calculate active filters count
  const activeFiltersCount = countActiveFilters(criteria);

  // Check if profile is complete for match mode
  const isProfileComplete = hasCompleteProfile();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black">
      <SEO title="Search Universities - AcademOra" description="Find your dream university from our global database." />
      
      {/* Persistent Search Header Bar */}
      <SearchHeaderBar
        totalResults={data?.pagination.totalResults || 0}
        appliedFiltersCount={activeFiltersCount}
        isLoading={isLoading}
        isProfileLoaded={isProfileLoaded}
        loadingProfile={loadingProfile}
        onMobileFiltersClick={() => setMobileFiltersOpen(true)}
      />

      {/* Main Content Area with Responsive Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filter Sheet (only on < lg) */}
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side="left" className="w-[340px] sm:w-[400px] overflow-y-auto p-0">
            <SheetHeader className="px-6 pt-6 pb-4 border-b">
              <SheetTitle>Filter Universities</SheetTitle>
            </SheetHeader>
            <div className="px-2">
              <SearchFiltersComponent />
            </div>
          </SheetContent>
        </Sheet>

        {/* Filters Section - Above Results (Desktop) */}
        <div className="hidden lg:block mb-8">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border shadow-sm">
            <SearchFiltersComponent />
          </div>
        </div>

        {/* Category Weight Panel - Only in Match Mode */}
        {viewMode === 'MATCH' && isProfileComplete && (
          <div className="mb-8">
            <CategoryWeightPanel />
          </div>
        )}

        {/* Results Area */}
        <main className="w-full">{/* Full width layout */}
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
                  {/* Results Summary Header */}
                  <div className="mb-6 pb-4 border-b border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          Found {data.pagination.totalResults.toLocaleString()} {data.pagination.totalResults === 1 ? 'University' : 'Universities'}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Showing {((data.pagination.currentPage - 1) * criteria.limit) + 1} - {Math.min(data.pagination.currentPage * criteria.limit, data.pagination.totalResults)} of {data.pagination.totalResults.toLocaleString()}
                          {data.restricted && (
                            <Badge variant="outline" className="ml-2 border-amber-400 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20">
                              Free tier: Top 3 results shown
                            </Badge>
                          )}
                        </p>
                      </div>
                      {activeFiltersCount > 0 && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="px-3 py-1">
                            {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

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

      {/* Floating Compare Button */}
      <CompareFloatingButton />
    </div>
  )
}
