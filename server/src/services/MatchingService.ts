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
    // 1. Initial Filtering (Base constraints)
    const where: any = {};
    if (profile.preferredCountry) {
      where.country = { equals: profile.preferredCountry, mode: 'insensitive' };
    }

    let universities = await prisma.university.findMany({ where });

    // 2. Strict Filtering (Dealbreakers) - Only if strictMatch is enabled
    if (profile.strictMatch) {
      universities = universities.filter((uni) => {
        // Budget Constraint: Exclude if tuition exceeds maxBudget
        const isInternational = profile.preferredCountry && 
          profile.preferredCountry.toLowerCase() !== uni.country.toLowerCase();
        const tuition = isInternational 
          ? (uni.tuitionInternational || uni.tuitionOutState || 50000)
          : (uni.tuitionOutState || 50000);
        
        if (tuition > profile.maxBudget) return false;

        // Visa Constraint: Exclude if visa duration less than minimum required
        if (profile.minVisaMonths && uni.visaDurationMonths) {
          if (uni.visaDurationMonths < profile.minVisaMonths) return false;
        }

        // Safety Constraint: Exclude if below minimum safety rating
        if (profile.minSafetyRating && uni.safetyRating) {
          if (uni.safetyRating < profile.minSafetyRating) return false;
        }

        return true;
      });
    }

    // 3. Scoring & Sorting
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
    
    // Diversity Matching: If user has explicit preference, calculate closeness
    if (profile.preferredDiversity !== undefined && uni.diversityScore !== null) {
      const diversityCloseness = 100 - (Math.abs(uni.diversityScore - profile.preferredDiversity) * 100);
      score = (score + diversityCloseness) / 2; // Blend with base score
    } else if ((uni.diversityScore || 0) > 0.7) {
      score += 5; // Small boost for high diversity if no explicit preference
    }

    // Safety Rating: Normalize 0-5 to 0-100 and blend in
    if (uni.safetyRating) {
      const safetyScore = (uni.safetyRating / 5) * 100;
      score = (score * 0.7) + (safetyScore * 0.3); // 70/30 weight
    }

    // Party Scene: Factor in for social fit (0-5 to 0-100)
    if (uni.partySceneRating) {
      const partyScore = (uni.partySceneRating / 5) * 100;
      score = (score * 0.8) + (partyScore * 0.2); // 80/20 weight
    }

    return Math.min(100, Math.max(0, score));
  }

  private static scoreLocation(uni: University, profile: MatchRequest): number {
    let score = 80;

    if (profile.preferredSetting && uni.setting) {
      if (profile.preferredSetting === uni.setting) score += 20;
      else score -= 20;
    }

    // Robust climate matching: case-insensitive substring search
    if (profile.preferredClimate && uni.climateZone) {
      const uniClimate = uni.climateZone.toLowerCase().trim();
      const preferredClimate = profile.preferredClimate.toLowerCase().trim();
      
      if (uniClimate.includes(preferredClimate) || preferredClimate.includes(uniClimate)) {
        score += 20; // Increased weight for climate match
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  private static scoreFuture(uni: University, profile: MatchRequest): number {
    let score = 50; // Lower baseline to make room for component scores

    // Employment outcomes (33% weight)
    if (uni.employmentRate) {
      const employmentScore = uni.employmentRate * 100; // 0-1 to 0-100
      score += employmentScore * 0.33;
    }

    // Alumni Network strength (33% weight) - normalize 0-5 to 0-100
    if (uni.alumniNetwork) {
      const alumniScore = (uni.alumniNetwork / 5) * 100;
      score += alumniScore * 0.33;
    }

    // Internship Support (33% weight) - normalize 0-5 to 0-100
    if (uni.internshipSupport) {
      const internshipScore = (uni.internshipSupport / 5) * 100;
      score += internshipScore * 0.33;
    }

    // Visa Support logic - bonus on top
    if (profile.needsVisaSupport && uni.visaDurationMonths) {
      if (profile.minVisaMonths && uni.visaDurationMonths >= profile.minVisaMonths) {
        score += 20; // Major bonus for meeting visa requirement
      } else if (uni.visaDurationMonths >= 24) {
        score += 10; // Good standard duration
      }
    }

    return Math.min(100, Math.max(0, score));
  }
}
