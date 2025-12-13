# Analytics Feature Implementation - Complete Documentation

**Project:** Academora_02  
**Date:** December 10, 2025  
**Feature:** Comprehensive Analytics System for Articles, Universities, Groups, and Website  

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Architecture](#architecture)
3. [Database Models](#database-models)
4. [Backend Services](#backend-services)
5. [API Endpoints](#api-endpoints)
6. [Frontend Implementation](#frontend-implementation)
7. [Usage Guide](#usage-guide)
8. [Integration Points](#integration-points)

---

## Feature Overview

The analytics system tracks and reports on:

### **For Admin Users:**
- **Site-Wide Analytics:** Overall page views, visitors, engagement metrics
- **Article Performance:** Views, likes, comments, shares, engagement rates
- **University Pages:** Page views, saves, comparisons, website clicks
- **Group Pages:** Page views, university clicks, traffic patterns
- **User Activity:** Active users, new signups, user engagement patterns
- **Device Breakdown:** Mobile, tablet, desktop traffic distribution
- **Traffic Sources:** Organic, social, referral, direct traffic
- **Geographic Distribution:** Page views by country
- **Search Analytics:** Top queries, zero-result queries, search trends
- **Real-Time Data:** Active users, top pages in the last 30 minutes

### **For Users (Article Authors):**
- **Personal Overview:** Total views, likes, comments, shares
- **Individual Article Performance:** Views, engagement, read metrics
- **Views Trend:** Daily views over selected period
- **Best Performing Article:** Article with highest engagement
- **Audience Insights:** Device breakdown, geography, traffic sources

---

## Architecture

### **Layers:**

```
Client (React)
    ↓
API Calls (Axios)
    ↓
Controllers (Express)
    ↓
Services (Business Logic)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
```

### **Key Components:**

**Backend:**
- `AnalyticsTrackingService` - Handles real-time event tracking
- `AnalyticsService` - Core analytics queries and aggregations
- `AdminAnalyticsService` - Admin-specific reports and dashboards
- `UserAnalyticsService` - User/author-specific analytics
- `analyticsController` - HTTP request handlers
- `analytics.ts` (routes) - Public tracking endpoints
- `admin.ts` (routes) - Admin analytics endpoints

**Frontend:**
- `useAdminAnalytics` hook - Admin dashboard data fetching
- `useUserAnalytics` hook - User analytics data fetching
- `useAnalyticsTracking` hook - Client-side event tracking
- `AdminAnalyticsPage` component - Admin dashboard
- `MyArticlesAnalyticsPage` component - Author dashboard

---

## Database Models

### **1. PageView**
Tracks individual page visits with detailed metadata.

```prisma
model PageView {
  id         String   @id @default(uuid())
  page       String   // 'article', 'university', 'group', 'home', etc.
  entityId   String?  // article/university/group ID
  entitySlug String?  // for easier querying
  userId     String?  // null for anonymous
  sessionId  String   // session tracking
  referrer   String?
  userAgent  String?
  country    String?
  city       String?
  device     String?  // 'mobile', 'tablet', 'desktop'
  browser    String?
  duration   Int?     // time spent in seconds
  createdAt  DateTime @default(now())
}
```

**Key Indices:**
- `[page, entityId]` - Find views for specific entity
- `[createdAt]` - Time-based queries
- `[userId]` - User activity queries

### **2. DailyAnalytics**
Aggregated metrics per day for performance optimization.

```prisma
model DailyAnalytics {
  id             String   @id @default(uuid())
  date           DateTime @db.Date
  entityType     String   // 'article', 'university', 'group', 'site'
  entityId       String?  // null for site-wide
  pageViews      Int
  uniqueVisitors Int
  avgDuration    Float?
  bounceRate     Float?
  mobileViews    Int
  desktopViews   Int
  tabletViews    Int
  newVisitors    Int
  returningVisitors Int
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([date, entityType, entityId])
}
```

**Purpose:** Reduces query load by pre-aggregating daily metrics.

### **3. EngagementEvent**
Tracks user interactions (clicks, shares, likes, etc.).

```prisma
model EngagementEvent {
  id         String   @id @default(uuid())
  userId     String?
  sessionId  String
  eventType  String   // 'click', 'share', 'download', 'like', 'comment', 'save', 'compare'
  entityType String?
  entityId   String?
  metadata   Json?
  createdAt  DateTime @default(now())
}
```

### **4. SearchAnalytics**
Tracks search queries and results.

```prisma
model SearchAnalytics {
  id            String   @id @default(uuid())
  query         String
  userId        String?
  sessionId     String
  resultsCount  Int
  clickedResult String?
  page          String
  filters       Json?
  createdAt     DateTime @default(now())
}
```

### **5. TrafficSource**
Aggregates traffic by source (organic, social, referral, etc.).

```prisma
model TrafficSource {
  id         String   @id @default(uuid())
  date       DateTime @db.Date
  source     String   // 'direct', 'organic', 'social', 'referral', 'email', 'paid'
  medium     String?  // more specific (google, facebook, twitter, etc.)
  campaign   String?
  visits     Int
  pageViews  Int
  bounceRate Float?
  avgDuration Float?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([date, source, medium, campaign])
}
```

### **6. GeoAnalytics**
Geographic distribution of traffic.

```prisma
model GeoAnalytics {
  id          String   @id @default(uuid())
  date        DateTime @db.Date
  country     String
  city        String?
  visits      Int
  uniqueUsers Int
  pageViews   Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([date, country, city])
}
```

### **7. ArticleDetailedAnalytics**
Detailed metrics specifically for articles.

```prisma
model ArticleDetailedAnalytics {
  id               String   @id @default(uuid())
  articleId        String
  date             DateTime @db.Date
  impressions      Int      // times shown in lists
  clicks           Int      // clicks from lists
  readTime         Float?   // average read time in seconds
  scrollDepth      Float?   // scroll depth percentage
  socialShares     Json?    // { facebook: 0, twitter: 0, linkedin: 0 }
  conversionRate   Float?   // engagement percentage
  topReferrers     Json?    // top 5 referrer domains
  topCountries     Json?    // top 5 countries
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@unique([articleId, date])
}
```

### **8. UniversityAnalytics, GroupAnalytics, AuthorAnalytics**
Entity-specific analytics tables following similar patterns.

---

## Backend Services

### **AnalyticsTrackingService**

Handles real-time event collection:

```typescript
// Track page view
await AnalyticsTrackingService.trackPageView({
  page: 'article',
  entityId: articleId,
  sessionId: sessionId,
  userAgent: userAgent,
  // ... more fields
});

// Track engagement event
await AnalyticsTrackingService.trackEngagementEvent({
  eventType: 'share',
  sessionId: sessionId,
  entityType: 'article',
  entityId: articleId,
});

// Track search
await AnalyticsTrackingService.trackSearch({
  query: 'stanford tuition',
  sessionId: sessionId,
  resultsCount: 5,
  page: 'university_search',
});
```

**Key Methods:**
- `trackPageView()` - Record a page visit
- `updatePageViewDuration()` - Update time spent on page
- `trackEngagementEvent()` - Record clicks, shares, etc.
- `trackSearch()` - Record search queries
- `parseUserAgent()` - Extract device/browser info
- `parseReferrer()` - Identify traffic source

### **AnalyticsService**

Core analytics queries:

```typescript
// Get site overview
const overview = await AnalyticsService.getSiteOverview(dateRange);
// Returns: { totalPageViews, uniqueVisitors, avgSessionDuration, bounceRate, ... }

// Get time series data
const trend = await AnalyticsService.getPageViewsTimeSeries(dateRange, 'article');

// Get top performers
const topArticles = await AnalyticsService.getTopArticles(dateRange, limit);

// Get device breakdown
const devices = await AnalyticsService.getDeviceBreakdown(dateRange);

// Get traffic sources
const sources = await AnalyticsService.getTrafficSources(dateRange);

// Get real-time data
const realtime = await AnalyticsService.getRealTimeActiveUsers();
```

### **AdminAnalyticsService**

Admin-specific reports:

```typescript
// Get full dashboard data
const dashboard = await AdminAnalyticsService.getDashboardData(dateRange);
// Returns comprehensive dashboard with all metrics

// Get detailed analytics by entity type
const articles = await AdminAnalyticsService.getArticlesAnalytics(dateRange, page, limit);
const universities = await AdminAnalyticsService.getUniversitiesAnalytics(dateRange, page, limit);
const groups = await AdminAnalyticsService.getGroupsAnalytics(dateRange, page, limit);

// Get user activity
const users = await AdminAnalyticsService.getUserAnalytics(dateRange, page, limit);
```

### **UserAnalyticsService**

User-specific metrics for article authors:

```typescript
// Get author overview
const overview = await UserAnalyticsService.getAuthorOverview(userId, dateRange);

// Get articles analytics
const articles = await UserAnalyticsService.getAuthorArticlesAnalytics(
  userId, 
  dateRange, 
  page, 
  limit, 
  sortBy
);

// Get views trend
const trend = await UserAnalyticsService.getAuthorViewsTrend(userId, dateRange);

// Get best article
const best = await UserAnalyticsService.getBestPerformingArticle(userId);

// Get audience insights
const audience = await UserAnalyticsService.getAudienceInsights(userId, dateRange);
```

---

## API Endpoints

### **Tracking Endpoints (Public - No Auth)**

```
POST /api/analytics/track/pageview
Body: {
  page: string (required)
  entityId?: string
  entitySlug?: string
  sessionId: string (required)
  referrer?: string
  duration?: number
}
Response: { id: string }

PATCH /api/analytics/track/pageview/:id
Body: { duration: number }
Response: { status: 'success' }

POST /api/analytics/track/event
Body: {
  eventType: string (required)
  sessionId: string (required)
  entityType?: string
  entityId?: string
  metadata?: object
}
Response: { status: 'success' }

POST /api/analytics/track/search
Body: {
  query: string (required)
  sessionId: string (required)
  resultsCount?: number
  clickedResult?: string
  page: string (required)
  filters?: object
}
Response: { status: 'success' }
```

### **Admin Analytics Endpoints (Requires Admin Role)**

```
GET /api/admin/analytics/dashboard?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
Response: AdminDashboardData

GET /api/admin/analytics/overview?startDate=...&endDate=...
Response: OverviewMetrics

GET /api/admin/analytics/pageviews?startDate=...&endDate=...&entityType=...&entityId=...
Response: TimeSeriesData[]

GET /api/admin/analytics/top-performers?startDate=...&endDate=...&type=articles|universities|groups&limit=10
Response: TopPerformer[]

GET /api/admin/analytics/articles?startDate=...&endDate=...&page=1&limit=20
GET /api/admin/analytics/universities?startDate=...&endDate=...&page=1&limit=20
GET /api/admin/analytics/groups?startDate=...&endDate=...&page=1&limit=20

GET /api/admin/analytics/users?startDate=...&endDate=...&page=1&limit=20

GET /api/admin/analytics/devices?startDate=...&endDate=...
GET /api/admin/analytics/traffic-sources?startDate=...&endDate=...
GET /api/admin/analytics/geography?startDate=...&endDate=...&limit=10
GET /api/admin/analytics/search?startDate=...&endDate=...&limit=20
GET /api/admin/analytics/engagement?startDate=...&endDate=...
GET /api/admin/analytics/realtime
```

### **User Analytics Endpoints (Requires Authentication)**

```
GET /api/analytics/my/overview?startDate=...&endDate=...
Response: AuthorOverview

GET /api/analytics/my/articles?startDate=...&endDate=...&page=1&limit=10&sortBy=views|likes|engagement|date
Response: { data: ArticleAnalytics[], meta: PaginationMeta }

GET /api/analytics/my/views-trend?startDate=...&endDate=...
Response: ViewsTrendData[]

GET /api/analytics/my/best-article
Response: BestArticle | null

GET /api/analytics/my/audience?startDate=...&endDate=...
Response: AudienceInsights
```

---

## Frontend Implementation

### **Hooks**

#### `useAdminAnalytics.ts`
Admin dashboard data fetching with React Query:

```typescript
// Hook for dashboard
const { data, isLoading } = useAdminAnalyticsDashboard(dateRange);

// Hook for time series
const { data: trend } = usePageViewsTimeSeries(dateRange, entityType, entityId);

// Hook for top performers
const { data: articles } = useTopPerformers(dateRange, 'articles', 10);

// Hook for specific analytics
const { data: universities } = useUniversitiesAnalytics(dateRange, page, limit);
```

#### `useUserAnalytics.ts`
User-specific analytics:

```typescript
const { data: overview } = useMyAnalyticsOverview(dateRange);
const { data: articles } = useMyArticlesAnalytics(dateRange, page, limit, sortBy);
const { data: trend } = useMyViewsTrend(dateRange);
const { data: best } = useMyBestArticle();
const { data: audience } = useMyAudienceInsights(dateRange);
```

#### `useAnalyticsTracking.ts`
Client-side event tracking:

```typescript
const { trackPageView, trackEvent, trackSearch } = useAnalyticsTracking();

// Automatic tracking on page mount
usePageViewTracking('article', articleId, articleSlug);

// Manual event tracking
trackEvent({ 
  eventType: 'share', 
  entityType: 'article', 
  entityId: articleId 
});
```

### **Pages**

#### `AdminAnalyticsPage.tsx`
Comprehensive admin dashboard with:
- Overview metrics (views, visitors, session duration)
- Content statistics (articles, universities, groups, users)
- Page views time series chart
- Device breakdown (mobile/tablet/desktop)
- Real-time active users
- Top performers (articles, universities, groups)
- Engagement summary
- Search analytics
- Traffic source breakdown

#### `MyArticlesAnalyticsPage.tsx`
Author dashboard with:
- Overview metrics (views, likes, comments, engagement rate)
- Article status breakdown (published, drafts, pending)
- Views trend chart
- Best performing article
- Detailed articles table with sorting
- Audience insights (devices, countries, traffic sources)

---

## Usage Guide

### **For Admin Users**

1. Navigate to `/admin/analytics`
2. Select a date range (7d, 30d, 90d)
3. View comprehensive dashboard with:
   - Site-wide metrics
   - Top-performing content
   - User activity
   - Device and traffic analysis
   - Search insights

### **For Article Authors**

1. Navigate to `/dashboard/my-articles/analytics`
2. Select date range and sort option
3. View:
   - Article performance metrics
   - Individual article analytics
   - Audience insights
   - Traffic source breakdown

### **For Client-Side Tracking**

```typescript
// In any page component
import { usePageViewTracking, useEventTracking } from '@/hooks/useAnalyticsTracking';

export function ArticlePage({ id, slug }) {
  // Automatically track page view
  usePageViewTracking('article', id, slug);
  
  const trackEvent = useEventTracking();
  
  const handleShare = () => {
    trackEvent({ 
      eventType: 'share', 
      entityType: 'article', 
      entityId: id 
    });
    // ... sharing logic
  };
  
  return (
    // ... component
  );
}
```

---

## Integration Points

### **1. Article Pages**
- Track page views with `usePageViewTracking('article', articleId, slug)`
- Track engagement: likes, comments, shares
- Automatic duration tracking

### **2. University Pages**
- Track page views with `usePageViewTracking('university', universityId, slug)`
- Track saves, comparisons, website clicks

### **3. Group Pages**
- Track page views with `usePageViewTracking('group', groupId, slug)`
- Track university clicks

### **4. Search Pages**
- Use `trackSearch()` for search queries
- Captures results count and clicked results

### **5. Dashboard Links**
Add navigation to analytics:

```typescript
// In admin dashboard
<Link to="/admin/analytics">View Analytics</Link>

// In user dashboard
<Link to="/dashboard/my-articles/analytics">View Analytics</Link>
```

---

## Performance Considerations

### **Optimization Strategies**

1. **Aggregation:** `DailyAnalytics` table pre-aggregates data
2. **Indices:** Optimized indices on frequently queried columns
3. **Async Processing:** Event tracking happens asynchronously
4. **Caching:** React Query caches frequently accessed data
5. **Pagination:** Large datasets are paginated (20 items per page)
6. **Selective Fields:** Queries only fetch needed fields

### **Query Patterns**

- Real-time queries: `PageView` table (indexed by `createdAt`, `userId`)
- Historical reports: `DailyAnalytics` table (aggregated by date)
- Engagement tracking: `EngagementEvent` table (indexed by `eventType`, `createdAt`)

---

## Data Privacy & Security

1. **Anonymous Sessions:** Session IDs allow tracking without user IDs
2. **Optional User Tracking:** User analytics only tracked if user is authenticated
3. **GDPR Compliance:** No sensitive data is collected; IP geo-location not stored
4. **Admin Access:** All detailed analytics require admin role
5. **User Privacy:** Authors only see analytics for their own articles

---

## Future Enhancements

1. **Funnel Analysis:** Track user journeys through the platform
2. **Cohort Analysis:** Group users by signup date, behavior patterns
3. **Custom Segments:** Admin-defined user segments for analysis
4. **A/B Testing:** Track performance of different versions
5. **Alerts:** Notifications for unusual metrics
6. **Export Features:** CSV, Excel exports for reports
7. **Scheduled Reports:** Email reports sent periodically
8. **Custom Dashboards:** User-customizable analytics views

---

## Troubleshooting

### **Tracking Not Working**
1. Check browser console for errors
2. Verify session ID is being generated
3. Check network tab for failed API calls
4. Ensure `/analytics` endpoints are not blocked

### **Missing Historical Data**
- Analytics start from deployment date
- `DailyAnalytics` aggregation runs on first page view of the day
- Manual aggregation can be run via admin panel (future feature)

### **High Database Queries**
- Ensure indices are created (run `prisma db push`)
- Use `DailyAnalytics` for historical reports
- Implement response caching

---

## Deployment Checklist

- [ ] Run `prisma db push` to create new tables
- [ ] Add analytics routes to main router
- [ ] Add admin analytics page to App.tsx
- [ ] Add user analytics page to App.tsx
- [ ] Test tracking on development environment
- [ ] Verify admin endpoints require ADMIN role
- [ ] Test date range filtering
- [ ] Verify pagination works correctly
- [ ] Check real-time data updates (30s refresh)
- [ ] Monitor database growth (PageView table will grow)

---

## File Structure

```
server/
├── src/
│   ├── services/
│   │   ├── AnalyticsTrackingService.ts  (Event tracking)
│   │   ├── AnalyticsService.ts          (Core queries)
│   │   ├── AdminAnalyticsService.ts     (Admin reports)
│   │   └── UserAnalyticsService.ts      (User reports)
│   ├── controllers/
│   │   └── analyticsController.ts       (HTTP handlers)
│   ├── routes/
│   │   └── analytics.ts                 (Tracking routes)
│   ├── routes/
│   │   └── admin.ts                     (Admin analytics routes)
│   └── validation/
│       └── analyticsSchemas.ts          (Zod schemas)
├── prisma/
│   └── schema.prisma                    (Analytics models)

client/
├── src/
│   ├── hooks/
│   │   ├── useAdminAnalytics.ts        (Admin hooks)
│   │   ├── useUserAnalytics.ts         (User hooks)
│   │   └── useAnalyticsTracking.ts     (Tracking hook)
│   ├── pages/
│   │   ├── admin/
│   │   │   └── AdminAnalyticsPage.tsx
│   │   └── dashboard/
│   │       └── MyArticlesAnalyticsPage.tsx
│   └── App.tsx                         (Routes)
```

---

**Implementation Date:** December 10, 2025  
**Status:** ✅ Complete & Ready for Testing  
**Version:** 1.0.0
