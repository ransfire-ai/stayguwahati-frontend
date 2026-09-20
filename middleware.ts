import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const NOINDEX_PREFIXES = [
  '/admin', '/dashboard', '/profile', '/host-dashboard', '/owner-dashboard',
  '/login', '/signin', '/register', '/forgot-password', '/reset-password',
  '/bookings', '/book-stay', '/booking-confirmation', '/checkout', '/chat',
  '/edit-property', '/list-property', '/wishlist', '/review', '/host-profile', '/map',
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const shouldNoIndex = NOINDEX_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!shouldNoIndex) return NextResponse.next();

  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
