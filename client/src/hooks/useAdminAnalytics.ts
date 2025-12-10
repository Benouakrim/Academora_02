import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface OverviewMetrics {
  totalPageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  pageViewsChange: number;
  visitorsChange: number;
}

export interface ContentStats {
  totalArticles: number;
  publishedArticles: number;
  pendingArticles: number;
  totalUniversities: number;
  totalGroups: number;
  totalUsers: number;
  newUsersThisPeriod: number;
}

export interface TopPerformer {
  id: string;
  name: string;
  slug?: string;
  views: number;
  engagement?: number;
}

export interface DeviceBreakdown {
  mobile: { count: number; percentage: number };
  desktop: { count: number; percentage: number };
  tablet: { count: number; percentage: number };
}

export interface RealtimeData {
  activeUsers: number;
  pageViewsLast30Min: number;
  topActivePages: Array<{ page: string; count: number }>;
}

export interface AdminDashboardData {
  overview: OverviewMetrics;
  contentStats: ContentStats;
  topPerformers: {
    articles: TopPerformer[];
    universities: TopPerformer[];
    groups: TopPerformer[];
  };
  deviceBreakdown: DeviceBreakdown;
  realtimeData: RealtimeData;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface ArticleAnalyticsItem {
  id: string;
  title: string;
  slug: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  publishedAt: string | null;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  _count: { comments: number };
  periodMetrics: {
    _sum: { impressions: number; clicks: number };
    _avg: { readTime: number | null; scrollDepth: number | null };
  };
}

export interface TrafficSource {
  source: string;
  visits: number;
  pageViews: number;
  percentage: number;
}

export interface GeoData {
  country: string;
  visits: number;
  pageViews: number;
  percentage: number;
}

export interface EngagementSummary {
  comments: number;
  likes: number;
  shares: number;
  saves: number;
  reviews: number;
}

export interface SearchAnalytics {
  topQueries: Array<{ query: string; count: number; avgResults: number }>;
  zeroResultQueries: Array<{ query: string; count: number }>;
  totalSearches: number;
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
// ADMIN ANALYTICS HOOKS
// ==========================================

/**
 * Hook to get admin dashboard analytics data
 */
export function useAdminAnalyticsDashboard(dateRange: DateRange) {
  return useQuery<AdminDashboardData>({
    queryKey: ['admin', 'analytics', 'dashboard', dateRange],
    queryFn: async () => {
      const { data } = await api.get(`/admin/analytics/dashboard?${buildQueryParams(dateRange)}`);
      return data.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

/**
 * Hook to get page views time series
 */
export function usePageViewsTimeSeries(dateRange: DateRange, entityType?: string, entityId?: string) {
  return useQuery<TimeSeriesData[]>({
    queryKey: ['admin', 'analytics', 'pageviews', dateRange, entityType, entityId],
    queryFn: async () => {
      const params = buildQueryParams(dateRange, { 
        ...(entityType && { entityType }),
        ...(entityId && { entityId }),
      });
      const { data } = await api.get(`/admin/analytics/pageviews?${params}`);
      return data.data;
    },
  });
}

/**
 * Hook to get top performers
 */
export function useTopPerformers(
  dateRange: DateRange, 
  type: 'articles' | 'universities' | 'groups' = 'articles',
  limit: number = 10
) {
  return useQuery<TopPerformer[]>({
    queryKey: ['admin', 'analytics', 'top-performers', type, dateRange, limit],
    queryFn: async () => {
      const params = buildQueryParams(dateRange, { type, limit });
      const { data } = await api.get(`/admin/analytics/top-performers?${params}`);
      return data.data;
    },
  });
}

/**
 * Hook to get articles analytics
 */
export function useArticlesAnalytics(dateRange: DateRange, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'articles', dateRange, page, limit],
    queryFn: async () => {
      const params = buildQueryParams(dateRange, { page, limit });
      const { data } = await api.get(`/admin/analytics/articles?${params}`);
      return data;
    },
  });
}

/**
 * Hook to get universities analytics
 */
export function useUniversitiesAnalytics(dateRange: DateRange, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'universities', dateRange, page, limit],
    queryFn: async () => {
      const params = buildQueryParams(dateRange, { page, limit });
      const { data } = await api.get(`/admin/analytics/universities?${params}`);
      return data;
    },
  });
}

/**
 * Hook to get groups analytics
 */
export function useGroupsAnalytics(dateRange: DateRange, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'groups', dateRange, page, limit],
    queryFn: async () => {
      const params = buildQueryParams(dateRange, { page, limit });
      const { data } = await api.get(`/admin/analytics/groups?${params}`);
      return data;
    },
  });
}

/**
 * Hook to get device breakdown
 */
export function useDeviceBreakdown(dateRange: DateRange) {
  return useQuery<DeviceBreakdown>({
    queryKey: ['admin', 'analytics', 'devices', dateRange],
    queryFn: async () => {
      const { data } = await api.get(`/admin/analytics/devices?${buildQueryParams(dateRange)}`);
      return data.data;
    },
  });
}

/**
 * Hook to get traffic sources
 */
export function useTrafficSources(dateRange: DateRange) {
  return useQuery<TrafficSource[]>({
    queryKey: ['admin', 'analytics', 'traffic-sources', dateRange],
    queryFn: async () => {
      const { data } = await api.get(`/admin/analytics/traffic-sources?${buildQueryParams(dateRange)}`);
      return data.data;
    },
  });
}

/**
 * Hook to get geographic distribution
 */
export function useGeographicDistribution(dateRange: DateRange, limit: number = 10) {
  return useQuery<GeoData[]>({
    queryKey: ['admin', 'analytics', 'geography', dateRange, limit],
    queryFn: async () => {
      const params = buildQueryParams(dateRange, { limit });
      const { data } = await api.get(`/admin/analytics/geography?${params}`);
      return data.data;
    },
  });
}

/**
 * Hook to get engagement summary
 */
export function useEngagementSummary(dateRange: DateRange) {
  return useQuery<EngagementSummary>({
    queryKey: ['admin', 'analytics', 'engagement', dateRange],
    queryFn: async () => {
      const { data } = await api.get(`/admin/analytics/engagement?${buildQueryParams(dateRange)}`);
      return data.data;
    },
  });
}

/**
 * Hook to get search analytics
 */
export function useSearchAnalytics(dateRange: DateRange) {
  return useQuery<SearchAnalytics>({
    queryKey: ['admin', 'analytics', 'search', dateRange],
    queryFn: async () => {
      const { data } = await api.get(`/admin/analytics/search?${buildQueryParams(dateRange)}`);
      return data.data;
    },
  });
}

/**
 * Hook to get real-time data
 */
export function useRealtimeData() {
  return useQuery<RealtimeData>({
    queryKey: ['admin', 'analytics', 'realtime'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics/realtime');
      return data.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
