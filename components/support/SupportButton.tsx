'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import SupportDialog from './SupportDialog'
import styles from './SupportButton.module.scss'

interface SupportButtonProps {
  /**
   * Visual variant:
   *  - `primary`: small filled DRK-red button, for headers/prominent spots.
   *  - `link`: subdued text link, for footers and legal pages.
   * Defaults to `link`.
   */
  variant?: 'primary' | 'link'
  /** Optional extra class names appended to the variant's base class. */
  className?: string
  /** Optional override for the visible label. Defaults to "Support". */
  label?: string
}

/**
 * Support trigger that opens the {@link SupportDialog}, where the user writes a
 * message (plus optional screenshots) that is filed as a Zammad helpdesk ticket
 * via the `/api/support` backend route. The helpdesk API token never reaches the
 * client — the button only opens the dialog and the dialog only talks to our own
 * endpoint. The logged-in user's email (from the Auth.js session) is shown in the
 * dialog so they know where replies will go.
 */
export default function SupportButton({ variant = 'link', className, label = 'Support' }: SupportButtonProps) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  const variantClass = variant === 'primary' ? styles.primary : styles.link
  const combined = className ? `${variantClass} ${className}` : variantClass

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={combined}
        aria-haspopup="dialog"
        aria-label="Support kontaktieren"
      >
        <MailIcon />
        <span>{label}</span>
      </button>
      <SupportDialog
        open={open}
        onClose={() => setOpen(false)}
        userEmail={session?.user?.email ?? null}
      />
    </>
  )
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
