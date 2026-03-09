'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './LoginForm.module.scss'

/**
 * Magic link login form. Sends a passwordless login email via Supabase Auth.
 * After clicking the link in the email, the user is redirected to /dashboard.
 */
export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })

    setLoading(false)

    if (authError) {
      if (authError.status === 429 || authError.message?.includes('rate')) {
        setError('Zu viele Anmeldeversuche. Bitte warten Sie einige Minuten und versuchen Sie es erneut.')
      } else {
        setError('Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.')
      }
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>✉️</div>
        <h2>E-Mail gesendet!</h2>
        <p>
          Wir haben einen Anmelde-Link an <strong>{email}</strong> gesendet.
          Bitte prüfen Sie Ihr Postfach und klicken Sie auf den Link.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className="form-field">
        <label htmlFor="email" className="form-field__label">
          E-Mail-Adresse
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-field__input"
          placeholder="vorname.nachname@drk.de"
          required
          autoComplete="email"
          autoFocus
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        type="submit"
        className="btn btn--primary btn--full"
        disabled={loading || !email}
      >
        {loading ? 'Wird gesendet...' : 'Magic Link senden'}
      </button>

      <p className={styles.hint}>
        Sie erhalten einen Anmelde-Link per E-Mail. Kein Passwort nötig.
      </p>
    </form>
  )
}
