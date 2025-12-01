import { PrismaClient, University } from '@prisma/client';

const prisma = new PrismaClient();

export interface MatchProfile {
  gpa: number;
  maxBudget: number;
  interests: string[];
  preferredCountry?: string;
}

export interface MatchBreakdown {
  gpaScore: number;
  budgetScore: number;
  interestScore: number;
}

export interface UniversityMatchResult {
  university: University;
  matchScore: number;
  breakdown: MatchBreakdown;
}

export class MatchingService {
  static async findMatches(profile: MatchProfile): Promise<UniversityMatchResult[]> {
    const { preferredCountry } = profile;

    const where: any = {};
    if (preferredCountry) {
      where.country = preferredCountry;
    }

    // Fetch universities (limit for performance)
    const universities = await prisma.university.findMany({
      where,
      take: 1000,
      orderBy: { name: 'asc' },
    });

    const results: UniversityMatchResult[] = universities.map((uni) => {
      const gpaScore = calculateGpaScore(profile.gpa, uni.minGpa);
      const budgetScore = calculateBudgetScore(profile.maxBudget, uni.tuitionOutState);
      const interestScore = calculateInterestScore(profile.interests, uni.popularMajors || []);
      const matchScore = gpaScore + budgetScore + interestScore;

      return {
        university: uni,
        matchScore,
        breakdown: { gpaScore, budgetScore, interestScore },
      };
    });

    // Sort descending by score and return top 20
    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 20);
  }
}

function calculateGpaScore(userGpa: number, minGpa: number | null | undefined): number {
  if (minGpa == null) return 15; // Neutral when missing
  return userGpa >= minGpa ? 30 : 0;
}

function calculateBudgetScore(maxBudget: number, tuitionOutState: number | null | undefined): number {
  if (tuitionOutState == null) return 0; // Treat missing tuition as unknown (no points)
  return tuitionOutState <= maxBudget ? 30 : 0;
}

function calculateInterestScore(interests: string[], majors: string[]): number {
  if (!interests.length) return 0; // Schema enforces at least 1, defensive
  if (!majors.length) return 0;

  const interestSet = interests.map((i) => i.toLowerCase());
  const majorsSet = majors.map((m) => m.toLowerCase());

  const matches = interestSet.filter((i) => majorsSet.includes(i)).length;
  const ratio = matches / interests.length;
  return ratio * 40;
}
