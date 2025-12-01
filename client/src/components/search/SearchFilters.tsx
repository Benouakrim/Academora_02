import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import type { SearchFilters as Filters } from '@/hooks/useUniversitySearch'

type SearchFiltersProps = {
  filters: Filters
  onFilterChange: (filters: Filters) => void
}

const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands']

export default function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const maxTuition = filters.maxTuition ?? 100000

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Filter Universities</h3>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="University name..."
            value={filters.search ?? ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Country</label>
        <Select value={filters.country ?? ''} onValueChange={(v) => onFilterChange({ ...filters, country: v || undefined })}>
          <SelectTrigger>
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Max Tuition</label>
        <div className="pt-2">
          <Slider
            min={0}
            max={100000}
            step={1000}
            value={[maxTuition]}
            onValueChange={(v) => onFilterChange({ ...filters, maxTuition: v[0] })}
          />
        </div>
        <div className="text-xs text-muted-foreground text-right">
          ${(maxTuition / 1000).toFixed(0)}k / year
        </div>
      </div>
    </div>
  )
}
