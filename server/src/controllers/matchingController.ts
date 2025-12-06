import { Request, Response, NextFunction } from 'express';
import { MatchingService } from '../services/MatchingService';
import prisma from '../lib/prisma';

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

/**
 * University Discovery Engine - High-performance search with comprehensive filtering
 * Supports tiered access: Free/Anonymous users get top 3 results, Premium+ get full results
 */
export const discoverUniversities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const criteria = req.body; // Already validated by discoveryCriteriaSchema middleware
    const userPlan = (req as any).userPlan || 'FREE';
    const isAnonymous = (req as any).isAnonymous || false;
    
    const discoveryResults = await MatchingService.searchUniversities(criteria, userPlan, isAnonymous);
    res.status(200).json(discoveryResults);
  } catch (err) {
    next(err);
  }
};

/**
 * Get initial search criteria based on user's profile data
 * Pre-fills filters with user's academic, financial, and location preferences
 */
export const getInitialCriteria = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;
    const clerkId = auth?.userId;
    
    if (!clerkId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const initialCriteria = await MatchingService.getInitialCriteria(clerkId);
    res.status(200).json(initialCriteria);
  } catch (err) {
    next(err);
  }
};
