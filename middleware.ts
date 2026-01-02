import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const protectedRoutes = [
  '/dashboard',
  '/groups',
  '/contributions',
  '/loans',
  '/profile',
  '/settings',
  '/admin',  // Added admin routes to protected routes
  '/treasurer'
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes - allow access without authentication
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname === '/' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/shared') ||  // Allow public shared links
    pathname.startsWith('/_next') ||   // Allow Next.js internals
    pathname.startsWith('/api/shared')  // Allow shared API endpoints
  ) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = req.cookies.get('auth_token')?.value;
  const payload = token ? await verifyToken(token) : null;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = pathname.startsWith('/admin');

  // Role-based Redirects
  if (payload) {
    const role = (payload as any)?.role;

    // Redirect REGIONAL_ADMIN from root or dashboard to their admin page
    if (role === 'REGIONAL_ADMIN') {
      if (pathname === '/' || pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/admin/regional', req.url));
      }
    }

    // Redirect SUPER_ADMIN from root or dashboard to their system admin page
    if (role === 'SUPER_ADMIN') {
      if (pathname === '/' || pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/admin/system', req.url));
      }
    }
  }

  // Require authentication for protected routes
  if (isProtectedRoute) {
    if (!payload) {
      const loginUrl = new URL('/login', req.nextUrl.origin);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Additional check for admin routes - require admin role
  if (isAdminRoute && payload) {
    const role = (payload as any)?.role;

    // Allow REGIONAL_ADMIN and SUPER_ADMIN access to admin routes
    if (role !== 'REGIONAL_ADMIN' && role !== 'SUPER_ADMIN') {
      // Redirect to dashboard instead of non-existent 403 page
      return NextResponse.redirect(new URL('/dashboard', req.url));
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
