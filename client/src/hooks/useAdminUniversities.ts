import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type University = {
  id: string
  name: string
  slug: string
  website?: string
  city?: string
  state?: string
  country: string
  acceptanceRate?: number
  minGpa?: number
  avgSat?: number
  tuitionInState?: number
  tuitionOutState?: number
  costOfLiving?: number
}

type ListResponse = {
  data: University[]
  meta?: { total?: number; page?: number; pageSize?: number }
}

export function useUniversities(page = 1, pageSize = 10) {
  return useQuery<ListResponse>({
    queryKey: ['universities', page, pageSize],
    queryFn: async () => {
      const res = await api.get(`/universities?page=${page}&pageSize=${pageSize}`)
      const data = Array.isArray(res.data)
        ? { data: res.data, meta: { total: res.data.length, page, pageSize } }
        : res.data
      return data
    },
  })
}

export function useUniversity(id?: string) {
  return useQuery<University | null>({
    queryKey: ['universities', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/universities/${id}`)
      return res.data
    },
  })
}

export function useCreateUniversity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<University>) => {
      const res = await api.post('/universities', payload)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['universities'] })
    },
  })
}

export function useUpdateUniversity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<University> }) => {
      const res = await api.put(`/universities/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['universities'] })
    },
  })
}

export function useDeleteUniversity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/universities/${id}`)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['universities'] })
    },
  })
}
