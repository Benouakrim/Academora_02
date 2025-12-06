/**
 * Article Performance Forecaster - Zod Schemas
 * Validation schemas for the Article Performance Forecaster feature
 */

import { z } from 'zod';

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * PredictRequestSchema - Validates the POST /predict endpoint request body
 */
export const PredictRequestSchema = z.object({
  /** Article content (Tiptap JSON format as string) */
  content: z.string().min(1, 'Article content is required'),

  /** Article title */
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),

  /** Article tags/keywords */
  tags: z.array(z.string().min(1).max(50)).default([]),

  /** Article category */
  category: z.string().min(1, 'Category is required'),

  /** Optional article ID for tracking/history */
  articleId: z.string().optional(),
});

/**
 * BatchPredictRequestSchema - Validates batch prediction requests
 */
export const BatchPredictRequestSchema = z.object({
  /** Array of article IDs to process */
  articleIds: z.array(z.string().min(1)).min(1, 'At least one article ID is required').max(100, 'Maximum 100 articles per batch'),
});

/**
 * HistoryParamsSchema - Validates history endpoint parameters
 */
export const HistoryParamsSchema = z.object({
  /** Article ID to fetch history for */
  articleId: z.string().min(1, 'Article ID is required'),
});

// ============================================================================
// Response Schemas (for runtime validation if needed)
// ============================================================================

/**
 * TrafficForecastSchema - Validates traffic forecast structure
 */
export const TrafficForecastSchema = z.object({
  low: z.number().min(0),
  med: z.number().min(0),
  high: z.number().min(0),
});

/**
 * LinkCountsSchema - Validates link counts structure
 */
export const LinkCountsSchema = z.object({
  internal: z.number().min(0),
  external: z.number().min(0),
});

/**
 * ArticleFeaturesSchema - Validates extracted article features
 */
export const ArticleFeaturesSchema = z.object({
  wordCount: z.number().min(0),
  headingHierarchy: z.record(z.string(), z.number()),
  linkCounts: LinkCountsSchema,
  academoraBlocks: z.record(z.string(), z.number()),
  imageCount: z.number().min(0),
  embedCount: z.number().min(0),
  titleLength: z.number().min(0),
  keywords: z.array(z.string()),
  keywordDensity: z.number().min(0).max(1),
  readabilityScore: z.number(),
});

/**
 * PredictionResultSchema - Validates prediction result structure
 */
export const PredictionResultSchema = z.object({
  seoScore: z.number().min(0).max(100),
  trafficForecast: TrafficForecastSchema,
  adRevenue: z.number().min(0),
  recommendations: z.array(z.string()),
  confidence: z.number().min(0).max(100),
  readTime: z.number().min(0),
  conversionRate: z.number().min(0).max(100),
  features: ArticleFeaturesSchema,
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type PredictRequest = z.infer<typeof PredictRequestSchema>;
export type BatchPredictRequest = z.infer<typeof BatchPredictRequestSchema>;
export type HistoryParams = z.infer<typeof HistoryParamsSchema>;
export type TrafficForecast = z.infer<typeof TrafficForecastSchema>;
export type ArticleFeatures = z.infer<typeof ArticleFeaturesSchema>;
export type PredictionResult = z.infer<typeof PredictionResultSchema>;
