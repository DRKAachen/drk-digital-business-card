import type { NextAuthConfig } from 'next-auth'

/**
 * Edge-compatible Auth.js configuration.
 * This module must NOT import Prisma or any Node.js-only dependencies
 * because it's used by the middleware which runs in the Edge Runtime.
 *
 * The full config (with Prisma adapter) is in lib/auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    {
      id: 'authentik',
      name: 'Authentik',
      type: 'oidc' as const,
      issuer: process.env.AUTH_AUTHENTIK_ISSUER,
      clientId: process.env.AUTH_AUTHENTIK_ID,
      clientSecret: process.env.AUTH_AUTHENTIK_SECRET,
    },
  ],
  callbacks: {
    /** Persist the user ID in the JWT so it's available without a DB query */
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    /** Expose the user ID on the session object for server components */
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
} satisfies NextAuthConfig
