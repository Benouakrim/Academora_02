import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { FinancialProfileService } from '../services/FinancialProfileService';
import { SyncService } from '../services/SyncService';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { clerkClient } from '@clerk/express';

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined; // Clerk injects auth
    if (!clerkId) return res.status(401).json({ error: 'unauthenticated' });
    
    // Check if user exists in database
    let profile = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        financialProfile: true,
        savedUniversities: {
          include: { 
            university: {
              select: {
                id: true,
                name: true,
                slug: true,
                city: true,
                state: true,
                country: true,
                logoUrl: true,
                tuitionOutState: true,
                tuitionInternational: true,
              }
            } 
          },
          orderBy: { createdAt: 'desc' }
        },
      },
    });
    
    // If user doesn't exist, create them with data from Clerk
    if (!profile) {
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || `user+${clerkId}@example.com`;
        const firstName = clerkUser.firstName || undefined;
        const lastName = clerkUser.lastName || undefined;
        const avatarUrl = clerkUser.imageUrl || undefined;
        
        const newUser = await prisma.user.create({
          data: { clerkId, email, firstName, lastName, avatarUrl },
          include: {
            financialProfile: true,
            savedUniversities: {
              include: { 
                university: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    city: true,
                    state: true,
                    country: true,
                    logoUrl: true,
                    tuitionOutState: true,
                    tuitionInternational: true,
                  }
                } 
              },
              orderBy: { createdAt: 'desc' }
            },
          },
        });
        
        profile = newUser;
      } catch (clerkError) {
        // If we can't fetch from Clerk, create with minimal data
        const newUser = await prisma.user.create({
          data: { clerkId, email: `user+${clerkId}@example.com` },
          include: {
            financialProfile: true,
            savedUniversities: {
              include: { 
                university: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    city: true,
                    state: true,
                    country: true,
                    logoUrl: true,
                    tuitionOutState: true,
                    tuitionInternational: true,
                  }
                } 
              },
              orderBy: { createdAt: 'desc' }
            },
          },
        });
        
        profile = newUser;
      }
    }
    
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
    let neonUserId = ''; // To store the internal ID for syncing

    const existingUser = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
    if (existingUser) neonUserId = existingUser.id;
    
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
      neonUserId = updatedUser.id;
    }

    // Upsert FinancialProfile if there's financial data
    if (Object.keys(financialUpdateData).length > 0) {
      await FinancialProfileService.upsert(clerkId, financialUpdateData);
    }
    
    // --- NEW SYNC LOGIC ---
    if (neonUserId) {
        // Push updated Neon data back to Clerk metadata
        await SyncService.syncNeonToClerk(neonUserId);
    }
    // --- END NEW SYNC LOGIC ---

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

    let user = await prisma.user.findUnique({ 
      where: { clerkId },
      include: {
        financialProfile: true, // Include 1:1 financial relation
      }
    });
    
    // If user doesn't exist, create them with data from Clerk
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || `user+${clerkId}@example.com`;
        const firstName = clerkUser.firstName || undefined;
        const lastName = clerkUser.lastName || undefined;
        const avatarUrl = clerkUser.imageUrl || undefined;
        
        user = await prisma.user.create({
          data: { clerkId, email, firstName, lastName, avatarUrl },
          include: {
            financialProfile: true,
          },
        });
      } catch (clerkError) {
        // If we can't fetch from Clerk, create with minimal data
        user = await prisma.user.create({
          data: { clerkId, email: `user+${clerkId}@example.com` },
          include: {
            financialProfile: true,
          },
        });
      }
    }

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
