'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.scss'

/**
 * Password reset page shown after clicking the reset link from email.
 * The user's session is already established by /auth/callback before arriving here.
 * Uses supabase.auth.updateUser() to set the new password.
 */
export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }

    if (password !== passwordConfirm) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (updateError) {
      if (updateError.message?.includes('same password')) {
        setError('Das neue Passwort muss sich vom alten unterscheiden.')
      } else {
        setError('Fehler beim Ändern des Passworts. Bitte versuchen Sie es erneut.')
      }
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.title}>Passwort geändert</h1>
          <p className={styles.subtitle}>
            Ihr Passwort wurde erfolgreich aktualisiert.
          </p>
          <Link href="/dashboard" className="btn btn--primary btn--full">
            Zum Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/">
          <Image src="/drk-logo.png" alt="DRK" width={56} height={56} />
        </Link>
        <h1 className={styles.title}>Neues Passwort setzen</h1>
        <p className={styles.subtitle}>
          Geben Sie Ihr neues Passwort ein.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-field">
            <label htmlFor="password" className="form-field__label">
              Neues Passwort
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
              autoComplete="new-password"
              autoFocus
            />
          </div>

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

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading || !password || !passwordConfirm}
          >
            {loading ? 'Wird gespeichert...' : 'Passwort speichern'}
          </button>
        </form>
      </div>
    </div>
  )
}
