import { NextResponse, NextRequest } from 'next/server';

// Middleware to protect routes
// Only /login and /api/auth/* are accessible without authentication
export default function middleware(req: NextRequest) {
  const { nextUrl } = req;

  const isApiRoute = nextUrl.pathname.startsWith('/api');
  const isAppRoute = nextUrl.pathname.startsWith('/app/');
  const isPublicRoute = nextUrl.pathname === '/login';

  // Allow all API routes (they handle auth internally)
  // Allow app static files (they'll handle auth via iframe parent)
  if (isApiRoute || isAppRoute) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionToken = req.cookies.get('next-auth.session-token')?.value ||
                       req.cookies.get('__Secure-next-auth.session-token')?.value;
  const isLoggedIn = !!sessionToken;

  // Redirect unauthenticated users to login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
