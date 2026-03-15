# QA Report: Calorie Tracker Next.js

**URL:** https://calorie-tracker-nextjs.vercel.app
**Date:** 2026-03-15
**Mode:** Full
**Framework:** Next.js 16.1.6 (Turbopack)
**Duration:** ~10 minutes
**Pages Visited:** 5 (Login, Dashboard, Progress, Profile, Onboarding attempt)
**Screenshots:** 53 total

---

## Health Score: 75/100

| Category         | Score | Weight | Weighted |
| ---------------- | ----- | ------ | -------- |
| Console          | 100   | 15%    | 15.0     |
| Links            | 100   | 10%    | 10.0     |
| Visual           | 100   | 10%    | 10.0     |
| Functional       | 50    | 20%    | 10.0     |
| UX               | 100   | 15%    | 15.0     |
| Performance      | 100   | 10%    | 10.0     |
| Content          | 100   | 5%     | 5.0      |
| Accessibility    | 100   | 15%    | 15.0     |
| **TOTAL**        |       |        | **75.0** |

---

## Issues Summary

| ID         | Title                                    | Severity | Category   |
| ---------- | ---------------------------------------- | -------- | ---------- |
| ISSUE-001  | Onboarding page returns 404 on Vercel    | Critical | Functional |
| ISSUE-002  | Onboarding code not deployed to Vercel   | Critical | Functional |
| ISSUE-003  | OpenFoodFacts API slow/unresponsive      | Low      | External   |

---

## Issue Details

### ISSUE-001: Onboarding Page Returns 404 on Vercel

**Severity:** Critical
**Category:** Functional
**Status:** Open

**Description:**
Navigating to `/onboarding` returns a 404 error on the Vercel deployment. The page exists locally in `src/app/onboarding/page.tsx` but is not accessible in production.

**Reproduction Steps:**
1. Navigate to `https://calorie-tracker-nextjs.vercel.app/onboarding`
2. Observe 404 error page

**Evidence:**
- Screenshot: `onboarding-page-direct.png` (shows 404 page)
- Network request: `GET /onboarding → 404`

**Impact:** New users cannot complete onboarding flow on production. The feature is completely non-functional on Vercel.

**Root Cause:** Code has not been committed or deployed to Vercel. The `src/app/onboarding/` directory and all onboarding-related changes exist only locally.

---

### ISSUE-002: Onboarding Code Not Deployed to Vercel

**Severity:** Critical
**Category:** Functional
**Status:** Open

**Description:**
The onboarding feature was built locally but was never committed to git or pushed to Vercel. Git status shows the `nextjs-app/` directory as untracked.

**Evidence:**
```
git status --short
 M ../index.html
?? ../.gitignore
?? ../.gstack/
?? ./
```

**Impact:** The entire onboarding feature (schema changes, TDEE calculator, 3-step UI, tests) is missing from production.

**Recommended Fix:**
1. Commit all onboarding changes to git
2. Push to remote repository
3. Trigger Vercel deployment

---

### ISSUE-003: OpenFoodFacts API Slow/Unresponsive

**Severity:** Low
**Category:** External
**Status:** Known Issue

**Description:**
The OpenFoodFacts API (`world.openfoodfacts.org`) can be slow to respond, causing the food search feature to show "Searching global database..." for extended periods.

**Evidence:**
- Network request: `GET https://world.openfoodfacts.org/cgi/search.pl?search_terms=banana → pending`
- Screenshot: `banana-results.png` shows search in progress after 15+ seconds

**Impact:** Users may perceive the app as broken when searching for food.

**Mitigation:** This is an external dependency. Consider:
- Adding a timeout with user feedback
- Caching search results
- Providing fallback suggestions

---

## Pages Tested

### Login Page (`/login`)
- **Status:** Working
- **Console Errors:** None
- **Notes:** Form submission works correctly. Test credentials accepted.

### Dashboard (`/`)
- **Status:** Working
- **Console Errors:** None
- **Notes:** Calorie ring, macro bars, and diary section display correctly. Empty state shows helpful message.

### Progress Page (`/progress`)
- **Status:** Working (Placeholder)
- **Console Errors:** None
- **Notes:** Shows "Coming Soon" message with planned features. Navigation works.

### Profile Page (`/profile`)
- **Status:** Working
- **Console Errors:** None
- **Notes:** User info displays correctly. Settings buttons show "Soon" state.

### Onboarding Page (`/onboarding`)
- **Status:** Broken (404)
- **Console Errors:** None (page doesn't exist)
- **Notes:** Returns 404 error. Code not deployed.

---

## Console Health Summary

**Total Console Errors:** 0

All tested pages had zero console errors. The application is well-behaved from a JavaScript perspective.

---

## Network Health Summary

**Failed Requests:** 1 (the 404 onboarding page)

All other requests returned 200 OK status. No 500 errors or timeouts observed within the app's control.

---

## Responsive Design

**Mobile Viewport (375x812):** Tested on login page
- Layout adjusts correctly
- Form inputs remain usable
- No horizontal overflow

---

## Top 3 Things to Fix

1. **Deploy onboarding code to Vercel** - The entire onboarding feature is missing from production. Commit and push changes.

2. **Verify deployment pipeline** - Ensure future changes are automatically deployed to Vercel when pushed.

3. **Add timeout feedback for food search** - When OpenFoodFacts is slow, show a timeout message or cached suggestions.

---

## Baseline Data (for regression testing)

```json
{
  "date": "2026-03-15",
  "url": "https://calorie-tracker-nextjs.vercel.app",
  "healthScore": 75,
  "issues": [
    {
      "id": "ISSUE-001",
      "title": "Onboarding page returns 404 on Vercel",
      "severity": "Critical",
      "category": "Functional"
    },
    {
      "id": "ISSUE-002",
      "title": "Onboarding code not deployed to Vercel",
      "severity": "Critical",
      "category": "Functional"
    },
    {
      "id": "ISSUE-003",
      "title": "OpenFoodFacts API slow/unresponsive",
      "severity": "Low",
      "category": "External"
    }
  ],
  "categoryScores": {
    "console": 100,
    "links": 100,
    "visual": 100,
    "functional": 50,
    "ux": 100,
    "performance": 100,
    "content": 100,
    "accessibility": 100
  }
}
```

---

## Screenshots

| Screenshot                       | Description                    |
| -------------------------------- | ------------------------------ |
| `initial.png`                    | Login page initial state       |
| `login-page.png`                 | Login page annotated           |
| `login-filled.png`               | Login form filled              |
| `post-login.png`                 | Dashboard after login          |
| `add-food-sheet.png`             | Add food bottom sheet          |
| `food-search-results.png`        | Food search in progress        |
| `banana-results.png`             | Search still loading           |
| `progress-page.png`              | Progress page                  |
| `profile-page.png`               | Profile page                   |
| `onboarding-page-direct.png`     | 404 on onboarding page         |
| `mobile-login.png`               | Mobile responsive view         |

---

## Next Steps

1. Commit all onboarding changes to git
2. Push to remote repository
3. Wait for Vercel deployment
4. Run regression QA to verify onboarding works on production