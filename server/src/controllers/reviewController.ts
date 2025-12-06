import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Admin can filter by status, users only see APPROVED by default
    const { universityId } = req.params as { universityId: string };
    const status = req.query.status as string;
    
    const where: any = { universityId };
    if (status) {
      where.status = status;
    } else {
      where.status = 'APPROVED';
    }

    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [reviews, total, aggregates] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          university: { select: { name: true } } // Include uni name for Admin view
        },
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({
        where: { universityId, status: 'APPROVED' },
        _avg: { rating: true, academicRating: true, campusRating: true, socialRating: true, careerRating: true },
        _count: { rating: true }
      })
    ]);

    res.status(200).json({
      data: reviews,
      stats: {
        count: aggregates._count.rating,
        avgRating: aggregates._avg.rating || 0,
        breakdown: {
          academic: aggregates._avg.academicRating || 0,
          campus: aggregates._avg.campusRating || 0,
          social: aggregates._avg.socialRating || 0,
          career: aggregates._avg.careerRating || 0,
        }
      },
      meta: { total, page, limit }
    });
  } catch (err) {
    next(err);
  }
};

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new AppError(404, 'User profile not found');

    const { universityId, ...data } = req.body;

    // Check for existing review
    const existing = await prisma.review.findUnique({
      where: { userId_universityId: { userId: user.id, universityId } }
    });

    if (existing) throw new AppError(409, 'You have already reviewed this university');

    const review = await prisma.review.create({
      data: {
        ...data,
        userId: user.id,
        universityId,
        status: 'PENDING', // Safety First: Default to Pending
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
      }
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

export const moderateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const review = await prisma.review.update({
      where: { id },
      data: { status },
    });

    res.status(200).json(review);
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const authFn = (req as any).auth;
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new AppError(404, 'User not found');

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new AppError(404, 'Review not found');

    // Allow Admin or Owner to delete
    if (review.userId !== user.id && user.role !== 'ADMIN') {
      throw new AppError(403, 'Permission denied');
    }

    await prisma.review.delete({ where: { id } });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
