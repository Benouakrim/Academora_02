import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { requireAuth, requireAdmin } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import {
  trackPageViewSchema,
  updatePageViewDurationSchema,
  trackEventSchema,
  trackSearchSchema,
} from '../validation/analyticsSchemas';

const router = Router();

// ==========================================
// PUBLIC TRACKING ENDPOINTS
// (No auth required - tracking should work for all visitors)
// ==========================================

// Track page view
router.post('/track/pageview', validate(trackPageViewSchema), analyticsController.trackPageView);

// Update page view duration
router.patch('/track/pageview/:id', validate(updatePageViewDurationSchema), analyticsController.updatePageViewDuration);

// Track engagement event
router.post('/track/event', validate(trackEventSchema), analyticsController.trackEvent);

// Track search
router.post('/track/search', validate(trackSearchSchema), analyticsController.trackSearch);

// ==========================================
// USER ANALYTICS ENDPOINTS (Authenticated users)
// ==========================================

// User's own article analytics
router.get('/my/overview', requireAuth, analyticsController.getMyAnalyticsOverview);
router.get('/my/articles', requireAuth, analyticsController.getMyArticlesAnalytics);
router.get('/my/views-trend', requireAuth, analyticsController.getMyViewsTrend);
router.get('/my/best-article', requireAuth, analyticsController.getMyBestArticle);
router.get('/my/audience', requireAuth, analyticsController.getMyAudienceInsights);

export default router;
