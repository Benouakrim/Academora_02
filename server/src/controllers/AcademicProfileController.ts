import { Request, Response, NextFunction } from 'express';
import { AcademicProfileService } from '../services/AcademicProfileService';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

export class AcademicProfileController {
  /**
   * GET /api/academic-profile
   * Get the current user's academic profile
   */
  static async getAcademicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract clerkId from authenticated request
      const authFn = (req as any).auth as (() => { userId?: string } | undefined);
      const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
      
      if (!clerkId) {
        throw new AppError(401, 'Unauthorized: No valid authentication');
      }

      const profile = await AcademicProfileService.getProfileWithCompleteness(clerkId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Academic profile not found',
          data: null,
        });
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error('[AcademicProfileController] Error getting profile:', error);
      next(error);
    }
  }

  /**
   * POST /api/academic-profile
   * Create or update the current user's academic profile
   */
  static async upsertAcademicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('[AcademicProfileController] POST/PUT request received');
      console.log('[AcademicProfileController] Body:', JSON.stringify(req.body, null, 2));
      
      // Extract clerkId from authenticated request
      const authFn = (req as any).auth as (() => { userId?: string } | undefined);
      const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
      
      console.log('[AcademicProfileController] ClerkId:', clerkId);
      
      if (!clerkId) {
        throw new AppError(401, 'Unauthorized: No valid authentication');
      }

      // Request body is already validated by Zod middleware
      const data = req.body;

      // Call service to upsert profile
      const profile = await AcademicProfileService.upsert(clerkId, data);

      // Calculate completeness
      const completeness = AcademicProfileService.calculateCompleteness(profile);

      res.status(200).json({
        success: true,
        message: 'Academic profile updated successfully',
        data: {
          ...profile,
          completeness,
        },
      });
    } catch (error) {
      console.error('[AcademicProfileController] Error upserting profile:', error);
      next(error);
    }
  }

  /**
   * PUT /api/academic-profile
   * Alias for POST - update academic profile (uses same upsert logic)
   */
  static async updateAcademicProfile(req: Request, res: Response, next: NextFunction) {
    return AcademicProfileController.upsertAcademicProfile(req, res, next);
  }

  /**
   * DELETE /api/academic-profile
   * Delete the current user's academic profile
   */
  static async deleteAcademicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authFn = (req as any).auth as (() => { userId?: string } | undefined);
      const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
      
      if (!clerkId) {
        throw new AppError(401, 'Unauthorized: No valid authentication');
      }

      await AcademicProfileService.delete(clerkId);

      res.status(200).json({
        success: true,
        message: 'Academic profile deleted successfully',
      });
    } catch (error) {
      console.error('[AcademicProfileController] Error deleting profile:', error);
      next(error);
    }
  }

  /**
   * POST /api/academic-profile/initialize
   * Initialize an empty academic profile for the current user
   */
  static async initializeAcademicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authFn = (req as any).auth as (() => { userId?: string } | undefined);
      const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
      
      if (!clerkId) {
        throw new AppError(401, 'Unauthorized: No valid authentication');
      }

      // Get user's internal ID
      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      const profile = await AcademicProfileService.initializeAcademicProfile(user.id);

      res.status(201).json({
        success: true,
        message: 'Academic profile initialized successfully',
        data: profile,
      });
    } catch (error) {
      console.error('[AcademicProfileController] Error initializing profile:', error);
      next(error);
    }
  }

  /**
   * GET /api/academic-profile/completeness
   * Get only the completeness score for the current user's profile
   */
  static async getCompleteness(req: Request, res: Response, next: NextFunction) {
    try {
      const authFn = (req as any).auth as (() => { userId?: string } | undefined);
      const clerkId = typeof authFn === 'function' ? authFn()?.userId : undefined;
      
      if (!clerkId) {
        throw new AppError(401, 'Unauthorized: No valid authentication');
      }

      const profile = await AcademicProfileService.getByClerkId(clerkId);
      const completeness = AcademicProfileService.calculateCompleteness(profile);

      res.status(200).json({
        success: true,
        data: {
          completeness,
          hasProfile: !!profile,
        },
      });
    } catch (error) {
      console.error('[AcademicProfileController] Error getting completeness:', error);
      next(error);
    }
  }
}
