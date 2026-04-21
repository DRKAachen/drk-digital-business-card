'use client'

import { useSession } from 'next-auth/react'
import { buildSupportMailto, generateSupportRef } from '@/lib/support'
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
 * Support button that opens the user's mail client with a prefilled request
 * to {@link SUPPORT_EMAIL}. A fresh reference ID is generated on every click
 * and embedded in the subject, so each support mail is uniquely identifiable
 * even without a backend. Logged-in user email (via Auth.js session) and the
 * current page URL are added to the body for ops context — the user can
 * review and edit everything in their own mail client before sending.
 *
 * Rendered as an anchor tag for native right-click / keyboard support; the
 * actual `href` is built at click-time so the reference ID is fresh and the
 * page URL reflects the location at click, not at render.
 */
export default function SupportButton({ variant = 'link', className, label = 'Support' }: SupportButtonProps) {
  const { data: session } = useSession()

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()

    const ref = generateSupportRef()
    const pageUrl = typeof window !== 'undefined' ? window.location.href : undefined
    const timestamp = new Date().toISOString()

    const mailto = buildSupportMailto({
      userEmail: session?.user?.email ?? null,
      pageUrl,
      ref,
      timestamp,
    })

    window.location.href = mailto
  }

  const variantClass = variant === 'primary' ? styles.primary : styles.link
  const combined = className ? `${variantClass} ${className}` : variantClass

  return (
    <a
      href={`mailto:`}
      onClick={handleClick}
      className={combined}
      aria-label="Support kontaktieren"
    >
      <MailIcon />
      <span>{label}</span>
    </a>
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
