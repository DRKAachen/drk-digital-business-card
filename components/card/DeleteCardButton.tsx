'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './DeleteCardButton.module.scss'

interface DeleteCardButtonProps {
  cardId: string
  cardName: string
}

/**
 * Client component that renders a delete button with a confirmation dialog.
 * On confirm it calls DELETE /api/cards, removes the card + photo, and refreshes the page.
 */
export default function DeleteCardButton({ cardId, cardName }: DeleteCardButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [open])

  /** Closes the dialog when the backdrop is clicked. */
  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      setOpen(false)
    }
  }

  /** Sends the delete request and refreshes the dashboard on success. */
  async function handleDelete() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/cards', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cardId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Löschen fehlgeschlagen.')
      }

      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Löschen fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className={`btn btn--danger ${styles.trigger}`}
        onClick={() => setOpen(true)}
      >
        <TrashIcon /> Löschen
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        onClick={handleBackdropClick}
        onClose={() => setOpen(false)}
      >
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <TrashIcon />
          </div>

          <h2 className={styles.title}>Visitenkarte löschen?</h2>
          <p className={styles.description}>
            Möchten Sie die Visitenkarte von <strong>{cardName}</strong> wirklich
            unwiderruflich löschen? Dabei werden auch das Foto und der öffentliche
            Link entfernt.
          </p>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Abbrechen
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Wird gelöscht…' : 'Endgültig löschen'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}
