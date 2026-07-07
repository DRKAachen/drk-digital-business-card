'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { SUPPORT_EMAIL } from '@/lib/support'
import styles from './SupportDialog.module.scss'

interface SupportDialogProps {
  open: boolean
  onClose: () => void
  /** Logged-in user's email; replies go here. Null if the session has none. */
  userEmail: string | null
}

/** Client-side attachment limits — mirrored by the API route, which is the source of truth. */
const MAX_ATTACHMENTS = 3
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024
const ACCEPT = 'image/png,image/jpeg,image/webp,application/pdf'
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])

interface PreparedAttachment {
  filename: string
  mimeType: string
  /** Raw base64 (no `data:` prefix), as Zammad expects. */
  data: string
  size: number
}

/**
 * Support request modal. Collects a message plus optional screenshots/PDFs and
 * posts them to `/api/support`, which files a Zammad ticket. Uses the native
 * `<dialog>` element for focus trapping and Esc-to-close, matching the app's
 * existing dialog pattern, and is laid out mobile-first (full-width sheet on
 * small screens, buttons stacked, internal scroll for long content).
 */
export default function SupportDialog({ open, onClose, userEmail }: SupportDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pathname = usePathname()

  const [message, setMessage] = useState('')
  /** Email typed by anonymous senders; ignored when `userEmail` is set. */
  const [email, setEmail] = useState('')
  const [attachments, setAttachments] = useState<PreparedAttachment[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ticketNumber, setTicketNumber] = useState<string | null>(null)
  /** Honeypot value; must stay empty for real users. */
  const [website, setWebsite] = useState('')

  // Reply-to address: the session email when logged in, otherwise what the user types.
  const replyEmail = userEmail ?? email.trim()

  // Open/close the native dialog in sync with the `open` prop.
  useEffect(() => {
    if (!dialogRef.current) return
    if (open) {
      dialogRef.current.showModal()
    } else if (dialogRef.current.open) {
      dialogRef.current.close()
    }
  }, [open])

  // Reset all state each time the dialog is (re)opened.
  useEffect(() => {
    if (!open) return
    setMessage('')
    setEmail('')
    setAttachments([])
    setSubmitting(false)
    setError(null)
    setTicketNumber(null)
    setWebsite('')
  }, [open])

  function requestClose() {
    if (submitting) return
    onClose()
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) requestClose()
  }

  function handleNativeCancel(event: React.SyntheticEvent<HTMLDialogElement>) {
    // Block Esc-to-close while a submit is in flight.
    if (submitting) {
      event.preventDefault()
      return
    }
    onClose()
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setError(null)

    const incoming = Array.from(fileList)
    if (attachments.length + incoming.length > MAX_ATTACHMENTS) {
      setError(`Maximal ${MAX_ATTACHMENTS} Anhänge.`)
      return
    }

    const prepared: PreparedAttachment[] = []
    for (const file of incoming) {
      if (!ALLOWED_MIME.has(file.type)) {
        setError('Nur Bilder (PNG/JPG/WebP) und PDF sind erlaubt.')
        return
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
        setError(`"${file.name}" ist zu groß (max. 5 MB).`)
        return
      }
      const data = await fileToBase64(file)
      prepared.push({ filename: file.name, mimeType: file.type, data, size: file.size })
    }
    setAttachments((current) => [...current, ...prepared])
  }

  function removeAttachment(index: number) {
    setAttachments((current) => current.filter((_, i) => i !== index))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (submitting) return

    const trimmed = message.trim()
    if (!trimmed) {
      setError('Bitte beschreiben Sie Ihr Anliegen.')
      return
    }

    // Anonymous senders must provide a valid reply address.
    if (!userEmail && !isValidEmail(email.trim())) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse an.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          email: replyEmail,
          website, // honeypot
          fields: {
            device_os: detectDeviceOs(),
            active_screen: pathname,
          },
          attachments: attachments.map((a) => ({
            filename: a.filename,
            mimeType: a.mimeType,
            data: a.data,
          })),
        }),
      })

      const data = (await res.json().catch(() => ({}))) as { number?: string; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Ihre Anfrage konnte nicht übermittelt werden.')
        return
      }

      setTicketNumber(data.number ?? '')
    } catch {
      setError('Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  const totalBytes = attachments.reduce((sum, a) => sum + a.size, 0)

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClick={handleBackdropClick}
      onCancel={handleNativeCancel}
      onClose={() => {
        if (open && !submitting) onClose()
      }}
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>Support kontaktieren</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={requestClose}
            aria-label="Schließen"
            disabled={submitting}
          >
            <CloseIcon />
          </button>
        </div>

        {ticketNumber ? (
          <div className={styles.success} role="status">
            <div className={styles.successIcon}>
              <CheckIcon />
            </div>
            <p className={styles.successTitle}>Anfrage gesendet</p>
            <p className={styles.successText}>
              {ticketNumber && ticketNumber !== '0' ? (
                <>
                  Ihr Ticket <strong>#{ticketNumber}</strong> wurde erstellt. Wir melden uns per
                  E-Mail
                  {replyEmail ? (
                    <>
                      {' '}
                      an <strong>{replyEmail}</strong>
                    </>
                  ) : null}
                  .
                </>
              ) : (
                <>Vielen Dank. Wir melden uns per E-Mail bei Ihnen.</>
              )}
            </p>
            <button type="button" className="btn btn--primary btn--full" onClick={onClose}>
              Schließen
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <p className={styles.intro}>
              {userEmail ? (
                <>
                  Beschreiben Sie kurz Ihr Anliegen. Antworten senden wir an{' '}
                  <strong>{userEmail}</strong>.
                </>
              ) : (
                <>Beschreiben Sie kurz Ihr Anliegen. Antworten senden wir an die unten angegebene E-Mail-Adresse.</>
              )}
            </p>

            {!userEmail && (
              <>
                <label className={styles.label} htmlFor="support-email">
                  Ihre E-Mail-Adresse
                </label>
                <input
                  id="support-email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@beispiel.de"
                  autoComplete="email"
                  required
                  disabled={submitting}
                />
              </>
            )}

            <label className={styles.label} htmlFor="support-message">
              Ihre Nachricht
            </label>
            <textarea
              id="support-message"
              className={styles.textarea}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Was können wir für Sie tun?"
              rows={5}
              maxLength={5000}
              required
              disabled={submitting}
              autoFocus
            />

            {/* Honeypot — hidden from users, tempting to bots. */}
            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor="support-website">Website (nicht ausfüllen)</label>
              <input
                id="support-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className={styles.attachRow}>
              <label className={styles.attachButton}>
                <PaperclipIcon />
                <span>Anhang hinzufügen</span>
                <input
                  type="file"
                  accept={ACCEPT}
                  multiple
                  className={styles.fileInput}
                  onChange={(e) => {
                    handleFiles(e.target.files)
                    e.target.value = '' // allow re-selecting the same file
                  }}
                  disabled={submitting || attachments.length >= MAX_ATTACHMENTS}
                />
              </label>
              <span className={styles.attachHint}>
                Bilder oder PDF, max. {MAX_ATTACHMENTS} · je 5 MB
              </span>
            </div>

            {attachments.length > 0 && (
              <ul className={styles.attachList}>
                {attachments.map((a, index) => (
                  <li key={`${a.filename}-${index}`} className={styles.attachItem}>
                    <span className={styles.attachName}>{a.filename}</span>
                    <span className={styles.attachSize}>{formatBytes(a.size)}</span>
                    <button
                      type="button"
                      className={styles.attachRemove}
                      onClick={() => removeAttachment(index)}
                      aria-label={`${a.filename} entfernen`}
                      disabled={submitting}
                    >
                      <CloseIcon />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={requestClose}
                disabled={submitting}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={
                  submitting || message.trim() === '' || (!userEmail && email.trim() === '')
                }
              >
                {submitting ? 'Wird gesendet…' : 'Anfrage senden'}
              </button>
            </div>

            <p className={styles.fallback}>
              Alternativ:{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className={styles.fallbackLink}>
                {SUPPORT_EMAIL}
              </a>
            </p>

            {/* Keep total size visible so users understand upload limits. */}
            {attachments.length > 0 && (
              <p className={styles.total}>Anhänge gesamt: {formatBytes(totalBytes)}</p>
            )}
          </form>
        )}
      </div>
    </dialog>
  )
}

/** Pragmatic email check, mirrored on the server. */
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254
}

/** Reads a File and returns its base64 payload without the `data:...;base64,` prefix. */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result)
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/** Best-effort human-readable OS + browser string from the user agent, for support context. */
function detectDeviceOs(): string {
  if (typeof navigator === 'undefined') return ''
  const ua = navigator.userAgent

  let os = 'Unbekannt'
  if (/Windows NT 10/.test(ua)) os = 'Windows 10/11'
  else if (/Windows/.test(ua)) os = 'Windows'
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/Mac OS X/.test(ua)) os = 'macOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  let browser = ''
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\//.test(ua)) browser = 'Opera'
  else if (/Chrome\//.test(ua)) browser = 'Chrome'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua)) browser = 'Safari'

  return browser ? `${os} · ${browser}` : os
}

/** Formats a byte count as KB/MB with one decimal. */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function PaperclipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  )
}
