import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

type Counts = { users: number; universities: number; saved: number }
type RecentUser = { id: string; firstName: string | null; lastName: string | null; email: string | null; createdAt: string }
export type AdminStats = { counts: Counts; recentUsers: RecentUser[] }

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats')
      return res.data
    },
  })
}
