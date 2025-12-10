import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AuthorOverview {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  pendingArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgEngagementRate: number;
  viewsChange: number;
  likesChange: number;
}

export interface ArticleAnalytics {
  id: string;
  title: string;
  slug: string;
  status: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  publishedAt: string | null;
  periodViews: number;
  periodLikes: number;
  engagement: number;
}

export interface ViewsTrendData {
  date: string;
  views: number;
}

export interface DeviceData {
  device: string;
  count: number;
  percentage: number;
}

export interface CountryData {
  country: string;
  count: number;
  percentage: number;
}

export interface ReferrerData {
  source: string;
  count: number;
  percentage: number;
}

export interface AudienceInsights {
  devices: DeviceData[];
  countries: CountryData[];
  referrers: ReferrerData[];
}

export interface BestArticle {
  id: string;
  title: string;
  slug: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  publishedAt: string | null;
  _count: { comments: number };
  engagement: number;
}

// Build query params
function buildQueryParams(dateRange: DateRange, extras?: Record<string, string | number>) {
  const params = new URLSearchParams({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    ...Object.fromEntries(
      Object.entries(extras || {}).map(([k, v]) => [k, String(v)])
    ),
  });
  return params.toString();
}

// ==========================================
// USER ANALYTICS HOOKS
// ==========================================

/**
 * Hook to get author analytics overview
 */
export function useMyAnalyticsOverview(dateRange: DateRange) {
  return useQuery<AuthorOverview>({
    queryKey: ['user', 'analytics', 'overview', dateRange],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/my/overview?${buildQueryParams(dateRange)}`);
      return data.data;
    },
  });
}

/**
 * Hook to get analytics for user's articles
 */
export function useMyArticlesAnalytics(
  dateRange: DateRange, 
  page: number = 1, 
  limit: number = 10,
  sortBy: 'views' | 'likes' | 'engagement' | 'date' = 'views'
) {
  return useQuery<{ data: ArticleAnalytics[]; meta: { total: number; page: number; limit: number; totalPages: number } }>({
    queryKey: ['user', 'analytics', 'articles', dateRange, page, limit, sortBy],
    queryFn: async () => {
      const params = buildQueryParams(dateRange, { page, limit, sortBy });
      const { data } = await api.get(`/analytics/my/articles?${params}`);
      return data;
    },
  });
}

/**
 * Hook to get views trend for user's articles
 */
export function useMyViewsTrend(dateRange: DateRange) {
  return useQuery<ViewsTrendData[]>({
    queryKey: ['user', 'analytics', 'views-trend', dateRange],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/my/views-trend?${buildQueryParams(dateRange)}`);
      return data.data;
    },
  });
}

/**
 * Hook to get best performing article
 */
export function useMyBestArticle() {
  return useQuery<BestArticle | null>({
    queryKey: ['user', 'analytics', 'best-article'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/my/best-article');
      return data.data;
    },
  });
}

/**
 * Hook to get audience insights
 */
export function useMyAudienceInsights(dateRange: DateRange) {
  return useQuery<AudienceInsights>({
    queryKey: ['user', 'analytics', 'audience', dateRange],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/my/audience?${buildQueryParams(dateRange)}`);
      return data.data;
    },
  });
}
