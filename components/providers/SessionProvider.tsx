'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

/**
 * Client-side wrapper around the Auth.js SessionProvider.
 * Placed at the root layout so that useSession() is available
 * everywhere (e.g. the LogoutButton for OIDC end-session redirect).
 */
export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
