/**
 * Shared Module Index
 * Central export for all shared types and schemas
 */

export * from './types';

// Export schemas explicitly to avoid duplicate type re-exports
export {
	PredictRequestSchema,
	BatchPredictRequestSchema,
	HistoryParamsSchema,
	TrafficForecastSchema,
	LinkCountsSchema,
	ArticleFeaturesSchema,
	PredictionResultSchema,
} from './schemas/articleForecasterSchemas';
