import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/NotificationService';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { clerkClient } from '@clerk/express';

const prisma = new PrismaClient();

/**
 * Get all notifications for the authenticated user
 */
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    // Find internal userId from clerkId, create if doesn't exist
    let user = await prisma.user.findUnique({ where: { clerkId } });
    
    if (!user) {
      // User not in DB yet - fetch from Clerk and create
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        const email = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress 
                      || clerkUser.emailAddresses[0]?.emailAddress;
        
        if (!email) throw new AppError(400, 'No email found for user');
        
        user = await prisma.user.create({
          data: {
            clerkId,
            email,
            firstName: clerkUser.firstName || undefined,
            lastName: clerkUser.lastName || undefined,
            avatarUrl: clerkUser.imageUrl || undefined,
          },
        });
        console.log('[NotificationController] Auto-created user:', user.id);
      } catch (err) {
        console.error('[NotificationController] Failed to create user:', err);
        throw new AppError(404, 'User not found and could not be created');
      }
    }

    const notifications = await NotificationService.getUserNotifications(user.id);
    const unreadCount = await NotificationService.getUnreadCount(user.id);

    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark a single notification as read
 */
export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    let user = await prisma.user.findUnique({ where: { clerkId } });
    
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        const email = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress 
                      || clerkUser.emailAddresses[0]?.emailAddress;
        if (!email) throw new AppError(400, 'No email found for user');
        
        user = await prisma.user.create({
          data: {
            clerkId,
            email,
            firstName: clerkUser.firstName || undefined,
            lastName: clerkUser.lastName || undefined,
            avatarUrl: clerkUser.imageUrl || undefined,
          },
        });
      } catch (err) {
        throw new AppError(404, 'User not found and could not be created');
      }
    }

    const notificationId = req.params.id;
    const updated = await NotificationService.markAsRead(notificationId, user.id);

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    if (!clerkId) throw new AppError(401, 'Unauthorized');

    let user = await prisma.user.findUnique({ where: { clerkId } });
    
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        const email = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress 
                      || clerkUser.emailAddresses[0]?.emailAddress;
        if (!email) throw new AppError(400, 'No email found for user');
        
        user = await prisma.user.create({
          data: {
            clerkId,
            email,
            firstName: clerkUser.firstName || undefined,
            lastName: clerkUser.lastName || undefined,
            avatarUrl: clerkUser.imageUrl || undefined,
          },
        });
      } catch (err) {
        throw new AppError(404, 'User not found and could not be created');
      }
    }

    const result = await NotificationService.markAllAsRead(user.id);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
