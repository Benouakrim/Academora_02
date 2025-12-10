import prisma from '../lib/prisma';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface TopPerformer {
  id: string;
  name: string;
  slug?: string;
  views: number;
  engagement?: number;
}

interface TimeSeriesData {
  date: string;
  value: number;
}

interface OverviewMetrics {
  totalPageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  pageViewsChange: number; // percentage change from previous period
  visitorsChange: number;
}

export class AnalyticsService {
  /**
   * Get site-wide analytics overview
   */
  static async getSiteOverview(dateRange: DateRange): Promise<OverviewMetrics> {
    const { startDate, endDate } = dateRange;
    
    // Calculate previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = new Date(startDate.getTime() - 1);

    // Current period metrics
    const [currentMetrics, previousMetrics] = await Promise.all([
      prisma.dailyAnalytics.aggregate({
        where: {
          date: { gte: startDate, lte: endDate },
          entityType: 'site',
        },
        _sum: {
          pageViews: true,
          uniqueVisitors: true,
        },
        _avg: {
          avgDuration: true,
          bounceRate: true,
        },
      }),
      prisma.dailyAnalytics.aggregate({
        where: {
          date: { gte: prevStartDate, lte: prevEndDate },
          entityType: 'site',
        },
        _sum: {
          pageViews: true,
          uniqueVisitors: true,
        },
      }),
    ]);

    const currentViews = currentMetrics._sum.pageViews || 0;
    const previousViews = previousMetrics._sum.pageViews || 0;
    const currentVisitors = currentMetrics._sum.uniqueVisitors || 0;
    const previousVisitors = previousMetrics._sum.uniqueVisitors || 0;

    return {
      totalPageViews: currentViews,
      uniqueVisitors: currentVisitors,
      avgSessionDuration: currentMetrics._avg.avgDuration || 0,
      bounceRate: currentMetrics._avg.bounceRate || 0,
      pageViewsChange: previousViews > 0 
        ? ((currentViews - previousViews) / previousViews) * 100 
        : 0,
      visitorsChange: previousVisitors > 0 
        ? ((currentVisitors - previousVisitors) / previousVisitors) * 100 
        : 0,
    };
  }

  /**
   * Get page views time series data
   */
  static async getPageViewsTimeSeries(dateRange: DateRange, entityType?: string, entityId?: string): Promise<TimeSeriesData[]> {
    const { startDate, endDate } = dateRange;

    const whereClause: any = {
      date: { gte: startDate, lte: endDate },
    };

    if (entityType) {
      whereClause.entityType = entityType;
    }
    if (entityId) {
      whereClause.entityId = entityId;
    } else if (!entityType) {
      whereClause.entityType = 'site';
    }

    const data = await prisma.dailyAnalytics.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
      select: {
        date: true,
        pageViews: true,
      },
    });

    return data.map(d => ({
      date: d.date.toISOString().split('T')[0],
      value: d.pageViews,
    }));
  }

  /**
   * Get top performing articles
   */
  static async getTopArticles(dateRange: DateRange, limit: number = 10): Promise<TopPerformer[]> {
    const { startDate, endDate } = dateRange;

    const analytics = await prisma.articleDetailedAnalytics.groupBy({
      by: ['articleId'],
      where: {
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        clicks: true,
      },
      orderBy: {
        _sum: {
          clicks: 'desc',
        },
      },
      take: limit,
    });

    // Get article details
    const articleIds = analytics.map(a => a.articleId);
    const articles = await prisma.article.findMany({
      where: { id: { in: articleIds } },
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        likeCount: true,
      },
    });

    const articlesMap = new Map(articles.map(a => [a.id, a]));

    return analytics.map(a => {
      const article = articlesMap.get(a.articleId);
      return {
        id: a.articleId,
        name: article?.title || 'Unknown Article',
        slug: article?.slug,
        views: a._sum.clicks || article?.viewCount || 0,
        engagement: article?.likeCount || 0,
      };
    });
  }

  /**
   * Get top performing universities
   */
  static async getTopUniversities(dateRange: DateRange, limit: number = 10): Promise<TopPerformer[]> {
    const { startDate, endDate } = dateRange;

    const analytics = await prisma.universityAnalytics.groupBy({
      by: ['universityId'],
      where: {
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        pageViews: true,
        saveCount: true,
      },
      orderBy: {
        _sum: {
          pageViews: 'desc',
        },
      },
      take: limit,
    });

    const universityIds = analytics.map(a => a.universityId);
    const universities = await prisma.university.findMany({
      where: { id: { in: universityIds } },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    const universitiesMap = new Map(universities.map(u => [u.id, u]));

    return analytics.map(a => {
      const university = universitiesMap.get(a.universityId);
      return {
        id: a.universityId,
        name: university?.name || 'Unknown University',
        slug: university?.slug,
        views: a._sum.pageViews || 0,
        engagement: a._sum.saveCount || 0,
      };
    });
  }

  /**
   * Get top performing groups
   */
  static async getTopGroups(dateRange: DateRange, limit: number = 10): Promise<TopPerformer[]> {
    const { startDate, endDate } = dateRange;

    const analytics = await prisma.groupAnalytics.groupBy({
      by: ['groupId'],
      where: {
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        pageViews: true,
        universityClicks: true,
      },
      orderBy: {
        _sum: {
          pageViews: 'desc',
        },
      },
      take: limit,
    });

    const groupIds = analytics.map(a => a.groupId);
    const groups = await prisma.universityGroup.findMany({
      where: { id: { in: groupIds } },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    const groupsMap = new Map(groups.map(g => [g.id, g]));

    return analytics.map(a => {
      const group = groupsMap.get(a.groupId);
      return {
        id: a.groupId,
        name: group?.name || 'Unknown Group',
        slug: group?.slug,
        views: a._sum.pageViews || 0,
        engagement: a._sum.universityClicks || 0,
      };
    });
  }

  /**
   * Get device breakdown
   */
  static async getDeviceBreakdown(dateRange: DateRange) {
    const { startDate, endDate } = dateRange;

    const data = await prisma.dailyAnalytics.aggregate({
      where: {
        date: { gte: startDate, lte: endDate },
        entityType: 'site',
      },
      _sum: {
        mobileViews: true,
        desktopViews: true,
        tabletViews: true,
      },
    });

    const total = (data._sum.mobileViews || 0) + (data._sum.desktopViews || 0) + (data._sum.tabletViews || 0);

    return {
      mobile: { count: data._sum.mobileViews || 0, percentage: total > 0 ? ((data._sum.mobileViews || 0) / total) * 100 : 0 },
      desktop: { count: data._sum.desktopViews || 0, percentage: total > 0 ? ((data._sum.desktopViews || 0) / total) * 100 : 0 },
      tablet: { count: data._sum.tabletViews || 0, percentage: total > 0 ? ((data._sum.tabletViews || 0) / total) * 100 : 0 },
    };
  }

  /**
   * Get traffic sources
   */
  static async getTrafficSources(dateRange: DateRange) {
    const { startDate, endDate } = dateRange;

    const data = await prisma.trafficSource.groupBy({
      by: ['source'],
      where: {
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        visits: true,
        pageViews: true,
      },
      orderBy: {
        _sum: {
          visits: 'desc',
        },
      },
    });

    const totalVisits = data.reduce((sum, d) => sum + (d._sum.visits || 0), 0);

    return data.map(d => ({
      source: d.source,
      visits: d._sum.visits || 0,
      pageViews: d._sum.pageViews || 0,
      percentage: totalVisits > 0 ? ((d._sum.visits || 0) / totalVisits) * 100 : 0,
    }));
  }

  /**
   * Get geographic distribution
   */
  static async getGeographicDistribution(dateRange: DateRange, limit: number = 10) {
    const { startDate, endDate } = dateRange;

    const data = await prisma.geoAnalytics.groupBy({
      by: ['country'],
      where: {
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        visits: true,
        pageViews: true,
      },
      orderBy: {
        _sum: {
          visits: 'desc',
        },
      },
      take: limit,
    });

    const totalVisits = data.reduce((sum, d) => sum + (d._sum.visits || 0), 0);

    return data.map(d => ({
      country: d.country,
      visits: d._sum.visits || 0,
      pageViews: d._sum.pageViews || 0,
      percentage: totalVisits > 0 ? ((d._sum.visits || 0) / totalVisits) * 100 : 0,
    }));
  }

  /**
   * Get engagement metrics
   */
  static async getEngagementMetrics(dateRange: DateRange) {
    const { startDate, endDate } = dateRange;

    const events = await prisma.engagementEvent.groupBy({
      by: ['eventType'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: true,
      orderBy: {
        _count: {
          eventType: 'desc',
        },
      },
    });

    return events.map(e => ({
      eventType: e.eventType,
      count: e._count,
    }));
  }

  /**
   * Get search analytics
   */
  static async getSearchAnalytics(dateRange: DateRange, limit: number = 20) {
    const { startDate, endDate } = dateRange;

    // Top search queries
    const topQueries = await prisma.searchAnalytics.groupBy({
      by: ['query'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: true,
      _avg: {
        resultsCount: true,
      },
      orderBy: {
        _count: {
          query: 'desc',
        },
      },
      take: limit,
    });

    // Zero-result queries
    const zeroResultQueries = await prisma.searchAnalytics.groupBy({
      by: ['query'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        resultsCount: 0,
      },
      _count: true,
      orderBy: {
        _count: {
          query: 'desc',
        },
      },
      take: 10,
    });

    // Search volume over time
    const searchVolume = await prisma.searchAnalytics.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: true,
    });

    return {
      topQueries: topQueries.map(q => ({
        query: q.query,
        count: q._count,
        avgResults: q._avg.resultsCount || 0,
      })),
      zeroResultQueries: zeroResultQueries.map(q => ({
        query: q.query,
        count: q._count,
      })),
      totalSearches: searchVolume.reduce((sum, s) => sum + s._count, 0),
    };
  }

  /**
   * Get real-time active users (users with activity in last 30 minutes)
   */
  static async getRealTimeActiveUsers() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const [activePageViews, activeSessions] = await Promise.all([
      prisma.pageView.count({
        where: {
          createdAt: { gte: thirtyMinutesAgo },
        },
      }),
      prisma.pageView.groupBy({
        by: ['sessionId'],
        where: {
          createdAt: { gte: thirtyMinutesAgo },
        },
      }),
    ]);

    // Get top active pages
    const activePages = await prisma.pageView.groupBy({
      by: ['page'],
      where: {
        createdAt: { gte: thirtyMinutesAgo },
      },
      _count: true,
      orderBy: {
        _count: {
          page: 'desc',
        },
      },
      take: 5,
    });

    return {
      activeUsers: activeSessions.length,
      pageViewsLast30Min: activePageViews,
      topActivePages: activePages.map(p => ({
        page: p.page,
        count: p._count,
      })),
    };
  }
}
