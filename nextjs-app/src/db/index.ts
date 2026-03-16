import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Database client singleton
let client: any = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let initError: Error | null = null;

function createDbClient() {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  console.log('[DB] Initializing. URL present:', !!url, 'Token present:', !!authToken);

  // Check if we have real Turso credentials
  if (url &&
      authToken &&
      !url.includes('localhost') &&
      !url.includes('dummy') &&
      authToken !== 'dummy-token-for-build-testing') {
    // Use Turso
    console.log('[DB] Using Turso database:', url.substring(0, 30) + '...');
    return createClient({
      url,
      authToken,
    });
  }

  // Fallback to local SQLite file
  // libsql client supports file: URLs natively
  console.log('[DB] Using local SQLite file for development');
  return createClient({
    url: 'file:./local.db',
  });
}

export function getDb() {
  if (dbInstance) return dbInstance;
  if (initError) throw initError;

  try {
    client = createDbClient();
    dbInstance = drizzle(client, { schema });
    return dbInstance;
  } catch (error) {
    console.error('Database initialization error:', error);
    initError = error as Error;
    throw initError;
  }
}

// Lazy export - will initialize on first use
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const db = getDb();
    return (db as any)[prop];
  },
});
