import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getPhotoUrl } from '@/lib/photo'
import type { CardRow } from '@/lib/supabase/types'
import styles from './page.module.scss'

export const metadata = {
  title: 'Dashboard',
}

/**
 * Dashboard overview page.
 * Shows the user's card status and quick links to edit and QR export.
 * User ID comes from middleware header (already validated with getUser()).
 */
export default async function DashboardPage() {
  const headerStore = await headers()
  const userId = headerStore.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const card = data as CardRow | null
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  if (!card) {
    return (
      <div className={styles.empty}>
        <h1>Willkommen!</h1>
        <p>Sie haben noch keine digitale Visitenkarte. Erstellen Sie jetzt Ihre erste!</p>
        <Link href="/dashboard/edit" className="btn btn--primary">
          Visitenkarte erstellen
        </Link>
      </div>
    )
  }

  const fullName = `${card.first_name} ${card.last_name}`
  const initials = `${card.first_name.charAt(0)}${card.last_name.charAt(0)}`.toUpperCase()
  const photoUrl = getPhotoUrl(card.photo_path)
  const cardUrl = `${siteUrl}/c/${card.slug}`

  return (
    <div>
      <h1 className={styles.heading}>Meine Visitenkarte</h1>

      <div className={styles.cardPreview}>
        <div className={styles.previewHeader}>
          <div className={styles.avatar}>
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={fullName} className={styles.avatarImg} />
            ) : (
              <span className={styles.avatarInitials}>{initials}</span>
            )}
          </div>
          <div>
            <h2 className={styles.name}>{fullName}</h2>
            {card.title && <p className={styles.title}>{card.title}</p>}
            {card.organization && <p className={styles.org}>{card.organization}</p>}
          </div>
        </div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Status</span>
            <span className={card.is_published ? styles.statusPublished : styles.statusDraft}>
              {card.is_published ? 'Veröffentlicht' : 'Entwurf'}
            </span>
          </div>
          {card.is_published && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>URL</span>
              <a
                href={cardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.metaLink}
              >
                {cardUrl.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Zuletzt geändert</span>
            <span>{new Date(card.updated_at).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</span>
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <Link href="/dashboard/edit" className={`btn btn--secondary ${styles.actionBtn}`}>
          <EditIcon /> Bearbeiten
        </Link>
        <Link href="/dashboard/qr" className={`btn btn--primary ${styles.actionBtn}`}>
          <QrIcon /> QR-Code herunterladen
        </Link>
        {card.is_published && (
          <a
            href={cardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn--outline ${styles.actionBtn}`}
          >
            <ExternalIcon /> Karte ansehen
          </a>
        )}
      </div>
    </div>
  )
}

function EditIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}

function QrIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><path d="M14 14h2v2h-2z"/><path d="M20 14h2v2h-2z"/><path d="M14 20h2v2h-2z"/><path d="M20 20h2v2h-2z"/><path d="M17 17h2v2h-2z"/></svg>
}

function ExternalIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
}
