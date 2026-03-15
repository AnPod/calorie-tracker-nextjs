import NextAuth, { type NextAuthOptions, type User, type Session, getServerSession } from 'next-auth';
import { type JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './db/schema';
import { eq } from 'drizzle-orm';

// Extend types for custom user id
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}

// Initialize database client once
// This works better in serverless than dynamic requires
function createDbClient() {
  const url = process.env.TURSO_DATABASE_URL || 'file:./local.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // For local development
  if (url.includes('localhost') || url.includes('dummy') || !authToken) {
    console.log('[Auth] Using local SQLite database');
    return createClient({ url: 'file:./local.db' });
  }

  // For Turso production
  console.log('[Auth] Using Turso database:', url.replace(/\.[^.]+$/, '...'));
  return createClient({ url, authToken });
}

// Create database instance
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let dbInitError: Error | null = null;

try {
  const client = createDbClient();
  db = drizzle(client, { schema });
} catch (error) {
  dbInitError = error as Error;
  console.error('[Auth] Database initialization error:', error);
}

export const authOptions: NextAuthOptions = {
  // Use JWT sessions for serverless compatibility
  session: { strategy: 'jwt' },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<User | null> {
        console.log('[Auth] Authorize called with email:', credentials?.email);

        // Check credentials
        if (!credentials?.email) {
          console.log('[Auth] No email provided');
          return null;
        }
        if (credentials.password !== 'test123') {
          console.log('[Auth] Invalid password');
          return null;
        }

        // Check database initialization
        if (!db) {
          console.error('[Auth] Database not initialized:', dbInitError);
          // Fallback: create user without database
          return {
            id: `user-${credentials.email}`,
            email: credentials.email,
            name: credentials.email.split('@')[0],
            image: null,
          };
        }

        try {
          const existingUser = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, credentials.email))
            .limit(1);

          console.log('[Auth] Existing user found:', existingUser.length > 0);

          if (existingUser.length > 0) {
            return {
              id: existingUser[0].id,
              email: existingUser[0].email,
              name: existingUser[0].name,
              image: existingUser[0].image,
            };
          }

          // Create new user
          console.log('[Auth] Creating new user');
          const newUser = await db
            .insert(schema.users)
            .values({
              id: crypto.randomUUID(),
              email: credentials.email,
              name: credentials.email.split('@')[0],
            })
            .returning();

          console.log('[Auth] User created:', newUser[0].id);

          return {
            id: newUser[0].id,
            email: newUser[0].email,
            name: newUser[0].name,
            image: null,
          };
        } catch (error) {
          console.error('[Auth] Database error in authorize:', error);
          // Fallback: create user without database
          return {
            id: `user-${credentials.email}`,
            email: credentials.email,
            name: credentials.email.split('@')[0],
            image: null,
          };
        }
      },
    }),
  ],

  callbacks: {
    jwt: async ({ token, user }: { token: JWT; user?: User }): Promise<JWT> => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }: { session: Session; token: JWT }): Promise<Session> => {
      if (token?.id) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
          },
        };
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  // Secret is required for JWT signing
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,

  // Debug mode for troubleshooting
  debug: process.env.NODE_ENV === 'development',
};

// Export handlers for API routes
const handler = NextAuth(authOptions);
export default handler;

// Export GET and POST for direct use in route handlers
export const GET = handler;
export const POST = handler;

// Export auth function for server-side session retrieval
export async function auth() {
  return getServerSession(authOptions);
}
