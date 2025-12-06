/**
 * Article Performance Forecaster - Shared TypeScript Interfaces
 * These interfaces are shared across the client (React) and server (Node.js/Express)
 */
/**
 * ArticleFeatures - Backend extraction interface
 * Represents the extracted features from an article for prediction analysis
 */
export interface ArticleFeatures {
    /** Total word count of the article content */
    wordCount: number;
    /** Heading hierarchy counts (e.g., { h1: 1, h2: 3, h3: 5 }) */
    headingHierarchy: Record<string, number>;
    /** Link counts broken down by type */
    linkCounts: {
        /** Number of internal links (within the site) */
        internal: number;
        /** Number of external links (to other domains) */
        external: number;
    };
    /** Academora-specific block type counts (e.g., { quiz: 2, callout: 3 }) */
    academoraBlocks: Record<string, number>;
    /** Number of images in the article */
    imageCount: number;
    /** Number of embedded content (iframes, videos, etc.) */
    embedCount: number;
    /** Article title length in characters */
    titleLength: number;
    /** Keywords/tags associated with the article */
    keywords: string[];
    /** Density of keywords/tags within the article content (0-1) */
    keywordDensity: number;
    /** Flesch reading ease score (0-100) */
    readabilityScore: number;
}
/**
 * TrafficForecast - Traffic estimation range
 */
export interface TrafficForecast {
    /** Lower bound estimate (pessimistic) */
    low: number;
    /** Medium estimate (most likely) */
    med: number;
    /** Upper bound estimate (optimistic) */
    high: number;
}
/**
 * PredictionResult - Final prediction output interface
 * Represents the complete prediction result for an article
 */
export interface PredictionResult {
    /** SEO score (0-100) */
    seoScore: number;
    /** Traffic forecast with low, medium, and high estimates */
    trafficForecast: TrafficForecast;
    /** Estimated ad revenue in USD */
    adRevenue: number;
    /** Array of improvement recommendations */
    recommendations: string[];
    /** Confidence score of the prediction (0-100) */
    confidence: number;
    /** Estimated read time in minutes */
    readTime: number;
    /** Estimated conversion rate percentage */
    conversionRate: number;
    /** The extracted features used for prediction */
    features: ArticleFeatures;
}
/**
 * PredictRequest - Input data for prediction endpoint
 */
export interface PredictRequest {
    /** Article content (Tiptap JSON format) */
    content: string;
    /** Article title */
    title: string;
    /** Article tags/keywords */
    tags: string[];
    /** Article category */
    category: string;
    /** Optional article ID for tracking/history */
    articleId?: string;
}
/**
 * PredictionHistory - Historical prediction record
 */
export interface PredictionHistory {
    /** Unique prediction ID */
    id: string;
    /** Associated article ID */
    articleId: string;
    /** Hash of the input content */
    inputHash: string;
    /** Extracted features at time of prediction */
    features: ArticleFeatures;
    /** Prediction result at time of prediction */
    result: PredictionResult;
    /** Prediction model version */
    version: number;
    /** Timestamp of prediction */
    createdAt: Date;
}
/**
 * BatchPredictionResult - Result of batch prediction operation
 */
export interface BatchPredictionResult {
    /** Map of article ID to prediction result */
    results: Record<string, PredictionResult>;
    /** List of article IDs that failed prediction */
    failed: string[];
    /** Total number of articles processed */
    totalProcessed: number;
}
//# sourceMappingURL=articleForecaster.d.ts.map