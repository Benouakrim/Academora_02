import { useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

// Generate or get session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

interface TrackPageViewOptions {
  page?: string;
  entityId?: string;
  entitySlug?: string;
  entityType?: 'article' | 'university' | 'group';
  title?: string;
  metadata?: Record<string, unknown>;
}

interface TrackEventOptions {
  eventType: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

interface TrackSearchOptions {
  query: string;
  resultsCount: number;
  clickedResult?: string;
  page: string;
  filters?: Record<string, unknown>;
}

interface TrackBlockInteractionOptions {
  blockId: string;
  blockType: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  entityId: string;
  entityType: 'university' | 'article';
}

/**
 * Hook for tracking analytics events
 */
export function useAnalyticsTracking() {
  const pageViewIdRef = useRef<string | null>(null);
  const pageEntryTimeRef = useRef<number>(Date.now());

  /**
   * Track a page view
   */
  const trackPageView = useCallback(async ({ page, entityId, entitySlug, entityType, title, metadata }: TrackPageViewOptions) => {
    try {
      const response = await api.post('/analytics/track/pageview', {
        page: page || (entityType ? `${entityType}:${entitySlug}` : undefined),
        entityId,
        entitySlug,
        entityType,
        title,
        metadata,
        sessionId: getSessionId(),
        referrer: document.referrer || undefined,
      });
      
      pageViewIdRef.current = response.data.data?.id;
      pageEntryTimeRef.current = Date.now();
      
      return response.data.data?.id;
    } catch (error) {
      console.error('Failed to track page view:', error);
      return null;
    }
  }, []);

  /**
   * Update page view duration when leaving
   */
  const updateDuration = useCallback(async () => {
    if (!pageViewIdRef.current) return;
    
    const duration = Math.round((Date.now() - pageEntryTimeRef.current) / 1000);
    
    try {
      await api.patch(`/analytics/track/pageview/${pageViewIdRef.current}`, {
        duration,
      });
    } catch (error) {
      console.error('Failed to update page view duration:', error);
    }
  }, []);

  /**
   * Track an engagement event
   */
  const trackEvent = useCallback(async ({ eventType, entityType, entityId, metadata }: TrackEventOptions) => {
    try {
      await api.post('/analytics/track/event', {
        eventType,
        sessionId: getSessionId(),
        entityType,
        entityId,
        metadata,
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, []);

  /**
   * Track a search
   */
  const trackSearch = useCallback(async ({ query, resultsCount, clickedResult, page, filters }: TrackSearchOptions) => {
    try {
      await api.post('/analytics/track/search', {
        query,
        sessionId: getSessionId(),
        resultsCount,
        clickedResult,
        page,
        filters,
      });
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  }, []);

  /**
   * Track block-specific interaction events
   */
  const trackBlockInteraction = useCallback(async ({ 
    blockId, 
    blockType, 
    eventType, 
    metadata, 
    entityId, 
    entityType 
  }: TrackBlockInteractionOptions) => {
    try {
      await api.post('/engagement/block-track', {
        blockId,
        blockType,
        eventType,
        metadata,
        entityId,
        entityType,
        sessionId: getSessionId(),
      });
    } catch (error) {
      console.error('Failed to track block interaction:', error);
    }
  }, []);


  // Update duration when component unmounts or page changes
  useEffect(() => {
    return () => {
      updateDuration();
    };
  }, [updateDuration]);

  // Handle page visibility change (user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateDuration();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateDuration]);

  // Handle before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      updateDuration();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [updateDuration]);

  return {
    trackPageView,
    trackEvent,
    trackSearch,
    trackBlockInteraction,
    updateDuration,
  };
}

/**
 * Hook to automatically track page view on mount
 */
export function usePageViewTracking(page: string, entityId?: string, entitySlug?: string) {
  const { trackPageView, updateDuration } = useAnalyticsTracking();

  useEffect(() => {
    trackPageView({ page, entityId, entitySlug });

    return () => {
      updateDuration();
    };
  }, [page, entityId, entitySlug, trackPageView, updateDuration]);
}

/**
 * Hook to track search queries
 */
export function useSearchTracking() {
  const { trackSearch } = useAnalyticsTracking();
  return trackSearch;
}

/**
 * Hook to track engagement events
 */
export function useEventTracking() {
  const { trackEvent } = useAnalyticsTracking();
  return trackEvent;
}
