import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebounce } from 'use-debounce'
import { Filter } from 'lucide-react'
import { useUniversitySearch, type SearchFilters as Filters } from '@/hooks/useUniversitySearch'
import UniversityCard from '@/components/search/UniversityCard'
import SearchFiltersComponent from '@/components/search/SearchFilters'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'

function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sheetOpen, setSheetOpen] = useState(false)

  // Initialize filters from URL
  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get('search') || undefined,
    country: searchParams.get('country') || undefined,
    maxTuition: searchParams.get('maxTuition') ? Number(searchParams.get('maxTuition')) : undefined,
  })

  // Debounce search input
  const [debouncedFilters] = useDebounce(filters, 400)

  // Fetch data
  const { data: universities, isLoading } = useUniversitySearch(debouncedFilters)

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.country) params.set('country', filters.country)
    if (filters.maxTuition !== undefined) params.set('maxTuition', String(filters.maxTuition))
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Find Your University</h1>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <SearchFiltersComponent filters={filters} onFilterChange={setFilters} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block md:col-span-1">
          <div className="sticky top-20">
            <SearchFiltersComponent filters={filters} onFilterChange={setFilters} />
          </div>
        </aside>

        {/* Results */}
        <main className="md:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : universities && universities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {universities.map((uni) => (
                <UniversityCard key={uni.id} university={uni} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No universities found. Try adjusting your filters.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
