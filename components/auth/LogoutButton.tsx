'use client'

import { signOut, useSession } from 'next-auth/react'

/**
 * Logout button that ends both the Auth.js session and the Authentik
 * OIDC session. Without the Authentik end-session redirect, the user
 * would be silently re-authenticated on the next login attempt because
 * Authentik's session cookie would still be valid.
 */
export default function LogoutButton() {
  const { data: session } = useSession()

  async function handleLogout() {
    const issuer = session?.authentikIssuer
    const idToken = session?.idToken

    await signOut({ redirect: false })

    if (issuer && idToken) {
      const endSessionUrl = new URL(`${issuer}end-session/`)
      endSessionUrl.searchParams.set('id_token_hint', idToken)
      endSessionUrl.searchParams.set(
        'post_logout_redirect_uri',
        window.location.origin,
      )
      window.location.href = endSessionUrl.toString()
    } else {
      window.location.href = '/'
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="btn btn--secondary"
      style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
    >
      Abmelden
    </button>
  )
}
