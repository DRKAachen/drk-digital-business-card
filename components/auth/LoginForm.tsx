'use client'

import { signIn } from 'next-auth/react'
import styles from './LoginForm.module.scss'

/**
 * Simple login form that redirects to Authentik for OIDC authentication.
 * All user/password management is handled by Authentik's own UI.
 */
export default function LoginForm() {
  function handleLogin() {
    signIn('authentik', { callbackUrl: '/dashboard' })
  }

  return (
    <div className={styles.formWrapper}>
      <button
        onClick={handleLogin}
        className="btn btn--primary btn--full"
      >
        Mit Authentik anmelden
      </button>

      <p className={styles.privacyNotice}>
        Mit der Anmeldung stimmen Sie unserer{' '}
        <a href="/datenschutz" target="_blank" rel="noopener noreferrer">
          Datenschutzerklärung
        </a>{' '}
        zu.
      </p>
    </div>
  )
}
