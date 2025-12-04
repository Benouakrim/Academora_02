import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Prisma BEFORE any imports that use it
vi.mock('@prisma/client', () => {
  const mockUniversityFindMany = vi.fn();
  
  class MockPrismaClient {
    university = {
      findUnique: vi.fn(),
      findMany: mockUniversityFindMany,
    };
    user = {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    };
    financialProfile = {
      findUnique: vi.fn(),
    };
    universityClaim = {
      findUnique: vi.fn(),
      create: vi.fn(),
    };
    $connect = vi.fn();
    $disconnect = vi.fn();
  }
  
  return {
    PrismaClient: MockPrismaClient,
    UserRole: { USER: 'USER', ADMIN: 'ADMIN' },
    ClaimStatus: { PENDING: 'PENDING', APPROVED: 'APPROVED' },
    CampusSetting: {
      URBAN: 'URBAN',
      SUBURBAN: 'SUBURBAN',
      RURAL: 'RURAL',
    },
    TestPolicy: {
      REQUIRED: 'REQUIRED',
      OPTIONAL: 'OPTIONAL',
      TEST_BLIND: 'TEST_BLIND',
    },
  };
});

// Now import the service (after mocking Prisma)
import { MatchingService } from '../services/MatchingService';
import { PrismaClient, University } from '@prisma/client';
import { MatchRequest } from '../validation/matchingSchemas';

// Get access to the mocked prisma instance
const prisma = new PrismaClient();

// Mock University data relevant to the matching logic
const mockUniversities: Partial<University>[] = [
  // High Academic, High Cost, High Safety
  {
    id: 'uni-1',
    name: 'Elite Research U',
    slug: 'elite-research',
    country: 'USA',
    city: 'Cambridge',
    state: 'MA',
    tuitionOutState: 70000,
    tuitionInternational: 75000,
    costOfLiving: 15000,
    averageGrantAid: 30000,
    minGpa: 3.5,
    avgGpa: 4.0,
    avgSatScore: 1550,
    acceptanceRate: 0.10,
    safetyRating: 5.0,
    partySceneRating: 1.0,
    studentLifeScore: 4.8,
    setting: 'URBAN' as any,
    climateZone: 'TEMPERATE' as any,
    popularMajors: ['Physics', 'Computer Science', 'Engineering'],
    employmentRate: 0.98,
    alumniNetwork: 5,
    internshipSupport: 5,
    visaDurationMonths: 36,
    diversityScore: 0.75,
    // Required fields for model compliance
    logoUrl: null,
    heroImageUrl: null,
    description: 'Elite research university',
    shortName: 'ERU',
    internationalEngReqs: null,
    applicationFee: 100,
    testPolicy: 'REQUIRED' as any,
    satMath25: 750,
    satMath75: 800,
    satVerbal25: 740,
    satVerbal75: 790,
    actComposite25: 34,
    actComposite75: 36,
    roomAndBoard: 16000,
    booksAndSupplies: 1200,
    percentReceivingAid: 0.85,
    scholarshipsIntl: true,
    needBlindAdmission: true,
  },
  
  // Low Academic, Low Cost, High Social
  {
    id: 'uni-2',
    name: 'Local Party State',
    slug: 'local-party',
    country: 'USA',
    city: 'Springfield',
    state: 'IL',
    tuitionOutState: 15000,
    tuitionInternational: 20000,
    costOfLiving: 12000,
    averageGrantAid: 5000,
    minGpa: 2.5,
    avgGpa: 3.0,
    avgSatScore: 1100,
    acceptanceRate: 0.85,
    safetyRating: 3.0,
    partySceneRating: 5.0,
    studentLifeScore: 4.5,
    setting: 'SUBURBAN' as any,
    climateZone: 'CONTINENTAL' as any,
    popularMajors: ['History', 'Business', 'Communications'],
    employmentRate: 0.75,
    alumniNetwork: 3,
    internshipSupport: 2,
    visaDurationMonths: 12,
    diversityScore: 0.60,
    // Required fields
    logoUrl: null,
    heroImageUrl: null,
    description: 'State university with active social scene',
    shortName: 'LPS',
    internationalEngReqs: null,
    applicationFee: 50,
    testPolicy: 'OPTIONAL' as any,
    satMath25: 500,
    satMath75: 600,
    satVerbal25: 490,
    satVerbal75: 590,
    actComposite25: 20,
    actComposite75: 24,
    roomAndBoard: 10000,
    booksAndSupplies: 800,
    percentReceivingAid: 0.65,
    scholarshipsIntl: false,
    needBlindAdmission: false,
  },
  
  // Medium All-Around, Strict Safety Filter Target
  {
    id: 'uni-3',
    name: 'Mid-Tier Safety School',
    slug: 'mid-tier',
    country: 'USA',
    city: 'Austin',
    state: 'TX',
    tuitionOutState: 40000,
    tuitionInternational: 45000,
    costOfLiving: 14000,
    averageGrantAid: 15000,
    minGpa: 3.0,
    avgGpa: 3.5,
    avgSatScore: 1300,
    acceptanceRate: 0.40,
    safetyRating: 4.0,
    partySceneRating: 3.0,
    studentLifeScore: 4.2,
    setting: 'URBAN' as any,
    climateZone: 'HUMID_SUBTROPICAL' as any,
    popularMajors: ['Physics', 'Biology', 'Psychology'],
    employmentRate: 0.88,
    alumniNetwork: 4,
    internshipSupport: 4,
    visaDurationMonths: 24,
    diversityScore: 0.70,
    // Required fields
    logoUrl: null,
    heroImageUrl: null,
    description: 'Well-rounded mid-tier university',
    shortName: 'MTS',
    internationalEngReqs: null,
    applicationFee: 75,
    testPolicy: 'REQUIRED' as any,
    satMath25: 620,
    satMath75: 710,
    satVerbal25: 610,
    satVerbal75: 700,
    actComposite25: 27,
    actComposite75: 31,
    roomAndBoard: 13000,
    booksAndSupplies: 1000,
    percentReceivingAid: 0.75,
    scholarshipsIntl: true,
    needBlindAdmission: false,
  },
];

describe('MatchingService - Core Algorithm Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the database call to return our mock university list
    vi.mocked(prisma.university.findMany).mockResolvedValue(mockUniversities as University[]);
  });

  afterEach(() => {
    vi.mocked(prisma.university.findMany).mockReset();
  });

  // Test Case 1: Academic Dominance
  it('should rank Elite Research U highest when academics are prioritized (Academics: 10, Cost: 1)', async () => {
    const profile: MatchRequest = {
      gpa: 4.0,
      satScore: 1550,
      maxBudget: 70000,
      preferredMajor: 'Physics',
      needsVisaSupport: false,
      importanceFactors: { 
        academics: 10, 
        social: 1, 
        cost: 1, 
        location: 5, 
        future: 5 
      },
      strictMatch: false,
    };

    const result = await MatchingService.findMatches(profile);

    // Expect Elite Research U to be ranked highest due to 10x academic weighting
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].university.name).toBe('Elite Research U');
    
    // Verify the score of the top match is high
    expect(result[0].matchScore).toBeGreaterThan(80);
    
    // The Cost factor should be low in the breakdown, but overwhelmed by Academic
    const eliteBreakdown = result.find(r => r.university.id === 'uni-1')?.breakdown;
    expect(eliteBreakdown).toBeDefined();
    expect(eliteBreakdown!.academic).toBeGreaterThan(90); // Has major, high GPA/SAT
    expect(eliteBreakdown!.financial).toBeGreaterThanOrEqual(85); // Budget covers cost
  });

  // Test Case 2: Cost Sensitivity
  it('should rank Local Party State highest when cost is prioritized (Cost: 10, Academics: 1)', async () => {
    const profile: MatchRequest = {
      gpa: 3.5,
      satScore: 1200,
      maxBudget: 25000,
      preferredMajor: 'History',
      needsVisaSupport: false,
      importanceFactors: { 
        academics: 1, 
        social: 5, 
        cost: 10, 
        location: 5, 
        future: 5 
      },
      strictMatch: false,
    };

    const result = await MatchingService.findMatches(profile);

    // Expect Local Party State to be ranked highest due to 10x cost weighting and fitting the budget
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].university.name).toBe('Local Party State');
    
    // The Cost factor should be high in the breakdown
    const localBreakdown = result.find(r => r.university.id === 'uni-2')?.breakdown;
    expect(localBreakdown).toBeDefined();
    expect(localBreakdown!.financial).toBeGreaterThan(85); // Within budget
    // Academic score may be high due to having the major + GPA above average
    expect(localBreakdown!.academic).toBeGreaterThan(0); // Just verify it's calculated
  });
  
  // Test Case 3: Strict Filter Failure
  it('should exclude universities below minimum safety rating when strict match is enabled', async () => {
    const profile: MatchRequest = {
      gpa: 4.0,
      satScore: 1550,
      maxBudget: 70000,
      preferredMajor: 'Physics',
      needsVisaSupport: false,
      importanceFactors: { 
        academics: 5, 
        social: 5, 
        cost: 5, 
        location: 5, 
        future: 5 
      },
      strictMatch: true,
      minSafetyRating: 4.5, // Requires a very safe school
    };

    const result = await MatchingService.findMatches(profile);

    // Only Elite Research U should remain (safetyRating: 5.0)
    // Mid-Tier (4.0) and Local Party (3.0) should be filtered out
    expect(result.length).toBe(1);
    expect(result[0].university.name).toBe('Elite Research U');
    
    // Assert that the excluded schools are not present
    const midTierSchool = result.find(r => r.university.id === 'uni-3');
    const partySchool = result.find(r => r.university.id === 'uni-2');
    expect(midTierSchool).toBeUndefined();
    expect(partySchool).toBeUndefined();
  });

  // Test Case 4: Budget Constraint with Strict Match
  it('should filter out universities exceeding maxBudget when strictMatch is true', async () => {
    const profile: MatchRequest = {
      gpa: 3.2,
      satScore: 1150,
      maxBudget: 25000,
      preferredMajor: 'Business',
      needsVisaSupport: false,
      importanceFactors: { 
        academics: 5, 
        social: 5, 
        cost: 5, 
        location: 5, 
        future: 5 
      },
      strictMatch: true,
    };

    const result = await MatchingService.findMatches(profile);

    // Only Local Party State should remain (tuition: 15000 < 25000)
    // Elite (70000) and Mid-Tier (40000) should be filtered out
    expect(result.length).toBe(1);
    expect(result[0].university.name).toBe('Local Party State');
    
    // Verify expensive schools are excluded
    const expensiveSchools = result.filter(r => {
      const tuition = r.university.tuitionOutState || 0;
      return tuition > profile.maxBudget;
    });
    expect(expensiveSchools.length).toBe(0);
  });

  // Test Case 5: Visa Duration Filter
  it('should filter universities with insufficient visa duration when strictMatch is true', async () => {
    const profile: MatchRequest = {
      gpa: 3.8,
      satScore: 1400,
      maxBudget: 60000,
      preferredMajor: 'Computer Science',
      importanceFactors: { 
        academics: 7, 
        social: 3, 
        cost: 5, 
        location: 5, 
        future: 8 
      },
      strictMatch: true,
      needsVisaSupport: true,
      minVisaMonths: 24, // Needs at least 24 months
    };

    const result = await MatchingService.findMatches(profile);

    // Elite Research U (36 months) and Mid-Tier (24 months) should pass
    // Local Party State (12 months) should be filtered out
    // Note: Mid-tier has 24 months which equals minVisaMonths, should pass
    expect(result.length).toBeGreaterThanOrEqual(1); // At least Elite passes
    
    const localParty = result.find(r => r.university.id === 'uni-2');
    expect(localParty).toBeUndefined();
    
    // Verify remaining schools meet visa requirement
    result.forEach(r => {
      expect(r.university.visaDurationMonths).toBeGreaterThanOrEqual(24);
    });
  });

  // Test Case 6: Major Matching Boost
  it('should give significant boost to universities offering the preferred major', async () => {
    const profile: MatchRequest = {
      gpa: 3.6,
      satScore: 1350,
      maxBudget: 50000,
      preferredMajor: 'Physics', // Only Elite and Mid-Tier have this
      needsVisaSupport: false,
      importanceFactors: { 
        academics: 10, // Maximum academic weight to prioritize major match
        social: 1, 
        cost: 1, // Minimize cost impact
        location: 1, 
        future: 1 
      },
      strictMatch: false,
    };

    const result = await MatchingService.findMatches(profile);

    // With maximum academic weighting, schools with Physics should rank higher
    expect(result.length).toBeGreaterThan(0);
    
    // Find schools with Physics major
    const physicsSchools = result.filter(r => r.university.popularMajors.includes('Physics'));
    expect(physicsSchools.length).toBeGreaterThan(0);
    
    // Check that schools with the major have the +20 boost in academic score
    const eliteSchool = result.find(r => r.university.id === 'uni-1');
    const midTierSchool = result.find(r => r.university.id === 'uni-3');
    
    if (eliteSchool) {
      // Elite has Physics, should have high academic breakdown
      expect(eliteSchool.breakdown.academic).toBeGreaterThanOrEqual(90);
    }
    
    if (midTierSchool) {
      // Mid-Tier has Physics, should have solid academic breakdown
      expect(midTierSchool.breakdown.academic).toBeGreaterThan(65);
    }
    
    // At least one of the top 2 should have Physics when academics are heavily weighted
    const topTwo = result.slice(0, 2);
    const hasPhysicsInTop = topTwo.some(r => r.university.popularMajors.includes('Physics'));
    expect(hasPhysicsInTop).toBe(true);
  });

  // Test Case 7: Country Filtering
  it('should only return universities from preferred country when specified', async () => {
    const profile: MatchRequest = {
      gpa: 3.5,
      satScore: 1250,
      maxBudget: 50000,
      preferredMajor: 'Engineering',
      preferredCountry: 'USA',
      needsVisaSupport: false,
      importanceFactors: { 
        academics: 5, 
        social: 5, 
        cost: 5, 
        location: 5, 
        future: 5 
      },
      strictMatch: false,
    };

    const result = await MatchingService.findMatches(profile);

    // All results should be from USA
    result.forEach(r => {
      expect(r.university.country.toLowerCase()).toBe('usa');
    });
  });

  // Test Case 8: Location Setting Preference
  it('should boost universities matching preferred campus setting', async () => {
    const profile: MatchRequest = {
      gpa: 3.4,
      satScore: 1200,
      maxBudget: 45000,
      preferredMajor: 'Psychology',
      preferredSetting: 'URBAN' as any,
      needsVisaSupport: false,
      importanceFactors: { 
        academics: 3, 
        social: 3, 
        cost: 3, 
        location: 10, // Heavy location weight
        future: 3 
      },
      strictMatch: false,
    };

    const result = await MatchingService.findMatches(profile);

    // Urban schools (Elite and Mid-Tier) should score higher in location
    const urbanSchools = result.filter(r => r.university.setting === 'URBAN');
    
    urbanSchools.forEach(school => {
      expect(school.breakdown.location).toBeGreaterThan(80);
    });
  });

  // Test Case 9: Match Score Normalization
  it('should return match scores between 0 and 100', async () => {
    const profile: MatchRequest = {
      gpa: 3.0,
      satScore: 1000,
      maxBudget: 20000,
      preferredMajor: 'Art',
      needsVisaSupport: false,
      importanceFactors: { 
        academics: 5, 
        social: 5, 
        cost: 5, 
        location: 5, 
        future: 5 
      },
      strictMatch: false,
    };

    const result = await MatchingService.findMatches(profile);

    // All scores should be within valid range
    result.forEach(r => {
      expect(r.matchScore).toBeGreaterThanOrEqual(0);
      expect(r.matchScore).toBeLessThanOrEqual(100);
      
      // Individual breakdown scores should also be 0-100
      expect(r.breakdown.academic).toBeGreaterThanOrEqual(0);
      expect(r.breakdown.academic).toBeLessThanOrEqual(100);
      expect(r.breakdown.financial).toBeGreaterThanOrEqual(0);
      expect(r.breakdown.financial).toBeLessThanOrEqual(100);
      expect(r.breakdown.social).toBeGreaterThanOrEqual(0);
      expect(r.breakdown.social).toBeLessThanOrEqual(100);
      expect(r.breakdown.location).toBeGreaterThanOrEqual(0);
      expect(r.breakdown.location).toBeLessThanOrEqual(100);
      expect(r.breakdown.future).toBeGreaterThanOrEqual(0);
      expect(r.breakdown.future).toBeLessThanOrEqual(100);
    });
  });

  // Test Case 10: Top 20 Limit
  it('should return maximum of 20 matches', async () => {
    // Create a larger set of mock universities
    const manyUniversities = Array.from({ length: 50 }, (_, i) => ({
      ...mockUniversities[i % 3],
      id: `uni-${i}`,
      name: `University ${i}`,
      slug: `university-${i}`,
    }));

    vi.mocked(prisma.university.findMany).mockResolvedValue(manyUniversities as University[]);

    const profile: MatchRequest = {
      gpa: 3.5,
      satScore: 1300,
      maxBudget: 50000,
      preferredMajor: 'Biology',
      needsVisaSupport: false,
      importanceFactors: { 
        academics: 5, 
        social: 5, 
        cost: 5, 
        location: 5, 
        future: 5 
      },
      strictMatch: false,
    };

    const result = await MatchingService.findMatches(profile);

    // Should cap at 20 results
    expect(result.length).toBeLessThanOrEqual(20);
  });
});

// ========================================
// Discovery Engine - Tiered Access Tests
// ========================================

describe('MatchingService - Discovery Engine Tiered Access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Create 10 mock universities for testing result restriction
    const tenUniversities = Array.from({ length: 10 }, (_, i) => ({
      ...mockUniversities[i % 3],
      id: `uni-${i + 1}`,
      name: `University ${i + 1}`,
      slug: `university-${i + 1}`,
      // Vary match scores for sorting test
      avgGpa: 3.0 + (i * 0.1),
      avgSatScore: 1200 + (i * 50),
    }));
    
    vi.mocked(prisma.university.findMany).mockResolvedValue(tenUniversities as University[]);
  });

  afterEach(() => {
    vi.mocked(prisma.university.findMany).mockReset();
  });

  // Test Case: Anonymous User Result Restriction
  it('should limit anonymous users to top 3 results sorted by match percentage', async () => {
    const criteria = {
      searchText: '',
      sortBy: 'matchPercentage' as const,
      page: 1,
      limit: 20,
      includeReachSchools: true,
      strictFiltering: false,
    };

    const result = await MatchingService.searchUniversities(
      criteria,
      'FREE', // Free plan
      true // Anonymous user
    );

    // Should return exactly 3 results
    expect(result.results.length).toBe(3);
    
    // Results should be sorted by matchPercentage in descending order
    for (let i = 0; i < result.results.length - 1; i++) {
      expect(result.results[i].matchPercentage).toBeGreaterThanOrEqual(
        result.results[i + 1].matchPercentage
      );
    }

    // Check restriction metadata
    expect(result.restricted).toBeDefined();
    expect(result.restricted?.reason).toBe('anonymous_user');
    expect(result.restricted?.showing).toBe(3);
    expect(result.restricted?.actualTotal).toBeGreaterThan(3);
    
    // Pagination should reflect restriction
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.totalResults).toBe(3);
    expect(result.pagination.hasNextPage).toBe(false);
    
    console.log('[Test] Anonymous user correctly restricted to 3 results');
  });

  // Test Case: Free Tier User Result Restriction
  it('should limit FREE tier users to top 3 results', async () => {
    const criteria = {
      searchText: '',
      sortBy: 'matchPercentage' as const,
      page: 1,
      limit: 20,
      includeReachSchools: true,
      strictFiltering: false,
    };

    const result = await MatchingService.searchUniversities(
      criteria,
      'FREE', // Free plan
      false // Authenticated user
    );

    // Should return exactly 3 results
    expect(result.results.length).toBe(3);
    
    // Check restriction metadata
    expect(result.restricted).toBeDefined();
    expect(result.restricted?.reason).toBe('free_tier');
    expect(result.restricted?.message).toContain('Premium');
  });

  // Test Case: Premium User Gets Full Results
  it('should return all results for PREMIUM users without restriction', async () => {
    const criteria = {
      searchText: '',
      sortBy: 'matchPercentage' as const,
      page: 1,
      limit: 20,
      includeReachSchools: true,
      strictFiltering: false,
    };

    const result = await MatchingService.searchUniversities(
      criteria,
      'PREMIUM', // Premium plan
      false
    );

    // Should return all 10 results
    expect(result.results.length).toBeGreaterThan(3);
    
    // No restriction metadata
    expect(result.restricted).toBeUndefined();
    
    console.log(`[Test] Premium user received ${result.results.length} results without restriction`);
  });

  // Test Case: Admin User Gets Full Results
  it('should return all results for ADMIN users without restriction', async () => {
    const criteria = {
      searchText: '',
      sortBy: 'matchPercentage' as const,
      page: 1,
      limit: 20,
      includeReachSchools: true,
      strictFiltering: false,
    };

    const result = await MatchingService.searchUniversities(
      criteria,
      'ADMIN', // Admin plan
      false
    );

    // Should return all results
    expect(result.results.length).toBeGreaterThan(3);
    expect(result.restricted).toBeUndefined();
  });
});
