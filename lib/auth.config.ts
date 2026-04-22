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
    // Custom error page. Auth.js appends ?error=<Code> when routing here,
    // so the page can show a friendly German message and a retry button
    // instead of the stock Auth.js UI.
    error: '/login/error',
  },
  cookies: {
    /*
     * Extend the PKCE code_verifier cookie lifetime from the Auth.js v5
     * default of 15 minutes to 30 minutes.
     *
     * Reason: during Authentik's email verification / enrollment flow
     * users routinely leave the page to open their inbox and click the
     * confirmation link. On slower mail servers or distracted users this
     * regularly exceeds 15 minutes, which then manifests as
     * `InvalidCheck: pkceCodeVerifier value could not be parsed` and a
     * `?error=Configuration` redirect on the callback.
     *
     * 30 minutes is a pragmatic trade-off: long enough to cover realistic
     * "I'll check my mail real quick" pauses, short enough that a stale
     * code_verifier cookie does not linger across days. The cookie is
     * still deleted on successful sign-in, so the longer TTL only
     * matters for in-flight / abandoned sign-ins.
     *
     * We deliberately override ONLY `maxAge`. Auth.js v5 deep-merges
     * partial `cookies.*.options` onto its defaults (see
     * `@auth/core/lib/init.ts`), so httpOnly, sameSite: 'lax', path: '/'
     * and the automatic `secure` / `__Secure-` prefix handling (true on
     * HTTPS, false on http://localhost) all stay active unchanged.
     *
     * The `state` cookie has the same 15-minute default and the same
     * failure mode, so extend it to 30 minutes for symmetry — Authentik
     * uses it in the same PKCE + OIDC round-trip.
     */
    pkceCodeVerifier: {
      options: {
        maxAge: 60 * 30,
      },
    },
    state: {
      options: {
        maxAge: 60 * 30,
      },
    },
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
