import { Router, Request, Response, NextFunction } from 'express'
import { getStats } from '../controllers/adminController'
import { requireAdmin } from '../middleware/requireAdmin'
import { validate } from '../middleware/validate'
import { reviewClaimSchema } from '../validation/claimSchemas'
import * as ClaimController from '../controllers/ClaimController'
import * as analyticsController from '../controllers/analyticsController'
import { SyncService } from '../services/SyncService'
import { Cache } from '../lib/cache'
import prisma from '../lib/prisma'

const router = Router()

router.get('/stats', requireAdmin, getStats)

// ==========================================
// ADMIN ANALYTICS ROUTES
// ==========================================

// Main analytics dashboard
router.get('/analytics/dashboard', requireAdmin, analyticsController.getAdminDashboard);

// Site overview
router.get('/analytics/overview', requireAdmin, analyticsController.getSiteOverview);

// Page views time series
router.get('/analytics/pageviews', requireAdmin, analyticsController.getPageViewsTimeSeries);

// Top performers (articles, universities, groups)
router.get('/analytics/top-performers', requireAdmin, analyticsController.getTopPerformers);

// Detailed articles analytics
router.get('/analytics/articles', requireAdmin, analyticsController.getArticlesAnalytics);

// Detailed universities analytics
router.get('/analytics/universities', requireAdmin, analyticsController.getUniversitiesAnalytics);

// Detailed groups analytics
router.get('/analytics/groups', requireAdmin, analyticsController.getGroupsAnalytics);

// User activity analytics
router.get('/analytics/users', requireAdmin, analyticsController.getUsersAnalytics);

// Device breakdown
router.get('/analytics/devices', requireAdmin, analyticsController.getDeviceBreakdown);

// Traffic sources
router.get('/analytics/traffic-sources', requireAdmin, analyticsController.getTrafficSources);

// Geographic distribution
router.get('/analytics/geography', requireAdmin, analyticsController.getGeographicDistribution);

// Search analytics
router.get('/analytics/search', requireAdmin, analyticsController.getSearchAnalytics);

// Engagement summary
router.get('/analytics/engagement', requireAdmin, analyticsController.getEngagementSummary);

// Real-time data
router.get('/analytics/realtime', requireAdmin, analyticsController.getRealTimeData);

// Get all reviews with optional status filter
router.get('/reviews', requireAdmin, async (req, res) => {
  const status = req.query.status as string | undefined;
  const reviews = await prisma.review.findMany({
    where: status ? { status: status as any } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      university: { select: { name: true } },
      user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } }
    },
    take: 50
  })
  res.json({ data: reviews })
})

// --- UNIVERSITY CLAIMS ADMIN ROUTES ---

// GET /api/admin/claims - Get all claims (pending first)
router.get('/claims', requireAdmin, ClaimController.getAllClaims);

// PATCH /api/admin/claims/:id/review - Review a specific claim
router.patch('/claims/:id/review', 
  requireAdmin, 
  validate(reviewClaimSchema), 
  ClaimController.reviewClaim
);

// GET /api/admin/claims/:id/documents - Get all documents for a claim
router.get('/claims/:id/documents', requireAdmin, ClaimController.getClaimDocuments);

// PATCH /api/admin/documents/:id/review - Review a specific document
router.patch('/documents/:id/review', requireAdmin, ClaimController.reviewDocument);

// --- NEW SYSTEM INTEGRITY & POWER TOOLS ROUTES ---

// GET /api/admin/health/cache - Get cache performance status
router.get('/health/cache', requireAdmin, async (req: Request, res: Response) => {
    try {
        const stats = (Cache as any).getStats();
        res.status(200).json({ status: 'success', data: stats });
    } catch (err) {
        // Return 500 if cache is not ready
        res.status(500).json({ status: 'error', message: 'Cache service unavailable.' });
    }
});

// POST /api/admin/health/cache/clear - Clear the cache
router.post('/health/cache/clear', requireAdmin, (req: Request, res: Response) => {
    try {
        Cache.clear();
        res.status(200).json({ status: 'success', message: 'In-memory cache cleared.' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Failed to clear cache.' });
    }
});

// GET /api/admin/health/sync-status - Check Clerk/Neon data consistency
router.get('/health/sync-status', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = await SyncService.verifySyncStatus();
        res.status(200).json({ status: 'success', data: status });
    } catch (err) {
        next(err);
    }
});

// POST /api/admin/health/reconcile - Trigger Clerk -> Neon reconciliation
router.post('/health/reconcile', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await SyncService.reconcileClerkToNeon();
        res.status(200).json({ status: 'success', message: 'Reconciliation process initiated.', data: result });
    } catch (err) {
        next(err);
    }
});

// --- LEGACY ROUTES (DEPRECATED - Use /health/* paths above) ---

// GET /api/admin/sync-status - Check for data inconsistencies (runs quickly on sample)
router.get('/sync-status', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = await SyncService.verifySyncStatus();
        res.status(200).json({ status: 'success', data: status });
    } catch (err) {
        next(err);
    }
});

// POST /api/admin/reconcile - Manual trigger for Clerk -> Neon reconciliation (heavy operation)
router.post('/reconcile', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cleanupOrphaned } = req.body;
        const result = await SyncService.reconcileClerkToNeon({ cleanupOrphaned });
        res.status(200).json({ status: 'success', message: 'Reconciliation process initiated.', data: result });
    } catch (err) {
        next(err);
    }
});

// --- REFERRAL ADMIN ROUTES ---

// GET /api/admin/referrals/metrics - Get referral system metrics
router.get('/referrals/metrics', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalReferrals, completedReferrals, pendingReferrals, totalRewardsGiven, activeCodes, uniqueReferrers] = await Promise.all([
      prisma.referral.count(),
      prisma.referral.count({ where: { status: 'COMPLETED' } }),
      prisma.referral.count({ where: { status: 'PENDING' } }),
      prisma.referral.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { rewardAmount: true }
      }),
      prisma.user.count({ where: { referralCode: { not: null } } }),
      prisma.referral.findMany({
        distinct: ['referrerId'],
        select: { referrerId: true }
      })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        totalRewardsGiven: totalRewardsGiven._sum.rewardAmount || 0,
        activeCodes,
        uniqueReferrers: uniqueReferrers.length
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/referrals - Get all referrals with optional status filter
router.get('/referrals', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string | undefined;
    const referrals = await prisma.referral.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        referrer: { select: { firstName: true, lastName: true, email: true } },
        referredUser: { select: { firstName: true, lastName: true, email: true } }
      },
      take: 100
    });

    res.status(200).json({ status: 'success', data: referrals });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/referrals/leaderboard - Get top referrers
router.get('/referrals/leaderboard', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topReferrers = await prisma.referral.groupBy({
      by: ['referrerId'],
      _count: {
        id: true
      },
      where: { status: 'COMPLETED' },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    const detailedReferrers = await Promise.all(
      topReferrers.map(async (ref) => {
        const user = await prisma.user.findUnique({
          where: { id: ref.referrerId },
          select: { id: true, firstName: true, lastName: true, email: true }
        });
        
        const allCount = await prisma.referral.count({
          where: { referrerId: ref.referrerId }
        });

        return {
          ...user,
          completedCount: ref._count.id,
          referralCount: allCount
        };
      })
    );

    res.status(200).json({ status: 'success', data: detailedReferrers });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/referrals/codes - Get all referral codes
router.get('/referrals/codes', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const codes = await prisma.user.findMany({
      where: { referralCode: { not: null } },
      select: {
        referralCode: true,
        id: true,
        firstName: true,
        lastName: true,
        email: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedCodes = codes.map(user => ({
      code: user.referralCode,
      userId: user.id,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      isActive: true // TODO: Add isActive field to User model if needed
    }));

    res.status(200).json({ status: 'success', data: formattedCodes });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/referrals/codes/:code/toggle - Toggle referral code status
router.patch('/referrals/codes/:code/toggle', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const { isActive } = req.body;

    // TODO: Implement isActive field on User model
    // For now, just return success
    res.status(200).json({ 
      status: 'success', 
      message: 'Code status would be toggled (feature requires model update)',
      data: { code, isActive }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/referrals/settings - Get referral system settings
router.get('/referrals/settings', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Return default settings (TODO: Store in database)
    const settings = {
      rewardsEnabled: true,
      pointsPerReferral: 100,
      minimumReferralsForReward: 5,
      rewardAmount: 50,
      codeExpiryDays: 365,
      maxCodesPerUser: 1
    };

    res.status(200).json({ status: 'success', data: settings });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/referrals/settings - Update referral system settings
router.patch('/referrals/settings', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Store settings in database
    res.status(200).json({ 
      status: 'success', 
      message: 'Settings updated (feature requires database implementation)',
      data: req.body 
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/referrals/export/csv - Export referrals as CSV
router.get('/referrals/export/csv', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const referrals = await prisma.referral.findMany({
      include: {
        referrer: { select: { firstName: true, lastName: true, email: true } },
        referredUser: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Create CSV content
    const headers = ['Referrer Name', 'Referrer Email', 'Referred User Name', 'Referred User Email', 'Status', 'Created At'];
    const rows = referrals.map(ref => [
      `${ref.referrer.firstName} ${ref.referrer.lastName}`,
      ref.referrer.email,
      `${ref.referredUser.firstName} ${ref.referredUser.lastName}`,
      ref.referredUser.email,
      ref.status,
      new Date(ref.createdAt).toISOString()
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="referrals-${new Date().toISOString().split('T')[0]}.csv"`);
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
});

export default router
