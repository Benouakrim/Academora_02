/**
 * Article Performance Forecaster - Zod Schemas
 * Validation schemas for the Article Performance Forecaster feature
 */
import { z } from 'zod';
/**
 * PredictRequestSchema - Validates the POST /predict endpoint request body
 */
export declare const PredictRequestSchema: z.ZodObject<{
    content: z.ZodString;
    title: z.ZodString;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    category: z.ZodString;
    articleId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * BatchPredictRequestSchema - Validates batch prediction requests
 */
export declare const BatchPredictRequestSchema: z.ZodObject<{
    articleIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
/**
 * HistoryParamsSchema - Validates history endpoint parameters
 */
export declare const HistoryParamsSchema: z.ZodObject<{
    articleId: z.ZodString;
}, z.core.$strip>;
/**
 * TrafficForecastSchema - Validates traffic forecast structure
 */
export declare const TrafficForecastSchema: z.ZodObject<{
    low: z.ZodNumber;
    med: z.ZodNumber;
    high: z.ZodNumber;
}, z.core.$strip>;
/**
 * LinkCountsSchema - Validates link counts structure
 */
export declare const LinkCountsSchema: z.ZodObject<{
    internal: z.ZodNumber;
    external: z.ZodNumber;
}, z.core.$strip>;
/**
 * ArticleFeaturesSchema - Validates extracted article features
 */
export declare const ArticleFeaturesSchema: z.ZodObject<{
    wordCount: z.ZodNumber;
    headingHierarchy: z.ZodRecord<z.ZodString, z.ZodNumber>;
    linkCounts: z.ZodObject<{
        internal: z.ZodNumber;
        external: z.ZodNumber;
    }, z.core.$strip>;
    academoraBlocks: z.ZodRecord<z.ZodString, z.ZodNumber>;
    imageCount: z.ZodNumber;
    embedCount: z.ZodNumber;
    titleLength: z.ZodNumber;
    keywords: z.ZodArray<z.ZodString>;
    keywordDensity: z.ZodNumber;
    readabilityScore: z.ZodNumber;
}, z.core.$strip>;
/**
 * PredictionResultSchema - Validates prediction result structure
 */
export declare const PredictionResultSchema: z.ZodObject<{
    seoScore: z.ZodNumber;
    trafficForecast: z.ZodObject<{
        low: z.ZodNumber;
        med: z.ZodNumber;
        high: z.ZodNumber;
    }, z.core.$strip>;
    adRevenue: z.ZodNumber;
    recommendations: z.ZodArray<z.ZodString>;
    confidence: z.ZodNumber;
    readTime: z.ZodNumber;
    conversionRate: z.ZodNumber;
    features: z.ZodObject<{
        wordCount: z.ZodNumber;
        headingHierarchy: z.ZodRecord<z.ZodString, z.ZodNumber>;
        linkCounts: z.ZodObject<{
            internal: z.ZodNumber;
            external: z.ZodNumber;
        }, z.core.$strip>;
        academoraBlocks: z.ZodRecord<z.ZodString, z.ZodNumber>;
        imageCount: z.ZodNumber;
        embedCount: z.ZodNumber;
        titleLength: z.ZodNumber;
        keywords: z.ZodArray<z.ZodString>;
        keywordDensity: z.ZodNumber;
        readabilityScore: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type PredictRequest = z.infer<typeof PredictRequestSchema>;
export type BatchPredictRequest = z.infer<typeof BatchPredictRequestSchema>;
export type HistoryParams = z.infer<typeof HistoryParamsSchema>;
export type TrafficForecast = z.infer<typeof TrafficForecastSchema>;
export type ArticleFeatures = z.infer<typeof ArticleFeaturesSchema>;
export type PredictionResult = z.infer<typeof PredictionResultSchema>;
//# sourceMappingURL=articleForecasterSchemas.d.ts.map