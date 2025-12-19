import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard/:path*',
  '/groups/:path*',
  '/contributions/:path*',
  '/loans/:path*',
  '/profile/:path*',
  '/settings/:path*'
])

const isAdminRoute = createRouteMatcher([
  '/admin/:path*'
])

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl
  
  // Don't protect auth routes
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return
  }

  // Check admin routes for proper role
  if (isAdminRoute(req)) {
    const authObj = await auth()
    if (!authObj.userId) {
      throw new Error("Unauthorized")
    }
    
    // Check if user has admin role
    const userRole = (authObj.sessionClaims as any)?.metadata?.role
    if (!userRole || (userRole !== 'REGIONAL_ADMIN' && userRole !== 'SUPER_ADMIN')) {
      throw new Error("Insufficient permissions")
    }
    
    // For system admin routes, require SUPER_ADMIN role
    if (pathname.includes('/admin/system')) {
      if (userRole !== 'SUPER_ADMIN') {
        throw new Error("Insufficient permissions")
      }
    }
  }

  // Check regular protected routes
  if (isProtectedRoute(req)) {
    const authObj = await auth()
    if (!authObj.userId) {
      throw new Error("Unauthorized")
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
