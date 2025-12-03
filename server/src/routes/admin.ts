import { Router, Request, Response, NextFunction } from 'express'
import { getStats } from '../controllers/adminController'
import { requireAdmin } from '../middleware/requireAdmin'
import { PrismaClient } from '@prisma/client'
import { validate } from '../middleware/validate'
import { reviewClaimSchema } from '../validation/claimSchemas'
import * as ClaimController from '../controllers/ClaimController'
import { SyncService } from '../services/SyncService'

const router = Router()
const prisma = new PrismaClient()

router.get('/stats', requireAdmin, getStats)

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

// --- NEW SYSTEM INTEGRITY ROUTES ---

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

export default router
