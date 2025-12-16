# Advanced Filters - Quick Reference Guide

## What's New?

### 1️⃣ Active Filter Counters
```
📊 FILTER TABS
┌─────────────┬──────────┬──────┬─────────┬────────┐
│ Academic ⓶  │Financial │Loc. ①│ Social  │Career⓵ │
└─────────────┴──────────┴──────┴─────────┴────────┘
     ↑                              ↑
     2 active filters            1 active filter
```

**Badge Location**: Top-right corner of each tab
**Shows**: Number of active filters for that tab
**Always Visible**: Only when filters are actually set

---

### 2️⃣ Reset Buttons

#### Tab-Level Reset
```
Academic Requirements     [↻ Reset Tab]
```
- Located above each tab's content
- Only resets filters in current tab
- Quick way to adjust specific category

#### Global Reset (Footer)
```
┌────────────────────────────────────┐
│ [↻ Reset All Filters]  [✓ Done]   │
└────────────────────────────────────┘
```
- Located in footer, left side
- Resets ALL tabs at once
- Disabled when no filters are active (grayed out)

---

### 3️⃣ Enhanced Visual Design

#### Filter Section Card
```
┌─────────────────────────────────────┐
│ ACT Score Range              📌     │
│ ┌────────────┬───────────────┐      │
│ │ Minimum    │ Maximum       │      │
│ │ [input]    │ [input]       │      │
│ └────────────┴───────────────┘      │
└─────────────────────────────────────┘
  ▲                                    ▲
  Background:                      Profile badge
  Light gray on light theme        (if from profile)
  Darker gray on dark theme
```

#### Slider with Value Display
```
Minimum Grant Aid               $15,000
┌──────────────⬤────────────────────┐
│ $0                      $50,000     │
└─────────────────────────────────────┘
                    ↑
              Current value
              Shown in blue bold
```

#### Tab Navigation
```
┌─────────────────────────────────────┐
│ [📖 Academic] ③  [💵 Financial] ②   │
│ [📍 Location]     [👥 Social]       │
│ [💼 Career] ①                       │
├─────────────────────────────────────┤
│ Academic Requirements    [↻ Reset Tab]
│                                      │
│ [Tab content displayed here]         │
│                                      │
└─────────────────────────────────────┘
  ▲
  Badge shows count
  for this tab
```

---

## Color Coding

### Active States
- **Tab Badges**: Bright blue (#2563eb)
- **Value Display**: Blue bold text
- **Active Tab**: Slight shadow effect
- **Global Counter**: Blue badge in header

### Reset Buttons
- **Tab Reset**: Gray text with hover effect
- **Global Reset**: Red text with red hover (for emphasis)
- **Disabled State**: Grayed out when no filters active

### Backgrounds
- **Filter Cards**: Light slate on light theme, dark slate on dark
- **Header**: Gradient from light to blue
- **Footer**: Gradient from light to blue
- **Inputs**: Standard white/dark background

---

## User Interactions

### Workflow 1: Set Some Filters
1. Open Advanced Filters modal
2. Navigate to desired tab
3. Adjust filters (sliders, inputs, checkboxes)
4. **See badge update** ← NEW!
5. Check header for total count
6. Click "Done"

### Workflow 2: Adjust One Tab
1. Modal already open
2. Switch to tab with filters
3. See tab has badge showing active count
4. Click "Reset Tab" to clear just that section
5. Or manually adjust individual filters

### Workflow 3: Start Fresh
1. Modal has various filters set
2. See "Reset All Filters" button enabled
3. Click it to clear everything at once
4. All badges disappear
5. All sliders reset to defaults

---

## Accessibility Features

✅ Larger checkbox/slider hit targets
✅ Bold, clear typography
✅ High color contrast
✅ Dark mode full support
✅ Keyboard navigation
✅ Clear label associations
✅ Semantic HTML structure
✅ ARIA-friendly components

---

## Responsive Design

### Desktop (> 768px)
- Full modal at 48rem wide
- All labels visible
- Tab text shown
- Full spacing

### Tablet (512px - 768px)
- Modal adjusts to viewport
- Icon + abbreviated labels on tabs
- Reduced spacing where needed

### Mobile (< 512px)
- Modal takes up most screen
- Icons only on tabs (labels hidden)
- Horizontal scrollable if needed
- Touch-friendly sizing

---

## Technical Details

### Files Modified
- `client/src/components/search/AdvancedFiltersModal.tsx`

### New Features
- `countActiveFilters()` - Smart filter counter
- `resetAcademicFilters()` - Clears academic filters
- `resetFinancialFilters()` - Clears financial filters
- `resetLocationFilters()` - Clears location filters
- `resetSocialFilters()` - Clears social filters
- `resetFutureFilters()` - Clears career filters
- `resetAllFilters()` - Clears everything
- `handleOpenChange()` - Manages scroll behavior

### State Hooks
- `useState('academics')` - Track active tab

### Styling Classes
- Gradient backgrounds
- Card-based layout
- Rounded corners and borders
- Blue accent colors
- Dark mode support via Tailwind

---

## Example Badge States

| Tab | Filters Set | Badge | Shows |
|-----|------------|-------|-------|
| Academic | ACT Score | 1 | ① |
| Financial | Grant + Net Cost | 2 | ② |
| Location | Setting + Safety | 2 | ② |
| Social | None | - | (hidden) |
| Career | Visa + Duration | 2 | ② |
| **TOTAL** | - | 7 | 7 active |

---

## What Happens When...

### User scrolls while modal is open?
✅ Modal stays centered and fixed
✅ Background page doesn't scroll
✅ Smooth, uninterrupted filter experience

### User activates a filter?
✅ Badge instantly updates on that tab
✅ Global count increments
✅ Tab visually highlights

### User clicks "Reset Tab"?
✅ Only that tab's filters clear
✅ Other tabs unaffected
✅ Badge disappears or updates

### User clicks "Reset All"?
✅ All tabs clear simultaneously
✅ All badges disappear
✅ Button becomes disabled

### User closes modal without saving?
✅ Filters are preserved (they're in store)
✅ Body scroll is restored
✅ Modal closes smoothly

---

## Common Use Cases

### "I want to see how many filters I've set"
→ Look at badges on tabs, or global count in header

### "I made a mistake in one tab only"
→ Click that tab's "Reset Tab" button

### "I went too restrictive, let me start over"
→ Click "Reset All Filters" in footer

### "I'm on mobile and need to adjust quickly"
→ Modal is responsive, all controls clearly labeled

### "Does this work in dark mode?"
→ Yes! Full dark mode support with adjusted colors

---

## Performance Notes
- Filtering logic is lightweight and efficient
- Badges update instantly with React state
- No external API calls
- Pure CSS styling (Tailwind)
- Minimal JavaScript overhead

---

Last Updated: December 15, 2025
Component: AdvancedFiltersModal.tsx
Status: ✅ Fully Implemented & Tested
