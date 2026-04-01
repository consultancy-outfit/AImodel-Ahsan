import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/hub', '/agents', '/marketplace', '/discover'];
const AUTH_ROUTES = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read token from cookie (we'll set it as a cookie on login)
  // Also check x-auth-token header as fallback
  const token = request.cookies.get('nexusai_token')?.value;

  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  // No token + trying to access protected route → redirect to login
  if (isProtected && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Has token + trying to access auth routes → redirect to hub
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/hub', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/hub/:path*', '/agents/:path*', '/marketplace/:path*', '/discover/:path*', '/auth/:path*'],
};
