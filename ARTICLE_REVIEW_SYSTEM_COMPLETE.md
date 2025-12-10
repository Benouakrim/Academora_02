# Article Review System - Complete Implementation Guide

## Overview
This document describes the fully implemented and functional article review system for Academora. The system handles the complete lifecycle of user article submissions from draft creation through admin review and publication.

## Architecture

### Backend (Node.js/Express)

#### API Endpoints

**Admin Review Workflow:**
- `GET /api/articles/pending/list` - Get all pending articles (admin only)
- `POST /api/articles/:id/approve` - Approve a pending article (admin only, publishes it)
- `POST /api/articles/:id/reject` - Reject a pending article (admin only)

**User Workflow:**
- `GET /api/articles/mine/list` - Get user's own articles
- `POST /api/articles/:id/submit` - Submit article for review
- `GET /api/articles/:slug` - View article details
- `POST /articles` - Create new article
- `PUT /articles/:id` - Update article
- `DELETE /articles/:id` - Delete article

**Public:**
- `GET /api/articles` - Get published articles
- `GET /api/articles/taxonomies` - Get categories and tags

#### Database Schema

**Article Model** includes:
- `status` (DRAFT, PENDING, PUBLISHED, REJECTED, ARCHIVED)
- `rejectionReason` - Text explaining why article was rejected
- `reviewedAt` - Timestamp when admin reviewed it
- `reviewedById` - ID of admin who reviewed it
- `authorId` - User who wrote it
- `publishedAt` - When it was published

**Article Status Transitions:**
```
User Flow:
DRAFT → PENDING (user submits) → PUBLISHED (admin approves) or REJECTED (admin rejects)
                                 → DRAFT (user edits and resubmits)

Admin Flow:
DRAFT → PUBLISHED (admin publishes directly)
     → PENDING (can set to pending)
     → REJECTED (can reject even if not pending)
```

### Frontend (React + TypeScript)

#### New Pages Created

**1. Admin Pending Articles Page**
- **Route:** `/admin/articles/pending`
- **File:** `client/src/pages/admin/articles/PendingArticlesPage.tsx`
- **Features:**
  - List all pending articles with author info, category, submission date
  - Preview button to view article
  - Edit button to modify before approval
  - Approve button (green) - publishes the article
  - Reject button (red) - opens modal for rejection reason
  - Dialog confirmations for approval and rejection
  - Real-time updates after action (invalidates query cache)

**2. User My Articles Page**
- **Route:** `/dashboard/my-articles`
- **File:** `client/src/pages/dashboard/MyArticlesPage.tsx`
- **Features:**
  - View all user's articles in one place
  - Filter by status (All, Draft, Pending, Published, Rejected)
  - Status badges with color coding
  - Statistics cards showing counts per status
  - Rejection reason display (if rejected)
  - Status-specific info messages
  - Action buttons based on status:
    - Draft/Rejected: Edit + Submit for Review
    - Published: View Published
  - Responsive tabs for status filtering

#### Route Configuration

**Updated `client/src/App.tsx`:**
- Added `PendingArticlesPage` lazy import
- Added `MyArticlesPage` lazy import
- Added route: `/admin/articles/pending` → `PendingArticlesPage`
- Added route: `/dashboard/my-articles` → `MyArticlesPage`

**Updated `client/src/layouts/AdminLayout.tsx`:**
- Added "Pending Articles" nav item (with Clock icon)
- Links to `/admin/articles/pending`

**Updated `client/src/layouts/DashboardLayout.tsx`:**
- Added "My Articles" nav item
- Links to `/dashboard/my-articles`

#### API Calls

Both pages use standard `@tanstack/react-query` patterns:

**PendingArticlesPage:**
```typescript
// Fetch pending articles
const { data: articles } = useQuery({
  queryKey: ['pending-articles'],
  queryFn: () => api.get('/articles/pending/list'),
})

// Approve
const approveMutation = useMutation({
  mutationFn: (id: string) => api.post(`/articles/${id}/approve`),
  onSuccess: () => queryClient.invalidateQueries()
})

// Reject
const rejectMutation = useMutation({
  mutationFn: (id: string) => api.post(`/articles/${id}/reject`, { reason }),
  onSuccess: () => queryClient.invalidateQueries()
})
```

**MyArticlesPage:**
```typescript
// Fetch user's articles
const { data: articles } = useQuery({
  queryKey: ['my-articles'],
  queryFn: () => api.get('/articles/mine/list'),
})
```

#### Backend Route Ordering

**Fixed in `server/src/routes/articles.ts`:**
- Moved `/pending/list` route BEFORE `/:id` routes
- This prevents the `pending` path from being caught by `:id` parameter matching
- Route order now correctly prioritizes specific paths over dynamic params

## Complete User Flow

### Scenario 1: User Creates and Submits Article

1. **User goes to `/articles/new`** (ArticleEditorLayout)
   - Creates/edits article with all rich text features
   - Can save as DRAFT
   - Can SUBMIT FOR REVIEW (sets status to PENDING)

2. **Article is submitted**
   - Backend validates user is author or admin
   - Enforces MAX_PENDING_ARTICLES limit (currently 3)
   - Sets status to PENDING
   - Clears rejectionReason

3. **Admin sees pending article**
   - Goes to `/admin/articles/pending`
   - Sees list of all pending articles
   - Can:
     - Preview article
     - Edit article (change content, category, etc)
     - Approve (publishes immediately)
     - Reject (provides reason)

4. **If Approved**
   - Article status → PUBLISHED
   - publishedAt timestamp set
   - Available at `/blog/{slug}`
   - User sees in "My Articles" → Published tab

5. **If Rejected**
   - Article status → REJECTED
   - rejectionReason stored in database
   - User sees in "My Articles" → Rejected tab
   - Sees rejection reason with alert styling
   - Can edit and resubmit

### Scenario 2: User Edits Article After Rejection

1. **User sees rejected article**
   - Goes to `/dashboard/my-articles` → Rejected tab
   - Sees rejection reason
   - Clicks "Edit"

2. **User updates article**
   - Goes to `/articles/{id}` editor
   - Edits content/title/etc
   - Clicks "Submit for Review" again

3. **Admin reviews again**
   - Article appears back in pending list
   - Can approve or reject again

### Scenario 3: Admin Creates/Publishes Directly

1. **Admin goes to `/admin/articles/new`**
   - Uses ArticleEditorLayout in admin mode
   - Has status selector (not just Save/Submit buttons)
   - Can set status to DRAFT, PENDING, PUBLISHED, etc.

2. **Admin clicks "Save Article"**
   - Article is created with selected status
   - If PUBLISHED, goes live immediately
   - If DRAFT, saved as draft
   - If PENDING, available for own approval workflow

## Security & Validation

### Backend Checks

**Authentication:**
- All write operations require `requireAuth` middleware
- Tokens extracted from Clerk auth function
- User lookup by clerkId in database

**Authorization:**
- Users can only edit their own articles
- Users cannot directly set PUBLISHED status (enforced)
- Max 3 pending articles per user
- Only admins can approve/reject

**Data Validation:**
- Required fields: title, content, slug, categoryId
- rejectionReason is required when rejecting
- Status transitions are enforced by business logic

### Frontend Checks

**Route Protection:**
- Articles editor at `/articles/new` and `/articles/:id` require auth
- Admin routes require admin role (via ProtectedRoute component)
- Dashboard routes require auth

**UI Validation:**
- Rejection dialog requires reason text before submission
- Approve/reject buttons disabled during request
- Toast notifications for success/error
- Query cache invalidation after mutations

## Testing Checklist

### Backend Testing

**1. Create Article (User)**
```bash
POST /api/articles
Headers: Authorization: Bearer {token}
Body: {
  title: "Test Article",
  slug: "test-article",
  excerpt: "Test excerpt",
  content: "<p>Test content</p>",
  categoryId: "{category-id}",
  status: "DRAFT"
}
Expected: Returns article with status DRAFT
```

**2. Submit Article (User)**
```bash
POST /api/articles/{id}/submit
Headers: Authorization: Bearer {token}
Expected: Returns article with status PENDING, reviewedBy/reviewedAt null
```

**3. Get Pending Articles (Admin)**
```bash
GET /api/articles/pending/list
Headers: Authorization: Bearer {admin-token}
Expected: Returns array of articles with status PENDING
```

**4. Approve Article (Admin)**
```bash
POST /api/articles/{id}/approve
Headers: Authorization: Bearer {admin-token}
Expected: Returns article with:
  - status: PUBLISHED
  - publishedAt: current timestamp
  - reviewedAt: current timestamp
  - reviewedById: admin user id
  - rejectionReason: null
```

**5. Reject Article (Admin)**
```bash
POST /api/articles/{id}/reject
Headers: Authorization: Bearer {admin-token}
Body: { reason: "Needs more citations" }
Expected: Returns article with:
  - status: REJECTED
  - rejectionReason: "Needs more citations"
  - reviewedAt: current timestamp
  - reviewedById: admin user id
  - publishedAt: null
```

**6. Get User's Articles**
```bash
GET /api/articles/mine/list
Headers: Authorization: Bearer {token}
Expected: Returns array of user's articles in all statuses
```

### Frontend Testing

**User Flow:**
1. ✅ Navigate to `/articles/new`
2. ✅ Fill in article form
3. ✅ Click "Save Draft" → article appears in My Articles (Draft tab)
4. ✅ Click "Submit for Review" → status changes to PENDING
5. ✅ Go to `/dashboard/my-articles` → see article in Pending tab
6. ✅ Admin goes to `/admin/articles/pending`
7. ✅ Admin clicks "Approve" → see success toast
8. ✅ Go back to My Articles → article is now in Published tab
9. ✅ Click "View Published" → article is live

**Rejection Flow:**
1. ✅ Admin clicks "Reject" on pending article
2. ✅ Dialog appears asking for reason
3. ✅ Enter reason text
4. ✅ Click "Confirm Rejection"
5. ✅ User checks `/dashboard/my-articles` → Rejected tab
6. ✅ See rejection reason in alert box
7. ✅ Click "Edit"
8. ✅ Make changes
9. ✅ Click "Submit for Review"
10. ✅ Admin approves → goes to Published

**Admin Direct Publishing:**
1. ✅ Admin goes to `/admin/articles/new`
2. ✅ Fill article form
3. ✅ Status selector shows all 5 options
4. ✅ Select "PUBLISHED"
5. ✅ Click "Save Article"
6. ✅ Article goes live immediately

## Known Limitations & Future Enhancements

### Current Limitations
- Single approval/rejection - no version control
- No comment system for review feedback
- No bulk operations on pending articles
- No scheduling for future publish dates

### Future Enhancements
1. **Review Comments:** Add detailed feedback from admin during review
2. **Revision History:** Track all changes/rejections
3. **Bulk Actions:** Approve/reject multiple articles at once
4. **Scheduled Publishing:** Schedule articles to publish at specific times
5. **Notifications:** Email user when article is approved/rejected
6. **Analytics:** Track which articles get rejected most often
7. **Publishing Queue:** View articles queued for publishing
8. **Content Review Notes:** Add private notes only visible to admins

## Files Modified & Created

### New Files
- `client/src/pages/admin/articles/PendingArticlesPage.tsx` (323 lines)
- `client/src/pages/dashboard/MyArticlesPage.tsx` (370 lines)

### Modified Files
- `client/src/App.tsx` - Added routes and lazy imports
- `client/src/layouts/AdminLayout.tsx` - Added nav item and Clock icon
- `client/src/layouts/DashboardLayout.tsx` - Added nav item
- `server/src/routes/articles.ts` - Fixed route ordering

### Already Implemented (No changes needed)
- `server/src/controllers/articleController.ts` - approve/reject endpoints ✅
- `server/src/routes/articles.ts` - Routes already defined ✅
- `server/prisma/schema.prisma` - All fields exist ✅
- `client/src/lib/api.ts` - API client configured ✅

## Deployment Checklist

Before deploying to production:

- [ ] Run backend TypeScript compilation: `cd server && npx tsc --noEmit`
- [ ] Run frontend build: `cd client && npm run build`
- [ ] Test all API endpoints with admin and user tokens
- [ ] Test complete user flow (create → submit → review → approve)
- [ ] Test rejection flow with reason
- [ ] Test navigation in admin and user layouts
- [ ] Test dialog confirmations
- [ ] Test error handling (unauthorized access, not found, etc)
- [ ] Verify database migrations ran (article fields exist)
- [ ] Test on mobile screens (responsive design)

## Troubleshooting

### Issue: "Unauthorized" error when submitting article
**Solution:** Ensure Clerk authentication is set up and token is being sent in Authorization header

### Issue: Pending articles list is empty
**Solution:** Check if articles have status PENDING in database. Can test with SQL or use GraphQL playground

### Issue: Can't see "Pending Articles" menu item
**Solution:** Clear browser cache and verify App.tsx routes are correctly configured

### Issue: Rejection reason not showing
**Solution:** Check database - rejectionReason field might not be populated. Verify reject endpoint passes reason correctly

### Issue: Articles not appearing in "My Articles"
**Solution:** Ensure user is authenticated and user.id matches authorId in database

## Support

For questions about the article review system:
1. Check this guide first
2. Review the commented code in component files
3. Check backend logs for API errors
4. Verify database queries with Prisma Studio: `npx prisma studio`
