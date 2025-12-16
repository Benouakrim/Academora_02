import { useParams, Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking'
import { useEffect } from 'react'
import BlockRenderer from '@/components/blocks/BlockRenderer'
import { useFullUniversityProfile } from '@/hooks/useFullUniversityProfile'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import UniversityHeader from './UniversityHeader'

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
        <Skeleton className="h-96 w-full" />
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

/**
 * UniversityPage: Public University Profile
 * 
 * Consumes the merged, cached university profile (Prompt 9) and renders:
 * 1. Static header with university metadata (canonical data)
 * 2. Dynamic blocks (Hard & Soft) ordered by priority
 * 3. Personalized inverse blocks (e.g., UserFitMeter)
 * 
 * Benefits:
 * - Single API request for all content
 * - Server-side caching (60 minutes)
 * - Complete data for both canonical and inverse blocks
 * - Personalization via user store integration
 */
export default function UniversityPage() {
  const { slug } = useParams<{ slug: string }>()
  const { trackPageView } = useAnalyticsTracking();
  
  // Fetch merged profile: canonical data + blocks + user data
  const { 
    profile, 
    universityData, 
    blocks, 
    userProfile, 
    isLoading, 
    isError, 
    error 
  } = useFullUniversityProfile(slug || '')

  // Track page view
  useEffect(() => {
    if (universityData?.id && slug) {
      trackPageView({
        entityType: 'university',
        entityId: universityData.id,
        title: universityData.name,
        metadata: {
          slug,
          state: universityData.state,
          type: universityData.campusType
        }
      });
    }
  }, [universityData?.id, slug]);

  if (!slug || isLoading) {
    return <LoadingSkeleton />
  }

  if (isError || !profile) {
    return (
      <NotFound />
    )
  }
  
  // Destructure the canonical data and micro-content array
  const canonicalData = universityData
  const blockList = blocks

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. Static Header using Canonical Scalar Data */}
      {canonicalData && <UniversityHeader university={canonicalData} />}
      
      {/* 2. Content Blocks from the Merged Entity API */}
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {blockList.length > 0 ? (
          blockList.map((block) => (
            <div key={block.id || Math.random()} className="w-full">
              <BlockRenderer
                block={{
                  // Normalize server block shape to MicroContentBlock expected by renderer
                  ...(block as Record<string, any>),
                  type: (block as any).blockType || (block as any).type,
                } as any}
                // Pass the full canonical and user profiles for Inverse Blocks
                universityProfile={canonicalData}
                userProfile={userProfile}
                isPreview={false}
              />
            </div>
          ))
        ) : (
          <div className="text-center p-20 text-gray-500 border-2 border-dashed rounded-lg">
            <p className="mb-2">No blocks configured for this university yet.</p>
            <p className="text-sm">Check back soon for content from the university team.</p>
          </div>
        )}
      </div>
    </div>
  )
}
