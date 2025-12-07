# Article Editor Routes - Quick Reference

## Route Map (All Using ArticleEditorLayout.tsx)

### User Routes (`/articles/*`)

#### `/articles/new`
**Purpose**: User creates a new article  
**Component**: `ArticleEditorLayout.tsx`  
**Mode Detection**: `isAdmin = false`  
**Edit Mode**: `isNewArticle = true` (no id param)  
**UI Elements**:
- Title input
- Slug input (auto-generated)
- Rich text editor with all CMS blocks
- Featured image upload
- SEO metadata (optional)
- "Save Draft" button → status: DRAFT
- "Submit for Review" button → status: PENDING
- ❌ NO status dropdown
- ❌ NO performance panels (new articles have no analysis)
- ❌ NO prediction history (doesn't exist yet)

**Example URL**: `/articles/new`

---

#### `/articles/:id`
**Purpose**: User edits their own article  
**Component**: `ArticleEditorLayout.tsx`  
**Mode Detection**: `isAdmin = false`  
**Edit Mode**: `isNewArticle = false` (has id param)  
**UI Elements**:
- Title input
- Slug input (editable)
- Rich text editor with all CMS blocks
- Featured image upload
- SEO metadata (optional)
- Performance Panel ✅ (shows analysis)
- Competitor Comparison Panel ✅
- Title Simulator Panel ✅
- ROI Calculator Panel ✅
- Prediction history ✅ (shows previous analyses)
- "Save Draft" button → status: DRAFT
- "Submit for Review" button → status: PENDING
- ❌ NO status dropdown
- Auto-save every 30 seconds (if status is DRAFT)

**Example URL**: `/articles/123`

---

### Admin Routes (`/admin/articles/*`)

#### `/admin/articles/new`
**Purpose**: Admin creates a new article  
**Component**: `ArticleEditorLayout.tsx`  
**Mode Detection**: `isAdmin = true`  
**Edit Mode**: `isNewArticle = true` (no id param)  
**UI Elements**:
- Title input
- Slug input (auto-generated)
- Rich text editor with all CMS blocks
- Featured image upload
- SEO metadata (optional)
- Status selector (5 options: DRAFT, PENDING, REJECTED, PUBLISHED, ARCHIVED) ✅
- "Publish" button (publishes based on selected status)
- ❌ NO performance panels (new articles have no analysis)
- ❌ NO prediction history (doesn't exist yet)

**Example URL**: `/admin/articles/new`

---

#### `/admin/articles/:id`
**Purpose**: Admin edits any article (user or admin created)  
**Component**: `ArticleEditorLayout.tsx`  
**Mode Detection**: `isAdmin = true`  
**Edit Mode**: `isNewArticle = false` (has id param)  
**UI Elements**:
- Title input
- Slug input (editable)
- Rich text editor with all CMS blocks
- Featured image upload
- SEO metadata (optional)
- Status selector (5 options: DRAFT, PENDING, REJECTED, PUBLISHED, ARCHIVED) ✅
- Performance Panel ✅ (shows analysis)
- Competitor Comparison Panel ✅
- Title Simulator Panel ✅
- ROI Calculator Panel ✅
- Prediction history ✅ (shows previous analyses)
- "Publish" button (publishes based on selected status)
- Auto-save every 30 seconds (if status is DRAFT)

**Example URL**: `/admin/articles/456`

---

## Route Decision Tree

```
User visits URL
    ↓
/articles/*
├── /articles/new        → Create new (no predictions)
│                           "Save Draft" | "Submit for Review"
│
└── /articles/:id        → Edit existing (has predictions)
                           "Save Draft" | "Submit for Review"
                           Performance panels visible
                           Prediction history visible

/admin/articles/*
├── /admin/articles/new  → Create new (no predictions)
│                           Status selector (DRAFT, PENDING, REJECTED, PUBLISHED, ARCHIVED)
│
└── /admin/articles/:id  → Edit existing (has predictions)
                           Status selector
                           Performance panels visible
                           Prediction history visible
```

---

## Navigation Links

### Links to User Create Route (`/articles/new`)
- Navbar: "Write Article" button
- ActivityFeed: "Write Article" button
- Header: Any "New Article" button

### Links to User Edit Route (`/articles/:id`)
- ArticlePage: "Edit" button (if user owns article)
- Dashboard: "Edit Draft" link

### Links to Admin Create Route (`/admin/articles/new`)
- AdminPanel: "New Article" button
- ArticlesList: "Create Article" button

### Links to Admin Edit Route (`/admin/articles/:id`)
- ArticlesList: "Edit" button in table
- ArticlePage: "Edit" button (if admin viewing)

---

## Feature Availability Matrix

| Feature | `/articles/new` | `/articles/:id` | `/admin/articles/new` | `/admin/articles/:id` |
|---------|---|---|---|---|
| **Title Input** | ✅ | ✅ | ✅ | ✅ |
| **Editor** | ✅ | ✅ | ✅ | ✅ |
| **CMS Blocks** | ✅ | ✅ | ✅ | ✅ |
| **Performance Panel** | ❌ (new) | ✅ | ❌ (new) | ✅ |
| **Competitor Analysis** | ❌ (new) | ✅ | ❌ (new) | ✅ |
| **Title Simulator** | ❌ (new) | ✅ | ❌ (new) | ✅ |
| **ROI Calculator** | ❌ (new) | ✅ | ❌ (new) | ✅ |
| **Prediction History** | ❌ (new) | ✅ | ❌ (new) | ✅ |
| **Auto-save** | ✅ (DRAFT only) | ✅ (DRAFT only) | ✅ (DRAFT only) | ✅ (DRAFT only) |
| **Status Selector** | ❌ | ❌ | ✅ | ✅ |
| **Save Draft Button** | ✅ | ✅ | ❌ | ❌ |
| **Submit for Review Button** | ✅ | ✅ | ❌ | ❌ |
| **Publish Button** | ❌ | ❌ | ✅ | ✅ |

---

## Code Location Reference

### Route Definitions
**File**: `client/src/App.tsx`  
**Lines**: ~86-87 (user routes), ~112-113 (admin routes)  
```typescript
// User routes
<Route path="/articles/new" element={<ArticleEditorLayout />} />
<Route path="/articles/:id" element={<ArticleEditorLayout />} />

// Admin routes (under /admin path)
<Route path="articles/new" element={<ArticleEditorLayout />} />
<Route path="articles/:id" element={<ArticleEditorLayout />} />
```

### Component Implementation
**File**: `client/src/pages/articles/ArticleEditorLayout.tsx`  
**Lines**: 1-526  
**Key Code**:
```typescript
const { pathname } = useLocation()
const { id } = useParams<{ id?: string }>()

// Mode detection from URL
const isAdmin = pathname.includes('/admin/articles')
const isNewArticle = !id

// Conditional rendering based on mode
{isAdmin && (
  <Select value={form.watch('status')}>
    {/* Admin-only status selector */}
  </Select>
)}

// Panels render for both modes (if not new)
{!isNewArticle && (
  <>
    <PerformancePanel />
    <CompetitorComparisonPanel />
    <TitleSimulatorPanel />
    <ROICalculatorPanel />
  </>
)}
```

---

## Backward Compatibility

### Old Routes (No Longer Valid)
```
❌ /blog/write           → Use /articles/new instead
❌ /blog/:id             → Use /articles/:id instead
❌ /admin/articles/edit/:id → Use /admin/articles/:id instead
```

### What Happens to Old Routes
- **Browser**: 404 Not Found (if not redirected)
- **Recommendation**: Set up URL redirect at reverse proxy level if needed:
  ```
  /blog/write → /articles/new
  /blog/:id   → /articles/:id
  /admin/articles/edit/:id → /admin/articles/:id
  ```

---

## API Endpoints Used (No Changes)

All endpoints remain the same:

- `GET /api/articles/:id` - Fetch article for editing
- `POST /api/articles` - Create new article
- `PUT /api/articles/:id` - Update article
- `POST /api/articles/:id/autosave` - Auto-save draft
- `POST /api/predictions` - Analyze content
- `GET /api/predictions/history/:articleId` - Fetch history
- `GET /api/taxonomy/categories` - Fetch categories
- `POST /api/images/upload` - Upload featured image

---

## Testing Each Route

### Test `/articles/new` (User Create)
```
1. Navigate to /articles/new
2. Should NOT see status dropdown
3. Should see "Save Draft" and "Submit for Review" buttons
4. Should NOT see prediction panels (new article)
5. Fill form and click "Save Draft"
6. Should be stored with status: DRAFT
```

### Test `/articles/:id` (User Edit)
```
1. Create an article first via /articles/new
2. Navigate to /articles/:id (where id is the article id)
3. Should NOT see status dropdown
4. Should see "Save Draft" and "Submit for Review" buttons
5. Should see prediction panels (existing article)
6. Can see prediction history
7. Auto-save triggers every 30s
```

### Test `/admin/articles/new` (Admin Create)
```
1. Navigate to /admin/articles/new
2. Should see status dropdown with 5 options
3. Should NOT see "Save Draft" button
4. Should see "Publish" button
5. Should NOT see prediction panels (new article)
6. Select status "PUBLISHED" and click "Publish"
7. Should be immediately published
```

### Test `/admin/articles/:id` (Admin Edit)
```
1. Navigate to /admin/articles/:id (any article)
2. Should see status dropdown
3. Should see prediction panels
4. Can access prediction history
5. Can change status and publish
6. Can edit any article (user or admin created)
```

---

## URL Parameters

### Path Parameters
```
/articles/:id           → id = article ID (string/number)
/admin/articles/:id     → id = article ID (string/number)
```

### Query Parameters (Not Currently Used)
```
/articles/new?template=blog   → Could use in future for templates
/articles/:id?tab=seo         → Could use in future for tab selection
```

---

## Common Mistakes & How to Avoid

### Mistake 1: Old Routes
```
❌ WRONG: Navigate to /blog/write
✅ RIGHT: Navigate to /articles/new
```

### Mistake 2: Forgetting to Update Links
```
❌ WRONG: <Link to="/blog/write">Write</Link>
✅ RIGHT: <Link to="/articles/new">Write</Link>
```

### Mistake 3: Admin Route Format
```
❌ WRONG: /admin/articles/edit/123
✅ RIGHT: /admin/articles/123
```

### Mistake 4: Expecting Predictions on New Articles
```
❌ WRONG: Expect performance panels on /articles/new
✅ RIGHT: Performance panels only show on /articles/:id (existing)
```

---

## Future Route Enhancements

Possible future additions:

```
/articles/drafts                  → List user's drafts
/articles/:id/versions            → Show article version history
/articles/:id/publish-schedule    → Schedule future publication
/admin/articles/bulk-edit         → Edit multiple articles
/admin/articles/:id/activity-log  → View article edit history
```

---

## Quick Copy-Paste Links

```
/articles/new
/articles/1
/admin/articles/new
/admin/articles/1
```

---

**Last Updated**: After unification complete  
**Status**: All routes verified and documented  
**Testing**: Use EDITOR_TESTING_GUIDE.md for validation  
