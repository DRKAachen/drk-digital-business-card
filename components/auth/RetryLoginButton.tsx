'use client'

import { signIn } from 'next-auth/react'

interface RetryLoginButtonProps {
  /** Optional override for the visible label. */
  label?: string
  /** Callback URL after successful login. Defaults to /dashboard. */
  callbackUrl?: string
  /** Optional className appended to the shared `.btn` classes. */
  className?: string
}

/**
 * Dedicated client button used on the auth error page to start a fresh
 * sign-in flow. Kept separate from the regular LoginForm so that:
 *  1. The error page does not double up on legal copy, and
 *  2. The button text can say "Erneut anmelden" instead of
 *     "Mit Authentik anmelden", which reads better in context.
 *
 * Triggering a fresh signIn() here is critical: it makes Auth.js set a new
 * PKCE code_verifier cookie in the current browser, which resolves the
 * most common root cause of the error (cookie missing because user
 * continued the flow in a different browser or after the 15-minute
 * cookie TTL).
 */
export default function RetryLoginButton({
  label = 'Erneut anmelden',
  callbackUrl = '/dashboard',
  className,
}: RetryLoginButtonProps) {
  function handleClick() {
    signIn('authentik', { callbackUrl })
  }

  const combined = className ? `btn btn--primary btn--full ${className}` : 'btn btn--primary btn--full'

  return (
    <button onClick={handleClick} className={combined} type="button">
      {label}
    </button>
  )
}
