import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/utils/auth';

export function middleware(request: NextRequest) {
  const publicPaths = ['/auth/login', '/auth/signup'];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/doctor/:path*',
    '/patient/:path*',
    '/call/:path*',
  ],
};