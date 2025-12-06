import { University } from '@prisma/client';
import { MatchRequest, DiscoveryCriteria, DiscoveryResponse } from '../validation/matchingSchemas';
import { AcademicProfileService } from './AcademicProfileService';
import { FinancialProfileService } from './FinancialProfileService';
import { UserService } from './UserService';
import prisma from '../lib/prisma';

interface UniversityMatchResult {
  university: University;
  matchScore: number;
  matchPercentage: number;
  breakdown: {
    academic: number;
    financial: number;
    social: number;
    location: number;
    future: number;
  };
  scoreBreakdown: {
    academic: { score: number; weight: number; contribution: number };
    financial: { score: number; weight: number; contribution: number };
    social: { score: number; weight: number; contribution: number };
    location: { score: number; weight: number; contribution: number };
    future: { score: number; weight: number; contribution: number };
    total: number;
  };
}

export class MatchingService {
  /**
   * Get initial search criteria based on user's profile data
   * Maps user, academic, and financial profile data to DiscoveryCriteria format
   * Used to pre-fill search filters on the frontend
   * 
   * @param clerkId - User's Clerk authentication ID
   * @returns DiscoveryCriteria object with user's profile data
   */
  static async getInitialCriteria(clerkId: string): Promise<DiscoveryCriteria> {
    try {
      // 1. Get basic user data
      const user = await UserService.getProfile(clerkId);
      
      if (!user) {
        // Return default criteria if user not found
        return this.getDefaultCriteria();
      }

      // 2. Get financial profile data
      let financialProfile = null;
      try {
        financialProfile = await FinancialProfileService.getByClerkId(clerkId);
      } catch (error) {
        console.log(`[MatchingService] No financial profile found for user ${clerkId}`);
      }

      // 3. Get academic profile data
      let academicProfile = null;
      try {
        academicProfile = await AcademicProfileService.getByClerkId(clerkId);
      } catch (error) {
        console.log(`[MatchingService] No academic profile found for user ${clerkId}`);
      }

      // 4. Extract and parse test scores from academic profile
      const testScores = academicProfile?.testScores as any || {};
      const satTotal = testScores.SAT?.total;
      const actComposite = testScores.ACT?.composite;

      // 5. Map user data to DiscoveryCriteria structure
      const initialCriteria: DiscoveryCriteria = {
        // Search text - default empty
        searchText: '',

        // Academic filters from academic profile
        academics: {
          minGpa: academicProfile?.gpa ? Math.max(0, academicProfile.gpa - 0.3) : undefined,
          maxGpa: academicProfile?.gpa ? Math.min(5.0, academicProfile.gpa + 0.3) : undefined,
          minSatScore: satTotal ? Math.max(400, satTotal - 150) : undefined,
          maxSatScore: satTotal ? Math.min(1600, satTotal + 150) : undefined,
          minActScore: actComposite ? Math.max(1, actComposite - 3) : undefined,
          maxActScore: actComposite ? Math.min(36, actComposite + 3) : undefined,
          majors: academicProfile?.primaryMajor 
            ? [academicProfile.primaryMajor] 
            : user.preferredMajor && user.preferredMajor !== 'Undeclared' 
            ? [user.preferredMajor] 
            : undefined,
          testPolicy: undefined, // User can select this
        },

        // Financial filters from financial profile
        financials: {
          maxTuition: financialProfile?.maxBudget || user.financialProfile?.maxBudget || undefined,
          minGrantAid: undefined, // User can adjust
          maxNetCost: financialProfile?.maxBudget || user.financialProfile?.maxBudget || undefined,
          needsFinancialAid: financialProfile?.needsFinancialAid || false,
        },

        // Location filters from user preferences
        location: {
          countries: undefined, // User can select
          states: undefined, // User can select
          settings: undefined, // User can select
          climateZones: undefined, // User can select
          minSafetyRating: undefined, // User can select
        },

        // Social filters - defaults, user can adjust
        social: {
          minStudentLifeScore: undefined,
          minDiversityScore: undefined,
          maxDiversityScore: undefined,
          minPartyScene: undefined,
          maxPartyScene: undefined,
        },

        // Future/Career filters
        future: {
          needsVisaSupport: false, // User can enable if needed
          minVisaDuration: undefined, // User can specify
          minEmploymentRate: undefined,
          minAlumniNetwork: undefined,
          minInternshipSupport: undefined,
        },

        // User profile for scoring
        userProfile: {
          gpa: academicProfile?.gpa || user.gpa || undefined,
          satScore: satTotal || user.satScore || undefined,
          actScore: actComposite || user.actScore || undefined,
          preferredMajor: academicProfile?.primaryMajor || user.preferredMajor || undefined,
          maxBudget: financialProfile?.maxBudget || user.financialProfile?.maxBudget || undefined,
        },

        // Default weights - user can customize
        weights: {
          academic: 40,
          financial: 30,
          location: 15,
          social: 10,
          future: 5,
        },

        // Default sorting and pagination
        sortBy: 'matchPercentage',
        page: 1,
        limit: 20,
        includeReachSchools: true,
        strictFiltering: false,
      };

      return initialCriteria;
    } catch (error) {
      console.error('[MatchingService] Error getting initial criteria:', error);
      // Return default criteria on error
      return this.getDefaultCriteria();
    }
  }

  /**
   * Get default search criteria when no user profile exists
   */
  private static getDefaultCriteria(): DiscoveryCriteria {
    return {
      searchText: '',
      sortBy: 'matchPercentage',
      page: 1,
      limit: 20,
      includeReachSchools: true,
      strictFiltering: false,
      weights: {
        academic: 40,
        financial: 30,
        location: 15,
        social: 10,
        future: 5,
      },
    };
  }

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
      const scoringResult = this.calculateWeightedScore(uni, profile, academicProfile);
      const matchScore = scoringResult.matchPercentage;
      
      return { 
        university: uni, 
        matchScore, 
        matchPercentage: scoringResult.matchPercentage,
        breakdown,
        scoreBreakdown: scoringResult.scoreBreakdown
      };
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

  /**
   * Calculate weighted match score with detailed breakdown
   * @param university - University to score
   * @param criteria - User's matching criteria
   * @param academicProfile - Optional academic profile for enhanced scoring
   * @returns Object containing matchPercentage and detailed scoreBreakdown
   */
  private static calculateWeightedScore(
    university: University,
    criteria: MatchRequest,
    academicProfile?: any
  ): { matchPercentage: number; scoreBreakdown: UniversityMatchResult['scoreBreakdown'] } {
    // Define default category weights (percentages)
    const DEFAULT_WEIGHTS = {
      academic: 0.40,   // 40% - Academic fit is most important
      financial: 0.30,  // 30% - Financial feasibility
      location: 0.15,   // 15% - Location preferences
      social: 0.10,     // 10% - Social/cultural fit
      future: 0.05,     // 5%  - Career outcomes
    };

    // Allow user-defined importance factors to adjust weights
    // Convert importance factors (1-10) to weight multipliers
    let adjustedWeights = { ...DEFAULT_WEIGHTS };
    
    if (criteria.importanceFactors) {
      const factors = criteria.importanceFactors;
      const totalFactors = factors.academics + factors.cost + factors.social + factors.location + factors.future;
      
      // Normalize user factors to percentages
      adjustedWeights = {
        academic: (factors.academics / totalFactors),
        financial: (factors.cost / totalFactors),
        social: (factors.social / totalFactors),
        location: (factors.location / totalFactors),
        future: (factors.future / totalFactors),
      };
    }

    // Calculate individual category scores (0-100)
    const breakdown = this.calculateBreakdown(university, criteria, academicProfile);
    
    // Calculate weighted contributions
    const contributions = {
      academic: breakdown.academic * adjustedWeights.academic,
      financial: breakdown.financial * adjustedWeights.financial,
      social: breakdown.social * adjustedWeights.social,
      location: breakdown.location * adjustedWeights.location,
      future: breakdown.future * adjustedWeights.future,
    };

    // Calculate total match percentage
    const totalScore = Object.values(contributions).reduce((sum, val) => sum + val, 0);
    const matchPercentage = Math.round(Math.min(100, Math.max(0, totalScore)));

    // Build detailed score breakdown
    const scoreBreakdown = {
      academic: {
        score: Math.round(breakdown.academic),
        weight: Math.round(adjustedWeights.academic * 100),
        contribution: Math.round(contributions.academic * 100) / 100,
      },
      financial: {
        score: Math.round(breakdown.financial),
        weight: Math.round(adjustedWeights.financial * 100),
        contribution: Math.round(contributions.financial * 100) / 100,
      },
      social: {
        score: Math.round(breakdown.social),
        weight: Math.round(adjustedWeights.social * 100),
        contribution: Math.round(contributions.social * 100) / 100,
      },
      location: {
        score: Math.round(breakdown.location),
        weight: Math.round(adjustedWeights.location * 100),
        contribution: Math.round(contributions.location * 100) / 100,
      },
      future: {
        score: Math.round(breakdown.future),
        weight: Math.round(adjustedWeights.future * 100),
        contribution: Math.round(contributions.future * 100) / 100,
      },
      total: matchPercentage,
    };

    return { matchPercentage, scoreBreakdown };
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

  // ========================================
  // UNIVERSITY DISCOVERY ENGINE
  // ========================================

  /**
   * High-performance university search with comprehensive filtering, scoring, and pagination
   * @param criteria - Discovery criteria with filters, sorting, and pagination
   * @param userPlan - User's subscription plan (USER, PREMIUM, ADMIN, or FREE for anonymous)
   * @param isAnonymous - Whether the user is unauthenticated
   * @returns Paginated results with match scores and metadata (restricted to top 3 for free/anonymous users)
   */
  static async searchUniversities(
    criteria: DiscoveryCriteria, 
    userPlan: string = 'FREE', 
    isAnonymous: boolean = false
  ): Promise<DiscoveryResponse> {
    // Build comprehensive Prisma WHERE clause
    const where: any = {};
    let filterCount = 0;

    // --- Text Search ---
    if (criteria.searchText && criteria.searchText.trim()) {
      filterCount++;
      const searchTerms = criteria.searchText.trim().toLowerCase();
      where.OR = [
        { name: { contains: searchTerms, mode: 'insensitive' } },
        { city: { contains: searchTerms, mode: 'insensitive' } },
        { country: { contains: searchTerms, mode: 'insensitive' } },
        { popularMajors: { hasSome: [searchTerms] } },
      ];
    }

    // --- Academic Filters ---
    if (criteria.academics) {
      if (criteria.academics.minGpa !== undefined) {
        filterCount++;
        where.avgGpa = { ...where.avgGpa, gte: criteria.academics.minGpa };
      }
      if (criteria.academics.maxGpa !== undefined) {
        filterCount++;
        where.avgGpa = { ...where.avgGpa, lte: criteria.academics.maxGpa };
      }
      if (criteria.academics.minSatScore !== undefined) {
        filterCount++;
        where.avgSatScore = { ...where.avgSatScore, gte: criteria.academics.minSatScore };
      }
      if (criteria.academics.maxSatScore !== undefined) {
        filterCount++;
        where.avgSatScore = { ...where.avgSatScore, lte: criteria.academics.maxSatScore };
      }
      if (criteria.academics.minActScore !== undefined) {
        filterCount++;
        where.avgActScore = { ...where.avgActScore, gte: criteria.academics.minActScore };
      }
      if (criteria.academics.maxActScore !== undefined) {
        filterCount++;
        where.avgActScore = { ...where.avgActScore, lte: criteria.academics.maxActScore };
      }
      if (criteria.academics.majors && criteria.academics.majors.length > 0) {
        filterCount++;
        where.popularMajors = { hasSome: criteria.academics.majors };
      }
      if (criteria.academics.testPolicy !== undefined) {
        filterCount++;
        where.testPolicy = criteria.academics.testPolicy;
      }
    }

    // --- Financial Filters ---
    if (criteria.financials) {
      if (criteria.financials.minTuition !== undefined) {
        filterCount++;
        where.tuitionOutState = { ...where.tuitionOutState, gte: criteria.financials.minTuition };
      }
      if (criteria.financials.maxTuition !== undefined) {
        filterCount++;
        where.tuitionOutState = { ...where.tuitionOutState, lte: criteria.financials.maxTuition };
      }
      if (criteria.financials.minGrantAid !== undefined) {
        filterCount++;
        where.averageGrantAid = { ...where.averageGrantAid, gte: criteria.financials.minGrantAid };
      }
    }

    // --- Location Filters ---
    if (criteria.location) {
      if (criteria.location.countries && criteria.location.countries.length > 0) {
        filterCount++;
        where.country = { in: criteria.location.countries };
      }
      if (criteria.location.states && criteria.location.states.length > 0) {
        filterCount++;
        where.state = { in: criteria.location.states };
      }
      if (criteria.location.cities && criteria.location.cities.length > 0) {
        filterCount++;
        where.city = { in: criteria.location.cities };
      }
      if (criteria.location.settings && criteria.location.settings.length > 0) {
        filterCount++;
        where.setting = { in: criteria.location.settings };
      }
      if (criteria.location.climateZones && criteria.location.climateZones.length > 0) {
        filterCount++;
        where.climateZone = { in: criteria.location.climateZones };
      }
      if (criteria.location.minSafetyRating !== undefined) {
        filterCount++;
        where.safetyRating = { ...where.safetyRating, gte: criteria.location.minSafetyRating };
      }
    }

    // --- Social Filters ---
    if (criteria.social) {
      if (criteria.social.minStudentLifeScore !== undefined) {
        filterCount++;
        where.studentLifeScore = { ...where.studentLifeScore, gte: criteria.social.minStudentLifeScore };
      }
      if (criteria.social.minDiversityScore !== undefined) {
        filterCount++;
        where.diversityScore = { ...where.diversityScore, gte: criteria.social.minDiversityScore };
      }
      if (criteria.social.maxDiversityScore !== undefined) {
        filterCount++;
        where.diversityScore = { ...where.diversityScore, lte: criteria.social.maxDiversityScore };
      }
      if (criteria.social.minPartyScene !== undefined) {
        filterCount++;
        where.partySceneRating = { ...where.partySceneRating, gte: criteria.social.minPartyScene };
      }
      if (criteria.social.maxPartyScene !== undefined) {
        filterCount++;
        where.partySceneRating = { ...where.partySceneRating, lte: criteria.social.maxPartyScene };
      }
    }

    // --- Career & Future Filters ---
    if (criteria.future) {
      if (criteria.future.minEmploymentRate !== undefined) {
        filterCount++;
        where.employmentRate = { ...where.employmentRate, gte: criteria.future.minEmploymentRate };
      }
      if (criteria.future.minAlumniNetwork !== undefined) {
        filterCount++;
        where.alumniNetwork = { ...where.alumniNetwork, gte: criteria.future.minAlumniNetwork };
      }
      if (criteria.future.minInternshipSupport !== undefined) {
        filterCount++;
        where.internshipSupport = { ...where.internshipSupport, gte: criteria.future.minInternshipSupport };
      }
      if (criteria.future.needsVisaSupport) {
        filterCount++;
        where.visaDurationMonths = { not: null };
      }
      if (criteria.future.minVisaDuration !== undefined) {
        filterCount++;
        where.visaDurationMonths = { ...where.visaDurationMonths, gte: criteria.future.minVisaDuration };
      }
    }

    // --- Count total matching records for pagination ---
    const totalResults = await prisma.university.count({ where });

    // Calculate pagination values
    const limit = criteria.limit || 20;
    const page = criteria.page || 1;
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalResults / limit);

    // --- Build orderBy clause based on sortBy ---
    let orderBy: any = {};
    switch (criteria.sortBy) {
      case 'tuition_asc':
        orderBy = { tuitionOutState: 'asc' };
        break;
      case 'tuition_desc':
        orderBy = { tuitionOutState: 'desc' };
        break;
      case 'ranking_asc':
        orderBy = { ranking: 'asc' };
        break;
      case 'ranking_desc':
        orderBy = { ranking: 'desc' };
        break;
      case 'acceptanceRate_asc':
        orderBy = { acceptanceRate: 'asc' };
        break;
      case 'acceptanceRate_desc':
        orderBy = { acceptanceRate: 'desc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      case 'matchPercentage':
      default:
        // Will sort by match score after scoring
        orderBy = { name: 'asc' }; // Temporary sort
        break;
    }

    // --- Execute optimized database query ---
    const universities = await prisma.university.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    // --- Calculate match scores for each university ---
    let results: UniversityMatchResult[] = universities.map((uni) => {
      // If user profile provided, calculate personalized score
      if (criteria.userProfile) {
        const mockProfile: MatchRequest = {
          gpa: criteria.userProfile.gpa || 3.0,
          satScore: criteria.userProfile.satScore,
          actScore: criteria.userProfile.actScore,
          preferredMajor: criteria.userProfile.preferredMajor || 'Undeclared',
          maxBudget: criteria.userProfile.maxBudget || 50000,
          needsVisaSupport: criteria.future?.needsVisaSupport || false,
          strictMatch: criteria.strictFiltering || false,
          importanceFactors: {
            academics: 5,
            social: 5,
            cost: 5,
            location: 5,
            future: 5,
          },
        };

        const scoringResult = this.calculateWeightedScore(uni, mockProfile, null);
        const breakdown = this.calculateBreakdown(uni, mockProfile, null);

        return {
          university: uni,
          matchScore: scoringResult.matchPercentage,
          matchPercentage: scoringResult.matchPercentage,
          breakdown,
          scoreBreakdown: scoringResult.scoreBreakdown,
        };
      } else {
        // No user profile - return neutral scores
        const neutralBreakdown = {
          academic: 75,
          financial: 75,
          social: 75,
          location: 75,
          future: 75,
        };

        return {
          university: uni,
          matchScore: 75,
          matchPercentage: 75,
          breakdown: neutralBreakdown,
          scoreBreakdown: {
            academic: { score: 75, weight: 40, contribution: 30 },
            financial: { score: 75, weight: 30, contribution: 22.5 },
            social: { score: 75, weight: 10, contribution: 7.5 },
            location: { score: 75, weight: 15, contribution: 11.25 },
            future: { score: 75, weight: 5, contribution: 3.75 },
            total: 75,
          },
        };
      }
    });

    // --- Sort by match percentage if requested ---
    if (criteria.sortBy === 'matchPercentage') {
      results = results.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    // --- Tiered Access Restriction ---
    // Free and anonymous users only see top 3 results (already sorted by match percentage)
    let restrictedResults = results;
    let isRestricted = false;
    
    // Apply restriction if user is unauthenticated or on FREE plan
    if (userPlan === 'FREE' || isAnonymous) {
      restrictedResults = results.slice(0, 3);
      isRestricted = results.length > 3;
      
      if (isRestricted) {
        console.log(`[SearchRestriction] ${isAnonymous ? 'Anonymous' : 'FREE'} user - limiting results from ${results.length} to 3`);
      }
    }

    // --- Build response with pagination metadata ---
    return {
      results: restrictedResults,
      pagination: {
        currentPage: page,
        totalPages: isRestricted ? 1 : totalPages, // Only 1 page for restricted results
        totalResults: isRestricted ? 3 : totalResults, // Show restricted count
        limit: isRestricted ? 3 : limit,
        hasNextPage: isRestricted ? false : page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        applied: filterCount,
      },
      // Add restriction metadata
      restricted: isRestricted ? {
        reason: isAnonymous ? 'anonymous_user' : 'free_tier',
        message: 'Upgrade to Premium to see all matching universities',
        actualTotal: totalResults,
        showing: 3,
      } : undefined,
    };
  }
}
