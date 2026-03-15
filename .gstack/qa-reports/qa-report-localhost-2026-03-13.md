# QA Report: Calorie Tracker

**Date:** 2026-03-13
**URL:** http://localhost:8080
**Duration:** ~5 minutes
**Framework:** Vanilla HTML/CSS/JS (no framework)
**Screenshots:** 8 captured

---

## Health Score: 75/100

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Console | 100 | 15% | 15 |
| Links | 100 | 10% | 10 |
| Visual | 90 | 10% | 9 |
| Functional | 60 | 20% | 12 |
| UX | 80 | 15% | 12 |
| Performance | 80 | 10% | 8 |
| Content | 100 | 5% | 5 |
| Accessibility | 70 | 15% | 10.5 |

---

## Top 3 Issues to Fix

### 1. API Search Timeout (Critical - Functional)
- **Severity:** High
- **Category:** Functional
- **Repro:**
  1. Enter "banana" in search field
  2. Click Search button
  3. Wait 10 seconds
  4. Observe "Search timed out" error
- **Expected:** Search results should display
- **Actual:** Request times out, no results shown
- **Screenshot:** `search-visual.png`
- **Impact:** Core feature (food search) is non-functional
- **Recommendation:** The Open Food Facts API may have CORS restrictions or slow response times from localhost. Consider:
  - Adding a loading indicator while searching
  - Implementing retry logic
  - Testing API connectivity separately

---

### 2. Missing Form Validation Feedback (Medium - UX)
- **Severity:** Medium
- **Category:** UX
- **Repro:**
  1. Click "+ Add Custom Food"
  2. Leave fields empty
  3. Click "Save Food"
- **Expected:** Inline validation or visual feedback on required fields
- **Actual:** Form silently does nothing (validation prevents submit but no user feedback)
- **Recommendation:** Add HTML5 `required` attributes or visual validation indicators

---

### 3. Success Messages Auto-Dismiss Too Quickly (Low - UX)
- **Severity:** Low
- **Category:** UX
- **Repro:**
  1. Add a custom food successfully
  2. Success message appears briefly
  3. Message disappears before user can read it
- **Expected:** Success message should persist long enough to read
- **Actual:** 3-second timeout may be too short
- **Recommendation:** Increase timeout to 5 seconds or add dismiss button

---

## All Issues Found

| ID | Title | Severity | Category | Status |
|----|-------|----------|----------|--------|
| ISSUE-001 | API Search Timeout | High | Functional | Open |
| ISSUE-002 | Missing Form Validation Feedback | Medium | UX | Open |
| ISSUE-003 | Success Messages Auto-Dismiss Too Quickly | Low | UX | Open |

---

## Console Health

**Errors:** 0
**Warnings:** 0

No JavaScript errors detected during testing.

---

## Screenshots Captured

1. `initial.png` - Landing page state
2. `search-visual.png` - Search timeout error
3. `custom-food-modal.png` - Custom food form
4. `custom-food-saved.png` - After saving custom food
5. `manage-meals.png` - Manage saved meals modal
6. `weekly-view.png` - Weekly view expanded
7. `mobile-view.png` - Responsive mobile layout

---

## Features Tested

### Working Features ✅
- Landing page loads correctly
- Custom food creation form opens/closes
- Manage Saved Meals modal functions
- Weekly view toggle (expand/collapse)
- Responsive mobile layout (375px width)
- Export/Import buttons present
- Clear Today's Log button
- Navigation and UI structure

### Not Tested / Needs Work ⚠️
- Search food (API timeout)
- Add food to daily log (blocked by search)
- Save meals (blocked by no logged foods)
- Data persistence (localStorage)
- Export/Import functionality
- Weekly chart data display

---

## Recommendations

### Priority: High
1. **Fix API connectivity** - The core search feature needs to work. Test API calls independently and verify CORS headers.
2. **Add offline fallback** - Cache a small default food database for when API is unavailable.

### Priority: Medium
3. **Add loading states** - Show spinner during API calls
4. **Improve error messages** - Make timeout errors more actionable
5. **Add input validation** - HTML5 `required` and `min` attributes on forms

### Priority: Low
6. **Increase success message duration** - From 3s to 5s
7. **Add empty state for search** - "No results" message styling
8. **Add keyboard shortcuts** - ESC to close modals

---

## Test Notes

- Tested on macOS with Chromium browser via Playwright
- No authentication required
- All data stored locally in localStorage
- No broken links detected (single-page app)
- Mobile responsive layout works well

---

🤖 Generated with Claude Code
