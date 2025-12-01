import { Router } from 'express';
import { handleClerkWebhook } from '../controllers/webhookController';

const router = Router();

// Clerk webhook endpoint (no auth; secured via signature verification)
router.post('/clerk', handleClerkWebhook);

export default router;
