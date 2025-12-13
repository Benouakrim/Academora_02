# Analytics Feature - Next Steps Checklist

**Status:** Core implementation ✅ COMPLETE | Integration ⏳ PENDING

---

## Immediate Action Items (Priority Order)

### 1. ✅ COMPLETED - Backend Implementation
- [x] Prisma schema with 10 analytics models
- [x] AnalyticsTrackingService for event collection
- [x] AnalyticsService for core queries
- [x] AdminAnalyticsService for admin reports
- [x] UserAnalyticsService for author analytics
- [x] analyticsController with 27 endpoints
- [x] Validation schemas (Zod)
- [x] API routes (tracking & analytics)

### 2. ✅ COMPLETED - Frontend Implementation
- [x] useAdminAnalytics hook (10 hooks)
- [x] useUserAnalytics hook (5 hooks)
- [x] useAnalyticsTracking hook (3 hooks + utilities)
- [x] AdminAnalyticsPage component
- [x] MyArticlesAnalyticsPage component
- [x] App.tsx routing setup

### 3. ⏳ TODO - Navigation Integration
**Estimated Time:** 15 minutes

**Action Items:**
- [ ] Update admin sidebar to include "Analytics" link
  - File: `client/src/layouts/AdminLayout.tsx` or `client/src/components/layout/AdminSidebar.tsx`
  - Add: `<Link to="/admin/analytics">Analytics</Link>`
  
- [ ] Update dashboard sidebar to include "Analytics" link
  - File: `client/src/layouts/DashboardLayout.tsx` or `client/src/components/layout/DashboardSidebar.tsx`
  - Add: `<Link to="/dashboard/my-articles/analytics">Analytics</Link>` under "My Articles" section

**Files to Check:**
```bash
# Find sidebar components
find client/src -name "*Sidebar*" -o -name "*Layout*" | grep -E "(Admin|Dashboard)"
```

### 4. ⏳ TODO - Tracking Integration
**Estimated Time:** 30 minutes

**Action Items:**
- [ ] Add tracking to Article pages (`/blog/:slug`)
  - Import: `usePageViewTracking`
  - Call: `usePageViewTracking('article', articleId, slug)`
  - Track events: likes, shares, comments

- [ ] Add tracking to University pages
  - Call: `usePageViewTracking('university', universityId, slug)`
  - Track: saves, comparisons, website clicks

- [ ] Add tracking to Group pages
  - Call: `usePageViewTracking('group', groupId, slug)`
  - Track: university link clicks

- [ ] Add tracking to Search pages
  - Import: `useAnalyticsTracking`
  - Use: `trackSearch()` method

**Files to Modify:**
```
client/src/pages/ (find article, university, group pages)
client/src/components/ (find engagement action handlers)
```

### 5. ⏳ TODO - Database Migration
**Estimated Time:** 5 minutes

**Commands to Run:**
```bash
# From server directory
cd server

# Create migration
npx prisma migrate dev --name add_analytics_models

# Or if using Neon (production)
npx prisma migrate deploy

# Verify schema
npx prisma studio  # Opens visual DB editor
```

**Important:** Run this BEFORE the changes go to production.

### 6. ⏳ TODO - Testing
**Estimated Time:** 30 minutes

**Manual Testing Checklist:**
- [ ] Navigate to `/admin/analytics` (admin only)
  - [ ] Verify date range selector works
  - [ ] Verify charts render
  - [ ] Verify pagination works
  - [ ] Check console for errors

- [ ] Navigate to `/dashboard/my-articles/analytics` (user logged in)
  - [ ] Verify personal metrics display
  - [ ] Verify article list loads
  - [ ] Verify sorting works
  - [ ] Check console for errors

- [ ] Verify tracking works
  - [ ] Open developer tools → Network tab
  - [ ] Navigate to article page
  - [ ] Look for POST to `/api/analytics/track/pageview`
  - [ ] Verify data is sent correctly
  - [ ] Wait for page to leave, check PATCH request for duration

- [ ] Test engagement events
  - [ ] Like an article → check POST `/api/analytics/track/event`
  - [ ] Share an article → check event tracking
  - [ ] Comment on article → check event tracking

---

## Optional - Enhanced Features

### Analytics Export (Future)
- Add CSV export button to admin dashboard
- Modify `AdminAnalyticsService.exportAnalyticsData()`
- Create `/api/admin/analytics/export?format=csv|excel`

### Scheduled Reports (Future)
- Create job that runs daily
- Sends email reports to admin
- Use: `node-schedule` or similar

### Custom Alerts (Future)
- Admin can set thresholds for metrics
- Alerts when metrics exceed thresholds
- Example: "Alert if article views drop by 50%"

---

## Quick Command Reference

```bash
# Navigate to server directory
cd server

# Run Prisma migrations
npx prisma migrate dev --name add_analytics_models

# View database in Prisma Studio
npx prisma studio

# Reset database (DEVELOPMENT ONLY!)
npx prisma migrate reset

# Check Prisma status
npx prisma migrate status

# Generate Prisma client
npx prisma generate
```

---

## Important Notes

### Access Control
- ✅ Admin analytics require `ADMIN` role
- ✅ User analytics require authentication
- ✅ Tracking endpoints are public (no auth needed)
- ✅ Users only see their own article analytics

### Performance
- PageView queries are real-time (might be slow for large datasets)
- DailyAnalytics table stores aggregated data (fast for historical queries)
- Pagination: 20 items per page for all analytics tables
- Refresh intervals: 60s for admin dashboard, 30s for real-time data

### Browser DevTools Testing
```javascript
// In browser console, manually trigger tracking
const sessionId = sessionStorage.getItem('analyticsSessionId') || crypto.randomUUID();
sessionStorage.setItem('analyticsSessionId', sessionId);

// Test page view tracking
fetch('/api/analytics/track/pageview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    page: 'article',
    entityId: 'test-id',
    sessionId: sessionId
  })
});

// Test event tracking
fetch('/api/analytics/track/event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'share',
    sessionId: sessionId,
    entityType: 'article',
    entityId: 'test-id'
  })
});
```

---

## File Locations Reference

**Backend Files Created/Modified:**
```
✅ server/prisma/schema.prisma
✅ server/src/services/AnalyticsTrackingService.ts
✅ server/src/services/AnalyticsService.ts
✅ server/src/services/AdminAnalyticsService.ts
✅ server/src/services/UserAnalyticsService.ts
✅ server/src/controllers/analyticsController.ts
✅ server/src/routes/analytics.ts
✅ server/src/routes/admin.ts (modified)
✅ server/src/validation/analyticsSchemas.ts
✅ server/src/routes.ts (modified)
```

**Frontend Files Created/Modified:**
```
✅ client/src/hooks/useAdminAnalytics.ts
✅ client/src/hooks/useUserAnalytics.ts
✅ client/src/hooks/useAnalyticsTracking.ts
✅ client/src/pages/admin/AdminAnalyticsPage.tsx
✅ client/src/pages/dashboard/MyArticlesAnalyticsPage.tsx
✅ client/src/App.tsx (modified)
```

**Next Files to Modify:**
```
⏳ client/src/layouts/AdminLayout.tsx (or sidebar component)
⏳ client/src/layouts/DashboardLayout.tsx (or sidebar component)
⏳ client/src/pages/blog/*.tsx (article pages)
⏳ client/src/pages/university/*.tsx (university pages)
⏳ client/src/pages/groups/*.tsx (group pages)
⏳ client/src/pages/search/*.tsx (search pages)
```

---

## Deployment Preparation

### Pre-Deployment Checklist
- [ ] Run Prisma migration in staging environment
- [ ] Test all analytics endpoints on staging
- [ ] Verify admin access control works
- [ ] Load test with Neon database
- [ ] Check error logs
- [ ] Backup production database
- [ ] Review performance metrics

### Production Deployment Steps
```bash
# 1. Create migration
npm run migrate:dev --name add_analytics_models

# 2. Build frontend & backend
npm run build

# 3. Deploy to Render (or your hosting)
# Push to git → automatic deployment

# 4. Run migration on production
npx prisma migrate deploy

# 5. Verify endpoints
curl https://your-domain.com/api/analytics/track/pageview
```

---

## Support & Documentation

- **Main Guide:** `ANALYTICS_IMPLEMENTATION_GUIDE.md`
- **API Documentation:** See API Endpoints section in implementation guide
- **Database Schema:** See Database Models section in implementation guide
- **Code Examples:** See Usage Guide section in implementation guide

---

**Status Summary:**
- ✅ Core feature: 100% complete
- ✅ Backend: 100% complete
- ✅ Frontend pages: 100% complete
- ✅ Routing: 100% complete
- ⏳ Navigation integration: Pending (15 min)
- ⏳ Tracking integration: Pending (30 min)
- ⏳ Database migration: Pending (5 min)
- ⏳ Testing: Pending (30 min)

**Total Time to Full Completion:** ~80 minutes

---

Last Updated: December 10, 2025
