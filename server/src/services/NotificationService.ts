import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

interface CreateNotificationData {
  type: string;
  title: string;
  message: string;
  link?: string;
}

export class NotificationService {
  /**
   * Create a new notification for a user
   */
  static async create(userId: string, data: CreateNotificationData) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
      },
    });

    // Optional: Send email notification for important types (fire-and-forget)
    // Uncomment when EmailService is ready
    // if (data.type === 'SYSTEM' || data.type === 'REVIEW_APPROVED') {
    //   try {
    //     const user = await prisma.user.findUnique({ where: { id: userId } });
    //     if (user?.email) {
    //       EmailService.sendNotification(user.email, data.title, data.message).catch(() => {});
    //     }
    //   } catch (err) {
    //     // Ignore email errors - notification is still created
    //   }
    // }

    return notification;
  }

  /**
   * Get notifications for a user (latest 20)
   */
  static async getUserNotifications(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return notifications;
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(id: string, userId: string) {
    // Ensure the notification belongs to the user
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new AppError(404, 'Notification not found');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return updated;
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { count: result.count };
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  }
}
