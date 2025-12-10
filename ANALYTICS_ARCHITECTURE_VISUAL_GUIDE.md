# Analytics System - Visual Architecture & Overview

**Purpose:** Comprehensive visual guide to understanding the analytics system

---

## 🏗️ System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React 18.2)                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────┐   ┌──────────────────────────────┐  │
│  │   Admin Analytics Page          │   │  User Analytics Page         │  │
│  │   (/admin/analytics)            │   │  (/dashboard/my-articles/)   │  │
│  │                                 │   │  analytics)                  │  │
│  │  • Overview stats               │   │  • Personal article metrics  │  │
│  │  • Content statistics           │   │  • Views trend               │  │
│  │  • Device breakdown             │   │  • Best article              │  │
│  │  • Traffic sources              │   │  • Audience insights         │  │
│  │  • Geographic distribution      │   │  • Articles table            │  │
│  │  • Search analytics             │   │  • Engagement summary        │  │
│  │  • Real-time users              │   │                              │  │
│  │  • Top performers               │   │                              │  │
│  └────────────┬────────────────────┘   └──────────────┬───────────────┘  │
│               │                                        │                   │
│               └──────────────────┬─────────────────────┘                   │
│                                  ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │              React Query Hooks (18 total)                            │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                      │  │
│  │  useAdminAnalytics (10 hooks)        useUserAnalytics (5 hooks)    │  │
│  │  ├─ useAdminAnalyticsDashboard      ├─ useMyAnalyticsOverview    │  │
│  │  ├─ usePageViewsTimeSeries          ├─ useMyArticlesAnalytics    │  │
│  │  ├─ useTopPerformers                ├─ useMyViewsTrend           │  │
│  │  ├─ useArticlesAnalytics            ├─ useMyBestArticle          │  │
│  │  ├─ useUniversitiesAnalytics        └─ useMyAudienceInsights     │  │
│  │  ├─ useGroupsAnalytics                                            │  │
│  │  ├─ useDeviceBreakdown              useAnalyticsTracking (3)     │  │
│  │  ├─ useTrafficSources               ├─ useAnalyticsTracking      │  │
│  │  ├─ useGeographicDistribution       ├─ usePageViewTracking       │  │
│  │  ├─ useEngagementSummary            └─ useSearchTracking         │  │
│  │  └─ useRealtimeData                                               │  │
│  │                                                                      │  │
│  └────────────────────────────────┬─────────────────────────────────────┘  │
│                                   │                                         │
└───────────────────────────────────┼─────────────────────────────────────────┘
                                    │
                        Axios HTTP Requests
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express.js + TypeScript)                       │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  analyticsController (27 functions)                                 │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                      │  │
│  │  Tracking Endpoints (Public, No Auth)      Admin Endpoints         │  │
│  │  ├─ trackPageView()                        ├─ getAdminDashboard   │  │
│  │  ├─ updatePageViewDuration()               ├─ getSiteOverview     │  │
│  │  ├─ trackEvent()                           ├─ getPageViewsTimeSeries
│  │  └─ trackSearch()                          ├─ getTopPerformers    │  │
│  │                                             ├─ getArticlesAnalytics
│  │  User Endpoints (Authenticated)            ├─ getUniversitiesAnalytics
│  │  ├─ getMyAnalyticsOverview()               ├─ getGroupsAnalytics  │  │
│  │  ├─ getMyArticlesAnalytics()               ├─ getUsersAnalytics   │  │
│  │  ├─ getMyViewsTrend()                      ├─ getDeviceBreakdown  │  │
│  │  ├─ getMyBestArticle()                     ├─ getTrafficSources   │  │
│  │  └─ getMyAudienceInsights()                ├─ getGeographicDistrib
│  │                                             ├─ getSearchAnalytics  │  │
│  │                                             ├─ getEngagementSummary
│  │                                             └─ getRealTimeData     │  │
│  │                                                                      │  │
│  └────────────────────────────┬─────────────────────────────────────────┘  │
│                               │                                             │
│  ┌────────────────────────────▼─────────────────────────────────────────┐  │
│  │  Service Layer (Business Logic)                                       │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │                                                                      │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │  AnalyticsTrackingService                                    │  │  │
│  │  │  ├─ trackPageView()        - Store individual page visits    │  │  │
│  │  │  ├─ updatePageViewDuration - Update time spent              │  │  │
│  │  │  ├─ trackEngagementEvent() - Record user interactions       │  │  │
│  │  │  ├─ trackSearch()          - Store search queries           │  │  │
│  │  │  ├─ parseUserAgent()       - Extract device/browser info   │  │  │
│  │  │  └─ parseReferrer()        - Identify traffic source        │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  │                                                                      │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │  AnalyticsService                                            │  │  │
│  │  │  ├─ getSiteOverview()      - Overall metrics & comparison   │  │  │
│  │  │  ├─ getPageViewsTimeSeries - Time-series data               │  │  │
│  │  │  ├─ getTopArticles()       - Top performing articles        │  │  │
│  │  │  ├─ getDeviceBreakdown()   - Mobile/tablet/desktop dist.   │  │  │
│  │  │  ├─ getTrafficSources()    - Organic/social/referral stats │  │  │
│  │  │  ├─ getGeographicDistribution() - Country/city breakdown    │  │  │
│  │  │  ├─ getSearchAnalytics()   - Top queries & zero-results     │  │  │
│  │  │  └─ getRealTimeActiveUsers - Users in last 30 minutes       │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  │                                                                      │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │  AdminAnalyticsService                                       │  │  │
│  │  │  ├─ getDashboardData()    - Comprehensive dashboard          │  │  │
│  │  │  ├─ getArticlesAnalytics - Detailed article metrics         │  │  │
│  │  │  ├─ getUniversitiesAnalytics - University page metrics      │  │  │
│  │  │  ├─ getGroupsAnalytics   - Group page metrics              │  │  │
│  │  │  ├─ getUserAnalytics     - User activity & engagement       │  │  │
│  │  │  ├─ getEngagementSummary - Comments, likes, shares, etc    │  │  │
│  │  │  └─ exportAnalyticsData  - CSV export functionality         │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  │                                                                      │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │  UserAnalyticsService                                        │  │  │
│  │  │  ├─ getAuthorOverview()   - Author's personal stats         │  │  │
│  │  │  ├─ getAuthorArticlesAnalytics - List with pagination       │  │  │
│  │  │  ├─ getAuthorViewsTrend   - Daily views over time           │  │  │
│  │  │  ├─ getBestPerformingArticle - Top article metrics          │  │  │
│  │  │  ├─ getAudienceInsights   - Device/geo/traffic breakdown    │  │  │
│  │  │  └─ getAuthorDailySummary - Yesterday vs today comparison   │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  │                                                                      │  │
│  └────────────────────────────┬─────────────────────────────────────────┘  │
│                               │                                             │
│  ┌────────────────────────────▼─────────────────────────────────────────┐  │
│  │  Data Access Layer (Prisma ORM)                                       │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │                                                                      │  │
│  │  Database Queries:                                                  │  │
│  │  ├─ prisma.pageView.create(), findMany(), aggregate()            │  │
│  │  ├─ prisma.dailyAnalytics.findUnique(), groupBy()                │  │
│  │  ├─ prisma.engagementEvent.create(), count()                     │  │
│  │  ├─ prisma.searchAnalytics.create(), findMany()                  │  │
│  │  ├─ prisma.trafficSource.aggregate()                             │  │
│  │  ├─ prisma.geoAnalytics.findMany()                               │  │
│  │  └─ prisma.[article|university|group|author]Analytics.queries()  │  │
│  │                                                                      │  │
│  │  Indices for Performance:                                           │  │
│  │  ├─ PageView: [page, entityId], [createdAt], [userId]           │  │
│  │  ├─ DailyAnalytics: [date], [entityType, entityId]              │  │
│  │  ├─ EngagementEvent: [eventType], [createdAt]                   │  │
│  │  └─ TrafficSource: [date, source, medium]                       │  │
│  │                                                                      │  │
│  └────────────────────────────┬─────────────────────────────────────────┘  │
│                               │                                             │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
                        SQL Queries (Neon)
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL + Neon)                             │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Core Tables:                  Analytics Tables:                           │
│  ├─ User                       ├─ PageView (per-visit tracking)          │
│  ├─ Article                    ├─ DailyAnalytics (aggregated daily)      │
│  ├─ University                 ├─ EngagementEvent (user interactions)    │
│  └─ UniversityGroup            ├─ SearchAnalytics (search queries)       │
│                                ├─ TrafficSource (attribution)             │
│                                ├─ GeoAnalytics (geographic)               │
│                                ├─ ArticleDetailedAnalytics                │
│                                ├─ UniversityAnalytics                     │
│                                ├─ GroupAnalytics                          │
│                                └─ AuthorAnalytics (daily summaries)       │
│                                                                             │
│  Key Performance Features:                                                 │
│  ├─ Optimized indices on frequently queried columns                       │
│  ├─ DailyAnalytics table aggregates data for historical queries          │
│  ├─ Connection pooling via Neon adapter                                  │
│  └─ Automatic scaling for production use                                 │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagrams

### Flow 1: Page View Tracking

```
User navigates to article
        │
        ▼
Component mounts
        │
        ▼
usePageViewTracking hook initializes
│
├─ Generate sessionId
├─ Capture page info (slug, ID)
└─ Capture user agent & referrer
        │
        ▼
POST /api/analytics/track/pageview
│
├─ Body: {
│    page: "article",
│    entityId: "123",
│    sessionId: "abc",
│    referrer: "google.com",
│    userAgent: "Mozilla..."
│  }
        │
        ▼
Backend receives request
│
├─ AnalyticsTrackingService.trackPageView()
│  ├─ Parse userAgent → device, browser
│  ├─ Parse referrer → traffic source
│  └─ Store in PageView table
        │
        ▼
Response: { id: "view-123" }
        │
        ▼
Store ID in component state
        │
        ▼
User leaves page
        │
        ▼
usePageViewTracking cleanup
│
├─ Capture duration
└─ Send PATCH /api/analytics/track/pageview/view-123
   └─ Body: { duration: 120 }
        │
        ▼
Backend updates PageView duration
        │
        ▼
Data available in:
├─ Real-time: PageView table
├─ Tomorrow: DailyAnalytics table
└─ Dashboard: Admin analytics page
```

### Flow 2: Engagement Event Tracking

```
User clicks "Share" button
        │
        ▼
handleShare() function called
        │
        ▼
trackEvent({
  eventType: 'share',
  sessionId: sessionId,
  entityType: 'article',
  entityId: articleId
})
        │
        ▼
POST /api/analytics/track/event
        │
        ▼
AnalyticsTrackingService.trackEngagementEvent()
        │
        ▼
Store in EngagementEvent table
        │
        ▼
Proceed with actual share action
        │
        ▼
Data aggregated in:
├─ AdminAnalyticsPage → Engagement Summary card
└─ MyArticlesAnalyticsPage → Engagement rate calculation
```

### Flow 3: Admin Dashboard Data Aggregation

```
Admin navigates to /admin/analytics
        │
        ▼
AdminAnalyticsPage component renders
        │
        ▼
useAdminAnalyticsDashboard({ startDate, endDate })
        │
        ▼
React Query sends: GET /api/admin/analytics/dashboard?startDate=...&endDate=...
        │
        ▼
analyticsController.getAdminDashboard()
        │
        ▼
AdminAnalyticsService.getDashboardData()
        │
        ├─ AnalyticsService.getSiteOverview()
        │  └─ Query: DailyAnalytics aggregate for date range
        │     └─ Calculate: views, visitors, avg duration, bounce rate
        │
        ├─ AnalyticsService.getPageViewsTimeSeries()
        │  └─ Query: DailyAnalytics grouped by date
        │     └─ Return: Daily data points for chart
        │
        ├─ AnalyticsService.getTopArticles()
        │  └─ Query: ArticleDetailedAnalytics ranked by views
        │     └─ Return: Top 10 articles with metrics
        │
        ├─ AnalyticsService.getDeviceBreakdown()
        │  └─ Query: DailyAnalytics sum mobile/tablet/desktop
        │     └─ Return: Device distribution percentages
        │
        ├─ AnalyticsService.getTrafficSources()
        │  └─ Query: TrafficSource grouped by source
        │     └─ Return: Organic, social, referral, direct counts
        │
        ├─ AnalyticsService.getRealTimeActiveUsers()
        │  └─ Query: PageView where createdAt > now - 30 min
        │     └─ Return: Count of active users
        │
        └─ All other analytics queries...
        │
        ▼
Response Object:
{
  overview: { totalPageViews, uniqueVisitors, ... },
  contentStats: { articles, universities, groups, ... },
  pageViews: [{ date, views, visitors }, ...],
  deviceBreakdown: { mobile: %, tablet: %, desktop: % },
  topArticles: [{ id, title, views, author }, ...],
  realtime: { activeUsers, topPages },
  ... more metrics
}
        │
        ▼
React Query caches response
        │
        ▼
AdminAnalyticsPage renders:
├─ Overview stats cards
├─ Content statistics
├─ Charts (line, pie)
├─ Top performers tables
├─ Engagement summary
├─ Search analytics
└─ Real-time display
```

---

## 🎯 Database Model Relationships

```
User (existing)
  │
  ├─── 1-to-many ──→ Article
  │                    │
  │                    ├─── 1-to-many ──→ PageView
  │                    ├─── 1-to-many ──→ ArticleDetailedAnalytics
  │                    ├─── 1-to-many ──→ DailyAnalytics
  │                    └─── 1-to-many ──→ EngagementEvent
  │
  ├─── 1-to-many ──→ University
  │                    │
  │                    ├─── 1-to-many ──→ PageView
  │                    ├─── 1-to-many ──→ UniversityAnalytics
  │                    ├─── 1-to-many ──→ DailyAnalytics
  │                    └─── 1-to-many ──→ EngagementEvent
  │
  ├─── 1-to-many ──→ UniversityGroup
  │                    │
  │                    ├─── 1-to-many ──→ PageView
  │                    ├─── 1-to-many ──→ GroupAnalytics
  │                    ├─── 1-to-many ──→ DailyAnalytics
  │                    └─── 1-to-many ──→ EngagementEvent
  │
  ├─── 1-to-many ──→ AuthorAnalytics
  │
  └─── 1-to-many ──→ PageView (userId nullable for anonymous)
       └─── 1-to-many ──→ EngagementEvent (userId nullable)

Other Analytics Tables (no direct relationships):
├─ SearchAnalytics (userId nullable)
├─ TrafficSource (global metrics)
└─ GeoAnalytics (global metrics)
```

---

## 📈 Query Performance Optimization

```
SLOW APPROACH ❌
┌─────────────────────────────┐
│ PageView table              │
│ (1M+ records)               │
│                             │
│ SELECT COUNT(*) as views    │
│ WHERE date > 7 days ago     │
│ AND entityId = 'article-1'  │
│                             │
│ Result: ~2-5 seconds        │
└─────────────────────────────┘

OPTIMIZED APPROACH ✅
┌─────────────────────────────┐
│ DailyAnalytics table        │
│ (365 records/year)          │
│                             │
│ SELECT SUM(pageViews)       │
│ WHERE date > 7 days ago     │
│ AND entityId = 'article-1'  │
│                             │
│ Result: ~100ms              │
└─────────────────────────────┘

RESULT: 20-50x faster for historical queries!
```

---

## 🔐 Access Control Matrix

```
┌──────────────────────────────────────────────────────────────┐
│              ACCESS CONTROL FOR ANALYTICS                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Public User (Anonymous)                                     │
│  ├─ ✅ POST /api/analytics/track/pageview (no auth)         │
│  ├─ ✅ POST /api/analytics/track/event (no auth)            │
│  ├─ ✅ POST /api/analytics/track/search (no auth)           │
│  ├─ ❌ GET /api/analytics/my/* (needs auth)                 │
│  └─ ❌ GET /api/admin/analytics/* (needs ADMIN role)        │
│                                                               │
│  Authenticated User (Article Author)                         │
│  ├─ ✅ All public endpoints (same as above)                 │
│  ├─ ✅ GET /api/analytics/my/overview                       │
│  ├─ ✅ GET /api/analytics/my/articles                       │
│  ├─ ✅ GET /api/analytics/my/views-trend                    │
│  ├─ ✅ GET /api/analytics/my/best-article                   │
│  ├─ ✅ GET /api/analytics/my/audience                       │
│  ├─ ⚠️  Can ONLY see own articles (enforced by service)     │
│  └─ ❌ GET /api/admin/analytics/* (needs ADMIN role)        │
│                                                               │
│  Admin User                                                   │
│  ├─ ✅ All public endpoints                                 │
│  ├─ ✅ All user endpoints (+ sees all users' data)          │
│  ├─ ✅ GET /api/admin/analytics/dashboard                   │
│  ├─ ✅ GET /api/admin/analytics/overview                    │
│  ├─ ✅ GET /api/admin/analytics/articles (all)              │
│  ├─ ✅ GET /api/admin/analytics/universities (all)          │
│  ├─ ✅ GET /api/admin/analytics/groups (all)                │
│  ├─ ✅ GET /api/admin/analytics/users (all)                 │
│  ├─ ✅ GET /api/admin/analytics/devices                     │
│  ├─ ✅ GET /api/admin/analytics/traffic-sources             │
│  ├─ ✅ GET /api/admin/analytics/geography                   │
│  ├─ ✅ GET /api/admin/analytics/search                      │
│  ├─ ✅ GET /api/admin/analytics/engagement                  │
│  ├─ ✅ GET /api/admin/analytics/realtime                    │
│  └─ ⚠️  Required middleware: requireAdmin                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Sample Dashboard Layouts

### Admin Dashboard (/admin/analytics)

```
┌─────────────────────────────────────────────────────────────┐
│ Analytics Dashboard          [7 days ▼] [30 days] [90 days] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Page Views   │ │ Unique Users │ │ Avg Duration │        │
│  │    12,500    │ │     8,450    │ │   2m 15s     │        │
│  │    +15.3%    │ │    +8.2%     │ │    +5.1%     │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  Articles    │ │ Universities │ │    Groups    │        │
│  │    1,250     │ │      85      │ │     42      │        │
│  │    +2.5%     │ │    +1.2%     │ │    +0.8%     │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ Page Views Over Time                                    │  │
│ │                                                         │  │
│ │   Views                                                 │  │
│ │   2000│        ╱╲                                       │  │
│ │   1500│      ╱  ╲    ╱╲                                │  │
│ │   1000│    ╱      ╲╱  ╲    ╱╲      ╱╲                 │  │
│ │    500│  ╱            ╲╱    ╲╱  ╲╱  ╲╱╲               │  │
│ │      └──────────────────────────────────               │  │
│ │        Day 1  Day 3  Day 5  Day 7                       │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                               │
│ ┌──────────────────┐ ┌──────────────────────┐              │
│ │ Device Breakdown │ │ Real-time: 45 Users  │              │
│ │ Desktop: 65%     │ │ Top Pages:           │              │
│ │ Mobile:  30%     │ │ 1. Article X (12)    │              │
│ │ Tablet:   5%     │ │ 2. University Y (8)  │              │
│ └──────────────────┘ └──────────────────────┘              │
│                                                               │
│ Top Performing Articles                                     │
│ ┌────────────┬────────┬────────┬────────────┐              │
│ │ Title      │ Views  │ Likes  │ Engagement │              │
│ ├────────────┼────────┼────────┼────────────┤              │
│ │ Article 1  │ 2,450  │   340  │    13.9%   │              │
│ │ Article 2  │ 1,890  │   285  │    15.1%   │              │
│ │ Article 3  │ 1,650  │   198  │    12.0%   │              │
│ └────────────┴────────┴────────┴────────────┘              │
│                                                               │
│ Search Queries                                              │
│ ┌────────────────────────┬────────────────────┐             │
│ │ Query                  │ Results Count      │             │
│ ├────────────────────────┼────────────────────┤             │
│ │ stanford tuition       │       125          │             │
│ │ harvard scholarships   │       89           │             │
│ │ mit engineering        │       0 ⚠️          │             │
│ └────────────────────────┴────────────────────┘             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### User Analytics Dashboard (/dashboard/my-articles/analytics)

```
┌─────────────────────────────────────────────────────────────┐
│ My Articles Analytics       [7 days ▼] [30 days] [90 days] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │    Views     │ │    Likes     │ │  Comments    │        │
│  │     3,450    │ │      567     │ │      89      │        │
│  │    +22.5%    │ │   +18.3%     │ │   +12.1%     │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                               │
│  ┌──────────────┐ ┌──────────────┐                          │
│  │    Shares    │ │ Engagement %  │                          │
│  │      234     │ │    18.5%      │                          │
│  │   +15.2%     │ │   +2.3%       │                          │
│  └──────────────┘ └──────────────┘                          │
│                                                               │
│ Article Status                                              │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ Published    │ │  Drafts      │ │   Pending    │        │
│ │    12       │ │      3       │ │      2       │        │
│ └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                               │
│ Views Over Time                                             │
│ │                                                         │  │
│ │   500│         ╱╲                                       │  │
│ │   400│       ╱  ╲    ╱╲                                │  │
│ │   300│     ╱      ╲╱  ╲    ╱╲      ╱╲                │  │
│ │   200│   ╱            ╲╱    ╲╱  ╲╱  ╲╱╲              │  │
│ │   100│ ╱                                ╲╱           │  │
│ │     └──────────────────────────────────────           │  │
│ │       Day 1  Day 3  Day 5  Day 7                      │  │
│ │                                                        │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                               │
│ Best Performing Article                                     │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ "Why AI Will Change Education"                       │  │
│ │ Views: 5,234  |  Likes: 892  |  Comments: 145       │  │
│ │ Engagement Rate: 24.5%  |  Avg Read Time: 4m 32s     │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                               │
│ My Articles                                                 │
│ ┌──────────────┬─────────┬────────┬──────────┬────────┐   │
│ │ Title        │ Views ▼ │ Likes  │ Comments │ Status │   │
│ ├──────────────┼─────────┼────────┼──────────┼────────┤   │
│ │ Article 1    │ 2,450   │   340  │    65    │ ✓Pub   │   │
│ │ Article 2    │ 1,234   │   185  │    34    │ ✓Pub   │   │
│ │ Article 3    │   890   │    98  │    12    │ ⏱Pend  │   │
│ │ Article 4    │   567   │    64  │    8     │ 🗒Draft │   │
│ └──────────────┴─────────┴────────┴──────────┴────────┘   │
│                                                               │
│ Audience Insights                                           │
│ ┌──────────────────┐ ┌──────────────────────┐              │
│ │ Device Usage     │ │ Top Countries        │              │
│ │ Desktop: 65%     │ │ 1. USA (45%)        │              │
│ │ Mobile:  30%     │ │ 2. Canada (20%)     │              │
│ │ Tablet:   5%     │ │ 3. UK (15%)         │              │
│ └──────────────────┘ └──────────────────────┘              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 State Management Flow

```
React Component State
        │
        ▼
┌─────────────────────────────┐
│ useState Hooks              │
│ ├─ dateRange                │
│ ├─ selectedPage             │
│ ├─ sortBy                   │
│ └─ filters                  │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ useEffect Triggers          │
│ (When dependencies change)  │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ React Query Hook            │
│ useQuery({                  │
│   queryKey: [deps],         │
│   queryFn: async () => {...}│
│ })                          │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Axios HTTP Request          │
│ GET /api/analytics/...      │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Backend Processing          │
│ (Controller → Service)      │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Database Query              │
│ (Prisma → PostgreSQL)       │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Response Returned           │
│ { data, status }            │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ React Query Caches          │
│ (Auto-refetch on interval)  │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Component Re-renders        │
│ With new data               │
└────────────┬────────────────┘
             │
             ▼
        Display Updated UI
```

---

**Version:** 1.0.0  
**Date:** December 10, 2025
