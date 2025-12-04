import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

interface Badge {
  id: string
  name: string
  description: string
  slug: string
  icon: string
  category: string
  rarity: string
}

interface UserBadge {
  id: string
  badgeId: string
  userId: string
  awardedAt: string
  badge: Badge
}

interface BadgesResponse {
  userBadges: UserBadge[]
  allBadges: Badge[]
}

/**
 * Hook to fetch user badges and all available badges
 */
export function useBadges() {
  return useQuery<BadgesResponse>({
    queryKey: ['userBadges'],
    queryFn: async () => {
      const { data } = await api.get('/user/badges')
      return data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
