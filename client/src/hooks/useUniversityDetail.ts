import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type UniversityDetail = {
  id: string
  name: string
  slug: string
  description: string | null
  city: string | null
  state: string | null
  country: string
  logoUrl: string | null
  websiteUrl: string | null
  tuitionInState: number | null
  tuitionOutState: number | null
  costOfLiving: number | null
  acceptanceRate: number | null
  minGpa: number | null
  avgSatScore: number | null
  popularMajors: string[]
  ranking: number | null
}

export function useUniversityDetail(slug: string) {
  return useQuery({
    queryKey: ['university', slug],
    queryFn: async () => {
      const { data } = await api.get<UniversityDetail>(`/universities/${slug}`)
      return data
    },
    enabled: !!slug,
  })
}
