import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/utils/auth';

/**
 * Proxy middleware (replaces middleware.ts in Next.js 15+)
 * This handles route protection and redirects unauthenticated users.
 */

export function proxy(request: NextRequest) {
  const publicPaths = ['/auth/login', '/auth/signup'];
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Allow public routes to continue
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check authentication token
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Continue to requested route if valid
  return NextResponse.next();
}

/**
 * Config defines which routes are protected by the proxy.
 */
export const config = {
  matcher: ['/doctor/:path*', '/patient/:path*', '/call/:path*'],
};
