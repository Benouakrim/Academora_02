import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type University = {
  id: string
  name: string
  city: string | null
  state: string | null
  country: string
  tuitionInState: number | null
  tuitionOutState: number | null
  logoUrl: string | null
  slug: string
}

export type SearchFilters = {
  search?: string
  country?: string
  minTuition?: number
  maxTuition?: number
}

export function useUniversitySearch(filters: SearchFilters) {
  return useQuery({
    queryKey: ['universities', filters],
    queryFn: async () => {
      const params: Record<string, any> = {}
      if (filters.search) params.search = filters.search
      if (filters.country) params.country = filters.country
      if (filters.minTuition !== undefined) params.minTuition = filters.minTuition
      if (filters.maxTuition !== undefined) params.maxTuition = filters.maxTuition

      const { data } = await api.get<University[]>('/universities', { params })
      return data
    },
  })
}
