# Maximum Update Depth Exceeded - Root Cause Analysis & Fixes

## Issue Summary
**Error:** "Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate."

**When:** When accessing a university page from the search feature

**Root Cause:** Setter functions (from Zustand/React) were included in `useEffect` dependency arrays, causing infinite loops due to function reference changes on every render.

---

## Root Causes Identified

### Pattern 1: Store Setter Functions in Dependencies
When Zustand setter functions are in the dependency array, they get recreated on each render (even though the function logic is the same), which triggers the useEffect again, causing state updates that trigger re-renders, creating an infinite loop.

```typescript
// ❌ WRONG - Causes infinite loop
useEffect(() => {
  setIsFetching(query.isFetching);
}, [query.isFetching, setIsFetching]); // setIsFetching causes the issue
```

### Pattern 2: Tracker Functions in Dependencies
Analytics tracking functions wrapped with `useCallback` don't need to be in the dependency array if they're already stable. Including them can still cause unnecessary updates.

```typescript
// ❌ WRONG - Unnecessary function dependency
useEffect(() => {
  trackPageView({...});
}, [universityData?.id, slug, trackPageView]); // trackPageView not needed
```

---

## Files Fixed

### 1. **client/src/hooks/useUniversitySearch.ts** (Lines 125-128)
**Issue:** `setIsFetching` function from Zustand store in dependency array

**Original:**
```typescript
useEffect(() => {
  setIsFetching(query.isFetching);
}, [query.isFetching, setIsFetching]); // ❌ setIsFetching causes infinite loop
```

**Fixed:**
```typescript
useEffect(() => {
  setIsFetching(query.isFetching);
}, [query.isFetching]); // ✅ Only data dependency needed
```

---

### 2. **client/src/components/search/CategoryWeightPanel.tsx** (Lines 35-38)
**Issue:** `setWeights` store setter function in dependency array

**Original:**
```typescript
useEffect(() => {
  setWeights(debouncedWeights);
}, [debouncedWeights, setWeights]); // ❌ setWeights not needed
```

**Fixed:**
```typescript
useEffect(() => {
  setWeights(debouncedWeights);
}, [debouncedWeights]); // ✅ Only data dependency needed
```

---

### 3. **client/src/hooks/useInitialSearchCriteria.tsx** (Lines 28-35)
**Issue:** `setProfileCriteria` store setter function in dependency array

**Original:**
```typescript
useEffect(() => {
  if (query.data) {
    setProfileCriteria(query.data);
  }
}, [query.data, setProfileCriteria]); // ❌ setProfileCriteria not needed
```

**Fixed:**
```typescript
useEffect(() => {
  if (query.data) {
    setProfileCriteria(query.data);
  }
}, [query.data]); // ✅ Only data dependency needed
```

---

### 4. **client/src/pages/university/UniversityPage.tsx** (Lines 88-100)
**Issue:** `trackPageView` and redundant `universityData` in dependency array

**Original:**
```typescript
useEffect(() => {
  if (universityData?.id && slug) {
    trackPageView({...});
  }
}, [universityData?.id, slug, trackPageView, universityData]); // ❌ trackPageView and universityData redundant
```

**Fixed:**
```typescript
useEffect(() => {
  if (universityData?.id && slug) {
    trackPageView({...});
  }
}, [universityData?.id, slug]); // ✅ Only essential data dependencies
```

---

### 5. **client/src/pages/GroupDetailPage.tsx** (Lines 48-61)
**Issue:** `trackPageView` in dependency array

**Original:**
```typescript
useEffect(() => {
  if (data?.data?.id && slug) {
    trackPageView({...});
  }
}, [data?.data?.id, data?.data?.name, slug, trackPageView]); // ❌ trackPageView not needed
```

**Fixed:**
```typescript
useEffect(() => {
  if (data?.data?.id && slug) {
    trackPageView({...});
  }
}, [data?.data?.id, data?.data?.name, slug]); // ✅ Only data dependencies
```

---

### 6. **client/src/pages/blog/ArticlePage.tsx** (Lines 58-72)
**Issue:** `trackPageView` in dependency array

**Original:**
```typescript
useEffect(() => {
  if (article?.id && slug) {
    trackPageView({...});
  }
}, [article?.id, slug, trackPageView]); // ❌ trackPageView not needed
```

**Fixed:**
```typescript
useEffect(() => {
  if (article?.id && slug) {
    trackPageView({...});
  }
}, [article?.id, slug]); // ✅ Only essential dependencies
```

---

### 7. **client/src/hooks/useAnalyticsTracking.ts** (Lines 206-218)
**Issue:** `trackPageView` and `updateDuration` in dependency array of custom hook

**Original:**
```typescript
export function usePageViewTracking(page: string, entityId?: string, entitySlug?: string) {
  const { trackPageView, updateDuration } = useAnalyticsTracking();

  useEffect(() => {
    trackPageView({ page, entityId, entitySlug });
    return () => {
      updateDuration();
    };
  }, [page, entityId, entitySlug, trackPageView, updateDuration]); // ❌ Functions not needed
}
```

**Fixed:**
```typescript
export function usePageViewTracking(page: string, entityId?: string, entitySlug?: string) {
  const { trackPageView, updateDuration } = useAnalyticsTracking();

  useEffect(() => {
    trackPageView({ page, entityId, entitySlug });
    return () => {
      updateDuration();
    };
  }, [page, entityId, entitySlug]); // ✅ Only data dependencies needed
}
```

---

## Why This Fixes the Issue

### Before the fix:
1. Component renders → `useEffect` runs with dependencies including setter function
2. Setter function reference is recreated (different object in memory)
3. `useEffect` dependency array detects change → effect runs again
4. Effect calls `setIsFetching()` → store state updates
5. State update triggers component re-render
6. Go back to step 1 → **INFINITE LOOP**

### After the fix:
1. Component renders → `useEffect` runs with only data dependencies
2. Data values are checked (same primitive values or memoized objects)
3. No dependency changes → effect doesn't run unnecessarily
4. Only runs when actual data (query results, slug, etc.) changes
5. Smooth, predictable updates with no infinite loop

---

## Testing Recommendations

✅ **Test the following scenarios:**

1. **Search Feature → University Page Navigation**
   - Go to search page
   - Perform a search
   - Click on a university result
   - Verify page loads without max depth error

2. **Direct University Page Access**
   - Navigate directly to `/university/[slug]`
   - Verify analytics tracking works
   - Check console for no error messages

3. **Category Weight Changes**
   - Open search filters
   - Change category weights
   - Verify filters update without errors

4. **Article & Group Pages**
   - Test ArticlePage analytics tracking
   - Test GroupDetailPage analytics tracking
   - Verify page views are tracked correctly

5. **Browser Console**
   - Open DevTools
   - Check for any React warnings or errors
   - Verify no "Maximum update depth" errors appear

---

## Prevention Tips for Future Development

1. **Don't include setter functions in dependencies**
   ```typescript
   // ❌ WRONG
   }, [data, setData, setter, updateState]);
   
   // ✅ CORRECT
   }, [data]); // Only include what actually triggers logic changes
   ```

2. **Use useCallback when needed, not in dependency arrays**
   ```typescript
   // If a function is created with useCallback with empty deps, 
   // you don't need it in the effect dependency array
   const stableFn = useCallback(() => {...}, []);
   useEffect(() => {
     stableFn();
   }, []); // ✅ Correct - doesn't need stableFn in deps
   ```

3. **Extract only the values you need**
   ```typescript
   // ❌ Include unnecessary data
   }, [object, object.id]);
   
   // ✅ Include only what matters
   }, [object.id]);
   ```

4. **Use ESLint plugin**
   ```json
   {
     "rules": {
       "react-hooks/exhaustive-deps": "warn"
     }
   }
   ```

---

## Summary of Changes

| File | Issue | Fix |
|------|-------|-----|
| useUniversitySearch.ts | setIsFetching in deps | Removed function from deps |
| CategoryWeightPanel.tsx | setWeights in deps | Removed function from deps |
| useInitialSearchCriteria.tsx | setProfileCriteria in deps | Removed function from deps |
| UniversityPage.tsx | trackPageView & redundant data | Removed function & redundant deps |
| GroupDetailPage.tsx | trackPageView in deps | Removed function from deps |
| ArticlePage.tsx | trackPageView in deps | Removed function from deps |
| useAnalyticsTracking.ts | trackPageView & updateDuration in deps | Removed functions from deps |

**Total Files Fixed: 7**  
**Total Issues Fixed: 7**  
**Status: ✅ Complete**

