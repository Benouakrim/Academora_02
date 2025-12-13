# Analytics Feature - Developer Quick Start

**Quick Reference for Developers Working with the Analytics System**

---

## 30-Second Overview

**What:** Comprehensive analytics system tracking article views, engagement, and performance.

**Where:**
- **Admin Dashboard:** `/admin/analytics` - site-wide metrics
- **Author Dashboard:** `/dashboard/my-articles/analytics` - personal article performance

**How it works:**
```
User Action → JavaScript Hook → API Endpoint → Database → Dashboard Display
```

---

## Common Tasks

### Task 1: Add Tracking to a New Page

```typescript
import { usePageViewTracking } from '@/hooks/useAnalyticsTracking';

export function MyNewPage() {
  // Auto-tracks page view on mount, duration on unmount
  usePageViewTracking('page-type', 'entity-id', 'entity-slug');
  
  return (
    // ... your component
  );
}
```

**Page Types:** `article`, `university`, `group`, `home`, `search`, etc.

---

### Task 2: Track a User Interaction

```typescript
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';

export function ArticleCard({ articleId }) {
  const { trackEvent } = useAnalyticsTracking();
  
  const handleShare = () => {
    trackEvent({
      eventType: 'share',
      entityType: 'article',
      entityId: articleId
    });
  };
  
  return (
    <button onClick={handleShare}>Share</button>
  );
}
```

**Event Types:** `click`, `share`, `download`, `like`, `comment`, `save`, `compare`

---

### Task 3: Query Analytics Data (Admin)

```typescript
import { useAdminAnalyticsDashboard } from '@/hooks/useAdminAnalytics';

export function MyAdminComponent() {
  const { data, isLoading } = useAdminAnalyticsDashboard({
    startDate: '2025-01-01',
    endDate: '2025-01-07'
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Page Views: {data.totalPageViews}</h2>
      <h2>Unique Visitors: {data.uniqueVisitors}</h2>
    </div>
  );
}
```

---

### Task 4: Query Analytics Data (User)

```typescript
import { useMyArticlesAnalytics } from '@/hooks/useUserAnalytics';

export function MyArticlesListComponent() {
  const { data, isLoading } = useMyArticlesAnalytics({
    startDate: '2025-01-01',
    endDate: '2025-01-07',
    page: 1,
    limit: 10,
    sortBy: 'views'
  });
  
  return (
    <table>
      {data?.data.map(article => (
        <tr key={article.id}>
          <td>{article.title}</td>
          <td>{article.views}</td>
          <td>{article.engagement}</td>
        </tr>
      ))}
    </table>
  );
}
```

---

### Task 5: Add an Admin Analytics Endpoint

**Backend (Express + Prisma):**

```typescript
// 1. Add to server/src/controllers/analyticsController.ts
export const myNewAnalyticsEndpoint = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await MyAnalyticsService.getMyMetrics({
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string)
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Add to server/src/routes/admin.ts
router.get('/analytics/my-endpoint', requireAdmin, analyticsController.myNewAnalyticsEndpoint);

// 3. Create query in server/src/services/AdminAnalyticsService.ts
static async getMyMetrics(dateRange: DateRange) {
  return prisma.pageView.aggregate({
    _count: true,
    _avg: { duration: true },
    where: {
      createdAt: {
        gte: dateRange.startDate,
        lte: dateRange.endDate
      }
    }
  });
}
```

**Frontend (React Query):**

```typescript
// 1. Add to client/src/hooks/useAdminAnalytics.ts
export function useMyNewMetrics(dateRange: DateRange) {
  return useQuery({
    queryKey: ['admin-analytics-my-metrics', dateRange],
    queryFn: () => api.get('/admin/analytics/my-endpoint', { params: dateRange }),
    enabled: !!dateRange.startDate
  });
}

// 2. Use in component
const { data } = useMyNewMetrics(dateRange);
```

---

## Database Queries Cheat Sheet

### Get Page Views for an Article

```typescript
// Raw Prisma query
const views = await prisma.pageView.count({
  where: {
    page: 'article',
    entityId: articleId
  }
});

// With time range
const viewsThisMonth = await prisma.pageView.count({
  where: {
    page: 'article',
    entityId: articleId,
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  }
});
```

### Get Engagement Events

```typescript
// Count by event type
const engagement = await prisma.engagementEvent.groupBy({
  by: ['eventType'],
  _count: true,
  where: {
    entityType: 'article',
    entityId: articleId
  }
});

// Get specific event type
const shares = await prisma.engagementEvent.count({
  where: {
    eventType: 'share',
    entityType: 'article',
    entityId: articleId
  }
});
```

### Get Daily Aggregated Data

```typescript
// Get daily stats
const dailyStats = await prisma.dailyAnalytics.findMany({
  where: {
    entityType: 'article',
    entityId: articleId,
    date: {
      gte: startDate,
      lte: endDate
    }
  },
  orderBy: { date: 'asc' }
});
```

---

## Date Range Patterns

**All analytics endpoints accept date ranges:**

```typescript
// 7 days
{ startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }

// Last 30 days
{ startDate: '2025-01-01', endDate: '2025-01-31' }

// Last 90 days
{ startDate: '2024-10-12', endDate: '2025-01-10' }
```

**Date Helper (Frontend):**

```typescript
const getLast7Days = () => {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  };
};
```

---

## API Response Formats

### Overview Metrics
```json
{
  "totalPageViews": 1250,
  "uniqueVisitors": 847,
  "avgSessionDuration": 120,
  "bounceRate": 0.35,
  "newVisitors": 342,
  "returningVisitors": 505
}
```

### Top Performers
```json
[
  {
    "id": "article-1",
    "title": "Article Title",
    "views": 500,
    "engagement": 120,
    "engagementRate": 0.24,
    "author": "John Doe"
  }
]
```

### Time Series Data
```json
[
  {
    "date": "2025-01-01",
    "views": 100,
    "uniqueVisitors": 75
  },
  {
    "date": "2025-01-02",
    "views": 120,
    "uniqueVisitors": 85
  }
]
```

---

## Common Errors & Solutions

### Error: "Cannot read property 'startDate' of undefined"
**Cause:** Missing date range in query
**Fix:** Always include startDate and endDate in API calls

### Error: "User is not authorized to access this resource"
**Cause:** Trying to access admin endpoint without admin role
**Fix:** Use `requireAdmin` middleware on routes

### Error: "No such table: PageView"
**Cause:** Database migration not run
**Fix:** Run `npx prisma migrate dev` in server directory

### Error: "sessionId is required"
**Cause:** Tracking endpoint called without sessionId
**Fix:** Ensure browser session is initialized (see `useAnalyticsTracking`)

---

## Performance Tips

### 1. Use Aggregated Data When Possible
```typescript
// ❌ SLOW - Counts all records
const total = await prisma.pageView.count({
  where: { entityId: articleId }
});

// ✅ FAST - Uses pre-aggregated data
const today = await prisma.dailyAnalytics.findUnique({
  where: {
    date_entityType_entityId: {
      date: new Date(),
      entityType: 'article',
      entityId: articleId
    }
  }
});
```

### 2. Add Date Filtering
```typescript
// ❌ SLOW - Scans all records
await prisma.pageView.findMany();

// ✅ FAST - Filtered by date
await prisma.pageView.findMany({
  where: {
    createdAt: { gte: startDate, lte: endDate }
  }
});
```

### 3. Use Pagination
```typescript
// ❌ SLOW - Returns all 10,000 records
const all = await prisma.pageView.findMany();

// ✅ FAST - Returns 20 records
const page = await prisma.pageView.findMany({
  skip: (pageNumber - 1) * 20,
  take: 20
});
```

---

## Testing Endpoints Locally

### Test Page View Tracking
```bash
curl -X POST http://localhost:5000/api/analytics/track/pageview \
  -H "Content-Type: application/json" \
  -d '{
    "page": "article",
    "entityId": "test-article",
    "sessionId": "test-session-123"
  }'
```

### Test Event Tracking
```bash
curl -X POST http://localhost:5000/api/analytics/track/event \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "share",
    "sessionId": "test-session-123",
    "entityType": "article",
    "entityId": "test-article"
  }'
```

### Test Admin Dashboard
```bash
curl -X GET "http://localhost:5000/api/admin/analytics/dashboard?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Code Examples by Entity Type

### Article Analytics
```typescript
// Track view
usePageViewTracking('article', article.id, article.slug);

// Track events
trackEvent({ eventType: 'like', entityType: 'article', entityId: article.id });
trackEvent({ eventType: 'share', entityType: 'article', entityId: article.id });
trackEvent({ eventType: 'comment', entityType: 'article', entityId: article.id });
```

### University Analytics
```typescript
usePageViewTracking('university', university.id, university.slug);
trackEvent({ eventType: 'save', entityType: 'university', entityId: university.id });
trackEvent({ eventType: 'compare', entityType: 'university', entityId: university.id });
```

### Group Analytics
```typescript
usePageViewTracking('group', group.id, group.slug);
trackEvent({ eventType: 'click', entityType: 'group', entityId: group.id });
```

---

## Next Steps

1. **Run Migration:** `npx prisma migrate dev --name add_analytics_models`
2. **Add Navigation Links:** Update sidebar components with analytics links
3. **Integrate Tracking:** Add `usePageViewTracking` to page components
4. **Test Locally:** Navigate to `/admin/analytics` and `/dashboard/my-articles/analytics`
5. **Deploy:** Follow deployment checklist in `ANALYTICS_NEXT_STEPS.md`

---

## Resources

- **Full Documentation:** `ANALYTICS_IMPLEMENTATION_GUIDE.md`
- **Next Steps:** `ANALYTICS_NEXT_STEPS.md`
- **Prisma Docs:** https://www.prisma.io/docs/
- **React Query Docs:** https://tanstack.com/query/latest

---

**Last Updated:** December 10, 2025  
**Version:** 1.0.0
