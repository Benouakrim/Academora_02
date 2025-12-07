# Article Editor Unification - Testing Guide

## Quick Verification Steps

### 1. **Route Access** (Should all load `ArticleEditorLayout`)

```bash
# Terminal: Start the dev server
npm run dev
```

Then visit in browser:

```
✅ /articles/new           → User create (no id, no status dropdown)
✅ /articles/1             → User edit (has id, no status dropdown)
✅ /admin/articles/new     → Admin create (no id, has status dropdown)
✅ /admin/articles/1       → Admin edit (has id, has status dropdown)

❌ /blog/write             → Should redirect or show 404 (old route, no longer exists)
❌ /admin/articles/edit/1  → Should redirect or show 404 (old URL pattern)
```

---

### 2. **Feature Availability** (All users should see these)

#### Performance Panel
- [ ] Title → updates performance score in real-time
- [ ] Content → updates word count, reading time, keyword density
- [ ] Shows SEO score (0-100)
- [ ] Shows readability suggestions

#### Competitor Comparison
- [ ] Dropdown shows top 5 competitors
- [ ] Shows metrics: title length, word count, sentiment
- [ ] Compares current article vs selected competitor
- [ ] Updates when you change title/content

#### Title Simulator
- [ ] Shows current title performance
- [ ] Can test alternate titles
- [ ] Shows predicted CTR/engagement
- [ ] Updates vs competitor data

#### ROI Calculator
- [ ] Shows estimated engagement
- [ ] Shows estimated reach
- [ ] Shows predicted conversion rate
- [ ] Updates with content changes

---

### 3. **Form Behavior**

#### Both Modes (User & Admin)
- [ ] Title field required
- [ ] Slug auto-generates from title
- [ ] Excerpt optional
- [ ] Category selector works
- [ ] Featured image upload works
- [ ] Content editor loads with all blocks
- [ ] SEO fields (meta, keywords, OG image) optional
- [ ] Auto-save triggers every 30 seconds

#### User Mode Only (`/articles/*`)
- [ ] "Save Draft" button visible
- [ ] "Submit for Review" button visible
- [ ] Status dropdown NOT visible
- [ ] Clicking "Save Draft" → status: DRAFT
- [ ] Clicking "Submit for Review" → status: PENDING
- [ ] Cannot see other users' articles

#### Admin Mode Only (`/admin/articles/*`)
- [ ] Status dropdown visible
- [ ] Status options: DRAFT, PENDING, REJECTED, PUBLISHED, ARCHIVED
- [ ] Can select any status directly
- [ ] "Publish" button visible
- [ ] Can see all articles (user and admin created)
- [ ] Can edit any article

---

### 4. **Editor Features** (All modes)

```
Slash Commands:
/c     → Checklist
/q     → Quiz
/t     → Timeline
/s     → Step Guide
/col   → Collapsible
/tab   → Tabs
/comp  → Comparison
/calc  → Calculator
/cta   → Call-to-Action
/img   → Image (built-in)
```

- [ ] Type `/` → block library menu appears
- [ ] Type `/checklist` → creates checklist block
- [ ] Type `/quiz` → creates quiz block
- [ ] All 9 CMS blocks available
- [ ] Click "Add Block" button → opens block library menu
- [ ] Can undo/redo (Ctrl+Z / Ctrl+Y)

---

### 5. **Auto-save** (Draft articles only)

#### Setup
1. Navigate to `/articles/new` (user mode)
2. Fill in title, excerpt, category
3. Add some content
4. Wait 30 seconds without saving

#### Verification
- [ ] Status says "DRAFT"
- [ ] After 30 seconds, article should auto-save
- [ ] Toast notification: "Draft saved" (check browser console if not visible)
- [ ] Refresh page → data still there
- [ ] For published articles → auto-save should NOT trigger

---

### 6. **SEO Metadata**

- [ ] "Meta Title" field accepts up to 60 characters
- [ ] "Meta Description" field accepts up to 160 characters
- [ ] "Focus Keyword" field for main optimization target
- [ ] "OG Image" URL field for social sharing
- [ ] "Canonical URL" field for duplicate management
- [ ] All fields are optional (not required)
- [ ] Values persist on page refresh

---

### 7. **Form Validation**

#### Submit User Article (`/articles/new`)
```javascript
Valid:
✅ title: "My Article"
✅ categoryId: "some-id"
✅ content: (anything)
✅ metaDescription: "optional"

Invalid:
❌ Missing title
❌ Missing category
❌ Missing content (empty editor)
```

#### Submit Admin Article (`/admin/articles/new`)
```javascript
Same validation as user, plus:
✅ Any status can be selected (DRAFT, PUBLISHED, ARCHIVED, etc.)
```

---

### 8. **Prediction History** (Existing articles only)

#### Setup
1. Navigate to `/articles/1` (existing article with id=1)
2. Scroll to "Prediction History" section
3. Make a change to the title or content

#### Verification
- [ ] History shows "Current" prediction
- [ ] History shows "Previous" predictions (if any)
- [ ] Each prediction shows timestamp
- [ ] Clicking on history item shows that version's metrics
- [ ] "New Prediction" button available
- [ ] Prediction score updates when you click "New Prediction"

---

### 9. **Navigation Links**

Check that all links still work:

- [ ] Navbar: "Write Article" → `/articles/new`
- [ ] Navbar: "Dashboard" → `/dashboard`
- [ ] ActivityFeed: "Write Article" → `/articles/new`
- [ ] ArticlesList (admin): Edit button → `/admin/articles/:id`
- [ ] ArticlePage: "Edit" button (yours) → `/articles/:id`
- [ ] ArticlePage: "Edit" button (admin) → `/admin/articles/:id`

---

### 10. **No Breaking Changes**

- [ ] API calls still work (no 400/500 errors)
- [ ] No console errors (red ❌)
- [ ] No TypeScript errors (compilation passing)
- [ ] No missing images/assets
- [ ] Styling looks correct (no broken CSS)

---

## Test Scenarios

### Scenario 1: User Creates Article
```
1. Go to /articles/new
2. Fill in title, category, content
3. See performance panel update in real-time
4. Click "Save Draft" → stored as DRAFT
5. Can view at /articles/:id
6. Click "Submit for Review" → status changes to PENDING
7. Admin sees it in /admin/articles review queue
```

### Scenario 2: User Edits Own Article
```
1. Go to /articles/:id (your article)
2. Update title
3. See performance metrics change instantly
4. Test different titles with Title Simulator
5. Auto-save triggers every 30s
6. Click "Save Draft" → stays DRAFT
7. Can't see in /admin/articles (user articles)
```

### Scenario 3: Admin Creates Article
```
1. Go to /admin/articles/new
2. Fill in title, category, content
3. See same performance panels as user
4. Select status "PUBLISHED" from dropdown
5. Click "Publish" → immediately published
6. User sees it on blog
```

### Scenario 4: Admin Edits User's Article
```
1. Go to /admin/articles/:id (any article, user or admin created)
2. Can change status: DRAFT → PENDING → REJECTED → PUBLISHED → ARCHIVED
3. Can access prediction history
4. Click "Publish" → immediately live
5. Can edit any article (permission check happens in backend)
```

---

## Browser Console Checks

Open DevTools → Console tab and verify:

- [ ] No red errors ❌
- [ ] No orange warnings ⚠️ (pre-existing React Hook Form warnings are OK)
- [ ] No "undefined" references
- [ ] No 404 errors for assets
- [ ] No CORS errors (API calls work)

---

## Common Issues & Fixes

### Issue: Routes don't exist
```
Error: Cannot GET /articles/new
```
**Fix**: Make sure App.tsx imports and defines the routes. Check EDITOR_UNIFICATION_ROUTES.md

### Issue: Performance panels not showing
```
Missing: PerformancePanel, CompetitorComparisonPanel, etc.
```
**Fix**: 
1. Check ArticleEditorLayout.tsx imports these components
2. Check `!isNewArticle` condition (panels only show on existing articles)
3. Verify these components are exported from @/components/editor/prediction

### Issue: Auto-save not working
```
Expected: Draft saved every 30s
Actual: Only saves on button click
```
**Fix**:
1. Check form.watch('status') returns 'DRAFT'
2. Check useEffect dependency array
3. Check API endpoint exists: POST /api/articles/autosave

### Issue: Status dropdown not showing for admin
```
Expected: 5 options (DRAFT, PUBLISHED, etc.)
Actual: Hidden or undefined
```
**Fix**:
1. Check `isAdmin` evaluates to `true` for /admin/articles/* paths
2. Check Select component imported from @/components/ui/select
3. Check form.control.watch('status') has initial value

---

## Rollback Plan (if needed)

If unification has issues:

1. Revert routing in `App.tsx` (restore old imports)
2. Restore old components: `ArticleEditorPage.tsx`, `UserArticleEditor.tsx`
3. Restore old routes: `/blog/write`, `/admin/articles/edit/:id`
4. Restore old links in navigation files

BUT: All changes are backwards-compatible, so this shouldn't be necessary.

---

## Performance Baseline

After implementing unification, measure:

- [ ] `/articles/new` load time: < 2s
- [ ] `/admin/articles/new` load time: < 2s
- [ ] Editor input responsiveness: < 100ms lag
- [ ] Performance panel updates: < 500ms
- [ ] Form submission: < 1s
- [ ] Auto-save: every 30 ± 2 seconds

---

## Sign-Off Checklist

After completing all tests:

- [ ] All 4 routes load correctly
- [ ] All 4 route scenarios work (user/admin × create/edit)
- [ ] Performance panels show for both modes
- [ ] Auto-save works for drafts
- [ ] Form validation works
- [ ] Navigation links updated
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Documentation complete (EDITOR_UNIFICATION_COMPLETE_V2.md)

**Ready for Production**: [ ] YES / [ ] NO

---

## Notes

- Pre-existing lint warnings (111 total) are unrelated to unification
- React Hook Form `watch()` warning is expected (library limitation)
- All tests should pass with current codebase
- No backend changes required (API remains the same)
- Feature parity now achieved: users have same tools as admins
