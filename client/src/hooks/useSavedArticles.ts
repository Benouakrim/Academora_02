import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { api } from '@/lib/api'

export type SavedArticle = {
  id: string
  notes: string | null
  article: {
    id: string
    slug: string
    title: string
    excerpt?: string | null
    featuredImage?: string | null
    createdAt: string
  }
}

type ProfileResponse = {
  savedArticles: SavedArticle[]
}

export function useSavedArticles() {
  const { isSignedIn } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['saved-articles'],
    queryFn: async (): Promise<SavedArticle[]> => {
      const { data } = await api.get<ProfileResponse>('/user/profile')
      return (data?.savedArticles ?? []) as SavedArticle[]
    },
    enabled: isSignedIn,
    retry: false,
  })

  const remove = async (articleId: string) => {
    await api.post(`/user/saved-article/${articleId}`)
    await qc.invalidateQueries({ queryKey: ['saved-articles'] })
  }

  const updateNote = async (articleId: string, note: string) => {
    // Optimistic update first
    const key = ['saved-articles'] as const
    const prev = qc.getQueryData<SavedArticle[]>(key)
    if (prev) {
      qc.setQueryData<SavedArticle[]>(key, prev.map((s) => (s.article.id === articleId ? { ...s, notes: note } : s)))
    }
    try {
      // Use the new PATCH /user/saved-notes endpoint
      await api.patch(`/user/saved-notes/${articleId}`, { notes: note, type: 'article' })
    } catch (_err) {
      // Revert on error
      if (prev) qc.setQueryData<SavedArticle[]>(key, prev)
      throw _err
    }
  }

  return { ...query, remove, updateNote }
}
