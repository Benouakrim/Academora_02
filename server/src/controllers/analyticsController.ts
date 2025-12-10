import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { AnalyticsTrackingService } from '../services/AnalyticsTrackingService';
import { AnalyticsService } from '../services/AnalyticsService';
import { AdminAnalyticsService } from '../services/AdminAnalyticsService';
import { UserAnalyticsService } from '../services/UserAnalyticsService';
import prisma from '../lib/prisma';

// Helper to parse date range from query params
function parseDateRange(startDate?: string, endDate?: string) {
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  const start = startDate 
    ? new Date(startDate) 
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
  start.setHours(0, 0, 0, 0);

  return { startDate: start, endDate: end };
}

// ==========================================
// TRACKING ENDPOINTS (Public)
// ==========================================

/**
 * Track a page view
 * POST /analytics/track/pageview
 */
export const trackPageView = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, entityId, entitySlug, sessionId, referrer, duration } = req.body;

    if (!page || !sessionId) {
      return next(new AppError(400, 'page and sessionId are required'));
    }

    // Get user ID if authenticated
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    let userId: string | undefined;

    if (clerkId) {
      const user = await prisma.user.findUnique({ 
        where: { clerkId },
        select: { id: true }
      });
      userId = user?.id;
    }

    // Parse user agent
    const userAgent = req.headers['user-agent'] || '';
    const { device, browser } = AnalyticsTrackingService.parseUserAgent(userAgent);

    // Get IP-based location (would need a geo-IP service in production)
    // For now, we'll leave these empty
    const country = undefined;
    const city = undefined;

    const pageView = await AnalyticsTrackingService.trackPageView({
      page,
      entityId,
      entitySlug,
      userId,
      sessionId,
      referrer,
      userAgent,
      country,
      city,
      device,
      browser,
      duration,
    });

    res.status(201).json({ 
      status: 'success', 
      data: { id: pageView.id } 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update page view duration
 * PATCH /analytics/track/pageview/:id
 */
export const updatePageViewDuration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { duration } = req.body;

    if (!duration || typeof duration !== 'number') {
      return next(new AppError(400, 'duration is required and must be a number'));
    }

    await AnalyticsTrackingService.updatePageViewDuration(id, duration);

    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};

/**
 * Track an engagement event
 * POST /analytics/track/event
 */
export const trackEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventType, sessionId, entityType, entityId, metadata } = req.body;

    if (!eventType || !sessionId) {
      return next(new AppError(400, 'eventType and sessionId are required'));
    }

    // Get user ID if authenticated
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    let userId: string | undefined;

    if (clerkId) {
      const user = await prisma.user.findUnique({ 
        where: { clerkId },
        select: { id: true }
      });
      userId = user?.id;
    }

    await AnalyticsTrackingService.trackEngagementEvent({
      userId,
      sessionId,
      eventType,
      entityType,
      entityId,
      metadata,
    });

    res.status(201).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};

/**
 * Track a search query
 * POST /analytics/track/search
 */
export const trackSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, sessionId, resultsCount, clickedResult, page, filters } = req.body;

    if (!query || !sessionId || !page) {
      return next(new AppError(400, 'query, sessionId, and page are required'));
    }

    // Get user ID if authenticated
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    let userId: string | undefined;

    if (clerkId) {
      const user = await prisma.user.findUnique({ 
        where: { clerkId },
        select: { id: true }
      });
      userId = user?.id;
    }

    await AnalyticsTrackingService.trackSearch({
      query,
      userId,
      sessionId,
      resultsCount: resultsCount || 0,
      clickedResult,
      page,
      filters,
    });

    res.status(201).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// ADMIN ANALYTICS ENDPOINTS
// ==========================================

/**
 * Get admin dashboard analytics
 * GET /admin/analytics/dashboard
 */
export const getAdminDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );

    const data = await AdminAnalyticsService.getDashboardData({ startDate, endDate });

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get site overview metrics
 * GET /admin/analytics/overview
 */
export const getSiteOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateRange = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );

    const data = await AnalyticsService.getSiteOverview(dateRange);

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get page views time series
 * GET /admin/analytics/pageviews
 */
export const getPageViewsTimeSeries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateRange = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );
    const entityType = req.query.entityType as string | undefined;
    const entityId = req.query.entityId as string | undefined;

    const data = await AnalyticsService.getPageViewsTimeSeries(dateRange, entityType, entityId);

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get top performers
 * GET /admin/analytics/top-performers
 */
export const getTopPerformers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateRange = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );
    const type = req.query.type as 'articles' | 'universities' | 'groups' || 'articles';
    const limit = parseInt(req.query.limit as string) || 10;

    let data;
    switch (type) {
      case 'universities':
        data = await AnalyticsService.getTopUniversities(dateRange, limit);
        break;
      case 'groups':
        data = await AnalyticsService.getTopGroups(dateRange, limit);
        break;
      default:
        data = await AnalyticsService.getTopArticles(dateRange, limit);
    }

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get detailed articles analytics
 * GET /admin/analytics/articles
 */
export const getArticlesAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateRange = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await AdminAnalyticsService.getArticlesAnalytics(dateRange, page, limit);

    res.status(200).json({ status: 'success', ...data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get detailed universities analytics
 * GET /admin/analytics/universities
 */
export const getUniversitiesAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateRange = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await AdminAnalyticsService.getUniversitiesAnalytics(dateRange, page, limit);

    res.status(200).json({ status: 'success', ...data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get detailed groups analytics
 * GET /admin/analytics/groups
 */
export const getGroupsAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateRange = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await AdminAnalyticsService.getGroupsAnalytics(dateRange, page, limit);

    res.status(200).json({ status: 'success', ...data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user activity analytics
 * GET /admin/analytics/users
 */
export const getUsersAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateRange = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await AdminAnalyticsService.getUserAnalytics(dateRange, page, limit);

    res.status(200).json({ status: 'success', ...data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get device breakdown
 * GET /admin/analytics/devices
 */
export const getDeviceBreakdown = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateRange = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );

    const data = await AnalyticsService.getDeviceBreakdown(dateRange);

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get traffic sources
 * GET /admin/analytics/traffic-sources
 */
export const getTrafficSources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateRange = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );

    const data = await AnalyticsService.getTrafficSources(dateRange);

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get geographic distribution
 * GET /admin/analytics/geography
 */
export const getGeographicDistribution = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateRange = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await AnalyticsService.getGeographicDistribution(dateRange, limit);

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get search analytics
 * GET /admin/analytics/search
 */
export const getSearchAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateRange = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await AnalyticsService.getSearchAnalytics(dateRange, limit);

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get engagement summary
 * GET /admin/analytics/engagement
 */
export const getEngagementSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateRange = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );

    const data = await AdminAnalyticsService.getEngagementSummary(dateRange);

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get real-time active users
 * GET /admin/analytics/realtime
 */
export const getRealTimeData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await AnalyticsService.getRealTimeActiveUsers();

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// USER ANALYTICS ENDPOINTS
// ==========================================

/**
 * Get author analytics overview (for the current user)
 * GET /user/analytics/overview
 */
export const getMyAnalyticsOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;

    if (!clerkId) {
      return next(new AppError(401, 'Authentication required'));
    }

    const user = await prisma.user.findUnique({ 
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    const dateRange = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );

    const data = await UserAnalyticsService.getAuthorOverview(user.id, dateRange);

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get detailed analytics for user's articles
 * GET /user/analytics/articles
 */
export const getMyArticlesAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;

    if (!clerkId) {
      return next(new AppError(401, 'Authentication required'));
    }

    const user = await prisma.user.findUnique({ 
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    const dateRange = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as 'views' | 'likes' | 'engagement' | 'date') || 'views';

    const data = await UserAnalyticsService.getAuthorArticlesAnalytics(
      user.id, 
      dateRange, 
      page, 
      limit, 
      sortBy
    );

    res.status(200).json({ status: 'success', ...data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get views trend for user's articles
 * GET /user/analytics/views-trend
 */
export const getMyViewsTrend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;

    if (!clerkId) {
      return next(new AppError(401, 'Authentication required'));
    }

    const user = await prisma.user.findUnique({ 
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    const dateRange = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );

    const data = await UserAnalyticsService.getAuthorViewsTrend(user.id, dateRange);

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get best performing article for the current user
 * GET /user/analytics/best-article
 */
export const getMyBestArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;

    if (!clerkId) {
      return next(new AppError(401, 'Authentication required'));
    }

    const user = await prisma.user.findUnique({ 
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    const data = await UserAnalyticsService.getBestPerformingArticle(user.id);

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

/**
 * Get audience insights for user's articles
 * GET /user/analytics/audience
 */
export const getMyAudienceInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;

    if (!clerkId) {
      return next(new AppError(401, 'Authentication required'));
    }

    const user = await prisma.user.findUnique({ 
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    const dateRange = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );

    const data = await UserAnalyticsService.getAudienceInsights(user.id, dateRange);

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};
