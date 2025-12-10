import { z } from 'zod';
import { CampusSetting, TestPolicy } from '@prisma/client';

export const matchRequestSchema = {
  body: z.object({
    // --- Academic Profile ---
    gpa: z.number().min(0).max(5.0),
    satScore: z.number().min(400).max(1600).optional(),
    actScore: z.number().min(1).max(36).optional(),
    englishProficiency: z.object({
      toefl: z.number().optional(),
      ielts: z.number().optional(),
    }).optional(),

    // --- Constraints ---
    maxBudget: z.number().positive(),
    preferredMajor: z.string().min(2),
    preferredCountry: z.string().optional(),
    
    // --- Lifestyle Preferences (New) ---
    preferredSetting: z.nativeEnum(CampusSetting).optional(),
    preferredClimate: z.enum(['Temperate', 'Tropical', 'Arid', 'Cold', 'Mediterranean', 'Maritime', 'Humid Subtropical', 'Continental']).optional(),
    preferredDiversity: z.number().min(0).max(1).optional(), // Target diversity score 0-1
    minSafetyRating: z.number().min(0).max(5).optional(), // Minimum acceptable safety rating
    
    // --- Future Goals (New) ---
    needsVisaSupport: z.boolean().default(false),
    minVisaMonths: z.number().optional(), // E.g., wants at least 24 months post-grad visa

    // --- Matching Behavior ---
    strictMatch: z.boolean().default(false), // If true, hard-filter dealbreakers (budget, visa)

    // --- Weights ---
    importanceFactors: z.object({
      academics: z.number().min(1).max(10),
      social: z.number().min(1).max(10),
      cost: z.number().min(1).max(10),
      location: z.number().min(1).max(10),
      future: z.number().min(1).max(10),
    }).default({ academics: 5, social: 5, cost: 5, location: 5, future: 5 }),
  }),
};

export type MatchRequest = z.infer<typeof matchRequestSchema['body']>;

// Scoring reason schema for transparency
const scoringReasonSchema = z.object({
  code: z.string(),
  message: z.string(),
  impact: z.enum(['positive', 'negative', 'neutral']),
  value: z.union([z.number(), z.string()]).optional(),
});

// Category score schema with reasons
const categoryScoreSchema = z.object({
  score: z.number(),
  weight: z.number(),
  contribution: z.number(),
  reasons: z.array(scoringReasonSchema),
});

// Response schema for university match results
export const universityMatchResultSchema = z.object({
  university: z.any(), // University object from Prisma
  matchScore: z.number(),
  matchPercentage: z.number().min(0).max(100),
  breakdown: z.object({
    academic: z.object({
      score: z.number(),
      reasons: z.array(scoringReasonSchema),
    }),
    financial: z.object({
      score: z.number(),
      reasons: z.array(scoringReasonSchema),
    }),
    social: z.object({
      score: z.number(),
      reasons: z.array(scoringReasonSchema),
    }),
    location: z.object({
      score: z.number(),
      reasons: z.array(scoringReasonSchema),
    }),
    future: z.object({
      score: z.number(),
      reasons: z.array(scoringReasonSchema),
    }),
  }),
  scoreBreakdown: z.object({
    academic: categoryScoreSchema,
    financial: categoryScoreSchema,
    social: categoryScoreSchema,
    location: categoryScoreSchema,
    future: categoryScoreSchema,
    total: z.number(),
  }),
});

export type UniversityMatchResult = z.infer<typeof universityMatchResultSchema>;

// ========================================
// University Discovery Engine Schema
// ========================================

// Discovery criteria for high-performance search endpoint
export const discoveryCriteriaSchema = {
  body: z.object({
    // --- Search & Text Query ---
    searchText: z.string().optional(), // Full-text search across university names, majors, locations
    
    // --- Academic Filters ---
    academics: z.object({
      minGpa: z.number().min(0).max(5.0).optional(),
      maxGpa: z.number().min(0).max(5.0).optional(),
      minSatScore: z.number().min(400).max(1600).optional(),
      maxSatScore: z.number().min(400).max(1600).optional(),
      minActScore: z.number().min(1).max(36).optional(),
      maxActScore: z.number().min(1).max(36).optional(),
      majors: z.array(z.string()).optional(), // Filter by specific majors
      testPolicy: z.nativeEnum(TestPolicy).optional(),
    }).optional(),

    // --- Financial Filters ---
    financials: z.object({
      minTuition: z.number().min(0).optional(),
      maxTuition: z.number().max(200000).optional(),
      minGrantAid: z.number().min(0).optional(),
      maxNetCost: z.number().min(0).optional(), // Tuition - average aid
      needsFinancialAid: z.boolean().optional(),
    }).optional(),

    // --- Location Filters ---
    location: z.object({
      countries: z.array(z.string()).optional(), // Multi-country filter
      states: z.array(z.string()).optional(), // US states or regions
      cities: z.array(z.string()).optional(),
      settings: z.array(z.nativeEnum(CampusSetting)).optional(), // Urban, Suburban, Rural
      climateZones: z.array(z.string()).optional(),
      minSafetyRating: z.number().min(0).max(5).optional(),
    }).optional(),

    // --- Social & Campus Life ---
    social: z.object({
      minStudentLifeScore: z.number().min(0).max(5).optional(),
      minDiversityScore: z.number().min(0).max(1).optional(),
      maxDiversityScore: z.number().min(0).max(1).optional(),
      minPartyScene: z.number().min(0).max(5).optional(),
      maxPartyScene: z.number().min(0).max(5).optional(),
    }).optional(),

    // --- Career & Future Outcomes ---
    future: z.object({
      minEmploymentRate: z.number().min(0).max(1).optional(),
      minAlumniNetwork: z.number().min(0).max(5).optional(),
      minInternshipSupport: z.number().min(0).max(5).optional(),
      needsVisaSupport: z.boolean().optional(),
      minVisaDuration: z.number().min(0).optional(), // Months
    }).optional(),

    // --- User Profile (for scoring) ---
    userProfile: z.object({
      gpa: z.number().min(0).max(5.0).optional(),
      satScore: z.number().min(400).max(1600).optional(),
      actScore: z.number().min(1).max(36).optional(),
      preferredMajor: z.string().optional(),
      maxBudget: z.number().positive().optional(),
    }).optional(),

    // --- Importance Weights ---
    weights: z.object({
      academic: z.number().min(0).max(100).default(40),
      financial: z.number().min(0).max(100).default(30),
      location: z.number().min(0).max(100).default(15),
      social: z.number().min(0).max(100).default(10),
      future: z.number().min(0).max(100).default(5),
    }).optional(),

    // --- Sorting ---
    sortBy: z.enum([
      'matchPercentage', // Best match first (default)
      'tuition_asc', 
      'tuition_desc',
      'ranking_asc',
      'ranking_desc',
      'acceptanceRate_asc',
      'acceptanceRate_desc',
      'name_asc',
      'name_desc',
    ]).default('matchPercentage'),

    // --- Pagination ---
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(50).default(20),

    // --- Advanced Options ---
    includeReachSchools: z.boolean().default(true), // Include universities above user's stats
    strictFiltering: z.boolean().default(false), // Hard-filter vs soft-scoring
  }),
};

export type DiscoveryCriteria = z.infer<typeof discoveryCriteriaSchema['body']>;

// Response schema for discovery endpoint
export const discoveryResponseSchema = z.object({
  results: z.array(universityMatchResultSchema),
  pagination: z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    totalResults: z.number(),
    limit: z.number(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
  filters: z.object({
    applied: z.number(), // Count of active filters
    available: z.object({
      countries: z.array(z.string()),
      majors: z.array(z.string()),
      settings: z.array(z.string()),
    }).optional(),
  }),
  // Tiered access restriction metadata
  restricted: z.object({
    reason: z.enum(['anonymous_user', 'free_tier']),
    message: z.string(),
    actualTotal: z.number(),
    showing: z.number(),
  }).optional(),
});

export type DiscoveryResponse = z.infer<typeof discoveryResponseSchema>;
