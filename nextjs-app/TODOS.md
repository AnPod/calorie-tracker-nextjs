# Project TODOs

## Deferred from Onboarding Feature

### Onboarding Funnel Logging
* **What:** Add structured logging for onboarding funnel analytics (started, step_completed, completed, errors).
* **Why:** Track completion rates, drop-off points, debug production issues.
* **Pros:** Data-driven improvements, debugging production issues.
* **Cons:** Log volume, privacy considerations.
* **Context:** Log events: onboarding_started, step_completed, onboarding_completed, onboarding_error. Use structured logging with userId, step, timestamp.
* **Effort:** Small
* **Priority:** P2
* **Depends on:** Onboarding feature merged.

### Onboarding Drop-off Analytics
* **What:** Add onboarding step analytics to track which step users drop off at.
* **Why:** Optimize flow, identify friction points for UX improvements.
* **Pros:** UX improvements, A/B testing capability.
* **Cons:** Adds complexity, privacy considerations.
* **Context:** Could use sessionStorage events or simple API ping to track step progression.
* **Effort:** Small
* **Priority:** P2
* **Depends on:** Onboarding feature merged.

## Previously Deferred

### ~~Handle Turso DB Timeouts in `src/app/page.tsx`~~
* **Status:** RESOLVED — Added try/catch in `checkOnboardingStatus` function.
* **What was the issue:** Server Components could crash if Turso sleeps or times out.
* **Resolution:** Wrapped DB queries in try/catch with graceful fallback to redirect users to onboarding (treats errors as incomplete state).