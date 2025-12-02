import { PrismaClient, University } from '@prisma/client';
import { MatchRequest } from '../validation/matchingSchemas';

const prisma = new PrismaClient();

interface UniversityMatchResult {
  university: University;
  matchScore: number;
  breakdown: {
    academic: number;
    financial: number;
    social: number;
    location: number;
    future: number;
  };
}

export class MatchingService {
  static async findMatches(profile: MatchRequest): Promise<UniversityMatchResult[]> {
    // 1. Initial Filtering (Deal breakers)
    const where: any = {};
    if (profile.preferredCountry) {
      where.country = { equals: profile.preferredCountry, mode: 'insensitive' };
    }

    const universities = await prisma.university.findMany({ where });

    // 2. Scoring & Sorting
    const results = universities.map((uni) => {
      const breakdown = this.calculateBreakdown(uni, profile);
      const matchScore = this.calculateWeightedScore(breakdown, profile.importanceFactors);
      
      return { university: uni, matchScore, breakdown };
    });

    // Return top 20 matches
    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 20);
  }

  private static calculateBreakdown(uni: University, profile: MatchRequest) {
    return {
      academic: this.scoreAcademic(uni, profile),
      financial: this.scoreFinancial(uni, profile),
      social: this.scoreSocial(uni, profile),
      location: this.scoreLocation(uni, profile),
      future: this.scoreFuture(uni, profile),
    };
  }

  private static calculateWeightedScore(
    breakdown: ReturnType<typeof MatchingService.calculateBreakdown>,
    factors: MatchRequest['importanceFactors']
  ): number {
    const totalWeight = Object.values(factors).reduce((a, b) => a + b, 0);
    
    const score = (
      (breakdown.academic * factors.academics) +
      (breakdown.financial * factors.cost) +
      (breakdown.social * factors.social) +
      (breakdown.location * factors.location) +
      (breakdown.future * factors.future)
    ) / totalWeight;

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  // --- Scoring Engines ---

  private static scoreAcademic(uni: University, profile: MatchRequest): number {
    let score = 70; // Baseline

    // GPA Match
    if (uni.avgGpa && profile.gpa >= uni.avgGpa) score += 20;
    else if (uni.minGpa && profile.gpa >= uni.minGpa) score += 10;
    else if (uni.avgGpa && profile.gpa < uni.avgGpa - 0.5) score -= 20; // Reach school

    // SAT Match (if provided)
    if (profile.satScore && uni.avgSatScore) {
      if (profile.satScore >= uni.avgSatScore) score += 10;
      else if (profile.satScore < uni.avgSatScore - 100) score -= 10;
    }

    // Major Availability
    const hasMajor = uni.popularMajors.some(m => 
      m.toLowerCase().includes(profile.preferredMajor.toLowerCase())
    );
    if (hasMajor) score += 20; // Big boost for having the major

    return Math.min(100, score);
  }

  private static scoreFinancial(uni: University, profile: MatchRequest): number {
    // Determine applicable tuition (Intl vs Out of State)
    // Heuristic: If preferred country != uni country, assume international
    const isInternational = profile.preferredCountry && 
      profile.preferredCountry.toLowerCase() !== uni.country.toLowerCase();
    
    const tuition = isInternational 
      ? (uni.tuitionInternational || uni.tuitionOutState || 50000)
      : (uni.tuitionOutState || 50000);

    const estimatedAid = uni.averageGrantAid || 0;
    const netCost = tuition - estimatedAid;

    if (profile.maxBudget >= tuition) return 100; // Easily affordable
    if (profile.maxBudget >= netCost) return 85; // Affordable with average aid
    
    // Gradient decay
    const deficit = netCost - profile.maxBudget;
    return Math.max(0, 100 - (deficit / 1000)); 
  }

  private static scoreSocial(uni: University, profile: MatchRequest): number {
    let score = (uni.studentLifeScore || 3) * 20; // Normalize 0-5 to 0-100
    
    // Boost for high diversity if implicit preference (could be added to schema)
    if ((uni.diversityScore || 0) > 0.7) score += 5;

    return Math.min(100, score);
  }

  private static scoreLocation(uni: University, profile: MatchRequest): number {
    let score = 80;

    if (profile.preferredSetting && uni.setting) {
      if (profile.preferredSetting === uni.setting) score += 20;
      else score -= 20;
    }

    if (profile.preferredClimate && uni.climateZone) {
      if (uni.climateZone.toLowerCase().includes(profile.preferredClimate.toLowerCase())) {
        score += 10;
      }
    }

    return Math.min(100, score);
  }

  private static scoreFuture(uni: University, profile: MatchRequest): number {
    let score = 70;

    // Employment outcomes
    if (uni.employmentRate) {
      score += (uni.employmentRate - 0.9) * 100; // Boost if > 90%
    }

    // Visa Support logic
    if (profile.needsVisaSupport && uni.visaDurationMonths) {
      if (profile.minVisaMonths && uni.visaDurationMonths >= profile.minVisaMonths) {
        score += 30;
      } else if (uni.visaDurationMonths >= 24) {
        score += 15; // Good standard duration
      }
    }

    return Math.min(100, Math.max(0, score));
  }
}
