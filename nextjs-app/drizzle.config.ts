import { defineConfig } from 'drizzle-kit';

// Determine if we're using Turso or local SQLite
const useTurso = process.env.TURSO_DATABASE_URL &&
                 !process.env.TURSO_DATABASE_URL.includes('localhost') &&
                 !process.env.TURSO_DATABASE_URL.includes('dummy');

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: useTurso ? 'turso' : 'sqlite',
  dbCredentials: useTurso
    ? {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
      }
    : {
        url: 'file:./local.db',
      },
});
