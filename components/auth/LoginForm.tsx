'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './LoginForm.module.scss'

type AuthMode = 'password' | 'magiclink'

/**
 * Combined auth form supporting email/password login+registration and magic link.
 * Password mode is the default to avoid Supabase email rate limits (2/hour on free tier).
 * Magic link remains available as an alternative.
 */
export default function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('password')
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Handles email/password sign-in or sign-up. */
  async function handlePasswordAuth(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (isRegister && password !== passwordConfirm) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (isRegister) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      setLoading(false)

      if (signUpError) {
        setError(mapAuthError(signUpError))
        return
      }

      router.push('/dashboard')
      router.refresh()
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      setLoading(false)

      if (signInError) {
        setError(mapAuthError(signInError))
        return
      }

      router.push('/dashboard')
      router.refresh()
    }
  }

  /** Handles magic link (OTP) sign-in. */
  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const siteUrl = /^https?:\/\//i.test(rawSiteUrl) ? rawSiteUrl : `https://${rawSiteUrl}`

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

  /** Maps Supabase auth errors to user-friendly German messages. */
  function mapAuthError(err: { status?: number; message?: string }): string {
    if (err.status === 429 || err.message?.includes('rate')) {
      return 'Zu viele Anmeldeversuche. Bitte warten Sie einige Minuten.'
    }
    if (err.message?.includes('Invalid login credentials')) {
      return 'E-Mail oder Passwort ist falsch.'
    }
    if (err.message?.includes('User already registered')) {
      return 'Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.'
    }
    if (err.message?.includes('Password should be at least')) {
      return 'Das Passwort muss mindestens 8 Zeichen lang sein.'
    }
    return 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'
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

  if (mode === 'magiclink') {
    return (
      <div className={styles.formWrapper}>
        <form onSubmit={handleMagicLink} className={styles.form}>
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

        <button
          type="button"
          className={styles.modeToggle}
          onClick={() => { setMode('password'); setError(null) }}
        >
          Stattdessen mit Passwort anmelden
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

  return (
    <div className={styles.formWrapper}>
      <form onSubmit={handlePasswordAuth} className={styles.form}>
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

        <div className="form-field">
          <label htmlFor="password" className="form-field__label">
            Passwort
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-field__input"
            placeholder="Mindestens 8 Zeichen"
            required
            minLength={8}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
        </div>

        {isRegister && (
          <div className="form-field">
            <label htmlFor="passwordConfirm" className="form-field__label">
              Passwort bestätigen
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="form-field__input"
              placeholder="Passwort wiederholen"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className="btn btn--primary btn--full"
          disabled={loading || !email || !password}
        >
          {loading
            ? (isRegister ? 'Registrierung...' : 'Anmeldung...')
            : (isRegister ? 'Registrieren' : 'Anmelden')
          }
        </button>
      </form>

      <div className={styles.toggleRow}>
        <button
          type="button"
          className={styles.modeToggle}
          onClick={() => { setIsRegister(!isRegister); setError(null) }}
        >
          {isRegister ? 'Bereits registriert? Anmelden' : 'Noch kein Konto? Registrieren'}
        </button>
        <span className={styles.toggleSeparator}>·</span>
        <button
          type="button"
          className={styles.modeToggle}
          onClick={() => { setMode('magiclink'); setError(null) }}
        >
          Magic Link nutzen
        </button>
      </div>

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
