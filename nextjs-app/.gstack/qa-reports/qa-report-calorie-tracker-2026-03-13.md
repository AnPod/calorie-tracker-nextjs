# QA Report: Calorie Tracker

**Date:** 2026-03-13  
**URL:** https://calorie-tracker-nextjs.vercel.app  
**Tester:** Claude Code QA Agent  
**Duration:** ~15 minutes  
**Framework:** Next.js 16.1.6 + NextAuth 4 + Turso

---

## Summary

| Metric | Score | Status |
|--------|-------|--------|
| **Health Score** | 45/100 | 🔴 Needs Work |
| **Console Errors** | 3 | 🔴 Critical issues |
| **Broken Links** | 0 | ✅ None found |
| **Pages Tested** | 4 | Login, API routes, Static files |

---

## Critical Issues (Must Fix)

### ISSUE-001: Login Not Working - CredentialsSignin Error
**Severity:** Critical  
**Category:** Functional

**Description:**
The login form submits but fails authentication with a "CredentialsSignin" error. The user cannot log in to use the application.

**Repro Steps:**
1. Navigate to https://calorie-tracker-nextjs.vercel.app/login
2. Enter email: `test@example.com`
3. Enter password: `test123`
4. Click "Sign in with Email"
5. Observe: Page remains on login, no session created

**Evidence:**
```bash
# API response shows redirect to error page
HTTP/2 302
location: /api/auth/error?error=CredentialsSignin&provider=credentials
```

**Root Cause Analysis:**
- The `authorize` callback in `auth.ts` is likely failing
- Possible database connection issue in serverless environment
- The lazy-loaded database might not be initializing correctly in the authorize callback

**Suggested Fix:**
1. Add error logging to the authorize callback
2. Verify database connection in Vercel functions
3. Check that the users table exists and is queryable
4. Consider using JWT without database for user lookup

---

### ISSUE-002: API Routes Return HTML Instead of JSON (Fixed)
**Severity:** High  
**Category:** Functional  
**Status:** ✅ Fixed in latest deploy

**Description:**
The middleware was redirecting API requests to the login page instead of allowing them to return proper 401 responses.

**Fix Applied:**
```typescript
// middleware.ts - Added exemption for API routes
if (isApiRoute) {
  return NextResponse.next();
}
```

**Verification:**
```bash
curl https://calorie-tracker-nextjs.vercel.app/api/food-entries
# Now returns: 401 Unauthorized (correct)
```

---

### ISSUE-003: Static /app Files Blocked by Middleware (Fixed)
**Severity:** Medium  
**Category:** Configuration  
**Status:** ✅ Fixed in latest deploy

**Description:**
The embedded calorie tracker app at `/app/index.html` was being redirected to login by middleware.

**Fix Applied:**
```typescript
// middleware.ts - Added exemption for app static files
if (isApiRoute || isAppRoute) {
  return NextResponse.next();
}
```

**Verification:**
```bash
curl https://calorie-tracker-nextjs.vercel.app/app/index.html
# Now returns: 200 with HTML content (correct)
```

---

## Console Errors

| Timestamp | Error | Page |
|-----------|-------|------|
| 2026-03-13T21:06:18.298Z | Failed to load resource: 500 () | Initial load |
| 2026-03-13T21:06:44.535Z | Failed to load resource: 500 () | API call |
| 2026-03-13T21:27:33.252Z | Failed to load resource: 401 () | Expected for unauthenticated |

---

## Test Results

### Login Flow
| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Login page loads | 200 OK | ✅ 200 OK | Pass |
| Form displays | Email/password fields | ✅ Fields visible | Pass |
| Submit credentials | Redirect to app | ❌ Stays on login | Fail |
| Session created | Cookie set | ❌ No session | Fail |

### API Endpoints
| Endpoint | Expected | Actual | Status |
|----------|----------|--------|--------|
| GET /api/auth/session | Returns {} | ✅ {} | Pass |
| GET /api/auth/providers | Shows credentials | ✅ credentials | Pass |
| GET /api/food-entries | 401 Unauthorized | ✅ 401 | Pass |
| GET /api/food-entries?date=... | 401 when unauth | ✅ 401 | Pass |

### Static Assets
| Asset | Expected | Actual | Status |
|-------|----------|--------|--------|
| /app/index.html | Returns HTML | ✅ 200 OK | Pass |
| /app/ directory | Serves static | ✅ Working | Pass |

---

## Top 3 Things to Fix

1. **Fix Login Authentication** - Critical - Users cannot access the app
   - Debug `authorize` callback in auth.ts
   - Add proper error logging
   - Verify database connectivity in Vercel

2. **Add Error Handling to Login Page** - High
   - Show error messages when login fails
   - Currently fails silently

3. **Remove Legacy Console Errors** - Low
   - Two 500 errors from earlier testing
   - May indicate intermittent issues

---

## Environment Configuration

| Variable | Status |
|----------|--------|
| TURSO_DATABASE_URL | ✅ Set |
| TURSO_AUTH_TOKEN | ✅ Set |
| AUTH_SECRET | ✅ Set |
| AUTH_TRUST_HOST | ✅ Set |

---

## Screenshots

1. `login-page.png` - Login form with email/password fields
2. `app-iframe.png` - Calorie tracker app (requires login)

---

## Recommendations

1. **Immediate:** Fix the login authentication issue
2. **Short-term:** Add comprehensive error handling to auth flows
3. **Medium-term:** Consider adding Google OAuth for easier testing
4. **Long-term:** Add E2E tests for critical user flows

---

## Appendix: Fixed Issues

### Middleware Configuration (Fixed)
**File:** `src/middleware.ts`

**Before:**
- API routes were being redirected to login
- Static /app files were blocked

**After:**
- API routes pass through (handle auth internally)
- Static files in /app are served directly
- Only page routes require authentication

