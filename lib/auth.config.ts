import type { NextAuthConfig } from 'next-auth'

/**
 * Edge-compatible Auth.js configuration.
 * This module must NOT import Prisma or any Node.js-only dependencies
 * because it's used by the middleware which runs in the Edge Runtime.
 *
 * The full config (with Prisma adapter) is in lib/auth.ts.
 */
export const authConfig = {
  trustHost: true,
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
      // Safe because Authentik is the only sign-in provider —
      // no risk of a different provider hijacking via matching email.
      allowDangerousEmailAccountLinking: true,
    },
  ],
  callbacks: {
    /**
     * Persist the user ID and Authentik id_token in the JWT.
     * The id_token is needed later to perform a proper OIDC logout
     * that also terminates the Authentik session.
     */
    jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      if (account?.id_token) {
        token.idToken = account.id_token
      }
      return token
    },
    /** Expose user ID, id_token, and issuer URL on the session object */
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
      }
      if (token.idToken) {
        session.idToken = token.idToken as string
      }
      session.authentikIssuer = process.env.AUTH_AUTHENTIK_ISSUER
      return session
    },
  },
} satisfies NextAuthConfig
