# Vercel Deployment Plan: Calorie Tracker

## Current State

**Stack:** Vanilla HTML/CSS/JS (no build step, no framework)
**Entry:** `index.html` (single file, ~1600 lines)
**Dependencies:** None (uses browser APIs + Open Food Facts API)

## Deployment Steps

### Step 1: Create Vercel Config

Create `vercel.json` to configure static deployment:

```json
{
  "version": 2,
  "name": "calorie-tracker",
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Step 2: Add package.json (Optional but Recommended)

```json
{
  "name": "calorie-tracker",
  "version": "1.0.0",
  "description": "Simple calorie tracking app",
  "scripts": {
    "dev": "vercel dev",
    "deploy": "vercel --prod"
  },
  "devDependencies": {
    "vercel": "^33.0.0"
  }
}
```

### Step 3: Environment Variables

Create `.env.example` for any future API keys:

```bash
# Optional: For future API configuration
# OPENFOODFACTS_API_URL=https://world.openfoodfacts.org
```

### Step 4: Update API Configuration

The Open Food Facts API should work from Vercel, but we should:

1. **Check CORS**: The API uses CORS, should work from any domain
2. **Add retry logic**: Handle timeouts gracefully
3. **Add loading states**: Better UX while waiting

### Step 5: Add .gitignore

```gitignore
# Vercel
.vercel

# Dependencies
node_modules/

# Environment
.env
.env.local

# OS
.DS_Store
```

### Step 6: Test Search API from Production

Before deploying, verify the API works:

```bash
curl "https://world.openfoodfacts.org/cgi/search.pl?search_terms=banana&json=1&page_size=10" \
  -H "User-Agent: CalorieTracker/1.0"
```

### Step 7: Deploy Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login (first time)
vercel login

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

---

## Known Issues to Address

### Issue 1: Search Timeout (Critical)

**Problem:** API calls timeout after 10s from localhost

**Solution Options:**

A. **Increase timeout** (Quick fix):
```javascript
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s
```

B. **Add loading indicator** (Better UX):
- Show spinner while searching
- Disable search button during request

C. **Add fallback** (Most robust):
- Cache popular foods locally
- Show cached results if API fails

### Issue 2: No Loading State

**Current:** Button just disables, no visual feedback

**Fix:** Add spinner to search button:
```css
.btn-loading {
  position: relative;
  color: transparent;
}
.btn-loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

### Issue 3: localStorage Persistence

**Note:** localStorage data is browser-specific, won't sync across devices. This is expected behavior for this app design.

---

## Post-Deploy Verification

### Checklist

- [ ] App loads at custom domain
- [ ] Search returns results within 5 seconds
- [ ] Custom food creation works
- [ ] Data persists in localStorage
- [ ] Mobile responsive layout works
- [ ] Export/Import functions work
- [ ] Weekly view displays correctly

### Performance Targets

- **Lighthouse Score**: 90+ (Performance)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s

---

## Estimated Timeline

| Task | Time |
|------|------|
| Create vercel.json | 2 min |
| Add loading states | 15 min |
| Fix timeout issues | 10 min |
| Test deployment | 5 min |
| **Total** | **~30 min** |

---

## Future Enhancements (Post-Deploy)

1. **PWA Support** - Add service worker for offline use
2. **Analytics** - Track most searched foods
3. **API Proxy** - Route through serverless function for reliability
4. **Database** - Move from localStorage to Supabase/Firebase

---

## Commands Summary

```bash
# Setup
cd myfitnesspal-clone
npm init -y
npm install -g vercel

# Deploy
vercel --prod

# View logs
vercel logs --tail
```
