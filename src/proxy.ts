import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/ideas', '/onboarding']
// Routes only for unauthenticated users
const AUTH_ROUTES = ['/login']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Let the Supabase middleware handle session refresh
  const response = await updateSession(request)

  // Check session by reading the cookie that Supabase sets
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  if (isProtected || isAuthRoute) {
    // We rely on the auth/callback route and server components to do redirects.
    // The updateSession call above refreshes the session cookie if expired.
    return response
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
