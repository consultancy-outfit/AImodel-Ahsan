import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Only the dashboard requires authentication
const PROTECTED_ROUTES = ['/dashboard'];
const AUTH_ROUTES = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('nexusai_token')?.value?.trim();

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // No token → redirect to login (dashboard only)
  if (isProtected && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in → skip auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/hub', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard(.*)',
    '/auth/(login|register)(.*)',
  ],
};
