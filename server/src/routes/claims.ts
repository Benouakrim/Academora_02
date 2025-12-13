import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { requireAdmin } from '../middleware/requireAdmin';
import { validate } from '../middleware/validate';
import * as controller from '../controllers/ClaimController';
import { 
  createClaimSchema, 
  postMessageSchema, 
  submitClaimDataSchema,
  updateClaimStatusSchema 
} from '../validation/claimSchemas';

const router = Router();

// --- USER ROUTES (Authenticated) ---

// POST /api/claims/request - Submit a new claim
router.post('/request', requireAuth, validate(createClaimSchema), controller.requestClaim);

// GET /api/claims/my-requests - Get user's claim history
router.get('/my-requests', requireAuth, controller.getMyClaims);

// GET /api/claims/:id - Get detailed claim information
router.get('/:id', requireAuth, controller.getClaimDetails);

// POST /api/claims/:id/message - Post a message (chat or document request)
router.post('/:id/message', requireAuth, validate(postMessageSchema), controller.postMessage);

// POST /api/claims/:id/submit-data - Submit data in response to a request
router.post('/:id/submit-data', requireAuth, validate(submitClaimDataSchema), controller.submitClaimData);

// PATCH /api/claims/:id - Update claim (user can edit their own pending claims)
router.patch('/:id', requireAuth, controller.updateClaim);

// DELETE /api/claims/:id - Delete claim (user can delete their own pending claims)
router.delete('/:id', requireAuth, controller.deleteClaim);

// PATCH /api/claims/:id/status - Update claim status (Admin only, but route is here for clarity)
router.patch('/:id/status', requireAuth, validate(updateClaimStatusSchema), controller.updateClaimStatus);

// NEW (Prompt 15): Super Admin approval of DATA_UPDATE claims
// Atomically moves data from Draft to Live columns
router.put('/:id/approve-data', requireAuth, requireAdmin, controller.approveDataUpdate);

export default router;
