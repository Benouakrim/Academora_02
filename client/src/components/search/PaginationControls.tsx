import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchStore } from '@/store/useSearchStore';

interface PaginationControlsProps {
  totalResults: number;
  currentPage: number;
  limit: number;
  isLoading?: boolean;
}

/**
 * Pagination Controls Component
 * Displays result range and provides navigation between pages
 * Shows: "Showing X-Y of Z results" with Previous/Next buttons
 */
export default function PaginationControls({
  totalResults,
  currentPage,
  limit,
  isLoading = false,
}: PaginationControlsProps) {
  const { setPage } = useSearchStore();

  // Calculate pagination values
  const totalPages = Math.ceil(totalResults / limit);
  const startResult = totalResults === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endResult = Math.min(currentPage * limit, totalResults);

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setPage(currentPage - 1);
      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage(currentPage + 1);
      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, action: 'prev' | 'next') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (action === 'prev') {
        handlePreviousPage();
      } else {
        handleNextPage();
      }
    }
  };

  if (totalResults === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <p className="text-sm">No results to display</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-border">
      {/* Result Range Display */}
      <div className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-semibold text-foreground">
          {startResult}–{endResult}
        </span>{' '}
        of{' '}
        <span className="font-semibold text-foreground">
          {totalResults.toLocaleString()}
        </span>{' '}
        result{totalResults !== 1 ? 's' : ''}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          onKeyDown={(e) => handleKeyDown(e, 'prev')}
          disabled={!hasPreviousPage || isLoading}
          className="gap-1"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 text-sm bg-muted rounded-md min-w-[100px] justify-center">
          <span className="font-medium">
            Page {currentPage}
          </span>
          <span className="text-muted-foreground">
            of {totalPages}
          </span>
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          onKeyDown={(e) => handleKeyDown(e, 'next')}
          disabled={!hasNextPage || isLoading}
          className="gap-1"
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Optional: Jump to Page (for future enhancement) */}
      {totalPages > 1 && (
        <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
          <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs">←</kbd>
          <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs">→</kbd>
          <span>Navigate pages</span>
        </div>
      )}
    </div>
  );
}
