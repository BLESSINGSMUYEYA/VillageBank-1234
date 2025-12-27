import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const protectedRoutes = [
  '/dashboard',
  '/groups',
  '/contributions',
  '/loans',
  '/profile',
  '/settings'
];

const adminRoutes = [
  '/admin'
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes
  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname === '/' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = req.cookies.get('auth_token')?.value;
  const payload = token ? await verifyToken(token) : null;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute || isAdminRoute) {
    if (!payload) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (isAdminRoute) {
    const role = (payload as any)?.role;
    if (role !== 'REGIONAL_ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.rewrite(new URL('/403', req.url)); // Or just redirect to dashboard
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
