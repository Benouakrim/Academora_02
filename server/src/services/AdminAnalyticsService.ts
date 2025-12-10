import prisma from '../lib/prisma';
import { AnalyticsService } from './AnalyticsService';

interface AdminDashboardData {
  overview: {
    totalPageViews: number;
    uniqueVisitors: number;
    avgSessionDuration: number;
    bounceRate: number;
    pageViewsChange: number;
    visitorsChange: number;
  };
  contentStats: {
    totalArticles: number;
    publishedArticles: number;
    pendingArticles: number;
    totalUniversities: number;
    totalGroups: number;
    totalUsers: number;
    newUsersThisPeriod: number;
  };
  topPerformers: {
    articles: Array<{
      id: string;
      name: string;
      slug?: string;
      views: number;
      engagement?: number;
    }>;
    universities: Array<{
      id: string;
      name: string;
      slug?: string;
      views: number;
      engagement?: number;
    }>;
    groups: Array<{
      id: string;
      name: string;
      slug?: string;
      views: number;
      engagement?: number;
    }>;
  };
  deviceBreakdown: {
    mobile: { count: number; percentage: number };
    desktop: { count: number; percentage: number };
    tablet: { count: number; percentage: number };
  };
  realtimeData: {
    activeUsers: number;
    pageViewsLast30Min: number;
    topActivePages: Array<{ page: string; count: number }>;
  };
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export class AdminAnalyticsService {
  /**
   * Get comprehensive admin dashboard data
   */
  static async getDashboardData(dateRange: DateRange): Promise<AdminDashboardData> {
    const [
      overview,
      contentStats,
      topArticles,
      topUniversities,
      topGroups,
      deviceBreakdown,
      realtimeData,
    ] = await Promise.all([
      AnalyticsService.getSiteOverview(dateRange),
      this.getContentStats(dateRange),
      AnalyticsService.getTopArticles(dateRange, 5),
      AnalyticsService.getTopUniversities(dateRange, 5),
      AnalyticsService.getTopGroups(dateRange, 5),
      AnalyticsService.getDeviceBreakdown(dateRange),
      AnalyticsService.getRealTimeActiveUsers(),
    ]);

    return {
      overview,
      contentStats,
      topPerformers: {
        articles: topArticles,
        universities: topUniversities,
        groups: topGroups,
      },
      deviceBreakdown,
      realtimeData,
    };
  }

  /**
   * Get content statistics
   */
  static async getContentStats(dateRange: DateRange) {
    const { startDate, endDate } = dateRange;

    const [
      totalArticles,
      publishedArticles,
      pendingArticles,
      totalUniversities,
      totalGroups,
      totalUsers,
      newUsersThisPeriod,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: 'PENDING' } }),
      prisma.university.count(),
      prisma.universityGroup.count(),
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    return {
      totalArticles,
      publishedArticles,
      pendingArticles,
      totalUniversities,
      totalGroups,
      totalUsers,
      newUsersThisPeriod,
    };
  }

  /**
   * Get detailed articles analytics
   */
  static async getArticlesAnalytics(dateRange: DateRange, page: number = 1, limit: number = 20) {
    const { startDate, endDate } = dateRange;
    const skip = (page - 1) * limit;

    // Get articles with their analytics
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      skip,
      take: limit,
      orderBy: { viewCount: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        likeCount: true,
        shareCount: true,
        publishedAt: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    // Get period-specific analytics
    const articleIds = articles.map(a => a.id);
    const periodAnalytics = await prisma.articleDetailedAnalytics.groupBy({
      by: ['articleId'],
      where: {
        articleId: { in: articleIds },
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        impressions: true,
        clicks: true,
      },
      _avg: {
        readTime: true,
        scrollDepth: true,
      },
    });

    const analyticsMap = new Map(periodAnalytics.map(a => [a.articleId, a]));

    const total = await prisma.article.count({ where: { status: 'PUBLISHED' } });

    return {
      data: articles.map(article => ({
        ...article,
        periodMetrics: analyticsMap.get(article.id) || {
          _sum: { impressions: 0, clicks: 0 },
          _avg: { readTime: null, scrollDepth: null },
        },
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get detailed university analytics
   */
  static async getUniversitiesAnalytics(dateRange: DateRange, page: number = 1, limit: number = 20) {
    const { startDate, endDate } = dateRange;
    const skip = (page - 1) * limit;

    // Get analytics for the period
    const analytics = await prisma.universityAnalytics.groupBy({
      by: ['universityId'],
      where: {
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        pageViews: true,
        uniqueVisitors: true,
        saveCount: true,
        compareCount: true,
        reviewViews: true,
        websiteClicks: true,
      },
      _avg: {
        avgTimeOnPage: true,
      },
      orderBy: {
        _sum: {
          pageViews: 'desc',
        },
      },
      skip,
      take: limit,
    });

    // Get university details
    const universityIds = analytics.map(a => a.universityId);
    const universities = await prisma.university.findMany({
      where: { id: { in: universityIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        state: true,
        _count: {
          select: {
            reviews: true,
            savedBy: true,
          },
        },
      },
    });

    const universitiesMap = new Map(universities.map(u => [u.id, u]));

    const total = await prisma.university.count();

    return {
      data: analytics.map(a => ({
        university: universitiesMap.get(a.universityId),
        metrics: {
          pageViews: a._sum.pageViews || 0,
          uniqueVisitors: a._sum.uniqueVisitors || 0,
          saveCount: a._sum.saveCount || 0,
          compareCount: a._sum.compareCount || 0,
          reviewViews: a._sum.reviewViews || 0,
          websiteClicks: a._sum.websiteClicks || 0,
          avgTimeOnPage: a._avg.avgTimeOnPage || 0,
        },
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get detailed group analytics
   */
  static async getGroupsAnalytics(dateRange: DateRange, page: number = 1, limit: number = 20) {
    const { startDate, endDate } = dateRange;
    const skip = (page - 1) * limit;

    const analytics = await prisma.groupAnalytics.groupBy({
      by: ['groupId'],
      where: {
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        pageViews: true,
        uniqueVisitors: true,
        universityClicks: true,
        websiteClicks: true,
      },
      _avg: {
        avgTimeOnPage: true,
      },
      orderBy: {
        _sum: {
          pageViews: 'desc',
        },
      },
      skip,
      take: limit,
    });

    const groupIds = analytics.map(a => a.groupId);
    const groups = await prisma.universityGroup.findMany({
      where: { id: { in: groupIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        memberCount: true,
        _count: {
          select: { universities: true },
        },
      },
    });

    const groupsMap = new Map(groups.map(g => [g.id, g]));

    const total = await prisma.universityGroup.count();

    return {
      data: analytics.map(a => ({
        group: groupsMap.get(a.groupId),
        metrics: {
          pageViews: a._sum.pageViews || 0,
          uniqueVisitors: a._sum.uniqueVisitors || 0,
          universityClicks: a._sum.universityClicks || 0,
          websiteClicks: a._sum.websiteClicks || 0,
          avgTimeOnPage: a._avg.avgTimeOnPage || 0,
        },
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user activity analytics
   */
  static async getUserAnalytics(dateRange: DateRange, page: number = 1, limit: number = 20) {
    const { startDate, endDate } = dateRange;
    const skip = (page - 1) * limit;

    // Get most active users
    const activeUsers = await prisma.pageView.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        userId: { not: null },
      },
      _count: true,
      orderBy: {
        _count: {
          userId: 'desc',
        },
      },
      skip,
      take: limit,
    });

    const userIds = activeUsers.map(u => u.userId).filter((id): id is string => id !== null);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            articles: true,
            comments: true,
            reviews: true,
          },
        },
      },
    });

    const usersMap = new Map(users.map(u => [u.id, u]));

    // User growth over time
    const newUsersCount = await prisma.user.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    const total = await prisma.user.count();

    return {
      activeUsers: activeUsers.map(u => ({
        user: usersMap.get(u.userId!),
        pageViews: u._count,
      })),
      newUsersCount,
      totalUsers: total,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get engagement summary
   */
  static async getEngagementSummary(dateRange: DateRange) {
    const { startDate, endDate } = dateRange;

    const [totalComments, totalLikes, totalShares, totalSaves, totalReviews] = await Promise.all([
      prisma.comment.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      prisma.articleLike.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      prisma.article.aggregate({
        where: { updatedAt: { gte: startDate, lte: endDate } },
        _sum: { shareCount: true },
      }),
      prisma.savedUniversity.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      prisma.review.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
    ]);

    return {
      comments: totalComments,
      likes: totalLikes,
      shares: totalShares._sum.shareCount || 0,
      saves: totalSaves,
      reviews: totalReviews,
    };
  }

  /**
   * Export analytics data (for CSV/Excel download)
   */
  static async exportAnalyticsData(dateRange: DateRange, entityType: 'articles' | 'universities' | 'groups' | 'all') {
    const { startDate, endDate } = dateRange;

    if (entityType === 'articles' || entityType === 'all') {
      const articles = await prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          likeCount: true,
          shareCount: true,
          publishedAt: true,
          author: {
            select: { firstName: true, lastName: true },
          },
          _count: { select: { comments: true } },
        },
      });

      return articles.map(a => ({
        type: 'article',
        id: a.id,
        title: a.title,
        slug: a.slug,
        author: `${a.author.firstName || ''} ${a.author.lastName || ''}`.trim(),
        views: a.viewCount,
        likes: a.likeCount,
        shares: a.shareCount,
        comments: a._count.comments,
        publishedAt: a.publishedAt,
      }));
    }

    return [];
  }
}
