// server/src/services/MatchScoreService.ts
/**
 * Match Score Calculation Service
 * 
 * Handles transient (non-persisting) calculations for Scenario 2 implementation.
 * This service takes temporary university data and calculates match scores
 * WITHOUT modifying the database.
 */

import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';

export interface UserProfile {
  id: string;
  academicProfile?: {
    gpa?: number;
    satScore?: number;
    actScore?: number;
  };
  financialProfile?: {
    budgetMin?: number;
    budgetMax?: number;
  };
}

export interface TransientUniversityData {
  acceptanceRate?: number;
  avgGpa?: number;
  avgSatScore?: number;
  avgActScore?: number;
  tuitionOutState?: number;
  tuitionInState?: number;
  studentPopulation?: number;
  [key: string]: unknown;
}

/**
 * Calculate a match score for a user against university data WITHOUT persisting
 * 
 * This is the core of Scenario 2: Transient Simulation.
 * The service uses the provided universityData instead of fetching from the database,
 * enabling What-If analysis and scenario planning.
 */
export class MatchScoreService {
  /**
   * Calculate match score using transient (temporary) university data
   * Does not modify any database records
   */
  public static async calculateTransientMatchScore(
    userId: string,
    transientData: TransientUniversityData
  ): Promise<{ matchScore: number; details?: Record<string, number> }> {
    // Fetch user profile for comparison
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        academicProfile: true,
        financialProfile: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Calculate match score components
    const scoreComponents: Record<string, number> = {};
    let totalScore = 0;
    let weightSum = 0;

    // 1. Academic Fit (40% weight)
    const academicScore = this.calculateAcademicFit(
      user.academicProfile,
      transientData
    );
    scoreComponents.academic = academicScore;
    totalScore += academicScore * 0.4;
    weightSum += 0.4;

    // 2. Financial Fit (30% weight)
    const financialScore = this.calculateFinancialFit(
      user.financialProfile,
      transientData
    );
    scoreComponents.financial = financialScore;
    totalScore += financialScore * 0.3;
    weightSum += 0.3;

    // 3. Size Preference (20% weight)
    const sizeScore = this.calculateSizeFit(
      user.academicProfile,
      transientData
    );
    scoreComponents.size = sizeScore;
    totalScore += sizeScore * 0.2;
    weightSum += 0.2;

    // 4. Acceptance Rate (10% weight) - opportunity fit
    const opportunityScore = this.calculateOpportunityFit(transientData);
    scoreComponents.opportunity = opportunityScore;
    totalScore += opportunityScore * 0.1;
    weightSum += 0.1;

    const finalScore = weightSum > 0 ? (totalScore / weightSum) * 100 : 0;

    return {
      matchScore: Math.round(finalScore * 100) / 100, // Round to 2 decimals
      details: {
        ...scoreComponents,
        final: finalScore,
      },
    };
  }

  /**
   * Academic Fit: Compare user GPA/test scores with university medians
   * Returns 0-100 score
   */
  private static calculateAcademicFit(
    userAcademicProfile: any,
    universityData: TransientUniversityData
  ): number {
    if (!userAcademicProfile || (!userAcademicProfile.gpa && !userAcademicProfile.satScore && !userAcademicProfile.actScore)) {
      return 50; // Default neutral score if no user data
    }

    const scores: number[] = [];

    // GPA Comparison
    if (userAcademicProfile.gpa && universityData.avgGpa) {
      const gpaDiff = userAcademicProfile.gpa - (universityData.avgGpa as number);
      // Perfect match = 100, 0.5 below = 75, 0.5 above = 90
      const gpaScore = Math.min(100, Math.max(0, 50 + (gpaDiff * 20)));
      scores.push(gpaScore);
    }

    // SAT Comparison
    if (userAcademicProfile.satScore && universityData.avgSatScore) {
      const satDiff = userAcademicProfile.satScore - (universityData.avgSatScore as number);
      // Normalize to 0-100 scale (SAT range 400-1600)
      const satScore = Math.min(100, Math.max(0, 50 + (satDiff / 12)));
      scores.push(satScore);
    }

    // ACT Comparison
    if (userAcademicProfile.actScore && universityData.avgActScore) {
      const actDiff = userAcademicProfile.actScore - (universityData.avgActScore as number);
      // Normalize to 0-100 scale (ACT range 1-36)
      const actScore = Math.min(100, Math.max(0, 50 + (actDiff * 2.5)));
      scores.push(actScore);
    }

    return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 50;
  }

  /**
   * Financial Fit: Compare user budget with university cost
   * Returns 0-100 score
   */
  private static calculateFinancialFit(
    userFinancialProfile: any,
    universityData: TransientUniversityData
  ): number {
    if (!userFinancialProfile || !userFinancialProfile.budgetMax) {
      return 50; // Default if no financial profile
    }

    // Use tuitionOutState as primary cost indicator
    const universityCost = (universityData.tuitionOutState as number) || 0;
    const userBudget = userFinancialProfile.budgetMax;

    // Calculate affordability ratio
    const affortabilityRatio = universityCost / userBudget;

    // Perfect fit = cost equals budget (ratio = 1.0) = 100
    // Expensive (ratio > 2.0) = 0
    // Cheap (ratio < 0.5) = 85 (still good but less ideal)
    let score = 0;
    if (affortabilityRatio <= 0.5) {
      score = 85;
    } else if (affortabilityRatio <= 1.0) {
      score = 100 - ((affortabilityRatio - 0.5) * 30);
    } else if (affortabilityRatio <= 2.0) {
      score = 70 - ((affortabilityRatio - 1.0) * 35);
    } else {
      score = 0;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Size Fit: Compare user preference with university size
   * Returns 0-100 score
   */
  private static calculateSizeFit(
    userAcademicProfile: any,
    universityData: TransientUniversityData
  ): number {
    if (!universityData.studentPopulation) {
      return 50; // Default if no size data
    }

    const size = universityData.studentPopulation as number;

    // Define size categories
    let universitySizeCategory = '';
    if (size < 5000) universitySizeCategory = 'small';
    else if (size < 15000) universitySizeCategory = 'medium';
    else universitySizeCategory = 'large';

    // Default to neutral score - in real impl, would check user preference
    // For now, assume medium schools are ideal (score 90), others 70
    return universitySizeCategory === 'medium' ? 90 : 70;
  }

  /**
   * Opportunity Fit: Based on acceptance rate
   * Higher acceptance rate = better opportunity (but maybe lower prestige)
   * Returns 0-100 score
   */
  private static calculateOpportunityFit(universityData: TransientUniversityData): number {
    const acceptanceRate = (universityData.acceptanceRate as number) || 50;

    // Normalized scale: 5% acceptance = 100, 75% = 50, 95% = 0
    // (More selective = harder but more competitive)
    const score = Math.max(0, Math.min(100, 100 - (acceptanceRate - 5) * 1.33));
    return score;
  }

  /**
   * Batch calculate match scores for multiple scenarios (optional)
   */
  public static async calculateBatchMatchScores(
    userId: string,
    scenarios: Array<{
      universityId?: string;
      universityData: TransientUniversityData;
      label?: string;
    }>
  ): Promise<
    Array<{
      universityId?: string;
      matchScore: number;
      label?: string;
    }>
  > {
    const results = await Promise.all(
      scenarios.map(async (scenario) => {
        try {
          const result = await this.calculateTransientMatchScore(userId, scenario.universityData);
          return {
            universityId: scenario.universityId,
            matchScore: result.matchScore,
            label: scenario.label,
          };
        } catch (error) {
          console.error(`Batch score calculation failed for scenario:`, error);
          return {
            universityId: scenario.universityId,
            matchScore: 0,
            label: scenario.label,
          };
        }
      })
    );

    return results;
  }
}
