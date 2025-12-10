import { z } from 'zod';

// Tracking schemas
export const trackPageViewSchema = {
  body: z.object({
    page: z.string().min(1, 'Page is required'),
    entityId: z.string().optional(),
    entitySlug: z.string().optional(),
    sessionId: z.string().min(1, 'Session ID is required'),
    referrer: z.string().optional(),
    duration: z.number().optional(),
  }),
};

export const updatePageViewDurationSchema = {
  params: z.object({
    id: z.string().uuid('Invalid page view ID'),
  }),
  body: z.object({
    duration: z.number().min(0, 'Duration must be positive'),
  }),
};

export const trackEventSchema = {
  body: z.object({
    eventType: z.string().min(1, 'Event type is required'),
    sessionId: z.string().min(1, 'Session ID is required'),
    entityType: z.string().optional(),
    entityId: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
};

export const trackSearchSchema = {
  body: z.object({
    query: z.string().min(1, 'Query is required'),
    sessionId: z.string().min(1, 'Session ID is required'),
    resultsCount: z.number().optional(),
    clickedResult: z.string().optional(),
    page: z.string().min(1, 'Page is required'),
    filters: z.record(z.unknown()).optional(),
  }),
};

// Query param schemas for analytics endpoints
export const dateRangeQuerySchema = {
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
};

export const paginatedAnalyticsQuerySchema = {
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().transform(v => parseInt(v) || 1).optional(),
    limit: z.string().transform(v => parseInt(v) || 20).optional(),
  }),
};

export const topPerformersQuerySchema = {
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    type: z.enum(['articles', 'universities', 'groups']).optional(),
    limit: z.string().transform(v => parseInt(v) || 10).optional(),
  }),
};

export const userArticlesAnalyticsQuerySchema = {
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().transform(v => parseInt(v) || 1).optional(),
    limit: z.string().transform(v => parseInt(v) || 10).optional(),
    sortBy: z.enum(['views', 'likes', 'engagement', 'date']).optional(),
  }),
};
