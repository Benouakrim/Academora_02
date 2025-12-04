import { PrismaClient, University } from '@prisma/client';
import { MatchRequest } from '../validation/matchingSchemas';
import { AcademicProfileService } from './AcademicProfileService';

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
  /**
   * Get recommended universities based on user's onboarding profile.
   * Pre-filters universities by focusArea and personaRole for first-time users.
   */
  static async getRecommendedUniversities(userId: string): Promise<UniversityMatchResult[]> {
    // Fetch user profile with onboarding data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        focusArea: true,
        personaRole: true,
        gpa: true,
        satScore: true,
        preferredMajor: true,
        financialProfile: {
          select: {
            maxBudget: true,
            householdIncome: true,
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Fetch the user's academic profile for enhanced matching
    let academicProfile = null;
    try {
      academicProfile = await AcademicProfileService.getByUserId(userId);
    } catch (error) {
      // Academic profile is optional - continue with basic matching if not found
      console.log(`[MatchingService] No academic profile found for user ${userId}`);
    }

    // Extract test scores from academic profile if available
    const testScores = academicProfile?.testScores as any || {};
    const satTotal = testScores.SAT?.total;
    const actComposite = testScores.ACT?.composite;

    // Build a basic MatchRequest from user profile for initial recommendations
    // Prioritize academic profile data over legacy user fields
    const matchRequest: MatchRequest = {
      gpa: academicProfile?.gpa || user.gpa || 3.0,
      satScore: (satTotal || user.satScore) ?? undefined,
      actScore: actComposite,
      preferredMajor: academicProfile?.primaryMajor || user.preferredMajor || user.focusArea || 'Undeclared',
      maxBudget: user.financialProfile?.maxBudget || 50000,
      needsVisaSupport: false,
      strictMatch: false,
      importanceFactors: {
        // Boost academic importance when academic profile exists
        academics: academicProfile ? 8 : 5,
        cost: 4,
        social: 3,
        location: 3,
        future: 4,
      }
    };

    return this.findMatches(matchRequest, user.focusArea, user.personaRole, academicProfile);
  }

  static async findMatches(
    profile: MatchRequest, 
    userFocusArea?: string | null, 
    userPersonaRole?: string | null,
    academicProfile?: any
  ): Promise<UniversityMatchResult[]> {
    // 1. Initial Filtering (Base constraints + Onboarding data)
    const where: any = {};
    if (profile.preferredCountry) {
      where.country = { equals: profile.preferredCountry, mode: 'insensitive' };
    }

    let universities = await prisma.university.findMany({ where });

    // 2. Apply Academic Profile-based filtering (Primary filter when available)
    // If user has a rich academic profile, use it for intelligent pre-filtering
    if (academicProfile) {
      universities = universities.filter((uni) => {
        // GPA Filter: Exclude universities significantly above user's academic level
        if (academicProfile.gpa && uni.minGpa && academicProfile.gpa < uni.minGpa - 0.3) {
          return false; // Too much of a reach
        }

        // Test Score Filter: Exclude if user's scores are too low
        const testScores = academicProfile.testScores as any || {};
        if (testScores.SAT?.total && uni.avgSatScore) {
          if (testScores.SAT.total < uni.avgSatScore - 150) {
            return false; // Significant SAT gap
          }
        }

        return true; // Include if passes academic filters
      });
    }

    // 3. Apply Onboarding-based filtering (First-time optimization)
    // If user has defined focusArea or personaRole, prioritize matching universities
    if (userFocusArea || userPersonaRole || academicProfile?.primaryMajor) {
      universities = universities.filter((uni) => {
        let score = 0;
        
        // Primary Major matching (highest priority if from academic profile)
        if (academicProfile?.primaryMajor) {
          const majorKeywords = academicProfile.primaryMajor.toLowerCase();
          const matchesMajor = uni.popularMajors.some(m => 
            m.toLowerCase().includes(majorKeywords) ||
            majorKeywords.includes(m.toLowerCase())
          );
          if (matchesMajor) score += 3; // Higher weight for academic profile major
        }
        
        // Focus Area matching: Check if university offers programs in the user's focus area
        if (userFocusArea) {
          const focusAreaKeywords = userFocusArea.toLowerCase().replace(/_/g, ' ');
          const matchesMajor = uni.popularMajors.some(m => 
            m.toLowerCase().includes(focusAreaKeywords) ||
            focusAreaKeywords.includes(m.toLowerCase())
          );
          if (matchesMajor) score += 2;
        }
        
        // Persona Role matching: Simple heuristic based on institution characteristics
        // STUDENT persona: Prefer institutions with strong undergraduate programs
        // PROFESSIONAL: Prefer institutions with career services and alumni networks
        if (userPersonaRole === 'STUDENT') {
          if (uni.studentLifeScore && uni.studentLifeScore >= 3) score += 1;
        } else if (userPersonaRole === 'PROFESSIONAL' || userPersonaRole === 'CAREER_CHANGER') {
          if (uni.alumniNetwork && uni.alumniNetwork >= 3) score += 1;
          if (uni.internshipSupport && uni.internshipSupport >= 3) score += 1;
        }
        
        // Only include universities with some relevance for first-time users
        // Otherwise include all for broader matching
        return score > 0 || (!userFocusArea && !userPersonaRole && !academicProfile?.primaryMajor);
      });
    }

    // 3. Strict Filtering (Dealbreakers) - Only if strictMatch is enabled
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

    // 4. Scoring & Sorting
    const results = universities.map((uni) => {
      const breakdown = this.calculateBreakdown(uni, profile, academicProfile);
      const matchScore = this.calculateWeightedScore(breakdown, profile.importanceFactors);
      
      return { university: uni, matchScore, breakdown };
    });

    // Return top 20 matches
    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 20);
  }

  private static calculateBreakdown(uni: University, profile: MatchRequest, academicProfile?: any) {
    return {
      academic: this.scoreAcademic(uni, profile, academicProfile),
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

  private static scoreAcademic(uni: University, profile: MatchRequest, academicProfile?: any): number {
    let score = 70; // Baseline

    // Enhanced GPA Match with academic profile
    const userGpa = academicProfile?.gpa || profile.gpa;
    if (uni.avgGpa && userGpa >= uni.avgGpa) score += 25; // Increased from 20
    else if (uni.minGpa && userGpa >= uni.minGpa) score += 15; // Increased from 10
    else if (uni.avgGpa && userGpa < uni.avgGpa - 0.5) score -= 20; // Reach school

    // Enhanced Test Score Match with academic profile data
    if (academicProfile?.testScores) {
      const testScores = academicProfile.testScores as any;
      
      // SAT Scoring
      if (testScores.SAT?.total && uni.avgSatScore) {
        const satDiff = testScores.SAT.total - uni.avgSatScore;
        if (satDiff >= 0) score += 15; // Above average
        else if (satDiff >= -100) score += 5; // Within range
        else score -= 15; // Below range
      }
      
      // ACT Scoring (alternative to SAT)
      if (testScores.ACT?.composite && uni.avgActScore) {
        const actDiff = testScores.ACT.composite - uni.avgActScore;
        if (actDiff >= 0) score += 15; // Above average
        else if (actDiff >= -2) score += 5; // Within range
        else score -= 15; // Below range
      }
      
      // AP Exam bonus - shows academic rigor
      if (testScores.AP && Array.isArray(testScores.AP)) {
        const apCount = testScores.AP.length;
        const highScores = testScores.AP.filter((exam: any) => exam.score >= 4).length;
        score += Math.min(10, apCount * 2); // Up to 10 points for AP courses
        score += Math.min(5, highScores); // Bonus for high scores
      }
    } else if (profile.satScore && uni.avgSatScore) {
      // Fallback to legacy SAT score
      if (profile.satScore >= uni.avgSatScore) score += 10;
      else if (profile.satScore < uni.avgSatScore - 100) score -= 10;
    }

    // Enhanced Major Alignment with academic profile
    const preferredMajor = academicProfile?.primaryMajor || profile.preferredMajor;
    const hasMajor = uni.popularMajors.some(m => 
      m.toLowerCase().includes(preferredMajor.toLowerCase()) ||
      preferredMajor.toLowerCase().includes(m.toLowerCase())
    );
    if (hasMajor) score += 25; // Increased from 20
    
    // Secondary major bonus
    if (academicProfile?.secondaryMajor) {
      const hasSecondaryMajor = uni.popularMajors.some(m => 
        m.toLowerCase().includes(academicProfile.secondaryMajor.toLowerCase())
      );
      if (hasSecondaryMajor) score += 10; // Bonus for dual major fit
    }

    // Academic Honors bonus - indicates high achievement
    if (academicProfile?.academicHonors && Array.isArray(academicProfile.academicHonors)) {
      const honors = academicProfile.academicHonors;
      const nationalOrHigher = honors.filter((h: any) => 
        ['National', 'International'].includes(h.level)
      ).length;
      score += Math.min(10, honors.length * 2); // Up to 10 points for honors
      score += nationalOrHigher * 3; // Extra bonus for national/international
    }

    // Extracurricular alignment bonus
    if (academicProfile?.extracurriculars && Array.isArray(academicProfile.extracurriculars)) {
      const activityCount = academicProfile.extracurriculars.length;
      score += Math.min(5, activityCount); // Up to 5 points for activities
    }

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
