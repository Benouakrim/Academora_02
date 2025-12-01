import { PrismaClient, University } from '@prisma/client';

const prisma = new PrismaClient();

export interface MatchProfile {
  gpa: number;
  satScore?: number;
  actScore?: number;
  maxBudget: number;
  preferredMajor: string;
  preferredCountry?: string;
  importanceFactors: {
    academics: number; // 1-10
    social: number;    // 1-10
    cost: number;      // 1-10
  };
}

export interface UniversityMatchResult {
  university: University;
  matchScore: number;
  breakdown: {
    academicScore: number;
    financialScore: number;
    socialScore: number;
    majorScore: number;
  };
}

export class MatchingService {
  static async findMatches(profile: MatchProfile): Promise<UniversityMatchResult[]> {
    const where: any = {};
    if (profile.preferredCountry) {
      where.country = profile.preferredCountry;
    }

    // Fetch all universities (optimize with cursor pagination in production)
    const universities = await prisma.university.findMany({ where });

    const results = universities.map((uni) => {
      const breakdown = this.calculateScores(uni, profile);
      
      // Weighted total based on user importance
      // Normalize importance to percentages
      const totalImp = profile.importanceFactors.academics + profile.importanceFactors.cost + profile.importanceFactors.social;
      const wAcademics = profile.importanceFactors.academics / totalImp;
      const wCost = profile.importanceFactors.cost / totalImp;
      const wSocial = profile.importanceFactors.social / totalImp;

      // Base score calculation
      let matchScore = (
        (breakdown.academicScore * wAcademics) +
        (breakdown.financialScore * wCost) +
        (breakdown.socialScore * wSocial) +
        (breakdown.majorScore * 0.2) // Major is always relevant flat bonus
      );

      // Normalize to 0-100
      matchScore = Math.min(100, Math.max(0, matchScore));

      return { university: uni, matchScore, breakdown };
    });

    // Return top 20 matches sorted by score
    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 20);
  }

  private static calculateScores(uni: University, profile: MatchProfile) {
    // 1. Academic Score (0-100)
    let academicScore = 70; // Base score
    if (uni.minGpa && profile.gpa >= uni.minGpa) academicScore += 10;
    if (uni.avgGpa && profile.gpa >= uni.avgGpa) academicScore += 20;
    
    // SAT/ACT handling
    if (profile.satScore && uni.satMath25 && uni.satMath75 && uni.satVerbal25 && uni.satVerbal75) {
      const uniAvgSat = (uni.satMath25 + uni.satMath75 + uni.satVerbal25 + uni.satVerbal75) / 2;
      if (profile.satScore >= uniAvgSat) academicScore += 20;
      else if (profile.satScore >= (uni.satMath25 + uni.satVerbal25)) academicScore += 10;
    }

    // 2. Financial Score (0-100)
    // Compare Budget vs (OutState Tuition - Avg Aid)
    const estimatedCost = (uni.tuitionOutState || 50000) - (uni.averageGrantAid || 0);
    const budgetRatio = profile.maxBudget / estimatedCost;
    let financialScore = Math.min(100, budgetRatio * 80);
    if (profile.maxBudget >= (uni.tuitionOutState || 999999)) financialScore = 100; // Full coverage

    // 3. Social Score (0-100)
    // Uses the new seed data fields
    const socialScore = ((uni.studentLifeScore || 3) / 5) * 100;

    // 4. Major Score (0 or 100)
    const hasMajor = uni.popularMajors.some(m => 
      m.toLowerCase().includes(profile.preferredMajor.toLowerCase())
    );
    const majorScore = hasMajor ? 100 : 0;

    return { academicScore, financialScore, socialScore, majorScore };
  }
}
