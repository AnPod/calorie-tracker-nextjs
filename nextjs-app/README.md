# Calorie Tracker - Next.js + Turso + NextAuth

A multi-user calorie tracking application with persistent cloud storage.

## Features

- **Authentication**: Google OAuth via NextAuth.js
- **Database**: Turso (SQLite edge database)
- **ORM**: Drizzle ORM
- **User Isolation**: Each user's data is completely isolated
- **Cross-device sync**: Access your data from any device

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Turso Database

```bash
# Login to Turso
turso auth login

# Create database
turso db create calorie-tracker-db

# Get database URL
turso db show calorie-tracker-db

# Create auth token
turso db tokens create calorie-tracker-db
```

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Required variables:
- `TURSO_DATABASE_URL` - From `turso db show`
- `TURSO_AUTH_TOKEN` - From `turso db tokens create`
- `AUTH_SECRET` - Generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

### 4. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### 5. Run Database Migrations

```bash
npm run db:push
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

Make sure to set:
- `AUTH_TRUST_HOST=true` for production

## Project Structure

```
src/
  app/
    api/
      auth/[...nextauth]/  # NextAuth.js API route
      food-entries/        # Food entry CRUD API
      custom-foods/        # Custom food CRUD API
      saved-meals/         # Saved meal CRUD API
      settings/            # User settings API
      weekly/              # Weekly summary API
    login/                 # Login page
    page.tsx               # Main app page
  auth.ts                  # NextAuth configuration
  db/
    index.ts               # Database client
    schema.ts              # Database schema
  components/
    LogoutButton.tsx       # Sign out button
public/
  app/
    index.html             # Main app UI (iframe content)
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/food-entries?date=YYYY-MM-DD` | GET | Get food entries for a date |
| `/api/food-entries` | POST | Add food entry |
| `/api/food-entries?id=xxx` | DELETE | Delete food entry |
| `/api/custom-foods` | GET | Get user's custom foods |
| `/api/custom-foods` | POST | Add custom food |
| `/api/custom-foods?id=xxx` | DELETE | Delete custom food |
| `/api/saved-meals` | GET | Get saved meals |
| `/api/saved-meals` | POST | Save meal |
| `/api/saved-meals?id=xxx` | DELETE | Delete saved meal |
| `/api/settings` | GET | Get user settings |
| `/api/settings` | PUT | Update settings |
| `/api/weekly` | GET | Get weekly summary |

## Database Schema

All tables include `user_id` for complete data isolation:

- `users` - User accounts (managed by NextAuth)
- `accounts` - OAuth accounts
- `sessions` - Active sessions
- `food_entries` - Daily food log entries
- `custom_foods` - User-created custom foods
- `saved_meals` - User's saved meals
- `saved_meal_items` - Items within saved meals
- `user_settings` - User preferences

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio
