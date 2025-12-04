import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { FinancialAidService } from '../services/FinancialAidService';
import { ComparisonAnalysisService } from '../services/ComparisonAnalysisService';
import { ComparisonService } from '../services/ComparisonService';

const prisma = new PrismaClient();

/**
 * Bulk fetch university details by slugs for comparison
 * GET /compare?slugs=harvard,stanford,mit
 */
export const getBulkDetailsBySlugs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slugsParam = req.query.slugs as string;

    if (!slugsParam) {
      throw new AppError(400, 'Slugs parameter is required');
    }

    // Parse comma-separated slugs
    const slugsArray = slugsParam.split(',').map(s => s.trim()).filter(Boolean);

    if (slugsArray.length === 0) {
      throw new AppError(400, 'At least one slug is required');
    }

    if (slugsArray.length > 5) {
      throw new AppError(400, 'Maximum 5 universities can be compared at once');
    }

    // Fetch all universities in a single query
    const universities = await prisma.university.findMany({
      where: {
        slug: { in: slugsArray }
      }
    });

    // Return universities in the order they were requested
    const orderedUniversities = slugsArray
      .map(slug => universities.find(u => u.slug === slug))
      .filter(Boolean);

    res.status(200).json(orderedUniversities);
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch universities with personalized financial aid predictions
 * POST /compare/with-predictions
 * Body: { slugs: string[], financialProfile?: {...} }
 */
export const getWithPredictions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slugs } = req.body;
    const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;
    const clerkId = auth?.userId;

    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      throw new AppError(400, 'Slugs array is required');
    }

    if (slugs.length > 5) {
      throw new AppError(400, 'Maximum 5 universities can be compared at once');
    }

    // Fetch universities
    const universities = await prisma.university.findMany({
      where: { slug: { in: slugs } },
    });

    // Get user's financial and academic profile if authenticated
    let userProfile = null;
    let academicProfile = null;
    if (clerkId) {
      const user = await prisma.user.findUnique({
        where: { clerkId },
        include: {
          financialProfile: true,
          academicProfile: true,
        },
      });
      userProfile = user?.financialProfile || null;
      academicProfile = user?.academicProfile || null;
    }

    // Check if profile is complete for predictions
    const isProfileComplete = Boolean(
      clerkId &&
      userProfile?.householdIncome !== null &&
      academicProfile?.gpa !== null
    );

    // Generate predictions for each university if profile is complete
    const predictions: Record<string, any> = {};

    if (isProfileComplete && clerkId) {
      for (const uni of universities) {
        try {
          // Extract SAT score from JSON if available
          let satScore: number | undefined;
          if (academicProfile?.testScores) {
            const scores = academicProfile.testScores as any;
            satScore = scores?.SAT?.total;
          }

          const prediction = await FinancialAidService.predict(
            {
              universityId: uni.id,
              residency: 'out-of-state', // Default, will be overridden by FinancialAidService from profile
              // Use profile data
              familyIncome: userProfile?.householdIncome || undefined,
              gpa: academicProfile?.gpa || undefined,
              satScore: satScore,
              savings: userProfile?.savings || undefined,
              investments: userProfile?.investments || undefined,
            },
            clerkId
          );

          predictions[uni.id] = prediction;
        } catch (error) {
          console.error(`Error predicting aid for ${uni.name}:`, error);
          predictions[uni.id] = null;
        }
      }
    }

    res.status(200).json({
      universities: slugs
        .map(slug => universities.find(u => u.slug === slug))
        .filter(Boolean),
      predictions,
      isProfileComplete,
      profileCompleteness: {
        hasFinancialProfile: Boolean(userProfile),
        hasAcademicProfile: Boolean(academicProfile),
        hasIncome: userProfile?.householdIncome !== null,
        hasGpa: academicProfile?.gpa !== null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Analyze universities and generate smart recommendations
 * POST /compare/analyze
 * Body: { universityIds: string[] }
 */
export const analyzeComparison = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { universityIds } = req.body;

    if (!universityIds || !Array.isArray(universityIds) || universityIds.length === 0) {
      throw new AppError(400, 'University IDs array is required');
    }

    if (universityIds.length > 5) {
      throw new AppError(400, 'Maximum 5 universities can be analyzed at once');
    }

    // Fetch universities
    const universities = await prisma.university.findMany({
      where: { id: { in: universityIds } },
    });

    if (universities.length === 0) {
      throw new AppError(404, 'No universities found');
    }

    // Generate analysis
    const analysis = ComparisonAnalysisService.analyze(universities);

    res.status(200).json(analysis);
  } catch (err) {
    next(err);
  }
};

/**
 * Save a comparison
 * POST /compare/saved
 * Body: { name: string, description?: string, universityIds: string[] }
 */
export const saveComparison = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;
    const clerkId = auth?.userId;

    if (!clerkId) {
      throw new AppError(401, 'Authentication required');
    }

    // Get user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const comparison = await ComparisonService.saveComparison(user.id, req.body);

    res.status(201).json(comparison);
  } catch (err) {
    next(err);
  }
};

/**
 * Get all saved comparisons for the authenticated user
 * GET /compare/saved
 */
export const getSavedComparisons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;
    const clerkId = auth?.userId;

    if (!clerkId) {
      throw new AppError(401, 'Authentication required');
    }

    // Get user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const comparisons = await ComparisonService.getUserComparisons(user.id);

    res.status(200).json(comparisons);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a specific saved comparison by ID
 * GET /compare/saved/:id
 */
export const getSavedComparisonById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;
    const clerkId = auth?.userId;

    if (!clerkId) {
      throw new AppError(401, 'Authentication required');
    }

    // Get user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const comparison = await ComparisonService.getComparisonById(id, user.id);

    res.status(200).json(comparison);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a saved comparison
 * DELETE /compare/saved/:id
 */
export const deleteSavedComparison = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;
    const clerkId = auth?.userId;

    if (!clerkId) {
      throw new AppError(401, 'Authentication required');
    }

    // Get user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    await ComparisonService.deleteComparison(id, user.id);

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
