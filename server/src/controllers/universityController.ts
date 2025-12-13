import { Request, Response, NextFunction } from 'express';
import { UniversityService } from '../services/UniversityService';
import { UniversityProfileService } from '../services/UniversityProfileService';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

export const getUniversities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UniversityService.getAll(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getUniversityBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    // Check if it's a UUID (admin edit by ID) or a Slug (public view)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    const university = isUuid 
      ? await UniversityService.getById(slug)
      : await UniversityService.getBySlug(slug);
      
    res.status(200).json(university);
  } catch (err) {
    next(err);
  }
};

export const createUniversity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const university = await UniversityService.create(req.body);
    res.status(201).json(university);
  } catch (err) {
    next(err);
  }
};

export const updateUniversity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params; // We use the ID passed in the URL param 'slug' for simplicity in routing
    const university = await UniversityService.update(slug, req.body);
    res.status(200).json(university);
  } catch (err) {
    next(err);
  }
};

export const deleteUniversity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    await UniversityService.delete(slug);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * NEW: Fetches the complete, merged University profile for public display.
 * This endpoint serves the entire university page content in a single request:
 * - All canonical scalar fields from University table
 * - All active blocks (Hard & Soft) from MicroContent table
 * 
 * Heavily cached for performance (60-minute TTL).
 * Designed for the public university profile page.
 * 
 * Route: GET /api/universities/:slug/profile/full
 */
export const getFullProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    
    // Fetch merged profile (cached at 60-minute TTL)
    const profile = await UniversityProfileService.getFullProfile(slug);
    
    res.status(200).json({ 
      success: true, 
      data: profile,
      cached: false // In production with Redis, could indicate cache hit
    });
  } catch (error) {
    // Handle AppError (404 for not found)
    if (error instanceof AppError) {
      return next(error);
    }
    // Handle other errors via middleware
    next(error);
  }
};

/**
 * NEW (Prompt 30): Fetches historical metrics for a university over a specified time range.
 * 
 * This endpoint returns time-series data from the UniversityMetricHistory table,
 * allowing clients to visualize historical trends in metrics like acceptance rate,
 * tuition cost, ranking, and employment rate.
 * 
 * Query Parameters:
 * - years: Number of years of history to return (default: 5)
 * 
 * Route: GET /api/universities/:universityId/history
 */
export const getMetricHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { universityId } = req.params;
    
    // Parse and validate years parameter with explicit typing
    let yearsToFetch: number = 5;
    const yearsQuery = req.query.years;
    
    if (typeof yearsQuery === 'string' && yearsQuery.length > 0) {
      const parsedYears: number = parseInt(yearsQuery, 10);
      if (!isNaN(parsedYears) && parsedYears > 0) {
        yearsToFetch = Math.min(parsedYears, 50);
      }
    }

    // Verify university exists
    const university = await prisma.university.findUnique({
      where: { id: universityId },
      select: { id: true, slug: true, name: true },
    });

    if (!university) {
      throw new AppError(404, 'University not found.');
    }

    // Calculate start year for query with explicit typing
    const currentYear: number = new Date().getFullYear();
    const startYearValue: number = currentYear - yearsToFetch;

    // Fetch historical records
    const history = await prisma.universityMetricHistory.findMany({
      where: {
        universityId,
        year: { gte: startYearValue },
      },
      orderBy: { year: 'asc' },
      select: {
        year: true,
        ranking: true,
        acceptanceRate: true,
        tuitionCost: true,
        employmentRate: true,
        averageSalary: true,
        studentCount: true,
      },
    });

    res.status(200).json({ 
      success: true, 
      data: history,
      university: {
        id: university.id,
        slug: university.slug,
        name: university.name,
      },
      yearsRequested: yearsToFetch,
      recordsFound: history.length,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(error);
  }
};
