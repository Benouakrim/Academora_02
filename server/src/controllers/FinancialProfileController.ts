import { Request, Response, NextFunction } from 'express';
import { FinancialProfileService } from '../services/FinancialProfileService';
import prisma from '../lib/prisma';

/**
 * Get the financial profile for the authenticated user
 */
export const getFinancialProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;
    const clerkId = auth?.userId;

    if (!clerkId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const profile = await FinancialProfileService.getByClerkId(clerkId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Financial profile not found' });
    }

    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

/**
 * Create or update the financial profile for the authenticated user
 */
export const upsertFinancialProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;
    const clerkId = auth?.userId;

    if (!clerkId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const profile = await FinancialProfileService.upsert(clerkId, req.body);
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

/**
 * Initialize a financial profile for the authenticated user
 */
export const initializeFinancialProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;
    const clerkId = auth?.userId;

    if (!clerkId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get internal user ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await FinancialProfileService.initializeFinancialProfile(user.id);
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete the financial profile for the authenticated user
 */
export const deleteFinancialProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;
    const clerkId = auth?.userId;

    if (!clerkId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get internal user ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.financialProfile.delete({
      where: { userId: user.id },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
