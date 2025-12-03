import { Router } from 'express';
import { startSubscriptionCheckout, handleStripeWebhook } from '../controllers/BillingController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// POST /api/billing/checkout - Initiate the checkout process
router.post('/checkout', requireAuth, startSubscriptionCheckout);

// POST /api/billing/webhook - Stripe Webhook listener (NO AUTH)
// NOTE: Must use raw body parser middleware for this route (configured in index.ts)
router.post('/webhook', handleStripeWebhook); 

export default router;
