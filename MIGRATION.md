# Migration: From localStorage to Turso + NextAuth

This document describes the transformation from a single-user localStorage app to a multi-user cloud-based application.

## Architecture Overview

### Before (localStorage)
```
┌─────────────────────────────────┐
│         Browser               │
│  ┌─────────────────────────┐  │
│  │  index.html (vanilla)   │  │
│  │  - localStorage API     │  │
│  │  - No authentication    │  │
│  └─────────────────────────┘  │
└─────────────────────────────────┘
```

### After (Turso + NextAuth)
```
┌─────────────────────────────────────────────────────────┐
│                      Vercel                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Next.js App                        │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │   │
│  │  │  Auth   │  │   API   │  │  Static App    │ │   │
│  │  │NextAuth │  │ Routes  │  │  (index.html)  │ │   │
│  │  └────┬────┘  └────┬────┘  └────────────────┘ │   │
│  └───────┼────────────┼──────────────────────────┘   │
│          │            │                               │
└──────────┼────────────┼───────────────────────────────┘
           │            │
     ┌─────▼─────┐  ┌───▼────────┐
     │  Google   │  │   Turso    │
     │   OAuth   │  │  (SQLite)  │
     └───────────┘  └────────────┘
```

## Key Changes

### 1. Storage Layer

| Aspect | Before | After |
|--------|--------|-------|
| **Storage** | localStorage | Turso (SQLite edge) |
| **Persistence** | Browser only | Cloud + edge cached |
| **Capacity** | ~5MB | Virtually unlimited |
| **Sync** | None | Real-time across devices |
| **Backup** | Manual export | Automatic + manual export |

### 2. Authentication

| Aspect | Before | After |
|--------|--------|-------|
| **Users** | Anonymous | Google OAuth |
| **Sessions** | None | JWT + database sessions |
| **Data isolation** | None | Complete per-user isolation |
| **Security** | None | NextAuth.js + middleware |

### 3. Data Model

**Before (flat JSON):**
```json
{
  "dailyLog": { "2026-03-13": [...] },
  "customFoods": [...],
  "savedMeals": [...],
  "settings": { "dailyCalorieGoal": 2000 }
}
```

**After (relational SQL):**
```sql
-- Each table has user_id for isolation
food_entries(id, user_id, date, name, ...)
custom_foods(id, user_id, name, ...)
saved_meals(id, user_id, name, ...)
saved_meal_items(id, meal_id, name, ...)
user_settings(user_id, daily_calorie_goal)
```

### 4. API Layer

New RESTful endpoints:

```
GET  /api/food-entries?date=YYYY-MM-DD
POST /api/food-entries
DELETE /api/food-entries?id=xxx

GET  /api/custom-foods
POST /api/custom-foods
DELETE /api/custom-foods?id=xxx

GET  /api/saved-meals
POST /api/saved-meals
DELETE /api/saved-meals?id=xxx

GET  /api/settings
PUT  /api/settings

GET  /api/weekly
```

All endpoints require authentication and filter by `user_id`.

## Frontend Changes

### Storage API Transformation

```javascript
// BEFORE: Synchronous localStorage
App.Storage.getDayLog = function(dateKey) {
    const data = JSON.parse(localStorage.getItem('calorieTrackerData'));
    return data.dailyLog[dateKey] || [];
};

App.Storage.addToDayLog = function(dateKey, entry) {
    const data = this.getData();
    data.dailyLog[dateKey].push(entry);
    localStorage.setItem('calorieTrackerData', JSON.stringify(data));
    return true;
};

// AFTER: Async API calls
App.Storage.getDayLog = async function(dateKey) {
    const response = await fetch(`/api/food-entries?date=${dateKey}`);
    return await response.json();
};

App.Storage.addToDayLog = async function(dateKey, entry) {
    const response = await fetch('/api/food-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...entry, date: dateKey }),
    });
    return response.ok;
};
```

### UI Updates

All UI functions became async:

```javascript
// BEFORE
App.UI.renderLoggedFoods = function() {
    const entries = App.Storage.getDayLog(getTodayKey());
    // render...
};

// AFTER
App.UI.renderLoggedFoods = async function() {
    const entries = await App.Storage.getDayLog(getTodayKey());
    // render...
};
```

## Database Schema

```sql
-- Users (managed by NextAuth)
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Food entries with user isolation
CREATE TABLE food_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT,
    grams REAL NOT NULL,
    calories_per_100g REAL NOT NULL,
    protein_per_100g REAL DEFAULT 0,
    carbs_per_100g REAL DEFAULT 0,
    fat_per_100g REAL DEFAULT 0,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_food_entries_user_date ON food_entries(user_id, date);
```

## Security Model

1. **Authentication**: NextAuth.js with Google OAuth
2. **Session Management**: JWT + database sessions
3. **API Authorization**: Every endpoint validates session
4. **Data Isolation**: All queries filter by `user_id`
5. **Middleware**: Unauthenticated users redirected to /login

## Deployment

### Environment Variables

```bash
# Turso
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=

# NextAuth
AUTH_SECRET=
AUTH_TRUST_HOST=true

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Build Command

```bash
npm run db:push && npm run build
```

## Migration Path for Existing Users

Users with localStorage data can export it before signing in:

1. Open old app version
2. Click "Export Data"
3. Save JSON file
4. Sign in to new version
5. (Future: Import functionality to restore data)

## Benefits

| Feature | Benefit |
|---------|---------|
| Multi-device | Access from phone, tablet, desktop |
| Cloud backup | No data loss when clearing browser |
| User accounts | Personalized experience |
| Scalability | Can add features like sharing, social |
| Security | Proper authentication & authorization |

## Trade-offs

| Aspect | Consideration |
|--------|--------------|
| Complexity | More moving parts (DB, Auth, API) |
| Cost | Turso free tier limits |
| Latency | Network requests vs instant localStorage |
| Offline | Requires connectivity (could add service worker) |
