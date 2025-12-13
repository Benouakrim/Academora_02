import { Request, Response, NextFunction } from 'express'
import { AdminService } from '../services/AdminService'
import { SyncService } from '../services/SyncService'

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await AdminService.getDashboardStats()
    res.status(200).json(stats)
  } catch (err) {
    next(err)
  }
}

/**
 * Manual trigger for the daily data synchronization process.
 * Protected by requireAdmin middleware.
 * 
 * Initiates background sync without blocking the HTTP response.
 * Returns immediately with success status while sync runs in background.
 * 
 * NEW (Prompt 16): Admin endpoint to trigger automated data synchronization.
 * 
 * POST /api/admin/sync/run-now
 */
export const runManualSync = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Fire and forget: Execute the service logic asynchronously
    // This allows the server to respond immediately while the background task runs.
    // In production, this should queue to a job processor (Bull, RabbitMQ, etc.)
    SyncService.runDailySync().catch(err => {
      console.error('[AdminController] Background sync failed:', err);
    });

    res.status(200).json({
      success: true,
      message: 'Daily data sync initiated. Check server logs for completion status.',
    });
  } catch (error) {
    next(error);
  }
}
