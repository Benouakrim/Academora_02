# Route Mapping & Feature Matrix

## URL Routes: Before vs After

### CREATE ARTICLE

| Scenario | Before | After |
|----------|--------|-------|
| **User creates** | `/blog/write` (UserArticleEditor) | `/articles/new` (ArticleEditorLayout) |
| **Admin creates** | `/admin/articles/new` (ArticleEditorPage) | `/admin/articles/new` (ArticleEditorLayout) |

### EDIT ARTICLE

| Scenario | Before | After |
|----------|--------|-------|
| **User edits own** | ❌ Not possible (no edit route) | `/articles/:id` (ArticleEditorLayout) |
| **Admin edits** | `/admin/articles/edit/:id` (ArticleEditorPage) | `/admin/articles/:id` (ArticleEditorLayout) |

---

## Feature Availability Matrix

### USER MODE (`/articles/*`)

| Feature | Availability | Notes |
|---------|--------------|-------|
| **Featured Image Upload** | ✅ Yes | Standard image upload |
| **Title & Auto-slug** | ✅ Yes | Auto-generates slug from title |
| **Category Selection** | ✅ Yes | Dropdown of available categories |
| **Rich Text Editor** | ✅ Yes | All CMS blocks available |
| **Excerpt** | ✅ Yes | 160 character limit |
| **SEO Tab** | ⚠️ Partial | Basic SEO fields only |
| **Performance Panel** | ❌ No | Admin-only analytics |
| **Competitor Analysis** | ❌ No | Admin-only |
| **Title Simulator** | ❌ No | Admin-only |
| **ROI Calculator** | ❌ No | Admin-only |
| **Status Dropdown** | ❌ No | Auto-set to DRAFT/PENDING |
| **Action Buttons** | ✅ Yes | "Save Draft" & "Submit for Review" |
| **Auto-save** | ❌ No | Manual save only |
| **Prediction History** | ❌ No | N/A for users |

### ADMIN MODE (`/admin/articles/*`)

| Feature | Availability | Notes |
|---------|--------------|-------|
| **Featured Image Upload** | ✅ Yes | Standard image upload |
| **Title & Auto-slug** | ✅ Yes | Auto-generates slug from title |
| **Category Selection** | ✅ Yes | Dropdown of available categories |
| **Rich Text Editor** | ✅ Yes | All CMS blocks available |
| **Excerpt** | ✅ Yes | 160 character limit |
| **SEO Tab** | ✅ Yes | Full SEO metadata |
| **Performance Panel** | ✅ Yes | Real-time content analysis |
| **Competitor Analysis** | ✅ Yes | Benchmark against competitors |
| **Title Simulator** | ✅ Yes | Test title effectiveness |
| **ROI Calculator** | ✅ Yes | Predict content ROI |
| **Status Dropdown** | ✅ Yes | Draft/Pending/Rejected/Published/Archived |
| **Action Buttons** | ✅ Yes | Single "Save Article" button |
| **Auto-save** | ✅ Yes | Every 30 seconds (Draft only) |
| **Prediction History** | ✅ Yes | View past analyses |
| **Direct Publish** | ✅ Yes | Set status to PUBLISHED |

---

## Component Sharing

### Shared Across Both Modes
- ✅ `RichTextEditor` with all CMS blocks
- ✅ `ImageUpload` component
- ✅ `BlockLibraryMenu` (interactive blocks)
- ✅ Form validation logic
- ✅ Slug generation
- ✅ API calls (create/update)
- ✅ Taxonomy fetching
- ✅ Unsaved changes warning

### Admin-Only Components (Conditionally Rendered)
- ❌ `PerformancePanel`
- ❌ `CompetitorComparisonPanel`
- ❌ `TitleSimulatorPanel`
- ❌ `ROICalculatorPanel`
- ❌ Status selector
- ❌ Prediction history queries

---

## User Journey Examples

### User Creating Article
```
1. Navigate to navbar "Write Article" → /articles/new
2. Fill in Title, Category, Featured Image
3. Write content in rich editor (with blocks)
4. Set SEO basics (meta title, keyword)
5. Click "Save Draft" or "Submit for Review"
6. Redirected to /articles/:id (if edit after create)
```

### Admin Creating Article
```
1. Navigate to articles list → "Write New" → /admin/articles/new
2. Fill in all fields (same as user)
3. See Performance Panel on right (analyzes in real-time)
4. Benchmark against competitors
5. Set status to PUBLISHED (or DRAFT/PENDING)
6. Click "Save Article"
7. Auto-saves every 30 seconds while editing
```

### Admin Editing User Submission
```
1. Article submitted by user (status: PENDING)
2. Admin navigates to /admin/articles/:id
3. Can see user's content + admin analysis panels
4. Reviews performance metrics
5. Decides to PUBLISH or REJECT
6. Auto-save handles intermediate states
```

---

## Data Flow

### Single Form Data Structure
```typescript
type FormData = {
  title: string               // Both
  slug: string                // Both
  excerpt: string             // Both
  categoryId: string          // Both
  content: string             // Both (HTML with CMS blocks)
  status: Status              // Both
  featuredImage: string       // Both
  metaTitle?: string          // Both
  metaDescription?: string    // Both
  focusKeyword?: string       // Both (admin-focused)
  ogImage?: string            // Both (admin-focused)
  canonicalUrl?: string       // Both (admin-focused)
}
```

**Same form structure used for:**
- User create
- User edit
- Admin create
- Admin edit

---

## Migration Path (Deployment)

### Phase 1: Feature Parity ✅
- [x] New unified component created
- [x] Routes configured
- [x] Navigation links updated
- [x] TypeScript compilation passing

### Phase 2: Testing (Next)
- [ ] Admin flow: create new article
- [ ] Admin flow: edit existing article
- [ ] User flow: create new article
- [ ] User flow: edit own article
- [ ] Admin panels render correctly
- [ ] User mode hides admin features
- [ ] Auto-save triggers for admin
- [ ] Draft recovery works

### Phase 3: Cleanup (Post-Testing)
- [ ] Delete `ArticleEditorPage.tsx`
- [ ] Delete `UserArticleEditor.tsx`
- [ ] Update any stray imports
- [ ] Verify no 404s in analytics

### Phase 4: Enhancement (Future)
- [ ] Add real-time collaboration
- [ ] Implement article versioning
- [ ] Add template system
- [ ] Enhanced role-based permissions

---

## Troubleshooting

### Issue: Admin panels not showing
**Solution:** Verify `pathname.includes('/admin/articles')` detection is correct

### Issue: User sees status dropdown
**Solution:** Check `isAdmin` mode detection from URL

### Issue: Form data not saving
**Solution:** Verify form submission handler correctly calls `api.post()` or `api.put()`

### Issue: Prediction panels empty
**Solution:** Ensure `useArticlePrediction()` hook is called and API returns data

### Issue: Changes not auto-saving
**Solution:** Check `useEffect` interval is set (30s) and form is in DRAFT status (admin only)
