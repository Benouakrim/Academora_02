import { Router } from 'express';
import { getNotifications, markRead, markAllRead } from '../controllers/notificationController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// All notification routes require authentication
router.use(requireAuth);

// Get all notifications for current user
router.get('/', getNotifications);

// Mark a single notification as read
router.patch('/:id/read', markRead);

// Mark all notifications as read
router.patch('/read-all', markAllRead);

export default router;
