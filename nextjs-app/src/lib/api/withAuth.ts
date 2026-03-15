import { auth } from '@/auth';
import { Session } from 'next-auth';
import { NextResponse, NextRequest } from 'next/server';

type AuthenticatedHandler = (
  request: NextRequest,
  context: { params: Promise<any>; session: Session }
) => Promise<Response> | Response;

/**
 * Higher Order Function to DRY up authentication checks across all API routes.
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest, context: { params: Promise<any> }) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Pass the session into the handler so we don't have to fetch it again
      return await handler(request, { ...context, session });
    } catch (error) {
      console.error('[API_ERROR]', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}
