import { Request, Response, NextFunction } from 'express';
import { ReferralService } from '../services/ReferralService';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

// Helper to get userId from clerkId
const getUserId = async (req: Request) => {
  const clerkId = typeof (req as any).auth === 'function' ? (req as any).auth()?.userId : undefined;
  if (!clerkId) throw new AppError(401, 'Unauthorized: Missing Clerk ID');
  
  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) throw new AppError(404, 'User profile not found');
  return user.id;
};

/**
 * Get referral data for authenticated user
 * Returns the user's referral code, list of referrals, and stats
 */
export const getReferralData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await getUserId(req);

    // Get user's referral code
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Get referrals and stats
    const [referrals, stats] = await Promise.all([
      ReferralService.getReferralsByUserId(userId),
      ReferralService.getReferralStats(userId),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        referralCode: user.referralCode,
        referrals,
        stats,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Apply a referral code (public endpoint, no auth required)
 * Sets a secure cookie that expires in 30 days to track the referral
 */
export const applyReferral = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;

    if (!code) {
      throw new AppError(400, 'Referral code is required');
    }

    // Verify the code exists
    const referrer = await prisma.user.findUnique({
      where: { referralCode: code.toUpperCase() },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!referrer) {
      throw new AppError(404, 'Invalid referral code');
    }

    // Set secure cookie that expires in 30 days
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    res.cookie('referralCode', code.toUpperCase(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: thirtyDays,
    });

    res.status(200).json({
      status: 'success',
      message: 'Referral code applied successfully',
      data: {
        referredBy: `${referrer.firstName} ${referrer.lastName}`,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Track a referral after user signup (called internally or via webhook)
 * This should be called after a new user completes registration
 */
export const trackReferralAfterSignup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = await getUserId(req);
    const referralCode = req.cookies.referralCode;

    if (!referralCode) {
      return res.status(200).json({
        status: 'success',
        message: 'No referral code found',
      });
    }

    // Track the referral
    await ReferralService.trackReferral(referralCode, userId);

    // Clear the cookie after tracking
    res.clearCookie('referralCode');

    res.status(201).json({
      status: 'success',
      message: 'Referral tracked successfully',
    });
  } catch (err) {
    next(err);
  }
};
