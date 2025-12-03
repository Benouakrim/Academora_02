import { Request, Response, NextFunction } from 'express';
import { FinancialAidService } from '../services/FinancialAidService';

export const predict = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract authenticated user ID if available (for profile-based calculations)
    const authFn = (req as any).auth as (() => { userId?: string } | undefined);
    const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
    
    const data = req.body; // Validated by middleware
    const result = await FinancialAidService.predict(data, clerkId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
