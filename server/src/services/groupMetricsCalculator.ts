// server/src/services/groupMetricsCalculator.ts
import prisma from '../lib/prisma';

export type MetricMode = 'static' | 'dynamic';

export interface CalculatedMetrics {
  // A. Identity & Overview
  numberOfCampuses?: number;
  totalStudentPopulation?: number;
  totalStaffCount?: number;

  // B. Academics & Programs
  fieldsOfStudy?: string[];
  levelCoverage?: string[];
  programQualityScore?: number;
  graduationRate?: number;
  accreditations?: string[];

  // C. Admissions & Selectivity
  tuitionRangeMin?: number;
  tuitionRangeMax?: number;

  // D. Rankings & Reputation
  employerReputationScore?: number;
  researchReputationScore?: number;

  // E. Research & Innovation
  researchCentersCount?: number;
  annualPublications?: number;
  researchBudget?: number;

  // F. Student Life & Facilities
  campusInfrastructureRating?: number;
  librariesCount?: number;
  studentAssociationsCount?: number;

  // G. International Outlook
  internationalStudentsPct?: number;
  partnerUniversitiesCount?: number;
  englishCoursesAvailable?: boolean;

  // H. Financial & Economic
  operationalBudget?: number;

  // I. Outcomes & Employability
  employmentRate?: number;
  medianSalary?: number;
}

/**
 * Calculate metrics for a university group based on its member universities
 */
export class GroupMetricsCalculator {
  /**
   * Calculate all dynamic metrics for a group
   */
  static async calculateMetrics(groupId: string): Promise<CalculatedMetrics> {
    // Fetch all universities in the group with relevant fields
    const group = await prisma.universityGroup.findUnique({
      where: { id: groupId },
      include: {
        universities: {
          select: {
            // Identity
            campusSizeAcres: true,
            studentPopulation: true,

            // Academics
            popularMajors: true,
            graduationRate: true,

            // Admissions
            tuitionInState: true,
            tuitionOutState: true,
            tuitionInternational: true,

            // Research
            fundedResearch: true,
            researchOutputScore: true,

            // Student Life
            studentLifeScore: true,

            // International
            percentInternational: true,

            // Financial
            averageNetPrice: true,

            // Outcomes
            employmentRate: true,
            averageStartingSalary: true,
            retentionRate: true,
          }
        }
      }
    });

    const universities = group?.universities || [];

    if (universities.length === 0) {
      return {};
    }

    const metrics: CalculatedMetrics = {};

    // A. Identity & Overview
    metrics.numberOfCampuses = universities.length;
    
    metrics.totalStudentPopulation = universities.reduce((sum, u) => 
      sum + (u.studentPopulation || 0), 0
    );

    // B. Academics & Programs
    // Aggregate unique fields of study from all universities
    const allFields = new Set<string>();
    universities.forEach(u => {
      if (u.popularMajors) {
        u.popularMajors.forEach((field: string) => allFields.add(field));
      }
    });
    metrics.fieldsOfStudy = Array.from(allFields);

    // Average graduation rate (weighted by student population)
    const gradRates = universities.filter(u => u.graduationRate !== null);
    if (gradRates.length > 0) {
      const totalStudents = gradRates.reduce((sum, u) => sum + (u.studentPopulation || 1), 0);
      const weightedSum = gradRates.reduce((sum, u) => 
        sum + (u.graduationRate || 0) * (u.studentPopulation || 1), 0
      );
      metrics.graduationRate = weightedSum / totalStudents;
    }

    // C. Admissions & Selectivity
    const tuitions = universities
      .map(u => [u.tuitionInState, u.tuitionOutState, u.tuitionInternational])
      .flat()
      .filter((t): t is number => t !== null && t !== undefined);
    
    if (tuitions.length > 0) {
      metrics.tuitionRangeMin = Math.min(...tuitions);
      metrics.tuitionRangeMax = Math.max(...tuitions);
    }

    // E. Research & Innovation
    metrics.researchCentersCount = universities.reduce((sum, u) => 
      sum + (u.fundedResearch || 0), 0
    );

    const budgets = universities
      .map(u => u.fundedResearch)
      .filter((b): b is number => b !== null && b !== undefined);
    
    if (budgets.length > 0) {
      metrics.researchBudget = budgets.reduce((sum, b) => sum + b, 0);
    }

    // F. Student Life & Facilities
    const lifeScores = universities
      .map(u => u.studentLifeScore)
      .filter((s): s is number => s !== null && s !== undefined);
    
    if (lifeScores.length > 0) {
      metrics.campusInfrastructureRating = 
        lifeScores.reduce((sum, s) => sum + s, 0) / lifeScores.length;
    }

    // G. International Outlook
    const intlPcts = universities
      .map(u => u.percentInternational)
      .filter((p): p is number => p !== null && p !== undefined);
    
    if (intlPcts.length > 0) {
      const totalStudentsForIntl = universities
        .filter(u => u.percentInternational !== null)
        .reduce((sum, u) => sum + (u.studentPopulation || 1), 0);
      
      const weightedIntl = universities
        .filter(u => u.percentInternational !== null)
        .reduce((sum, u) => 
          sum + (u.percentInternational || 0) * (u.studentPopulation || 1), 0
        );
      
      metrics.internationalStudentsPct = weightedIntl / totalStudentsForIntl;
    }

    // H. Financial & Economic
    const netPrices = universities
      .map(u => u.averageNetPrice)
      .filter((p): p is number => p !== null && p !== undefined);
    
    if (netPrices.length > 0) {
      metrics.operationalBudget = netPrices.reduce((sum, p) => sum + p, 0) * 
        (metrics.totalStudentPopulation || 0);
    }

    // I. Outcomes & Employability
    const empRates = universities
      .map(u => u.employmentRate)
      .filter((r): r is number => r !== null && r !== undefined);
    
    if (empRates.length > 0) {
      const totalGrads = universities
        .filter(u => u.employmentRate !== null)
        .reduce((sum, u) => 
          sum + ((u.studentPopulation || 0) * (u.graduationRate || 0.5)), 0
        );
      
      const weightedEmp = universities
        .filter(u => u.employmentRate !== null)
        .reduce((sum, u) => 
          sum + (u.employmentRate || 0) * ((u.studentPopulation || 0) * (u.graduationRate || 0.5)), 0
        );
      
      metrics.employmentRate = weightedEmp / totalGrads;
    }

    const salaries = universities
      .map(u => u.averageStartingSalary)
      .filter((s): s is number => s !== null && s !== undefined);
    
    if (salaries.length > 0) {
      metrics.medianSalary = this.calculateMedian(salaries);
    }

    return metrics;
  }

  /**
   * Merge static (admin-provided) and dynamic (calculated) metrics
   */
  static mergeMetrics(
    staticData: Record<string, any>,
    dynamicData: CalculatedMetrics,
    metricModes: Record<string, MetricMode>
  ): Record<string, any> {
    const merged: Record<string, any> = {};

    // Get all possible metric keys
    const allKeys = new Set([
      ...Object.keys(staticData),
      ...Object.keys(dynamicData),
    ]);

    for (const key of allKeys) {
      const mode = metricModes[key] || 'dynamic';
      
      if (mode === 'static' && staticData[key] !== undefined && staticData[key] !== null) {
        // Use admin-provided static value
        merged[key] = staticData[key];
      } else if (dynamicData[key as keyof CalculatedMetrics] !== undefined) {
        // Use calculated dynamic value
        merged[key] = dynamicData[key as keyof CalculatedMetrics];
      } else {
        // Fallback to static if dynamic not available
        merged[key] = staticData[key];
      }
    }

    return merged;
  }

  /**
   * Calculate median from array of numbers
   */
  private static calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }

  /**
   * Check if cache is still valid (less than 1 hour old)
   */
  static isCacheValid(cacheUpdatedAt: Date | null): boolean {
    if (!cacheUpdatedAt) return false;
    
    const hourInMs = 60 * 60 * 1000;
    const now = new Date();
    return (now.getTime() - cacheUpdatedAt.getTime()) < hourInMs;
  }

  /**
   * Invalidate cache for a group (called when universities are added/removed)
   */
  static async invalidateCache(groupId: string): Promise<void> {
    await prisma.universityGroup.update({
      where: { id: groupId },
      data: {
        calculatedMetricsCache: undefined,
        cacheUpdatedAt: null,
      },
    });
  }

  /**
   * Update cache for a group
   */
  static async updateCache(groupId: string, metrics: CalculatedMetrics): Promise<void> {
    await prisma.universityGroup.update({
      where: { id: groupId },
      data: {
        calculatedMetricsCache: metrics as any,
        cacheUpdatedAt: new Date(),
      },
    });
  }

  /**
   * Get metrics with caching
   */
  static async getMetricsWithCache(groupId: string): Promise<CalculatedMetrics> {
    const group = await prisma.universityGroup.findUnique({
      where: { id: groupId },
      select: {
        calculatedMetricsCache: true,
        cacheUpdatedAt: true,
      },
    });

    // Use cache if valid
    if (group?.calculatedMetricsCache && this.isCacheValid(group.cacheUpdatedAt)) {
      return group.calculatedMetricsCache as CalculatedMetrics;
    }

    // Calculate fresh metrics
    const metrics = await this.calculateMetrics(groupId);
    
    // Update cache
    await this.updateCache(groupId, metrics);
    
    return metrics;
  }
}
