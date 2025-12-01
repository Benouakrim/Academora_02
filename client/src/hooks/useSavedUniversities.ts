import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { api } from '@/lib/api'

export type SavedUniversity = {
  id: string
  notes: string | null
  university: {
    id: string
    slug: string
    name: string
    city: string | null
    state: string | null
    country: string
    logoUrl: string | null
    tuitionOutState: number | null
  }
}

type ProfileResponse = {
  savedUniversities: SavedUniversity[]
  [k: string]: any
}

export function useSavedUniversities() {
  const { isSignedIn } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['saved-universities'],
    queryFn: async (): Promise<SavedUniversity[]> => {
      const { data } = await api.get<ProfileResponse>('/user/profile')
      return (data?.savedUniversities ?? []) as SavedUniversity[]
    },
    enabled: isSignedIn,
    retry: false,
  })

  const remove = async (universityId: string) => {
    await api.post(`/user/saved/${universityId}`)
    await qc.invalidateQueries({ queryKey: ['saved-universities'] })
  }

  const updateNote = async (universityId: string, note: string) => {
    // Optimistic update first
    const key = ['saved-universities'] as const
    const prev = qc.getQueryData<SavedUniversity[]>(key)
    if (prev) {
      qc.setQueryData<SavedUniversity[]>(key, prev.map((s) => (s.university.id === universityId ? { ...s, notes: note } : s)))
    }
    try {
      // Assume backend supports this; if not, this call will be a no-op
      await api.patch(`/user/saved/${universityId}`, { notes: note })
    } catch (_err) {
      // Revert on error
      if (prev) qc.setQueryData<SavedUniversity[]>(key, prev)
      throw _err
    }
  }

  return { ...query, remove, updateNote }
}
