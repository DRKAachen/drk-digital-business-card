import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import QrExport from '@/components/qr/QrExport'

export const metadata = {
  title: 'QR-Code',
}

interface CardBasic {
  slug: string
  first_name: string
  last_name: string
  is_published: boolean
}

/**
 * QR code export page. Shows the QR code for the user's published card.
 * If no card exists yet, directs the user to create one first.
 * User ID comes from middleware header (already validated with getUser()).
 */
export default async function QrPage() {
  const headerStore = await headers()
  const userId = headerStore.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from('cards')
    .select('slug, first_name, last_name, is_published')
    .eq('user_id', userId)
    .maybeSingle()

  const card = data as CardBasic | null

  if (!card) {
    return (
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
          QR-Code
        </h1>
        <p style={{ color: '#525252', marginBottom: '1.5rem' }}>
          Sie haben noch keine Visitenkarte erstellt.
        </p>
        <Link href="/dashboard/edit" className="btn btn--primary">
          Jetzt erstellen
        </Link>
      </div>
    )
  }

  if (!card.is_published) {
    return (
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
          QR-Code
        </h1>
        <p style={{ color: '#525252', marginBottom: '1.5rem' }}>
          Ihre Visitenkarte ist noch nicht veröffentlicht. Veröffentlichen Sie sie zuerst, damit der QR-Code funktioniert.
        </p>
        <Link href="/dashboard/edit" className="btn btn--primary">
          Bearbeiten & veröffentlichen
        </Link>
      </div>
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const cardUrl = `${siteUrl}/c/${card.slug}`
  const cardName = `${card.first_name}-${card.last_name}`.toLowerCase()

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        QR-Code
      </h1>
      <p style={{ color: '#525252', marginBottom: '2rem', fontSize: '0.875rem' }}>
        Laden Sie Ihren QR-Code herunter, um ihn auf Visitenkarten zu drucken oder in Präsentationen zu verwenden.
      </p>
      <QrExport cardUrl={cardUrl} cardName={cardName} />
    </div>
  )
}
