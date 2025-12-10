# Article Review System - Quick Reference Guide

## For Developers: Quick Setup & Testing

### Backend API Endpoints

```bash
# Get pending articles (admin only)
GET /api/articles/pending/list
Header: Authorization: Bearer {admin-token}
Response: { data: Article[] }

# Approve article (publishes it)
POST /api/articles/{articleId}/approve
Header: Authorization: Bearer {admin-token}
Response: { ...article, status: "PUBLISHED", publishedAt: now }

# Reject article
POST /api/articles/{articleId}/reject
Header: Authorization: Bearer {admin-token}
Body: { reason: "string" }
Response: { ...article, status: "REJECTED", rejectionReason: "string" }

# Get user's articles
GET /api/articles/mine/list
Header: Authorization: Bearer {user-token}
Response: { data: Article[] }

# Submit article for review
POST /api/articles/{articleId}/submit
Header: Authorization: Bearer {user-token}
Response: { ...article, status: "PENDING" }

# Create article
POST /api/articles
Header: Authorization: Bearer {user-token}
Body: { title, content, excerpt, slug, categoryId, ... }
Response: Article

# Update article
PUT /api/articles/{articleId}
Header: Authorization: Bearer {user-token}
Body: { ... updated fields ... }
Response: Article
```

### Frontend Routes

| Route | Component | Access | Purpose |
|-------|-----------|--------|---------|
| `/articles/new` | ArticleEditorLayout | User | Create new article |
| `/articles/:id` | ArticleEditorLayout | User (author) | Edit own article |
| `/admin/articles` | ArticlesList | Admin | View all articles |
| `/admin/articles/pending` | PendingArticlesPage | Admin | Review pending articles |
| `/admin/articles/new` | ArticleEditorLayout | Admin | Create article (admin mode) |
| `/admin/articles/:id` | ArticleEditorLayout | Admin | Edit any article |
| `/dashboard/my-articles` | MyArticlesPage | User | View own articles & status |
| `/blog/:slug` | ArticlePage | Public | View published article |

### Quick Test Commands

**Test admin can see pending articles:**
```bash
curl -H "Authorization: Bearer {admin-token}" \
  http://localhost:3001/api/articles/pending/list
```

**Test user can submit article:**
```bash
curl -X POST -H "Authorization: Bearer {user-token}" \
  -H "Content-Type: application/json" \
  -d '{"articleId": "{id}"}' \
  http://localhost:3001/api/articles/{id}/submit
```

**Test admin can approve:**
```bash
curl -X POST -H "Authorization: Bearer {admin-token}" \
  http://localhost:3001/api/articles/{id}/approve
```

**Test admin can reject:**
```bash
curl -X POST -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Needs revision"}' \
  http://localhost:3001/api/articles/{id}/reject
```

### Component Props

**PendingArticlesPage**
- No props (uses React Router hooks)
- Accesses:
  - `useNavigate()` - for routing
  - `useQuery` - fetch pending articles
  - `useMutation` - approve/reject

**MyArticlesPage**
- No props (uses React Router hooks)
- Accesses:
  - `useNavigate()` - for routing
  - `useQuery` - fetch user articles
  - `useUser()` - get current user

### Common Issues & Fixes

**Issue: Can't see pending articles (empty list)**
```
Check:
1. Is user an admin? (role check in database)
2. Are there articles with status='PENDING'?
3. Is token being sent correctly?
4. Is API URL correct?
```

**Issue: Approve button not working**
```
Check:
1. Is user an admin?
2. Does article exist?
3. Is article status actually PENDING?
4. Check browser console for API errors
```

**Issue: Rejection reason not saved**
```
Check:
1. Is reason field filled in modal?
2. Is rejectionReason sent in POST body?
3. Check API response - should have rejectionReason
4. Verify database field exists (SELECT rejectionReason FROM Article)
```

**Issue: "Max pending articles" error**
```
Fix:
1. User has 3+ pending articles
2. User must approve/publish one before submitting another
3. Or admin can approve one
4. Or user can delete draft if not needed
```

### Database Queries for Testing

**Check pending articles:**
```sql
SELECT id, title, status, authorId, createdAt 
FROM "Article" 
WHERE status = 'PENDING' 
ORDER BY createdAt ASC;
```

**Check rejected articles:**
```sql
SELECT id, title, status, rejectionReason, createdAt 
FROM "Article" 
WHERE status = 'REJECTED';
```

**Check a user's articles:**
```sql
SELECT id, title, status, createdAt 
FROM "Article" 
WHERE authorId = '{userId}' 
ORDER BY createdAt DESC;
```

**Count by status:**
```sql
SELECT status, COUNT(*) as count 
FROM "Article" 
GROUP BY status;
```

### Debugging Tips

**Enable API logging:**
```typescript
// In client/src/lib/api.ts
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.data)
    return response
  },
  error => {
    console.error('API Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)
```

**Check React Query cache:**
```typescript
// In browser console
import { QueryClient } from '@tanstack/react-query'
// The cache is in the QueryClient instance
// Check Network tab for API calls
```

**Verify Clerk token:**
```typescript
// In browser console
const token = await window.Clerk.session?.getToken()
console.log('Current token:', token)
```

### Performance Monitoring

**Slow API calls:**
1. Check Network tab in DevTools
2. Check server logs for slow queries
3. Use Prisma Studio: `npx prisma studio`

**Slow page loads:**
1. Check React DevTools Profiler
2. Check if useQuery is refetching unnecessarily
3. Check if dialogs are causing re-renders

### Deployment Checklist

- [ ] Backend compiles: `cd server && npx tsc --noEmit`
- [ ] Frontend builds: `cd client && npm run build`
- [ ] Database migrations run: `npx prisma migrate deploy`
- [ ] Clerk keys configured
- [ ] API URLs configured correctly
- [ ] Test endpoints with actual tokens
- [ ] Test workflows end-to-end
- [ ] Check browser console for errors
- [ ] Verify dark mode works
- [ ] Test on mobile viewport

### Key Files Reference

| File | Purpose | Changes |
|------|---------|---------|
| `server/src/routes/articles.ts` | Article API routes | ✏️ Fixed route ordering |
| `server/src/controllers/articleController.ts` | Endpoint logic | ✅ No changes (already correct) |
| `server/prisma/schema.prisma` | Database schema | ✅ No changes (fields exist) |
| `client/src/pages/admin/articles/PendingArticlesPage.tsx` | Admin review page | ✨ NEW |
| `client/src/pages/dashboard/MyArticlesPage.tsx` | User articles page | ✨ NEW |
| `client/src/App.tsx` | Route definitions | ✏️ Added 2 routes |
| `client/src/layouts/AdminLayout.tsx` | Admin navigation | ✏️ Added nav item |
| `client/src/layouts/DashboardLayout.tsx` | User navigation | ✏️ Added nav item |
| `client/src/lib/api.ts` | API client | ✅ No changes |

### Support Resources

- Full guide: `ARTICLE_REVIEW_SYSTEM_COMPLETE.md`
- Summary: `ARTICLE_REVIEW_SYSTEM_SUMMARY.md`
- Component comments in source files
- TypeScript types provide IDE hints
