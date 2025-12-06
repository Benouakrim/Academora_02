import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { FinancialAidService } from '../services/FinancialAidService';
import { ComparisonAnalysisService } from '../services/ComparisonAnalysisService';
import { ComparativeInsightsService } from '../services/ComparativeInsightsService';
import { ComparisonReportService } from '../services/ComparisonReportService';
import { ComparisonService } from '../services/ComparisonService';
import prisma from '../lib/prisma';

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
 * Body: { universityIds: string[], weights?: { ranking, cost, acceptance, ... } }
 */
export const analyzeComparison = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { universityIds, weights } = req.body;
    const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;
    const clerkId = auth?.userId;

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

    // Get user's custom weights if authenticated
    let userWeights = weights;
    if (clerkId && !weights) {
      const user = await prisma.user.findUnique({
        where: { clerkId },
        include: { analysisWeights: true },
      });
      
      if (user?.analysisWeights) {
        userWeights = {
          ranking: user.analysisWeights.ranking,
          cost: user.analysisWeights.cost,
          acceptance: user.analysisWeights.acceptance,
          employmentRate: user.analysisWeights.employmentRate,
          studentSatisfaction: user.analysisWeights.studentSatisfaction,
          research: user.analysisWeights.research,
        };
      }
    }

    // Generate analysis
    const analysis = ComparisonAnalysisService.analyze(universities, userWeights);

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

/**
 * Set or update analysis weights for the authenticated user
 * POST /compare/weights
 * Body: { ranking: number, cost: number, acceptance: number, ... }
 */
export const setAnalysisWeights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;
    const clerkId = auth?.userId;

    if (!clerkId) {
      throw new AppError(401, 'Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const {
      ranking = 0.25,
      cost = 0.25,
      acceptance = 0.15,
      employmentRate = 0.15,
      studentSatisfaction = 0.10,
      research = 0.10,
      targetSalary,
      careerFocus,
      preferredLocation,
      internshipImportant = false,
      researchImportant = false,
    } = req.body;

    // Validate weights sum to approximately 1.0
    const totalWeight = ranking + cost + acceptance + employmentRate + studentSatisfaction + research;
    if (totalWeight < 0.9 || totalWeight > 1.1) {
      throw new AppError(400, 'Weights must sum to approximately 1.0');
    }

    const weights = await prisma.analysisWeights.upsert({
      where: { userId: user.id },
      update: {
        ranking,
        cost,
        acceptance,
        employmentRate,
        studentSatisfaction,
        research,
        targetSalary,
        careerFocus,
        preferredLocation,
        internshipImportant,
        researchImportant,
      },
      create: {
        userId: user.id,
        ranking,
        cost,
        acceptance,
        employmentRate,
        studentSatisfaction,
        research,
        targetSalary,
        careerFocus,
        preferredLocation,
        internshipImportant,
        researchImportant,
      },
    });

    res.status(200).json(weights);
  } catch (err) {
    next(err);
  }
};

/**
 * Get analysis weights for the authenticated user
 * GET /compare/weights
 */
export const getAnalysisWeights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;
    const clerkId = auth?.userId;

    if (!clerkId) {
      throw new AppError(401, 'Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { analysisWeights: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Return default weights if user hasn't set custom ones
    const weights = user.analysisWeights || {
      ranking: 0.25,
      cost: 0.25,
      acceptance: 0.15,
      employmentRate: 0.15,
      studentSatisfaction: 0.10,
      research: 0.10,
    };

    res.status(200).json(weights);
  } catch (err) {
    next(err);
  }
};

/**
 * Get risk assessments for universities in a comparison
 * POST /compare/risks
 * Body: { universityIds: string[] }
 */
export const getRiskAssessments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { universityIds } = req.body;

    if (!universityIds || !Array.isArray(universityIds) || universityIds.length === 0) {
      throw new AppError(400, 'University IDs array is required');
    }

    if (universityIds.length > 5) {
      throw new AppError(400, 'Maximum 5 universities at once');
    }

    const universities = await prisma.university.findMany({
      where: { id: { in: universityIds } },
    });

    if (universities.length === 0) {
      throw new AppError(404, 'No universities found');
    }

    // Generate risk assessments using the service
    const analysis = ComparisonAnalysisService.analyze(universities);
    
    res.status(200).json({
      riskAssessments: analysis.riskAssessments,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get trend analysis for universities
 * POST /compare/trends
 * Body: { universityIds: string[] }
 */
export const getTrendAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { universityIds } = req.body;

    if (!universityIds || !Array.isArray(universityIds) || universityIds.length === 0) {
      throw new AppError(400, 'University IDs array is required');
    }

    if (universityIds.length > 5) {
      throw new AppError(400, 'Maximum 5 universities at once');
    }

    const universities = await prisma.university.findMany({
      where: { id: { in: universityIds } },
    });

    if (universities.length === 0) {
      throw new AppError(404, 'No universities found');
    }

    // Get historical data from database
    const trendData = await Promise.all(
      universities.map(async (uni) => {
        const history = await prisma.universityMetricHistory.findMany({
          where: { universityId: uni.id },
          orderBy: { year: 'asc' },
          take: -5, // Get last 5 years
        });

        return { university: uni, history };
      })
    );

    // Generate trend analysis using the service
    const analysis = ComparisonAnalysisService.analyze(universities);
    
    // Enrich with historical data
    const enrichedTrends = analysis.trends.map((trend, idx) => {
      const historyData = trendData[idx]?.history || [];
      return {
        ...trend,
        historicalData: historyData,
      };
    });

    res.status(200).json({
      trends: enrichedTrends,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get comparative insights for universities
 * POST /compare/insights
 * Body: { universityIds: string[] }
 */
export const getComparativeInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { universityIds } = req.body;

    if (!universityIds || !Array.isArray(universityIds) || universityIds.length === 0) {
      throw new AppError(400, 'University IDs array is required');
    }

    if (universityIds.length > 5) {
      throw new AppError(400, 'Maximum 5 universities at once');
    }

    const universities = await prisma.university.findMany({
      where: { id: { in: universityIds } },
    });

    if (universities.length === 0) {
      throw new AppError(404, 'No universities found');
    }

    const insights = {
      costBenefit: ComparativeInsightsService.generateCostBenefitAnalysis(universities),
      careerOutcomes: ComparativeInsightsService.generateCareerOutcomeAnalysis(universities),
      acceptanceDifficulty: ComparativeInsightsService.generateAcceptanceDifficultyAnalysis(
        universities
      ),
      studentExperience: ComparativeInsightsService.generateStudentExperienceAnalysis(
        universities
      ),
      researchOpportunities: ComparativeInsightsService.generateResearchOpportunitiesAnalysis(
        universities
      ),
      internationalOpportunities: ComparativeInsightsService.generateInternationalOpportunitiesAnalysis(
        universities
      ),
    };

    res.status(200).json(insights);
  } catch (err) {
    next(err);
  }
};

/**
 * Generate HTML report for comparison
 * POST /compare/report/html
 * Body: { universityIds: string[] }
 */
export const generateHTMLReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { universityIds } = req.body;

    if (!universityIds || !Array.isArray(universityIds) || universityIds.length === 0) {
      throw new AppError(400, 'University IDs array is required');
    }

    if (universityIds.length > 5) {
      throw new AppError(400, 'Maximum 5 universities at once');
    }

    const universities = await prisma.university.findMany({
      where: { id: { in: universityIds } },
    });

    if (universities.length === 0) {
      throw new AppError(404, 'No universities found');
    }

    const analysis = ComparisonAnalysisService.analyze(universities);
    const htmlReport = ComparisonReportService.generateHTMLReport(universities, analysis);

    res.status(200).type('text/html').send(htmlReport);
  } catch (err) {
    next(err);
  }
};

/**
 * Generate CSV export of comparison
 * POST /compare/report/csv
 * Body: { universityIds: string[] }
 */
export const generateCSVReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { universityIds } = req.body;

    if (!universityIds || !Array.isArray(universityIds) || universityIds.length === 0) {
      throw new AppError(400, 'University IDs array is required');
    }

    if (universityIds.length > 5) {
      throw new AppError(400, 'Maximum 5 universities at once');
    }

    const universities = await prisma.university.findMany({
      where: { id: { in: universityIds } },
    });

    if (universities.length === 0) {
      throw new AppError(404, 'No universities found');
    }

    const analysis = ComparisonAnalysisService.analyze(universities);
    const csvData = ComparisonReportService.generateCSVExport(universities, analysis);

    res.status(200).type('text/csv').header('Content-Disposition', 'attachment; filename="comparison.csv"').send(csvData);
  } catch (err) {
    next(err);
  }
};

/**
 * Generate JSON export of complete analysis
 * POST /compare/report/json
 * Body: { universityIds: string[] }
 */
export const generateJSONReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { universityIds } = req.body;

    if (!universityIds || !Array.isArray(universityIds) || universityIds.length === 0) {
      throw new AppError(400, 'University IDs array is required');
    }

    if (universityIds.length > 5) {
      throw new AppError(400, 'Maximum 5 universities at once');
    }

    const universities = await prisma.university.findMany({
      where: { id: { in: universityIds } },
    });

    if (universities.length === 0) {
      throw new AppError(404, 'No universities found');
    }

    const analysis = ComparisonAnalysisService.analyze(universities);
    const jsonData = ComparisonReportService.generateJSONExport(universities, analysis);

    res.status(200).type('application/json').header('Content-Disposition', 'attachment; filename="comparison.json"').send(jsonData);
  } catch (err) {
    next(err);
  }
};

/**
 * Generate email-friendly summary
 * POST /compare/report/email
 * Body: { universityIds: string[], recipientEmail: string }
 */
export const sendComparisonEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { universityIds, recipientEmail } = req.body;

    if (!universityIds || !Array.isArray(universityIds) || universityIds.length === 0) {
      throw new AppError(400, 'University IDs array is required');
    }

    if (!recipientEmail) {
      throw new AppError(400, 'Recipient email is required');
    }

    if (universityIds.length > 5) {
      throw new AppError(400, 'Maximum 5 universities at once');
    }

    const universities = await prisma.university.findMany({
      where: { id: { in: universityIds } },
    });

    if (universities.length === 0) {
      throw new AppError(404, 'No universities found');
    }

    const analysis = ComparisonAnalysisService.analyze(universities);
    const emailSummary = ComparisonReportService.generateEmailSummary(universities, analysis);

    // TODO: Integrate with email service (e.g., SendGrid, Nodemailer)
    // For now, we'll just return the formatted email body

    res.status(200).json({
      success: true,
      message: 'Email summary generated',
      emailContent: emailSummary,
      recipientEmail,
      // In production, email would be sent here
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Generate and create a shareable comparison link
 * POST /compare/share
 * Body: { comparisonId: string }
 */
export const createShareableLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { comparisonId } = req.body;
    const getAuth = (req as any).auth as (() => { userId?: string } | undefined);
    const auth = typeof getAuth === 'function' ? getAuth() : undefined;
    const clerkId = auth?.userId;

    if (!comparisonId) {
      throw new AppError(400, 'Comparison ID is required');
    }

    if (!clerkId) {
      throw new AppError(401, 'Authentication required');
    }

    // Verify user owns this comparison
    const comparison = await prisma.comparison.findUnique({
      where: { id: comparisonId },
      include: { user: true },
    });

    if (!comparison || comparison.user?.clerkId !== clerkId) {
      throw new AppError(404, 'Comparison not found or access denied');
    }

    const shareableLink = ComparisonReportService.generateShareableLink(comparisonId);
    const shareUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/compare/shared/${shareableLink}`;

    res.status(200).json({
      shareableLink,
      shareUrl,
      expiresIn: '30 days', // Can be implemented with expiration
    });
  } catch (err) {
    next(err);
  }
};
