import 'next-auth'
import 'next-auth/jwt'

/**
 * Augment the default Auth.js types with custom fields used for
 * proper OIDC logout (id_token forwarding to Authentik end-session).
 */
declare module 'next-auth' {
  interface Session {
    idToken?: string
    authentikIssuer?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    idToken?: string
  }
}
