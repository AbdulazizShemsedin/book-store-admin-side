import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Public routes that do not require an active admin session.
 */
const PUBLIC_PREFIXES = [
  '/login',
  '/api',
  '/admin/api',
  '/internal',
  '/_next',
  '/images',
  '/icon.png',
  '/robots.txt',
  '/favicon.ico',
  '/mockServiceWorker.js',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public routes, static assets, and backend API proxies
  const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Check demo mode (only permitted outside production)
  const isDemo =
    process.env.NODE_ENV !== 'production' &&
    (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      process.env.NEXT_PUBLIC_USE_MOCK_API === 'true');

  const hasSession = request.cookies.get('tewba_session_active')?.value === 'true';

  // 2. If logged in and visiting /login, redirect to /dashboard
  if (pathname === '/login' && hasSession && !isDemo) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isPublic || isDemo) {
    return NextResponse.next();
  }

  // 3. Intercept unauthenticated access to protected routes at the Server Edge
  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/' && !pathname.startsWith('/login')) {
      loginUrl.searchParams.set('returnUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png, images/
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|images/|mockServiceWorker.js).*)',
  ],
};
