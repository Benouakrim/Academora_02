"use strict";
/**
 * Article Performance Forecaster - Zod Schemas
 * Validation schemas for the Article Performance Forecaster feature
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionResultSchema = exports.ArticleFeaturesSchema = exports.LinkCountsSchema = exports.TrafficForecastSchema = exports.HistoryParamsSchema = exports.BatchPredictRequestSchema = exports.PredictRequestSchema = void 0;
const zod_1 = require("zod");
// ============================================================================
// Request Schemas
// ============================================================================
/**
 * PredictRequestSchema - Validates the POST /predict endpoint request body
 */
exports.PredictRequestSchema = zod_1.z.object({
    /** Article content (Tiptap JSON format as string) */
    content: zod_1.z.string().min(1, 'Article content is required'),
    /** Article title */
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
    /** Article tags/keywords */
    tags: zod_1.z.array(zod_1.z.string().min(1).max(50)).default([]),
    /** Article category */
    category: zod_1.z.string().min(1, 'Category is required'),
    /** Optional article ID for tracking/history */
    articleId: zod_1.z.string().optional(),
});
/**
 * BatchPredictRequestSchema - Validates batch prediction requests
 */
exports.BatchPredictRequestSchema = zod_1.z.object({
    /** Array of article IDs to process */
    articleIds: zod_1.z.array(zod_1.z.string().min(1)).min(1, 'At least one article ID is required').max(100, 'Maximum 100 articles per batch'),
});
/**
 * HistoryParamsSchema - Validates history endpoint parameters
 */
exports.HistoryParamsSchema = zod_1.z.object({
    /** Article ID to fetch history for */
    articleId: zod_1.z.string().min(1, 'Article ID is required'),
});
// ============================================================================
// Response Schemas (for runtime validation if needed)
// ============================================================================
/**
 * TrafficForecastSchema - Validates traffic forecast structure
 */
exports.TrafficForecastSchema = zod_1.z.object({
    low: zod_1.z.number().min(0),
    med: zod_1.z.number().min(0),
    high: zod_1.z.number().min(0),
});
/**
 * LinkCountsSchema - Validates link counts structure
 */
exports.LinkCountsSchema = zod_1.z.object({
    internal: zod_1.z.number().min(0),
    external: zod_1.z.number().min(0),
});
/**
 * ArticleFeaturesSchema - Validates extracted article features
 */
exports.ArticleFeaturesSchema = zod_1.z.object({
    wordCount: zod_1.z.number().min(0),
    headingHierarchy: zod_1.z.record(zod_1.z.string(), zod_1.z.number()),
    linkCounts: exports.LinkCountsSchema,
    academoraBlocks: zod_1.z.record(zod_1.z.string(), zod_1.z.number()),
    imageCount: zod_1.z.number().min(0),
    embedCount: zod_1.z.number().min(0),
    titleLength: zod_1.z.number().min(0),
    keywords: zod_1.z.array(zod_1.z.string()),
    keywordDensity: zod_1.z.number().min(0).max(1),
    readabilityScore: zod_1.z.number(),
});
/**
 * PredictionResultSchema - Validates prediction result structure
 */
exports.PredictionResultSchema = zod_1.z.object({
    seoScore: zod_1.z.number().min(0).max(100),
    trafficForecast: exports.TrafficForecastSchema,
    adRevenue: zod_1.z.number().min(0),
    recommendations: zod_1.z.array(zod_1.z.string()),
    confidence: zod_1.z.number().min(0).max(100),
    readTime: zod_1.z.number().min(0),
    conversionRate: zod_1.z.number().min(0).max(100),
    features: exports.ArticleFeaturesSchema,
});
//# sourceMappingURL=articleForecasterSchemas.js.map