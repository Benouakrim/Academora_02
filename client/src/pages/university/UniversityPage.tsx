import { useParams, Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { useUniversityDetail } from '@/hooks/useUniversityDetail'
import UniversityHeader from './UniversityHeader'
import UniversityTabs from './UniversityTabs'
import { useState } from 'react';
import { FinancialAidDialog } from '@/components/calculator/FinancialAidDialog';
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="relative">
        <Skeleton className="h-64 sm:h-80 w-full" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 flex items-end gap-4">
            <Skeleton className="w-32 h-32 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-2">University Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The university you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/search">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function UniversityPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: university, isLoading, isError } = useUniversityDetail(slug || '')
  const [isCalculatorOpen, setCalculatorOpen] = useState(false);

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (isError || !university) {
    return <NotFound />
  }

  return (
    <div>
      <UniversityHeader university={university} />
      <UniversityTabs university={university} onOpenCalculator={() => setCalculatorOpen(true)} />
      <FinancialAidDialog
        universityId={university.id}
        isOpen={isCalculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        stickerPrice={university.tuitionOutState || university.tuitionInState || 50000}
      />
    </div>
  )
}
