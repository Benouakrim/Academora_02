import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useDebounce } from 'use-debounce'

export type University = {
  id: string
  slug: string
  name: string
  city: string
  state: string | null
  country: string
  logoUrl: string | null
  heroImageUrl: string | null
  acceptanceRate: number | null
  tuitionOutState: number | null
  tuitionInternational: number | null
  ranking: number | null
  studentLifeScore: number | null
}

export type SearchFilters = {
  search?: string
  country?: string
  major?: string
  maxTuition?: number
  minGpa?: number
  climate?: string
  setting?: string
}

export function useUniversitySearch(filters: SearchFilters) {
  // Debounce the entire filter object to prevent rapid API calls
  const [debouncedFilters] = useDebounce(filters, 500)

  return useQuery({
    queryKey: ['universities', debouncedFilters],
    queryFn: async () => {
      // Clean undefined values
      const params = Object.fromEntries(
        Object.entries(debouncedFilters).filter(([_, v]) => v !== undefined && v !== '')
      )
      
      const { data } = await api.get<University[]>('/universities', { params })
      return data
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}
