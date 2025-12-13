# Article Review System Implementation Guide

**Status:** ✅ COMPLETE & PRODUCTION READY  
**Last Updated:** December 9, 2025  
**Version:** 1.0  

---

## Executive Summary

A comprehensive article submission and review system that manages the complete lifecycle of user article submissions from draft creation through admin review and publication. Includes role-based approval workflows, rejection handling, and scheduled deletion for repeatedly rejected articles.

**System Status: FULLY OPERATIONAL**
- ✅ Backend: 8 API endpoints fully functional
- ✅ Database: Complete schema with status tracking
- ✅ Frontend: 2 comprehensive UI pages for admin and authors
- ✅ Workflows: Full approval and rejection handling
- ✅ Validation: Form validation and authorization checks

---

## System Architecture

### Article Status Workflow

```
User Flow:
DRAFT → PENDING (user submits) 
  ├→ PUBLISHED (admin approves)
  ├→ REJECTED (admin rejects - hard limit)
  └→ NEEDS_REVISION (admin requests changes - soft feedback)
       └→ DRAFT (user can resubmit)

Admin Flow:
DRAFT/PENDING/PUBLISHED can all transition to any other status

Deletion Rules:
- After 3 hard REJECTIONS → Scheduled for deletion (3 days later)
- NEEDS_REVISION status does NOT count toward rejection limit
```

---

## Backend Implementation

### Database Schema

**Article Model Fields:**
```typescript
{
  id: String (UUID)
  title: String
  slug: String (unique)
  content: String
  excerpt: String?
  featuredImage: String?
  category: String
  tags: String[]
  
  // Author & Review Info
  authorId: String (FK to User)
  author: User
  reviewedById: String? (FK to User)
  reviewedBy: User?
  
  // Status & Workflow
  status: ArticleStatus (DRAFT | PENDING | PUBLISHED | REJECTED | NEEDS_REVISION | ARCHIVED)
  rejectionReason: String?
  rejectionCount: Integer (default: 0) - tracks hard rejections
  
  // Timestamps
  createdAt: DateTime
  updatedAt: DateTime
  publishedAt: DateTime?
  reviewedAt: DateTime?
  scheduledForDeletion: DateTime? - 3 days after 3rd rejection
}

// ArticleStatus Enum
enum ArticleStatus {
  DRAFT              // User is editing
  PENDING            // Submitted for admin review
  PUBLISHED          // Admin approved, visible to public
  REJECTED           // Admin rejected (counts toward limit)
  NEEDS_REVISION     // Admin requested changes (soft feedback, no limit)
  ARCHIVED           // Removed from active listings
}
```

### API Endpoints

**Public Endpoints (No Authentication):**
```
GET /api/articles
  - Get all published articles with pagination
  - Query params: page, limit, category, tag
  - Returns: { articles: Article[], total: number }

GET /api/articles/:slug
  - Get published article details
  - Returns full article if PUBLISHED
  - Returns 403 Forbidden if not PUBLISHED (unless user is author/admin)
  - Returns: Article

GET /api/articles/taxonomies
  - Get available categories and tags
  - Returns: { categories: string[], tags: string[] }
```

**User Endpoints (Authenticated):**
```
POST /api/articles
  - Create new article (DRAFT status)
  - Body: { title, slug, content, excerpt?, featuredImage?, category, tags }
  - Returns: Article (with DRAFT status)

POST /api/articles/:id
  - Update article (if author or admin)
  - Body: Partial article fields
  - Returns: Article (updated)

DELETE /api/articles/:id
  - Delete article (if author or admin)
  - Returns: 204 No Content

POST /api/articles/:id/submit
  - Submit article for review (changes DRAFT to PENDING)
  - Clears scheduled deletion if previously rejected
  - Returns: Article (with PENDING status)

GET /api/articles/mine/list
  - Get user's articles (all statuses visible to author)
  - Returns: Article[]
```

**Admin Endpoints (Role-Based Access):**
```
GET /api/articles/pending/list
  - Get all pending articles for review
  - Returns: Article[] (filtered by PENDING status)

POST /api/articles/:id/approve
  - Approve article (changes PENDING to PUBLISHED)
  - Sets publishedAt timestamp
  - Sets reviewedAt and reviewedById
  - Returns: Article (with PUBLISHED status)

POST /api/articles/:id/reject
  - Reject article (changes PENDING to REJECTED)
  - Increments rejectionCount
  - Sets rejectionReason from body
  - If rejectionCount >= 3: schedules deletion 3 days out
  - Sets reviewedAt and reviewedById
  - Returns: Article (with REJECTED status)

POST /api/articles/:id/needs-revision
  - Request revision (changes PENDING to NEEDS_REVISION)
  - Does NOT increment rejectionCount
  - Sets feedback reason
  - Returns: Article (with NEEDS_REVISION status)
```

---

## Frontend Implementation

### Admin Pages

**Pending Articles Management** (`/admin/articles/pending`)

**Features:**
- ✅ List all pending articles awaiting review
- ✅ Sort by submission date, author, category
- ✅ View article metadata (author, category, submission date)
- ✅ Preview button (opens article in new tab)
- ✅ Edit button (navigates to article editor)
- ✅ Approve button with confirmation
- ✅ Reject button with reason modal
- ✅ Needs Revision button with feedback modal
- ✅ Real-time list updates after action
- ✅ Toast notifications for success/error
- ✅ Responsive card-based design

**File:** `client/src/pages/admin/articles/PendingArticlesPage.tsx` (323 lines)

**Key Components:**
```typescript
// Article approval
handleApprove(articleId)
  → POST /api/articles/:id/approve
  → Invalidate queries
  → Show success toast

// Article rejection with reason
handleReject(articleId, reason)
  → POST /api/articles/:id/reject
  → Body: { rejectionReason: reason }
  → Show rejection count if >= 2
  → Warn about deletion if = 3

// Request revision (soft feedback)
handleNeedsRevision(articleId, feedback)
  → POST /api/articles/:id/needs-revision
  → Body: { feedback }
  → Does NOT count toward rejection limit
```

### Author Pages

**My Articles Dashboard** (`/dashboard/my-articles`)

**Features:**
- ✅ View all user's articles in one place
- ✅ Status tabs (All, Draft, Pending, Published, Rejected, Archived)
- ✅ Status statistics cards
- ✅ Color-coded status badges
- ✅ Rejection reason display with visual alert
- ✅ Scheduled deletion countdown (if applicable)
- ✅ Smart action buttons per status:
  - **DRAFT**: Edit, Delete, Submit
  - **PENDING**: Preview only (awaiting review)
  - **PUBLISHED**: Edit, View, Share, Archive
  - **REJECTED**: View rejection reason, Edit & Resubmit (if attempts < 3), Delete if scheduled
  - **NEEDS_REVISION**: View feedback, Edit & Resubmit, Delete
- ✅ Real-time list updates
- ✅ Responsive grid layout

**File:** `client/src/pages/dashboard/MyArticlesPage.tsx` (370 lines)

**Status Display:**
```typescript
// Visual feedback per status
DRAFT:            Gray badge - "In Progress"
PENDING:          Blue badge - "Under Review"
PUBLISHED:        Green badge - "Published"
NEEDS_REVISION:   Yellow badge - "Needs Revision"
REJECTED:         Red badge - "Rejected" + Reason + Deletion countdown
ARCHIVED:         Gray badge - "Archived"

// Rejection warning
If rejectionCount >= 2:
  Show warning: "1 more rejection will schedule deletion"
If scheduledForDeletion:
  Show countdown: "Scheduled for deletion in X days"
```

### Form Validation

**Article Editor** (`client/src/pages/articles/ArticleEditorLayout.tsx`)

**Validation Features:**
- ✅ Required field validation
- ✅ Error message display
- ✅ Submit button disabled state
- ✅ Form prevents submission if invalid
- ✅ Clear error messages guide users
- ✅ Success toast on submission
- ✅ Rejection history display
- ✅ Deletion warning if limit reached

---

## Workflow Examples

### Example 1: Basic Approval Workflow

```
1. Author writes article in /blog/new
2. Article created as DRAFT
3. Author clicks "Submit for Review"
   → Status: DRAFT → PENDING
   → Visible to admins in /admin/articles/pending
4. Admin reviews article
5. Admin clicks "Approve"
   → Status: PENDING → PUBLISHED
   → Article now visible to public
   → Author gets success notification
6. Article visible at /blog/{slug}
```

### Example 2: Rejection & Resubmission

```
1. Author submits article (PENDING)
2. Admin reviews, clicks "Reject"
   → Selects rejection reason
   → Status: PENDING → REJECTED
   → rejectionCount: 0 → 1
3. Author sees REJECTED status
4. Author fixes article, clicks "Resubmit"
   → Status: REJECTED → PENDING
   → rejectionCount remains 1
   → scheduledForDeletion cleared
5. Admin reviews again, approves
   → Status: PENDING → PUBLISHED
```

### Example 3: Deletion After Multiple Rejections

```
1. Author submits article
2. Admin rejects (reason: poor quality) - rejectionCount = 1
3. Author resubmits, admin rejects again - rejectionCount = 2
   → Show warning to author: "1 more rejection will schedule deletion"
4. Author resubmits, admin rejects third time - rejectionCount = 3
   → Status: PENDING → REJECTED
   → scheduledForDeletion: now + 3 days
   → Author sees: "Article scheduled for deletion in 3 days"
   → Article automatically deleted after 3 days
5. Author cannot resubmit after 3rd rejection
```

### Example 4: Needs Revision (Soft Feedback)

```
1. Author submits article
2. Admin reviews, minor formatting issues
3. Admin clicks "Needs Revision"
   → Sets feedback message
   → Status: PENDING → NEEDS_REVISION
   → rejectionCount: NOT incremented
4. Author sees "Needs Revision" with feedback
5. Author edits and clicks "Resubmit"
   → Status: NEEDS_REVISION → PENDING
6. Admin reviews, approves
   → Status: PENDING → PUBLISHED
   
Note: Multiple NEEDS_REVISION cycles allowed
      (doesn't count toward 3-rejection limit)
```

---

## Data Models & Types

### ArticleStatus Enum
```typescript
enum ArticleStatus {
  DRAFT              // Editing
  PENDING            // Awaiting admin review
  PUBLISHED          // Live & visible to public
  REJECTED           // Hard rejection (counts toward limit)
  NEEDS_REVISION     // Soft feedback (no limit)
  ARCHIVED           // Hidden from listings
}
```

### Error Responses

**403 Forbidden** - Unauthorized access
```typescript
{
  statusCode: 403,
  message: "You do not have permission to perform this action",
  code: "UNAUTHORIZED"
}
```

**404 Not Found** - Article not found
```typescript
{
  statusCode: 404,
  message: "Article not found",
  code: "NOT_FOUND"
}
```

**400 Bad Request** - Validation error
```typescript
{
  statusCode: 400,
  message: "Validation failed",
  code: "VALIDATION_ERROR",
  errors: { title: "Required", slug: "Must be unique" }
}
```

---

## Common Tasks

### For Admins

**Review Pending Articles:**
1. Navigate to `/admin/articles/pending`
2. Review article content by clicking "Preview"
3. Choose action:
   - Click "Approve" to publish immediately
   - Click "Reject" to request major changes (counts toward limit)
   - Click "Needs Revision" for minor feedback (no limit)

**View Rejection History:**
1. Click article to open details
2. See rejection count and reasons
3. See scheduled deletion date if applicable

### For Authors

**Submit Article for Review:**
1. Write article in `/blog/new`
2. Save as DRAFT
3. Click "Submit for Review" button
4. Status changes to PENDING
5. Check `/dashboard/my-articles` for review status

**Handle Rejection:**
1. See rejection reason in My Articles page
2. Edit article to address feedback
3. Click "Resubmit for Review"
4. Wait for admin review

**Handle Needs Revision:**
1. See feedback in My Articles page
2. Edit article based on feedback
3. Click "Resubmit" button
4. No need to wait for additional approval (faster feedback loop)

---

## Testing Checklist

- [x] DRAFT articles not visible to public (/blog/:slug returns 403)
- [x] PUBLISHED articles visible to all users
- [x] PENDING/REJECTED/NEEDS_REVISION visible only to author & admin
- [x] Admin can approve PENDING articles
- [x] Admin can reject PENDING articles with reason
- [x] Admin can request revision without counting toward limit
- [x] Rejection count increments on hard rejection
- [x] After 3 rejections, article scheduled for deletion
- [x] Author cannot resubmit after 3 rejections
- [x] Resubmission clears scheduledForDeletion
- [x] NEEDS_REVISION does not increment rejection count
- [x] Form validation prevents submission with missing required fields
- [x] Navigation links added to admin sidebar
- [x] Real-time updates after approval/rejection
- [x] Toast notifications show success/error

---

## Deployment Checklist

- [x] Database schema with rejection tracking
- [x] API endpoints implemented and tested
- [x] Frontend pages created
- [x] Navigation links added
- [x] Form validation implemented
- [x] Access control verified
- [x] Error handling implemented
- [x] Toast notifications working
- [x] Real-time updates via React Query
- [x] Documentation complete
- [x] Ready for production deployment

---

## Troubleshooting

### Issue: Can't resubmit article

**Cause:** Article already has 3 rejections
**Solution:** Article is scheduled for deletion; cannot resubmit. Wait for deletion or contact admin.

### Issue: Rejection count not incrementing

**Cause:** Using "Needs Revision" instead of "Reject"
**Solution:** Use "Reject" for hard rejections that count toward limit.

### Issue: Article visible to public but not published yet

**Cause:** Status is PUBLISHED but not intended
**Solution:** Check article status - should be PUBLISHED only after admin approval.

---

## File References

**Backend Files:**
- `server/src/controllers/articleController.ts` - Article endpoints (updated)
- `server/src/routes/articles.ts` - Route definitions (fixed ordering)
- `server/prisma/schema.prisma` - Database schema (updated with rejection tracking)

**Frontend Files:**
- `client/src/pages/admin/articles/PendingArticlesPage.tsx` - Admin review page
- `client/src/pages/dashboard/MyArticlesPage.tsx` - Author status page
- `client/src/pages/articles/ArticleEditorLayout.tsx` - Editor with validation
- `client/src/App.tsx` - Route definitions
- `client/src/layouts/AdminLayout.tsx` - Navigation updates

**Migration Files:**
- `server/prisma/migrations/20251209_add_article_rejection_tracking` - Schema updates

---

## Support & Questions

For detailed implementation questions, refer to:
- Backend logic in `articleController.ts` docstrings
- Frontend component docstrings in page files
- Database schema documentation in `schema.prisma`
