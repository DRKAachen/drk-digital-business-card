'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import styles from './AccountActions.module.scss'

interface AccountActionsProps {
  userEmail: string
}

/**
 * Account management component providing DSGVO-compliant self-service actions:
 * - Data export (Art. 20 DSGVO – Recht auf Datenübertragbarkeit)
 * - Account deletion (Art. 17 DSGVO – Recht auf Löschung)
 *
 * Password management is handled by Authentik's own UI.
 */
export default function AccountActions({ userEmail }: AccountActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

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

      await signOut({ callbackUrl: '/' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Löschung fehlgeschlagen.')
      setDeleting(false)
    }
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
        <p style={{ color: '#525252', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
          Passwort und Kontodaten können in Authentik verwaltet werden.
        </p>
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
