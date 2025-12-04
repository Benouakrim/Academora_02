import UniversityCard from './UniversityCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { UniversityMatchResult } from '@/hooks/useUniversitySearch';

interface UniversityCardGridProps {
  results: UniversityMatchResult[];
  isLoading?: boolean;
}

/**
 * Skeleton Card Component for loading state
 */
function UniversityCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-border/50 overflow-hidden">
      {/* Hero Image Skeleton */}
      <Skeleton className="h-48 w-full rounded-none" />
      
      {/* Content Area */}
      <div className="p-6 pt-14 space-y-4">
        {/* Title and Logo */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
        
        {/* Metrics */}
        <div className="space-y-3 py-4 border-y border-border/50">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * UniversityCardGrid Component
 * Renders university results in a responsive card grid layout
 * Shows skeleton loading state for better UX
 */
export default function UniversityCardGrid({ results, isLoading = false }: UniversityCardGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 20 }).map((_, index) => (
          <UniversityCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {results.map((result) => (
        <UniversityCard 
          key={result.university.id} 
          result={result}
        />
      ))}
    </div>
  );
}
