import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getPhotoUrl } from '@/lib/photo'
import type { CardRow } from '@/lib/supabase/types'
import CardViewer from '@/components/card/CardViewer'

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * Generates Open Graph / social media meta tags for a card.
 * Enables rich link previews when the card URL is shared on social media or messengers.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from('cards')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  const card = data as CardRow | null

  if (!card) {
    return { title: 'Karte nicht gefunden' }
  }

  const fullName = `${card.first_name} ${card.last_name}`
  const description = [card.title, card.organization].filter(Boolean).join(' – ')
  const photoUrl = getPhotoUrl(card.photo_path)

  return {
    title: `${fullName} – Visitenkarte`,
    description: description || `Digitale Visitenkarte von ${fullName}`,
    openGraph: {
      title: fullName,
      description: description || `Digitale Visitenkarte von ${fullName}`,
      type: 'profile',
      ...(photoUrl && { images: [{ url: photoUrl, width: 400, height: 400 }] }),
    },
  }
}

/**
 * Public card viewer page.
 * Server-rendered: fetches the published card by slug from Supabase.
 */
export default async function CardPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from('cards')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  const card = data as CardRow | null

  if (!card) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const cardUrl = `${siteUrl}/c/${card.slug}`
  const vcardUrl = `${siteUrl}/c/${card.slug}/vcard`

  return <CardViewer card={card} cardUrl={cardUrl} vcardUrl={vcardUrl} />
}
