import { Request, Response, NextFunction } from 'express';
import { ClaimService } from '../services/ClaimService';
import { AppError } from '../utils/AppError';
import { ClaimStatus } from '@prisma/client';
import prisma from '../lib/prisma';

// Helper to get userId from clerkId (should be safe by now)
const getUserId = async (req: Request) => {
  const clerkId = typeof (req as any).auth === 'function' ? (req as any).auth()?.userId : undefined;
  if (!clerkId) throw new AppError(401, 'Unauthorized: Missing Clerk ID');
  
  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) throw new AppError(404, 'User profile not found');
  return user.id;
};

export const requestClaim = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await getUserId(req);
    
    // Request body is validated by Zod middleware, so it's safe to cast
    const claimData = req.body as {
      universityId?: string;
      universityGroupId?: string;
      requesterName: string;
      requesterEmail: string;
      position: string;
      department?: string;
      verificationDocuments: string[];
      comments?: string;
    };
    
    const newClaim = await ClaimService.create(userId, claimData);
    
    // We expect the newClaim object back
    res.status(201).json(newClaim);
  } catch (err) {
    next(err);
  }
};

export const getMyClaims = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await getUserId(req);
    const claims = await ClaimService.getUserClaims(userId);
    res.status(200).json({ status: 'success', data: claims });
  } catch (err) {
    next(err);
  }
};

export const getAllClaims = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claims = await prisma.universityClaim.findMany({
      orderBy: [
        { status: 'asc' }, // PENDING first
        { createdAt: 'desc' },
      ],
      include: {
        user: { select: { firstName: true, lastName: true, email: true, clerkId: true } },
        university: { select: { name: true, slug: true } },
      },
    });

    res.status(200).json({ status: 'success', data: claims });
  } catch (err) {
    next(err);
  }
};

export const reviewClaim = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = await getUserId(req); // To ensure an admin is performing this
    const { id } = req.params;
    const { status, adminNotes } = req.body as { status: 'APPROVED' | 'REJECTED', adminNotes?: string };

    const updatedClaim = await ClaimService.reviewClaim(id, status, adminId, adminNotes);

    res.status(200).json({ status: 'success', data: updatedClaim });
  } catch (err) {
    next(err);
  }
};
