import { Request, Response, NextFunction } from 'express';
import { OnboardingService } from '../services/OnboardingService';
import { AppError } from '../utils/AppError';
import type { OnboardingPayload } from '../validation/onboardingSchemas';

export class OnboardingController {
  /**
   * POST /api/onboarding
   * Completes the onboarding process for a user
   */
  static async postOnboarding(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('[OnboardingController] POST request received');
      console.log('[OnboardingController] Body:', JSON.stringify(req.body, null, 2));
      
      // Extract clerkId from authenticated request
      const authFn = (req as any).auth as (() => { userId?: string } | undefined);
      const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
      
      console.log('[OnboardingController] ClerkId:', clerkId);
      
      if (!clerkId) {
        throw new AppError(401, 'Unauthorized: No valid authentication');
      }

      // Request body is already validated by Zod middleware
      const data = req.body as OnboardingPayload;

      // Call service to complete onboarding
      const updatedUser = await OnboardingService.completeOnboarding(clerkId, data);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Onboarding completed successfully',
        user: updatedUser,
      });
    } catch (error) {
      console.error('[OnboardingController] Error:', error);
      next(error);
    }
  }

  /**
   * GET /api/onboarding/status
   * Gets the current onboarding status for a user
   */
  static async getOnboardingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const authFn = (req as any).auth as (() => { userId?: string } | undefined);
      const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
      
      if (!clerkId) {
        throw new AppError(401, 'Unauthorized: No valid authentication');
      }

      const status = await OnboardingService.getOnboardingStatus(clerkId);

      res.status(200).json({
        success: true,
        status,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/onboarding
   * Updates/re-does the onboarding for a user
   */
  static async updateOnboarding(req: Request, res: Response, next: NextFunction) {
    try {
      const authFn = (req as any).auth as (() => { userId?: string } | undefined);
      const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
      
      if (!clerkId) {
        throw new AppError(401, 'Unauthorized: No valid authentication');
      }

      const data = req.body as OnboardingPayload;

      const updatedUser = await OnboardingService.updateOnboarding(clerkId, data);

      res.status(200).json({
        success: true,
        message: 'Onboarding updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/onboarding/skip
   * Skips the onboarding for a user
   */
  static async skipOnboarding(req: Request, res: Response, next: NextFunction) {
    try {
      const authFn = (req as any).auth as (() => { userId?: string } | undefined);
      const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
      
      if (!clerkId) {
        throw new AppError(401, 'Unauthorized: No valid authentication');
      }

      const updatedUser = await OnboardingService.skipOnboarding(clerkId);

      res.status(200).json({
        success: true,
        message: 'Onboarding skipped successfully',
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
}
