import { SlidersHorizontal, UserCheck } from 'lucide-react';
import { useSearchStore } from '@/store/useSearchStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SortDropdown } from '@/components/search/SortDropdown';
import ViewToggle from '@/components/search/ViewToggle';
import ViewModeToggle from '@/components/search/ViewModeToggle';
import LimitInput from '@/components/search/LimitInput';

interface SearchHeaderBarProps {
  totalResults: number;
  appliedFiltersCount: number;
  isLoading: boolean;
  isProfileLoaded: boolean;
  loadingProfile: boolean;
  onMobileFiltersClick: () => void;
}

/**
 * SearchHeaderBar Component
 * Persistent sticky header containing:
 * - Primary search input
 * - Results summary
 * - Sort dropdown
 * - View toggle
 * - Limit input
 * - Mobile filter button (< lg breakpoint)
 */
export default function SearchHeaderBar({
  totalResults,
  appliedFiltersCount,
  isLoading,
  isProfileLoaded,
  loadingProfile,
  onMobileFiltersClick,
}: SearchHeaderBarProps) {
  const { criteria, viewMode, setSearchTextDebounced } = useSearchStore();

  return (
    <div className="bg-white dark:bg-neutral-900 border-b border-border sticky top-16 z-30 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-col gap-4">
          {/* Top Row: Search Bar and Mobile Filter Button */}
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Search universities by name, location, or major..."
              value={criteria.searchText || ''}
              onChange={(e) => setSearchTextDebounced(e.target.value)}
              className="flex-1"
            />
            
            {/* Mobile Filter Button - Only visible on mobile */}
            <Button 
              variant="outline" 
              className="lg:hidden gap-2 shrink-0"
              onClick={onMobileFiltersClick}
            >
              <SlidersHorizontal className="h-4 w-4" /> 
              Filters
              {appliedFiltersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                  {appliedFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Bottom Row: Results Summary and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Results Summary */}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {loadingProfile ? (
                  <span className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 animate-pulse" />
                    Loading your preferences...
                  </span>
                ) : isProfileLoaded ? (
                  <span className="flex items-center gap-2 flex-wrap">
                    <span>
                      <span className="font-semibold">{totalResults.toLocaleString()}</span> universities found
                      {appliedFiltersCount > 0 && (
                        <span className="ml-1">
                          ({appliedFiltersCount} filter{appliedFiltersCount !== 1 ? 's' : ''} applied)
                        </span>
                      )}
                    </span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Personalized
                    </Badge>
                  </span>
                ) : !isLoading ? (
                  <>
                    <span className="font-semibold">{totalResults.toLocaleString()}</span> universities found
                    {appliedFiltersCount > 0 && (
                      <span className="ml-1">
                        ({appliedFiltersCount} filter{appliedFiltersCount !== 1 ? 's' : ''} applied)
                      </span>
                    )}
                  </>
                ) : (
                  'Searching...'
                )}
              </p>
            </div>
            
            {/* Sort and View Controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <ViewModeToggle />
              <LimitInput />
              {viewMode === 'BROWSE' && <SortDropdown />}
              <ViewToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
