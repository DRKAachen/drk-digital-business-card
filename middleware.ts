import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/lib/auth.config'

/**
 * Auth.js middleware that protects /dashboard/* routes and redirects
 * logged-in users away from /login. Uses the edge-compatible auth config
 * (no Prisma) so it can run in the Edge Runtime. Session is read from the
 * JWT cookie without a database round-trip.
 */
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  if (!isLoggedIn && pathname.startsWith('/dashboard')) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (isLoggedIn && pathname === '/login') {
    const redirect = req.nextUrl.searchParams.get('redirect') || '/dashboard'
    const url = req.nextUrl.clone()
    url.pathname = redirect
    url.search = ''
    return NextResponse.redirect(url)
  }
})

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
