import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, SlidersHorizontal } from 'lucide-react'
import { useUniversitySearch, type SearchFilters as Filters } from '@/hooks/useUniversitySearch'
import UniversityCard from '@/components/search/UniversityCard'
import SearchFiltersComponent from '@/components/search/SearchFilters'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { SEO } from '@/components/common/SEO'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Parse URL params into filter state
  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get('q') || undefined,
    country: searchParams.get('country') || undefined,
    maxTuition: searchParams.get('maxTuition') ? Number(searchParams.get('maxTuition')) : undefined,
    major: searchParams.get('major') || undefined,
    climate: searchParams.get('climate') || undefined,
    setting: searchParams.get('setting') || undefined,
  })

  // Sync state -> URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search) params.set('q', filters.search)
    if (filters.country) params.set('country', filters.country)
    if (filters.major) params.set('major', filters.major)
    if (filters.climate) params.set('climate', filters.climate)
    if (filters.setting) params.set('setting', filters.setting)
    if (filters.maxTuition) params.set('maxTuition', String(filters.maxTuition))
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  const { data: universities, isLoading } = useUniversitySearch(filters)

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black">
      <SEO title="Search Universities - AcademOra" description="Find your dream university from our global database." />
      
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-border sticky top-16 z-30 px-4 py-4 shadow-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Explore Universities</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              {universities ? `${universities.length} results found` : 'Searching...'}
            </p>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>Filter Results</SheetTitle>
              </SheetHeader>
              <SearchFiltersComponent filters={filters} onChange={setFilters} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-32 space-y-6">
               <div className="bg-white dark:bg-neutral-900 rounded-xl border p-5 shadow-sm">
                 <SearchFiltersComponent filters={filters} onChange={setFilters} />
               </div>
            </div>
          </aside>

          {/* Results Grid */}
          <main className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : universities && universities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {universities.map((uni) => (
                  <UniversityCard key={uni.id} university={uni} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-20 w-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                  <Filter className="h-10 w-10 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-lg font-semibold">No universities found</h3>
                <p className="text-muted-foreground max-w-sm mt-2">
                  Try adjusting your filters or search query to see more results.
                </p>
                <Button 
                  variant="link" 
                  onClick={() => setFilters({})}
                  className="mt-4 text-primary"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
