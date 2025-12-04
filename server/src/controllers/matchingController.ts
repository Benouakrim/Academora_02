import { Request, Response, NextFunction } from 'express';
import { MatchingService } from '../services/MatchingService';

export const calculateMatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = req.body; // Already validated by middleware
    const matches = await MatchingService.findMatches(profile);
    res.status(200).json(matches);
  } catch (err) {
    next(err);
  }
};

/**
 * Get personalized university recommendations based on user's onboarding profile
 */
export const getRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;
    const clerkId = auth?.userId;
    
    if (!clerkId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get internal user ID from clerkId
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const matches = await MatchingService.getRecommendedUniversities(user.id);
    res.status(200).json(matches);
  } catch (err) {
    next(err);
  }
};
