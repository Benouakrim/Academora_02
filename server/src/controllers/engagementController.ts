// server/src/controllers/engagementController.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';
import { AnalyticsTrackingService } from '../services/AnalyticsTrackingService';

export const toggleReviewHelpful = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    
    if (!clerkId) {
      return next(new AppError(401, 'Authentication required'));
    }

    // Find the user
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id },
      select: { id: true, helpfulCount: true }
    });

    if (!review) {
      return next(new AppError(404, 'Review not found'));
    }

    // For now, we simply increment the helpful count
    // In a production system, you would:
    // 1. Check if user has already voted (via ReviewHelpful junction table)
    // 2. Toggle vote (add or remove)
    // 3. Update helpfulCount accordingly
    const updatedReview = await prisma.review.update({
      where: { id },
      data: { helpfulCount: { increment: 1 } },
      select: {
        id: true,
        helpfulCount: true,
        rating: true,
        title: true,
        content: true,
        verified: true,
        createdAt: true
      }
    });

    res.status(200).json({ 
      status: 'success', 
      data: updatedReview 
    });
  } catch (err) {
    // If ID is invalid or not found, Prisma throws P2025
    if ((err as any).code === 'P2025') {
        return next(new AppError(404, 'Review not found'));
    }
    next(err);
  }
};

/**
 * Endpoint to track block-specific engagement (e.g., vote, checklist toggle).
 */
export const trackBlockInteraction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { blockId, blockType, eventType, entityId, entityType, metadata } = req.body;
    
    // Extract userId and sessionId from request
    const userId = (req as any).userId || undefined;
    const sessionId = (req as any).sessionId || undefined;
    
    if (!blockId || !blockType || !eventType) {
      return next(new AppError(400, 'Missing required block tracking fields: blockId, blockType, eventType'));
    }

    if (!sessionId) {
      return next(new AppError(400, 'Missing sessionId'));
    }

    // Map generic entityId/entityType back to specific fields for the service
    const universityId = entityType === 'university' ? entityId : undefined;
    const articleId = entityType === 'article' ? entityId : undefined;

    await AnalyticsTrackingService.trackBlockEngagement({
      blockId,
      blockType,
      eventType,
      universityId,
      articleId,
      metadata,
      sessionId,
      userId,
    });

    // Respond quickly, as tracking should not block the user interface
    res.status(202).json({ success: true, message: 'Engagement tracked.' });
  } catch (error) {
    console.error('Engagement tracking error:', error);
    next(new AppError(500, 'Failed to track engagement'));
  }
};

