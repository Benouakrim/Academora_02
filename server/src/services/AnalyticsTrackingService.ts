import prisma from '../lib/prisma';

interface PageViewData {
  page: string;
  entityId?: string;
  entitySlug?: string;
  userId?: string;
  sessionId: string;
  referrer?: string;
  userAgent?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  duration?: number;
}

interface EngagementEventData {
  userId?: string;
  sessionId: string;
  eventType: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

interface SearchEventData {
  query: string;
  userId?: string;
  sessionId: string;
  resultsCount: number;
  clickedResult?: string;
  page: string;
  filters?: Record<string, unknown>;
}

interface BlockEngagementPayload {
  blockId: string;
  blockType: string;
  universityId?: string;
  articleId?: string;
  eventType: string;
  metadata?: Record<string, any>;
  sessionId: string;
  userId?: string;
}

export class AnalyticsTrackingService {
  /**
   * Track a page view
   */
  static async trackPageView(data: PageViewData) {
    try {
      const pageView = await prisma.pageView.create({
        data: {
          page: data.page,
          entityId: data.entityId,
          entitySlug: data.entitySlug,
          userId: data.userId,
          sessionId: data.sessionId,
          referrer: data.referrer,
          userAgent: data.userAgent,
          country: data.country,
          city: data.city,
          device: data.device,
          browser: data.browser,
          duration: data.duration,
        },
      });

      // Update daily analytics asynchronously
      this.updateDailyAnalytics(data.page, data.entityId, data.device).catch(console.error);

      // Update entity-specific analytics
      if (data.entityId) {
        this.updateEntityAnalytics(data.page, data.entityId, data.sessionId).catch(console.error);
      }

      return pageView;
    } catch (error) {
      console.error('Error tracking page view:', error);
      throw error;
    }
  }

  /**
   * Update page view duration when user leaves
   */
  static async updatePageViewDuration(pageViewId: string, duration: number) {
    try {
      return await prisma.pageView.update({
        where: { id: pageViewId },
        data: { duration },
      });
    } catch (error) {
      console.error('Error updating page view duration:', error);
      throw error;
    }
  }

  /**
   * Track an engagement event
   */
  static async trackEngagementEvent(data: EngagementEventData) {
    try {
      const event = await prisma.engagementEvent.create({
        data: {
          userId: data.userId,
          sessionId: data.sessionId,
          eventType: data.eventType,
          entityType: data.entityType,
          entityId: data.entityId,
          metadata: data.metadata as any,
        },
      });

      return event;
    } catch (error) {
      console.error('Error tracking engagement event:', error);
      throw error;
    }
  }

  /**
   * Track user interaction events specific to Micro-Content Blocks.
   */
  static async trackBlockEngagement(payload: BlockEngagementPayload) {
    try {
      const { 
        blockId, 
        blockType, 
        universityId, 
        articleId, 
        eventType, 
        metadata, 
        sessionId, 
        userId 
      } = payload;
      
      const entityType = universityId ? 'university' : articleId ? 'article' : undefined;
      const entityId = universityId || articleId;

      const event = await prisma.engagementEvent.create({
        data: {
          userId,
          sessionId,
          eventType,
          entityType,
          entityId,
          ...(blockId && { blockId }),
          ...(blockType && { blockType }),
          metadata: metadata ? (metadata as any) : undefined,
        } as any,
      });

      return event;
    } catch (error) {
      console.error('Error tracking block engagement:', error);
      throw error;
    }
  }

  /**
   * Track a search query
   */
  static async trackSearch(data: SearchEventData) {
    try {
      return await prisma.searchAnalytics.create({
        data: {
          query: data.query,
          userId: data.userId,
          sessionId: data.sessionId,
          resultsCount: data.resultsCount,
          clickedResult: data.clickedResult,
          page: data.page,
          filters: data.filters as any,
        },
      });
    } catch (error) {
      console.error('Error tracking search:', error);
      throw error;
    }
  }

  /**
   * Update daily aggregated analytics
   */
  private static async updateDailyAnalytics(page: string, entityId?: string, device?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entityType = page === 'article' ? 'article' 
      : page === 'university' ? 'university'
      : page === 'group' ? 'group'
      : 'site';

    try {
      await prisma.dailyAnalytics.upsert({
        where: {
          date_entityType_entityId: {
            date: today,
            entityType,
            entityId: entityId || 'global',
          },
        },
        update: {
          pageViews: { increment: 1 },
          mobileViews: device === 'mobile' ? { increment: 1 } : undefined,
          desktopViews: device === 'desktop' ? { increment: 1 } : undefined,
          tabletViews: device === 'tablet' ? { increment: 1 } : undefined,
        },
        create: {
          date: today,
          entityType,
          entityId: entityId || 'global',
          pageViews: 1,
          mobileViews: device === 'mobile' ? 1 : 0,
          desktopViews: device === 'desktop' ? 1 : 0,
          tabletViews: device === 'tablet' ? 1 : 0,
        },
      });

      // Also update site-wide metrics if this is an entity page
      if (entityId) {
        await prisma.dailyAnalytics.upsert({
          where: {
            date_entityType_entityId: {
              date: today,
              entityType: 'site',
              entityId: 'global',
            },
          },
          update: {
            pageViews: { increment: 1 },
            mobileViews: device === 'mobile' ? { increment: 1 } : undefined,
            desktopViews: device === 'desktop' ? { increment: 1 } : undefined,
            tabletViews: device === 'tablet' ? { increment: 1 } : undefined,
          },
          create: {
            date: today,
            entityType: 'site',
            entityId: 'global',
            pageViews: 1,
            mobileViews: device === 'mobile' ? 1 : 0,
            desktopViews: device === 'desktop' ? 1 : 0,
            tabletViews: device === 'tablet' ? 1 : 0,
          },
        });
      }
    } catch (error) {
      console.error('Error updating daily analytics:', error);
    }
  }

  /**
   * Update entity-specific analytics (article, university, group)
   */
  private static async updateEntityAnalytics(page: string, entityId: string, sessionId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      switch (page) {
        case 'article':
          // Update article view count
          await prisma.article.update({
            where: { id: entityId },
            data: { viewCount: { increment: 1 } },
          }).catch(() => {
            // Try by slug if ID fails
            prisma.article.update({
              where: { slug: entityId },
              data: { viewCount: { increment: 1 } },
            }).catch(() => {});
          });

          // Update article detailed analytics
          await prisma.articleDetailedAnalytics.upsert({
            where: {
              articleId_date: {
                articleId: entityId,
                date: today,
              },
            },
            update: {
              clicks: { increment: 1 },
            },
            create: {
              articleId: entityId,
              date: today,
              clicks: 1,
            },
          }).catch(() => {});
          break;

        case 'university':
          await prisma.universityAnalytics.upsert({
            where: {
              universityId_date: {
                universityId: entityId,
                date: today,
              },
            },
            update: {
              pageViews: { increment: 1 },
            },
            create: {
              universityId: entityId,
              date: today,
              pageViews: 1,
            },
          }).catch(() => {});
          break;

        case 'group':
          await prisma.groupAnalytics.upsert({
            where: {
              groupId_date: {
                groupId: entityId,
                date: today,
              },
            },
            update: {
              pageViews: { increment: 1 },
            },
            create: {
              groupId: entityId,
              date: today,
              pageViews: 1,
            },
          }).catch(() => {});
          break;
      }
    } catch (error) {
      console.error('Error updating entity analytics:', error);
    }
  }

  /**
   * Parse user agent to extract device and browser info
   */
  static parseUserAgent(userAgent: string): { device: string; browser: string } {
    let device = 'desktop';
    let browser = 'unknown';

    const ua = userAgent.toLowerCase();

    // Device detection
    if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
      if (/tablet|ipad/i.test(ua)) {
        device = 'tablet';
      } else {
        device = 'mobile';
      }
    }

    // Browser detection
    if (ua.includes('firefox')) {
      browser = 'firefox';
    } else if (ua.includes('edg')) {
      browser = 'edge';
    } else if (ua.includes('chrome')) {
      browser = 'chrome';
    } else if (ua.includes('safari')) {
      browser = 'safari';
    } else if (ua.includes('opera') || ua.includes('opr')) {
      browser = 'opera';
    }

    return { device, browser };
  }

  /**
   * Parse referrer to get traffic source
   */
  static parseReferrer(referrer: string): { source: string; medium?: string } {
    if (!referrer) {
      return { source: 'direct' };
    }

    const url = referrer.toLowerCase();

    // Search engines
    if (url.includes('google.')) {
      return { source: 'organic', medium: 'google' };
    }
    if (url.includes('bing.')) {
      return { source: 'organic', medium: 'bing' };
    }
    if (url.includes('yahoo.')) {
      return { source: 'organic', medium: 'yahoo' };
    }
    if (url.includes('duckduckgo.')) {
      return { source: 'organic', medium: 'duckduckgo' };
    }

    // Social media
    if (url.includes('facebook.') || url.includes('fb.')) {
      return { source: 'social', medium: 'facebook' };
    }
    if (url.includes('twitter.') || url.includes('t.co')) {
      return { source: 'social', medium: 'twitter' };
    }
    if (url.includes('linkedin.')) {
      return { source: 'social', medium: 'linkedin' };
    }
    if (url.includes('instagram.')) {
      return { source: 'social', medium: 'instagram' };
    }
    if (url.includes('tiktok.')) {
      return { source: 'social', medium: 'tiktok' };
    }
    if (url.includes('reddit.')) {
      return { source: 'social', medium: 'reddit' };
    }

    return { source: 'referral', medium: new URL(referrer).hostname };
  }
}
