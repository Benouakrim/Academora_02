import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { articleId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { 
        articleId,
        parentId: null // Only fetch top-level comments
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true }
        },
        replies: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get userId from the auth middleware
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    // Find internal User ID
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new AppError(404, 'User profile not found');

    const { content, articleId, parentId } = req.body;

    if (!content) throw new AppError(400, 'Content is required');

    const comment = await prisma.comment.create({
      data: {
        content,
        articleId,
        parentId: parentId || null,
        userId: user.id
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true }
        }
      }
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};
