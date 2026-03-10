'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './AccountActions.module.scss'

interface AccountActionsProps {
  userEmail: string
}

/**
 * Account management component providing DSGVO-compliant self-service actions:
 * - Data export (Art. 20 DSGVO – Recht auf Datenübertragbarkeit)
 * - Account deletion (Art. 17 DSGVO – Recht auf Löschung)
 */
export default function AccountActions({ userEmail }: AccountActionsProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  /** Triggers a JSON download of all personal data */
  async function handleExport() {
    setExporting(true)
    setError(null)

    try {
      const response = await fetch('/api/account/export')

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Export fehlgeschlagen.')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `drk-visitenkarte-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export fehlgeschlagen.')
    } finally {
      setExporting(false)
    }
  }

  /** Permanently deletes the user account after confirmation */
  async function handleDelete() {
    if (confirmText !== 'LÖSCHEN') return

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch('/api/account/delete', { method: 'POST' })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Löschung fehlgeschlagen.')
      }

      const supabase = createClient()
      await supabase.auth.signOut()

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Löschung fehlgeschlagen.')
      setDeleting(false)
    }
  }

  /** Updates the user's password via Supabase Auth. */
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (newPassword.length < 8) {
      setPasswordError('Das Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }

    if (newPassword !== newPasswordConfirm) {
      setPasswordError('Die Passwörter stimmen nicht überein.')
      return
    }

    setChangingPassword(true)
    const supabase = createClient()

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setChangingPassword(false)

    if (updateError) {
      if (updateError.message?.includes('same password')) {
        setPasswordError('Das neue Passwort muss sich vom alten unterscheiden.')
      } else {
        setPasswordError('Fehler beim Ändern des Passworts. Bitte versuchen Sie es erneut.')
      }
      return
    }

    setPasswordSuccess(true)
    setNewPassword('')
    setNewPasswordConfirm('')
  }

  return (
    <div className={styles.wrapper}>
      {/* Account info */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Kontoinformationen</h2>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>E-Mail</span>
          <span>{userEmail}</span>
        </div>
      </section>

      {/* Change password */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Passwort ändern</h2>
        <form onSubmit={handleChangePassword}>
          <div className="form-field">
            <label htmlFor="newPassword" className="form-field__label">
              Neues Passwort
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPasswordSuccess(false) }}
              className="form-field__input"
              placeholder="Mindestens 8 Zeichen"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="form-field">
            <label htmlFor="newPasswordConfirm" className="form-field__label">
              Passwort bestätigen
            </label>
            <input
              id="newPasswordConfirm"
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => { setNewPasswordConfirm(e.target.value); setPasswordSuccess(false) }}
              className="form-field__input"
              placeholder="Passwort wiederholen"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {passwordError && <p className={styles.errorMsg}>{passwordError}</p>}
          {passwordSuccess && (
            <p className={styles.successMsg}>Passwort erfolgreich geändert.</p>
          )}
          <button
            type="submit"
            disabled={changingPassword || !newPassword || !newPasswordConfirm}
            className="btn btn--primary"
            style={{ marginTop: '0.5rem' }}
          >
            {changingPassword ? 'Wird geändert...' : 'Passwort ändern'}
          </button>
        </form>
      </section>

      {/* Data export */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Datenexport</h2>
        <p className={styles.description}>
          Laden Sie alle Ihre gespeicherten Daten als JSON-Datei herunter.
          Dies umfasst Ihre Kontoinformationen und alle Visitenkarten-Daten
          (Art. 20 DSGVO – Recht auf Datenübertragbarkeit).
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn btn--secondary"
        >
          {exporting ? 'Wird exportiert...' : 'Meine Daten herunterladen'}
        </button>
      </section>

      {/* Account deletion */}
      <section className={`${styles.section} ${styles.dangerSection}`}>
        <h2 className={styles.sectionTitle}>Konto löschen</h2>
        <p className={styles.description}>
          Hiermit werden Ihr Benutzerkonto, Ihre Visitenkarte und Ihr Profilfoto
          unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden
          (Art. 17 DSGVO – Recht auf Löschung).
        </p>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className={`btn ${styles.dangerBtn}`}
          >
            Konto endgültig löschen
          </button>
        ) : (
          <div className={styles.confirmBox}>
            <p className={styles.confirmText}>
              Bitte geben Sie <strong>LÖSCHEN</strong> ein, um die Löschung zu bestätigen:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="LÖSCHEN"
              className="form-field__input"
              autoFocus
            />
            <div className={styles.confirmActions}>
              <button
                onClick={handleDelete}
                disabled={confirmText !== 'LÖSCHEN' || deleting}
                className={`btn ${styles.dangerBtn}`}
              >
                {deleting ? 'Wird gelöscht...' : 'Endgültig löschen'}
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false)
                  setConfirmText('')
                }}
                disabled={deleting}
                className="btn btn--secondary"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </section>

      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  )
}
