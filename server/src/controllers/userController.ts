import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { FinancialProfileService } from '../services/FinancialProfileService';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined; // Clerk injects auth
    if (!clerkId) return res.status(401).json({ error: 'unauthenticated' });
    const profile = await UserService.getProfile(clerkId);
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) return res.status(401).json({ error: 'unauthenticated' });

    // Define financial fields that belong to FinancialProfile model
    const financialFields = [
      'maxBudget',
      'householdIncome',
      'familySize',
      'savings',
      'investments',
      'expectedFamilyContribution',
      'eligibleForPellGrant',
      'eligibleForStateAid'
    ];

    // Split the request body into user and financial data
    const userUpdateData: any = {};
    const financialUpdateData: any = {};

    Object.entries(req.body).forEach(([key, value]) => {
      if (financialFields.includes(key)) {
        financialUpdateData[key] = value;
      } else {
        userUpdateData[key] = value;
      }
    });

    // Update User model if there's user data
    let updatedUser;
    if (Object.keys(userUpdateData).length > 0) {
      updatedUser = await UserService.updateProfile(clerkId, userUpdateData);
    }

    // Upsert FinancialProfile if there's financial data
    let updatedFinancialProfile;
    if (Object.keys(financialUpdateData).length > 0) {
      updatedFinancialProfile = await FinancialProfileService.upsert(clerkId, financialUpdateData);
    }

    // Fetch complete updated profile to return
    const completeProfile = await UserService.getProfile(clerkId);
    
    res.status(200).json(completeProfile);
  } catch (err) {
    next(err);
  }
};

export const toggleSaved = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) return res.status(401).json({ error: 'unauthenticated' });
    const universityId = req.params.id;
    const result = await UserService.toggleSavedUniversity(clerkId, universityId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getUserDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    const user = await prisma.user.findUnique({ 
      where: { clerkId },
      include: {
        financialProfile: true, // Include 1:1 financial relation
      }
    });
    if (!user) throw new AppError(404, 'User not found');

    const [saved, reviews, articles] = await Promise.all([
      prisma.savedUniversity.findMany({
        where: { userId: user.id },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { university: { select: { id: true, name: true, slug: true, logoUrl: true } } },
      }),
      prisma.review.findMany({
        where: { userId: user.id },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { university: { select: { name: true } } },
      }),
      prisma.article.findMany({
        where: { authorId: user.id },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, slug: true, status: true, createdAt: true },
      }),
    ]);

    const stats = {
      savedCount: await prisma.savedUniversity.count({ where: { userId: user.id } }),
      reviewCount: await prisma.review.count({ where: { userId: user.id } }),
      articleCount: await prisma.article.count({ where: { authorId: user.id } }),
    };

    res.status(200).json({
      user, // Now includes financialProfile
      recent: { saved, reviews, articles },
      stats,
    });
  } catch (err) {
    next(err);
  }
};
