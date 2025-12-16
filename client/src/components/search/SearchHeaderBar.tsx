import { Search, MapPin, GraduationCap, SlidersHorizontal, ArrowUpDown, Settings } from 'lucide-react';
import { useState } from 'react';
import { useSearchStore } from '@/store/useSearchStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SortDropdown } from '@/components/search/SortDropdown';
import ViewToggle from '@/components/search/ViewToggle';
import ViewModeModal from '@/components/search/ViewModeModal';
import LimitInput from '@/components/search/LimitInput';

interface SearchHeaderBarProps {
  totalResults: number;
  appliedFiltersCount: number;
  isLoading: boolean;
  isProfileLoaded: boolean;
  loadingProfile: boolean;
  onAdvancedFiltersClick: () => void;
}

/**
 * SearchHeaderBar Component - Minimalist Design
 * Inspired by modern job search interfaces
 * Features:
 * - Fixed search bar with 3 focused inputs
 * - Advanced Filters button
 * - Modes button (Browse/Best Match)
 * - Results count display
 * - Sort dropdown
 */
export default function SearchHeaderBar({
  totalResults,
  appliedFiltersCount,
  isLoading,
  onAdvancedFiltersClick,
}: SearchHeaderBarProps) {
  const { criteria, viewMode, setSearchTextDebounced, setLocationFilters } = useSearchStore();
  
  const [locationInput, setLocationInput] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('');
  const [viewModeModalOpen, setViewModeModalOpen] = useState(false);

  const handleLocationChange = (value: string) => {
    setLocationInput(value);
    // Parse location input - could be country, state, or city
    if (value) {
      const locations = value.split(',').map(l => l.trim()).filter(l => l.length > 0);
      setLocationFilters({ countries: locations });
    } else {
      setLocationFilters({ countries: undefined });
    }
  };

  return (
    <div className="w-full bg-neutral-50 dark:bg-black border-b border-border shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Search Section */}
        <div className="py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Explore <span className="text-primary">universities</span>
          </h1>
          
          {/* Main Search Bar */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 shadow-lg overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* University Name/Keyword Input */}
              <div className="flex items-center flex-1 px-5 py-4 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
                <Input
                  type="text"
                  placeholder="Search by university, program or keyword"
                  value={criteria.searchText || ''}
                  onChange={(e) => setSearchTextDebounced(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 text-base !bg-transparent shadow-none"
                />
              </div>

              {/* Location Input */}
              <div className="flex items-center flex-1 px-5 py-4 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <MapPin className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
                <Input
                  type="text"
                  placeholder="City, region, country..."
                  value={locationInput}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 text-base !bg-transparent shadow-none"
                />
              </div>

              {/* Degree Level Input */}
              <div className="flex items-center flex-1 px-5 py-4 bg-white dark:bg-neutral-900">
                <GraduationCap className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
                <Input
                  type="text"
                  placeholder="Bachelor's, Master's, PhD..."
                  value={degreeLevel}
                  onChange={(e) => setDegreeLevel(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 text-base !bg-transparent shadow-none"
                />
              </div>
            </div>
          </div>

          {/* Filter and Mode Buttons Row */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={onAdvancedFiltersClick}
              className="gap-2 h-11 px-6 bg-neutral-900 dark:bg-neutral-800 text-white dark:text-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-700 border-0 font-medium rounded-lg"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Advanced Filters
              {appliedFiltersCount > 0 && (
                <span className="ml-1 px-2.5 py-0.5 text-xs bg-white/20 rounded-full font-semibold">
                  {appliedFiltersCount}
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setViewModeModalOpen(true)}
              className="gap-2 h-11 px-6 bg-neutral-900 dark:bg-neutral-800 text-white dark:text-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-700 border-0 font-medium rounded-lg"
            >
              <Settings className="h-4 w-4" />
              Modes
            </Button>

            <Button
              variant="outline"
              className="gap-2 h-11 px-6 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800 font-medium rounded-lg"
            >
              🔔 Search saved
            </Button>
          </div>
        </div>

        {/* Results Bar */}
        <div className="pb-5 border-t border-border pt-5 bg-white dark:bg-neutral-950">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Results Count */}
            <div className="flex items-center gap-3">
              {isLoading ? (
                <h2 className="text-lg sm:text-xl font-medium text-muted-foreground">Searching...</h2>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-foreground">{totalResults.toLocaleString()}</span>
                  <span className="text-base sm:text-lg text-muted-foreground font-medium">universities</span>
                </div>
              )}
              
              {/* Info Icon */}
              <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Info">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
                </svg>
              </button>
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">By relevance</span>
              </div>
              {viewMode === 'BROWSE' && (
                <>
                  <div className="h-6 w-px bg-border" />
                  <SortDropdown />
                </>
              )}
              <div className="h-6 w-px bg-border" />
              <LimitInput />
              <ViewToggle />
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Modal */}
      <ViewModeModal open={viewModeModalOpen} onOpenChange={setViewModeModalOpen} />
    </div>
  );
}
