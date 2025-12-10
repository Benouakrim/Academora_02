import prisma from '../lib/prisma';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface AuthorArticleAnalytics {
  id: string;
  title: string;
  slug: string;
  status: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  publishedAt: Date | null;
  periodViews: number;
  periodLikes: number;
  engagement: number; // calculated engagement rate
}

interface AuthorOverview {
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

export class UserAnalyticsService {
  /**
   * Get analytics overview for an article author
   */
  static async getAuthorOverview(userId: string, dateRange: DateRange): Promise<AuthorOverview> {
    const { startDate, endDate } = dateRange;

    // Calculate previous period
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = new Date(startDate.getTime() - 1);

    // Get all user's articles
    const articles = await prisma.article.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        status: true,
        viewCount: true,
        likeCount: true,
        shareCount: true,
        _count: { select: { comments: true } },
      },
    });

    // Current period analytics
    const currentPeriodAnalytics = await prisma.articleDetailedAnalytics.aggregate({
      where: {
        articleId: { in: articles.map(a => a.id) },
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        clicks: true,
      },
    });

    // Previous period analytics
    const previousPeriodAnalytics = await prisma.articleDetailedAnalytics.aggregate({
      where: {
        articleId: { in: articles.map(a => a.id) },
        date: { gte: prevStartDate, lte: prevEndDate },
      },
      _sum: {
        clicks: true,
      },
    });

    // Current period likes
    const currentLikes = await prisma.articleLike.count({
      where: {
        articleId: { in: articles.map(a => a.id) },
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    // Previous period likes
    const previousLikes = await prisma.articleLike.count({
      where: {
        articleId: { in: articles.map(a => a.id) },
        createdAt: { gte: prevStartDate, lte: prevEndDate },
      },
    });

    const totalViews = articles.reduce((sum, a) => sum + a.viewCount, 0);
    const totalLikes = articles.reduce((sum, a) => sum + a.likeCount, 0);
    const totalComments = articles.reduce((sum, a) => sum + a._count.comments, 0);
    const totalShares = articles.reduce((sum, a) => sum + a.shareCount, 0);

    const currentViews = currentPeriodAnalytics._sum.clicks || 0;
    const previousViews = previousPeriodAnalytics._sum.clicks || 0;

    // Calculate engagement rate (likes + comments + shares) / views * 100
    const avgEngagementRate = totalViews > 0 
      ? ((totalLikes + totalComments + totalShares) / totalViews) * 100 
      : 0;

    return {
      totalArticles: articles.length,
      publishedArticles: articles.filter(a => a.status === 'PUBLISHED').length,
      draftArticles: articles.filter(a => a.status === 'DRAFT').length,
      pendingArticles: articles.filter(a => a.status === 'PENDING').length,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
      viewsChange: previousViews > 0 
        ? Math.round(((currentViews - previousViews) / previousViews) * 100 * 100) / 100
        : 0,
      likesChange: previousLikes > 0 
        ? Math.round(((currentLikes - previousLikes) / previousLikes) * 100 * 100) / 100
        : 0,
    };
  }

  /**
   * Get detailed analytics for each of the author's articles
   */
  static async getAuthorArticlesAnalytics(
    userId: string, 
    dateRange: DateRange,
    page: number = 1,
    limit: number = 10,
    sortBy: 'views' | 'likes' | 'engagement' | 'date' = 'views'
  ) {
    const { startDate, endDate } = dateRange;
    const skip = (page - 1) * limit;

    // Get user's published articles
    const articles = await prisma.article.findMany({
      where: { 
        authorId: userId,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        viewCount: true,
        likeCount: true,
        shareCount: true,
        publishedAt: true,
        _count: { select: { comments: true } },
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
        clicks: true,
      },
    });

    // Get period likes
    const periodLikes = await prisma.articleLike.groupBy({
      by: ['articleId'],
      where: {
        articleId: { in: articleIds },
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: true,
    });

    const analyticsMap = new Map(periodAnalytics.map(a => [a.articleId, a._sum.clicks || 0]));
    const likesMap = new Map(periodLikes.map(l => [l.articleId, l._count]));

    // Build result with calculated engagement
    let result: AuthorArticleAnalytics[] = articles.map(article => {
      const periodViews = analyticsMap.get(article.id) || 0;
      const periodLikesCount = likesMap.get(article.id) || 0;
      const engagement = article.viewCount > 0 
        ? ((article.likeCount + article._count.comments + article.shareCount) / article.viewCount) * 100 
        : 0;

      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        status: article.status,
        views: article.viewCount,
        likes: article.likeCount,
        comments: article._count.comments,
        shares: article.shareCount,
        publishedAt: article.publishedAt,
        periodViews,
        periodLikes: periodLikesCount,
        engagement: Math.round(engagement * 100) / 100,
      };
    });

    // Sort based on sortBy parameter
    switch (sortBy) {
      case 'views':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'likes':
        result.sort((a, b) => b.likes - a.likes);
        break;
      case 'engagement':
        result.sort((a, b) => b.engagement - a.engagement);
        break;
      case 'date':
        result.sort((a, b) => {
          if (!a.publishedAt) return 1;
          if (!b.publishedAt) return -1;
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        });
        break;
    }

    // Apply pagination
    const paginatedResult = result.slice(skip, skip + limit);
    const total = result.length;

    return {
      data: paginatedResult,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get views trend for author's articles
   */
  static async getAuthorViewsTrend(userId: string, dateRange: DateRange) {
    const { startDate, endDate } = dateRange;

    // Get user's article IDs
    const articles = await prisma.article.findMany({
      where: { authorId: userId, status: 'PUBLISHED' },
      select: { id: true },
    });

    const articleIds = articles.map(a => a.id);

    // Get daily analytics
    const dailyAnalytics = await prisma.articleDetailedAnalytics.groupBy({
      by: ['date'],
      where: {
        articleId: { in: articleIds },
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        clicks: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return dailyAnalytics.map(d => ({
      date: d.date.toISOString().split('T')[0],
      views: d._sum.clicks || 0,
    }));
  }

  /**
   * Get best performing article for the user
   */
  static async getBestPerformingArticle(userId: string) {
    const article = await prisma.article.findFirst({
      where: { 
        authorId: userId,
        status: 'PUBLISHED',
      },
      orderBy: { viewCount: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        likeCount: true,
        shareCount: true,
        publishedAt: true,
        _count: { select: { comments: true } },
      },
    });

    if (!article) return null;

    return {
      ...article,
      engagement: article.viewCount > 0 
        ? ((article.likeCount + article._count.comments + article.shareCount) / article.viewCount) * 100 
        : 0,
    };
  }

  /**
   * Get audience insights for author's articles
   */
  static async getAudienceInsights(userId: string, dateRange: DateRange) {
    const { startDate, endDate } = dateRange;

    // Get user's article IDs
    const articles = await prisma.article.findMany({
      where: { authorId: userId, status: 'PUBLISHED' },
      select: { id: true },
    });

    const articleIds = articles.map(a => a.id);

    // Get page views for author's articles
    const pageViews = await prisma.pageView.findMany({
      where: {
        page: 'article',
        entityId: { in: articleIds },
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        device: true,
        country: true,
        referrer: true,
      },
    });

    // Device breakdown
    const deviceCounts = pageViews.reduce((acc, pv) => {
      const device = pv.device || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Country breakdown
    const countryCounts = pageViews.reduce((acc, pv) => {
      const country = pv.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Referrer breakdown
    const referrerCounts = pageViews.reduce((acc, pv) => {
      let source = 'direct';
      if (pv.referrer) {
        if (pv.referrer.includes('google')) source = 'Google';
        else if (pv.referrer.includes('facebook') || pv.referrer.includes('fb.')) source = 'Facebook';
        else if (pv.referrer.includes('twitter') || pv.referrer.includes('t.co')) source = 'Twitter';
        else if (pv.referrer.includes('linkedin')) source = 'LinkedIn';
        else source = 'Other';
      }
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalViews = pageViews.length;

    return {
      devices: Object.entries(deviceCounts)
        .map(([device, count]) => ({
          device,
          count,
          percentage: totalViews > 0 ? Math.round((count / totalViews) * 100 * 100) / 100 : 0,
        }))
        .sort((a, b) => b.count - a.count),
      countries: Object.entries(countryCounts)
        .map(([country, count]) => ({
          country,
          count,
          percentage: totalViews > 0 ? Math.round((count / totalViews) * 100 * 100) / 100 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      referrers: Object.entries(referrerCounts)
        .map(([source, count]) => ({
          source,
          count,
          percentage: totalViews > 0 ? Math.round((count / totalViews) * 100 * 100) / 100 : 0,
        }))
        .sort((a, b) => b.count - a.count),
    };
  }

  /**
   * Get daily summary for author dashboard
   */
  static async getAuthorDailySummary(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const authorAnalytics = await prisma.authorAnalytics.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    const yesterdayAnalytics = await prisma.authorAnalytics.findUnique({
      where: {
        userId_date: {
          userId,
          date: yesterday,
        },
      },
    });

    return {
      today: authorAnalytics || { totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0 },
      yesterday: yesterdayAnalytics || { totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0 },
      viewsChange: yesterdayAnalytics?.totalViews 
        ? ((authorAnalytics?.totalViews || 0) - yesterdayAnalytics.totalViews) / yesterdayAnalytics.totalViews * 100 
        : 0,
    };
  }
}
