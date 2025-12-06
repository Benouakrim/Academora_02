/**
 * Article Performance Forecaster - Industry Benchmarks
 * Contains hardcoded benchmark data for traffic and revenue predictions
 */

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Benchmark data for a single category
 */
export interface CategoryBenchmark {
  /** Category name */
  category: string;
  /** Revenue Per Mille (per 1000 pageviews) in USD */
  rpm: number;
  /** Average monthly search volume for this category */
  avgSearchVolume: number;
  /** Average click-through rate from search results (0-1) */
  avgCTR: number;
  /** Seasonal multiplier (1.0 = baseline) */
  seasonalMultiplier: number;
  /** Competition level (1-10, higher = more competitive) */
  competitionLevel: number;
}

/**
 * Industry benchmarks map interface
 */
export interface IndustryBenchmarks {
  /** Map of category name to benchmark data */
  categories: Record<string, CategoryBenchmark>;
  /** Global default values */
  defaults: CategoryBenchmark;
  /** RPM adjustments by content quality tier */
  qualityMultipliers: {
    low: number;
    medium: number;
    high: number;
    premium: number;
  };
}

// ============================================================================
// Benchmark Data
// ============================================================================

/**
 * Legacy benchmark array (for backward compatibility)
 */
export interface Benchmark {
  category: string;
  rpm: number;
  avgSearchVolume: number;
}

export const BENCHMARKS: Benchmark[] = [
  { category: 'Admissions', rpm: 15.50, avgSearchVolume: 2500 },
  { category: 'Financial Aid', rpm: 22.00, avgSearchVolume: 3200 },
  { category: 'Campus Life', rpm: 8.50, avgSearchVolume: 1800 },
  { category: 'Programs', rpm: 12.00, avgSearchVolume: 2100 },
  { category: 'Scholarships', rpm: 25.00, avgSearchVolume: 4500 },
  { category: 'Test Prep', rpm: 28.00, avgSearchVolume: 5200 },
  { category: 'Career Services', rpm: 18.50, avgSearchVolume: 2800 },
  { category: 'Student Resources', rpm: 10.00, avgSearchVolume: 1500 },
  { category: 'Graduate Programs', rpm: 20.00, avgSearchVolume: 2000 },
  { category: 'International Students', rpm: 24.00, avgSearchVolume: 3000 },
  { category: 'Housing', rpm: 14.00, avgSearchVolume: 2200 },
  { category: 'Athletics', rpm: 6.50, avgSearchVolume: 1200 },
  { category: 'Research', rpm: 11.00, avgSearchVolume: 900 },
  { category: 'Alumni', rpm: 9.00, avgSearchVolume: 800 },
  { category: 'Default', rpm: 10.00, avgSearchVolume: 1000 },
];

/**
 * Comprehensive industry benchmarks with detailed metrics
 */
export const INDUSTRY_BENCHMARKS: IndustryBenchmarks = {
  categories: {
    'Admissions': {
      category: 'Admissions',
      rpm: 15.50,
      avgSearchVolume: 2500,
      avgCTR: 0.045,
      seasonalMultiplier: 1.3, // Higher during application season
      competitionLevel: 8,
    },
    'Financial Aid': {
      category: 'Financial Aid',
      rpm: 22.00,
      avgSearchVolume: 3200,
      avgCTR: 0.052,
      seasonalMultiplier: 1.4, // Higher during FAFSA season
      competitionLevel: 9,
    },
    'Campus Life': {
      category: 'Campus Life',
      rpm: 8.50,
      avgSearchVolume: 1800,
      avgCTR: 0.038,
      seasonalMultiplier: 1.1,
      competitionLevel: 5,
    },
    'Programs': {
      category: 'Programs',
      rpm: 12.00,
      avgSearchVolume: 2100,
      avgCTR: 0.042,
      seasonalMultiplier: 1.0,
      competitionLevel: 7,
    },
    'Scholarships': {
      category: 'Scholarships',
      rpm: 25.00,
      avgSearchVolume: 4500,
      avgCTR: 0.058,
      seasonalMultiplier: 1.5, // Very high during scholarship deadlines
      competitionLevel: 9,
    },
    'Test Prep': {
      category: 'Test Prep',
      rpm: 28.00,
      avgSearchVolume: 5200,
      avgCTR: 0.062,
      seasonalMultiplier: 1.2,
      competitionLevel: 10,
    },
    'Career Services': {
      category: 'Career Services',
      rpm: 18.50,
      avgSearchVolume: 2800,
      avgCTR: 0.048,
      seasonalMultiplier: 1.2, // Higher during graduation/job season
      competitionLevel: 7,
    },
    'Student Resources': {
      category: 'Student Resources',
      rpm: 10.00,
      avgSearchVolume: 1500,
      avgCTR: 0.035,
      seasonalMultiplier: 1.0,
      competitionLevel: 4,
    },
    'Graduate Programs': {
      category: 'Graduate Programs',
      rpm: 20.00,
      avgSearchVolume: 2000,
      avgCTR: 0.050,
      seasonalMultiplier: 1.2,
      competitionLevel: 8,
    },
    'International Students': {
      category: 'International Students',
      rpm: 24.00,
      avgSearchVolume: 3000,
      avgCTR: 0.055,
      seasonalMultiplier: 1.3,
      competitionLevel: 7,
    },
    'Housing': {
      category: 'Housing',
      rpm: 14.00,
      avgSearchVolume: 2200,
      avgCTR: 0.040,
      seasonalMultiplier: 1.4, // Higher before semester starts
      competitionLevel: 6,
    },
    'Athletics': {
      category: 'Athletics',
      rpm: 6.50,
      avgSearchVolume: 1200,
      avgCTR: 0.032,
      seasonalMultiplier: 1.0,
      competitionLevel: 3,
    },
    'Research': {
      category: 'Research',
      rpm: 11.00,
      avgSearchVolume: 900,
      avgCTR: 0.028,
      seasonalMultiplier: 1.0,
      competitionLevel: 5,
    },
    'Alumni': {
      category: 'Alumni',
      rpm: 9.00,
      avgSearchVolume: 800,
      avgCTR: 0.025,
      seasonalMultiplier: 1.1, // Higher during reunion season
      competitionLevel: 3,
    },
    // Placeholder categories for future expansion
    'Online Learning': {
      category: 'Online Learning',
      rpm: 19.00,
      avgSearchVolume: 3500,
      avgCTR: 0.048,
      seasonalMultiplier: 1.1,
      competitionLevel: 8,
    },
    'Study Abroad': {
      category: 'Study Abroad',
      rpm: 16.00,
      avgSearchVolume: 1800,
      avgCTR: 0.044,
      seasonalMultiplier: 1.2,
      competitionLevel: 6,
    },
    'Student Life Tips': {
      category: 'Student Life Tips',
      rpm: 7.50,
      avgSearchVolume: 2000,
      avgCTR: 0.036,
      seasonalMultiplier: 1.0,
      competitionLevel: 4,
    },
  },
  defaults: {
    category: 'Default',
    rpm: 10.00,
    avgSearchVolume: 1000,
    avgCTR: 0.035,
    seasonalMultiplier: 1.0,
    competitionLevel: 5,
  },
  qualityMultipliers: {
    low: 0.6,      // Poor quality content
    medium: 1.0,   // Average quality
    high: 1.4,     // High quality, well-optimized
    premium: 1.8,  // Exceptional, viral potential
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get benchmark data for a specific category (legacy function)
 */
export function getBenchmarkFor(category?: string): Benchmark {
  if (!category) return BENCHMARKS.find(b => b.category === 'Default')!;
  return BENCHMARKS.find(b => b.category === category) || BENCHMARKS.find(b => b.category === 'Default')!;
}

/**
 * Get comprehensive benchmark data for a category
 */
export function getCategoryBenchmark(category?: string): CategoryBenchmark {
  if (!category) return INDUSTRY_BENCHMARKS.defaults;
  return INDUSTRY_BENCHMARKS.categories[category] || INDUSTRY_BENCHMARKS.defaults;
}

/**
 * Get RPM adjusted by content quality
 */
export function getAdjustedRPM(
  category: string | undefined,
  qualityTier: 'low' | 'medium' | 'high' | 'premium' = 'medium'
): number {
  const benchmark = getCategoryBenchmark(category);
  const multiplier = INDUSTRY_BENCHMARKS.qualityMultipliers[qualityTier];
  return Math.round(benchmark.rpm * multiplier * 100) / 100;
}

/**
 * Get all available categories
 */
export function getAvailableCategories(): string[] {
  return Object.keys(INDUSTRY_BENCHMARKS.categories);
}

/**
 * Calculate estimated monthly traffic based on benchmark data
 */
export function estimateMonthlyTraffic(
  category: string | undefined,
  seoScore: number, // 0-100
  contentAge: number = 0 // months since publication
): { low: number; med: number; high: number } {
  const benchmark = getCategoryBenchmark(category);
  
  // Base traffic from search volume and CTR
  const baseTraffic = benchmark.avgSearchVolume * benchmark.avgCTR;
  
  // SEO score factor (0.3 to 1.5)
  const seoFactor = 0.3 + (seoScore / 100) * 1.2;
  
  // Content age decay (older content gets less traffic, min 0.4)
  const ageFactor = Math.max(0.4, 1 - (contentAge * 0.02));
  
  // Seasonal adjustment
  const seasonalFactor = benchmark.seasonalMultiplier;
  
  // Competition penalty (higher competition = lower share)
  const competitionFactor = 1 - (benchmark.competitionLevel * 0.05);
  
  const medTraffic = Math.round(baseTraffic * seoFactor * ageFactor * seasonalFactor * competitionFactor);
  
  return {
    low: Math.round(medTraffic * 0.6),
    med: medTraffic,
    high: Math.round(medTraffic * 1.5),
  };
}
