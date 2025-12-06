// server/src/controllers/engagementController.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

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
