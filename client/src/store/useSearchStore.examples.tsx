/**
 * useSearchStore Usage Examples
 * 
 * This file demonstrates how to use the centralized search store
 * for the University Discovery Engine
 */

import { useSearchStore, selectDebouncedCriteria } from './useSearchStore';
import { useUniversitySearch } from '@/hooks/useUniversitySearch';

// ========================================
// Example 1: Basic Search Component
// ========================================

export function SearchBar() {
  const { searchText, setSearchTextDebounced } = useSearchStore((state) => ({
    searchText: state.criteria.searchText,
    setSearchTextDebounced: state.setSearchTextDebounced,
  }));

  return (
    <input
      type="text"
      placeholder="Search universities..."
      value={searchText || ''}
      onChange={(e) => setSearchTextDebounced(e.target.value)}
      className="w-full px-4 py-2 border rounded-lg"
    />
  );
}

// ========================================
// Example 2: Filter Panel with Debouncing
// ========================================

export function AcademicFiltersPanel() {
  const { academics, setAcademicFilters } = useSearchStore((state) => ({
    academics: state.criteria.academics,
    setAcademicFilters: state.setAcademicFilters,
  }));

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Academic Filters</h3>
      
      {/* GPA Range */}
      <div>
        <label>Min GPA</label>
        <input
          type="number"
          min="0"
          max="4.0"
          step="0.1"
          value={academics?.minGpa || ''}
          onChange={(e) => 
            setAcademicFilters({ minGpa: parseFloat(e.target.value) || undefined })
          }
        />
      </div>

      {/* SAT Range */}
      <div>
        <label>Min SAT Score</label>
        <input
          type="number"
          min="400"
          max="1600"
          value={academics?.minSatScore || ''}
          onChange={(e) => 
            setAcademicFilters({ minSatScore: parseInt(e.target.value) || undefined })
          }
        />
      </div>

      {/* Major Selection */}
      <div>
        <label>Majors</label>
        <select
          multiple
          value={academics?.majors || []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
            setAcademicFilters({ majors: selected });
          }}
        >
          <option value="Computer Science">Computer Science</option>
          <option value="Engineering">Engineering</option>
          <option value="Business">Business</option>
          <option value="Medicine">Medicine</option>
        </select>
      </div>
    </div>
  );
}

// ========================================
// Example 3: Financial Filters
// ========================================

export function FinancialFiltersPanel() {
  const { financials, setFinancialFilters } = useSearchStore((state) => ({
    financials: state.criteria.financials,
    setFinancialFilters: state.setFinancialFilters,
  }));

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Financial Filters</h3>
      
      {/* Tuition Range */}
      <div>
        <label>Max Tuition</label>
        <input
          type="range"
          min="0"
          max="100000"
          step="1000"
          value={financials?.maxTuition || 50000}
          onChange={(e) => 
            setFinancialFilters({ maxTuition: parseInt(e.target.value) })
          }
        />
        <span>${financials?.maxTuition?.toLocaleString() || '50,000'}</span>
      </div>

      {/* Financial Aid */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={financials?.needsFinancialAid || false}
            onChange={(e) => 
              setFinancialFilters({ needsFinancialAid: e.target.checked })
            }
          />
          Need Financial Aid
        </label>
      </div>
    </div>
  );
}

// ========================================
// Example 4: Sorting & Pagination Controls
// ========================================

export function SortingControls() {
  const { sortBy, setSortBy } = useSearchStore((state) => ({
    sortBy: state.criteria.sortBy,
    setSortBy: state.setSortBy,
  }));

  return (
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value as any)}
      className="px-4 py-2 border rounded"
    >
      <option value="matchPercentage">Best Match</option>
      <option value="tuition_asc">Tuition: Low to High</option>
      <option value="tuition_desc">Tuition: High to Low</option>
      <option value="ranking_asc">Ranking: Best First</option>
      <option value="acceptanceRate_asc">Acceptance Rate: Low to High</option>
      <option value="name_asc">Name: A to Z</option>
    </select>
  );
}

export function PaginationControls() {
  const { page, setPage, limit, setLimit } = useSearchStore((state) => ({
    page: state.criteria.page,
    setPage: state.setPage,
    limit: state.criteria.limit,
    setLimit: state.setLimit,
  }));

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 border rounded disabled:opacity-50"
      >
        Previous
      </button>
      
      <span>Page {page}</span>
      
      <button
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 border rounded"
      >
        Next
      </button>

      <select
        value={limit}
        onChange={(e) => setLimit(parseInt(e.target.value))}
        className="px-2 py-1 border rounded"
      >
        <option value="10">10 per page</option>
        <option value="20">20 per page</option>
        <option value="50">50 per page</option>
      </select>
    </div>
  );
}

// ========================================
// Example 5: View Type Switcher
// ========================================

export function ViewTypeSwitcher() {
  const { viewType, setViewType } = useSearchStore((state) => ({
    viewType: state.viewType,
    setViewType: state.setViewType,
  }));

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setViewType('CARD')}
        className={`px-4 py-2 rounded ${
          viewType === 'CARD' ? 'bg-blue-600 text-white' : 'bg-gray-200'
        }`}
      >
        Card View
      </button>
      <button
        onClick={() => setViewType('LIST')}
        className={`px-4 py-2 rounded ${
          viewType === 'LIST' ? 'bg-blue-600 text-white' : 'bg-gray-200'
        }`}
      >
        List View
      </button>
      <button
        onClick={() => setViewType('MAP')}
        className={`px-4 py-2 rounded ${
          viewType === 'MAP' ? 'bg-blue-600 text-white' : 'bg-gray-200'
        }`}
      >
        Map View
      </button>
    </div>
  );
}

// ========================================
// Example 6: Complete Search Page
// ========================================

export function UniversitySearchPage() {
  // Use the search hook which subscribes to debounced criteria
  const { data, isLoading, error } = useUniversitySearch();
  
  // Get additional state for UI
  const { isFetching, viewType, resetFilters } = useSearchStore((state) => ({
    isFetching: state.isFetching,
    viewType: state.viewType,
    resetFilters: state.resetFilters,
  }));

  if (error) {
    return <div className="text-red-600">Error loading universities</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <AcademicFiltersPanel />
        <FinancialFiltersPanel />
        <div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <SortingControls />
        <ViewTypeSwitcher />
      </div>

      {/* Loading State */}
      {isFetching && (
        <div className="text-center py-4">Loading universities...</div>
      )}

      {/* Results */}
      {data && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Found {data.pagination.totalResults} universities 
            ({data.filters.applied} filters applied)
          </div>

          {viewType === 'CARD' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.results.map((result) => (
                <UniversityCard key={result.university.id} result={result} />
              ))}
            </div>
          )}

          {viewType === 'LIST' && (
            <div className="space-y-4">
              {data.results.map((result) => (
                <UniversityListItem key={result.university.id} result={result} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-8">
            <PaginationControls />
          </div>
        </>
      )}
    </div>
  );
}

// ========================================
// Example 7: University Card with Match Score
// ========================================

function UniversityCard({ result }: { result: any }) {
  const { university, matchPercentage, scoreBreakdown } = result;

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      {/* University Info */}
      <img
        src={university.logoUrl || '/placeholder.png'}
        alt={university.name}
        className="w-full h-32 object-cover rounded"
      />
      <h3 className="font-bold mt-2">{university.name}</h3>
      <p className="text-sm text-gray-600">
        {university.city}, {university.country}
      </p>

      {/* Match Score */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Match Score</span>
          <span className="text-2xl font-bold text-blue-600">
            {matchPercentage}%
          </span>
        </div>
        
        {/* Score Breakdown */}
        <div className="mt-2 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Academic</span>
            <span>{scoreBreakdown.academic.score}%</span>
          </div>
          <div className="flex justify-between">
            <span>Financial</span>
            <span>{scoreBreakdown.financial.score}%</span>
          </div>
          <div className="flex justify-between">
            <span>Location</span>
            <span>{scoreBreakdown.location.score}%</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Tuition:</span>
            <div className="font-semibold">
              ${university.tuitionOutState?.toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Acceptance:</span>
            <div className="font-semibold">
              {(university.acceptanceRate * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UniversityListItem({ result }: { result: any }) {
  const { university, matchPercentage } = result;

  return (
    <div className="border rounded-lg p-4 flex items-center gap-4 hover:bg-gray-50">
      <img
        src={university.logoUrl || '/placeholder.png'}
        alt={university.name}
        className="w-16 h-16 object-cover rounded"
      />
      <div className="flex-1">
        <h3 className="font-bold">{university.name}</h3>
        <p className="text-sm text-gray-600">
          {university.city}, {university.country}
        </p>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-blue-600">{matchPercentage}%</div>
        <div className="text-xs text-gray-600">Match</div>
      </div>
    </div>
  );
}

// ========================================
// Example 8: Weight Customization Panel
// ========================================

export function WeightCustomizationPanel() {
  const { weights, setWeights } = useSearchStore((state) => ({
    weights: state.criteria.weights,
    setWeights: state.setWeights,
  }));

  const categories = [
    { key: 'academic', label: 'Academic Fit', color: 'blue' },
    { key: 'financial', label: 'Financial', color: 'green' },
    { key: 'location', label: 'Location', color: 'purple' },
    { key: 'social', label: 'Social', color: 'pink' },
    { key: 'future', label: 'Career', color: 'orange' },
  ] as const;

  const currentWeights = weights || {
    academic: 40,
    financial: 30,
    location: 15,
    social: 10,
    future: 5,
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Customize Match Weights</h3>
      <p className="text-sm text-gray-600">
        Adjust how much each category matters to you
      </p>

      {categories.map((cat) => (
        <div key={cat.key}>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium">{cat.label}</label>
            <span className="text-sm font-bold">{currentWeights[cat.key]}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={currentWeights[cat.key]}
            onChange={(e) => 
              setWeights({ [cat.key]: parseInt(e.target.value) })
            }
            className="w-full"
          />
        </div>
      ))}

      <div className="pt-2 border-t">
        <div className="flex justify-between text-sm">
          <span>Total:</span>
          <span className="font-bold">
            {Object.values(currentWeights).reduce((a, b) => a + b, 0)}%
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Weights don't need to equal 100% - they're automatically normalized
        </p>
      </div>
    </div>
  );
}
