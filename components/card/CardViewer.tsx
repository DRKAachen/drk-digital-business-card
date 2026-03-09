'use client'

import Image from 'next/image'
import type { CardRow } from '@/lib/supabase/types'
import { getPhotoUrl } from '@/lib/photo'
import styles from './CardViewer.module.scss'

interface CardViewerProps {
  card: CardRow
  /** Full public URL for this card (used by share button) */
  cardUrl: string
  /** Full URL for the vCard download endpoint */
  vcardUrl: string
}

/**
 * Public card viewer: renders the full contact card with action buttons.
 * Shown when someone scans the QR code or opens the card URL.
 */
export default function CardViewer({ card, cardUrl, vcardUrl }: CardViewerProps) {
  const fullName = `${card.first_name} ${card.last_name}`
  const initials = `${card.first_name.charAt(0)}${card.last_name.charAt(0)}`.toUpperCase()
  const photoUrl = getPhotoUrl(card.photo_path)
  const hasAddress = !!(card.street || card.city || card.zip)

  async function handleShare() {
    const shareData = {
      title: `${fullName} – DRK Visitenkarte`,
      text: `Kontaktdaten von ${fullName}`,
      url: cardUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        if ((err as DOMException).name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(cardUrl)
      showToast('Link in die Zwischenablage kopiert!')
    } catch {
      showToast('Link konnte nicht kopiert werden.')
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logo}>
            <Image src="/favicon.svg" alt="DRK" width={28} height={28} />
          </div>
          <div className={styles.avatar}>
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={fullName}
                width={88}
                height={88}
                className={styles.avatarImg}
                unoptimized
              />
            ) : (
              <span className={styles.avatarInitials}>{initials}</span>
            )}
          </div>
          <h1 className={styles.name}>{fullName}</h1>
          {card.title && <p className={styles.title}>{card.title}</p>}
          {card.organization && <p className={styles.org}>{card.organization}</p>}
        </header>

        {/* Quick Actions */}
        <div className={styles.actions}>
          {card.phone && (
            <a href={`tel:${card.phone}`} className={styles.action}>
              <span className={styles.actionIcon}>
                <PhoneIcon />
              </span>
              <span className={styles.actionLabel}>Anrufen</span>
            </a>
          )}
          {card.mobile && (
            <a href={`tel:${card.mobile}`} className={styles.action}>
              <span className={styles.actionIcon}>
                <MobileIcon />
              </span>
              <span className={styles.actionLabel}>Mobil</span>
            </a>
          )}
          {card.email && (
            <a href={`mailto:${card.email}`} className={styles.action}>
              <span className={styles.actionIcon}>
                <EmailIcon />
              </span>
              <span className={styles.actionLabel}>E-Mail</span>
            </a>
          )}
          {hasAddress && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(card))}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.action}
            >
              <span className={styles.actionIcon}>
                <MapIcon />
              </span>
              <span className={styles.actionLabel}>Route</span>
            </a>
          )}
          {card.website && (
            <a
              href={ensureProtocol(card.website)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.action}
            >
              <span className={styles.actionIcon}>
                <WebIcon />
              </span>
              <span className={styles.actionLabel}>Web</span>
            </a>
          )}
        </div>

        {/* Details */}
        <div className={styles.details}>
          {card.email && (
            <DetailRow label="E-MAIL" value={card.email} href={`mailto:${card.email}`} icon={<EmailIcon />} />
          )}
          {card.phone && (
            <DetailRow label="TELEFON" value={card.phone} href={`tel:${card.phone}`} icon={<PhoneIcon />} />
          )}
          {card.mobile && (
            <DetailRow label="MOBIL" value={card.mobile} href={`tel:${card.mobile}`} icon={<MobileIcon />} />
          )}
          {hasAddress && (
            <DetailRow
              label="ADRESSE"
              value={
                <span>
                  {card.street && <>{card.street}<br /></>}
                  {(card.zip || card.city) && <>{[card.zip, card.city].filter(Boolean).join(' ')}<br /></>}
                  {card.country && <>{card.country}</>}
                </span>
              }
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(card))}`}
              icon={<MapIcon />}
              external
            />
          )}
          {card.website && (
            <DetailRow
              label="WEBSEITE"
              value={card.website.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')}
              href={ensureProtocol(card.website)}
              icon={<WebIcon />}
              external
            />
          )}
          {card.linkedin && (
            <DetailRow label="LINKEDIN" value="Profil öffnen" href={ensureProtocol(card.linkedin)} icon={<LinkedInIcon />} external />
          )}
          {card.xing && (
            <DetailRow label="XING" value="Profil öffnen" href={ensureProtocol(card.xing)} icon={<XingIcon />} external />
          )}
        </div>

        {/* Footer buttons */}
        <div className={styles.footer}>
          <a href={vcardUrl} download className="btn btn--primary btn--full">
            <DownloadIcon /> Kontakt speichern
          </a>
          <button onClick={handleShare} className="btn btn--secondary btn--full">
            <ShareIcon /> Teilen
          </button>
        </div>
      </div>

      <p className={styles.privacy}>
        Keine Cookies. Kein Tracking. Ihre Daten sind sicher.
      </p>
      <nav className={styles.legalLinks} aria-label="Rechtliche Hinweise">
        <a href="/impressum">Impressum</a>
        <a href="/datenschutz">Datenschutz</a>
      </nav>
    </div>
  )
}

interface DetailRowProps {
  label: string
  value: string | React.ReactNode
  href?: string
  icon?: React.ReactNode
  external?: boolean
}

/**
 * Detail row: label sits independently on top, then value text and icon
 * are centered together on the second line. Entire area is clickable when href is set.
 */
function DetailRow({ label, value, href, icon, external }: DetailRowProps) {
  const content = (
    <>
      <span className={styles.detailLabel}>{label}</span>
      <div className={styles.detailRow}>
        <span className={styles.detailText}>{value}</span>
        {icon && <span className={styles.detailIcon}>{icon}</span>}
      </div>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className={styles.detail}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {content}
      </a>
    )
  }

  return <div className={styles.detail}>{content}</div>
}

/** Flat single-line address for the Google Maps query string */
function formatAddress(card: CardRow): string {
  const parts: string[] = []
  if (card.street) parts.push(card.street)
  if (card.zip && card.city) parts.push(`${card.zip} ${card.city}`)
  else if (card.city) parts.push(card.city)
  if (card.country) parts.push(card.country)
  return parts.join(', ')
}

function ensureProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

function showToast(message: string) {
  const existing = document.querySelector('.toast')
  if (existing) existing.remove()
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message
  document.body.appendChild(toast)
  requestAnimationFrame(() => toast.classList.add('toast--visible'))
  setTimeout(() => {
    toast.classList.remove('toast--visible')
    setTimeout(() => toast.remove(), 300)
  }, 2500)
}

// Inline SVG icons to avoid external requests
function PhoneIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
}

function MobileIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
}

function EmailIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
}

function MapIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
}

function WebIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
}

function DownloadIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}

function ShareIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
}

function LinkedInIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
}

function XingIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2l-8 14 5 9"/><path d="M4 7l3 5-2 4"/></svg>
}
