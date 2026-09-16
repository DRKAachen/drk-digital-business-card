import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { getSiteUrl } from '@/lib/url'
import type { CardRow } from '@/lib/types'
import CardViewer from '@/components/card/CardViewer'
import {isWalletConfigured} from '@/lib/wallet'
import { isGoogleWalletConfigured } from '@/lib/google-wallet'
interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * Generates Open Graph / social media meta tags for a card.
 * Enables rich link previews when the card URL is shared on social media or messengers.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  const card: CardRow | null = await prisma.card.findFirst({
    where: { slug, is_published: true },
  })

  if (!card) {
    return { title: 'Karte nicht gefunden' }
  }

  const fullName = `${card.first_name} ${card.last_name}`
  const description = [card.title, card.organization].filter(Boolean).join(' – ')
  const siteUrl = getSiteUrl()
  const ogImageUrl = `${siteUrl}/c/${slug}/opengraph-image`

  // Tab title reflects the card's own organization, not the global
  // NEXT_PUBLIC_ORG_NAME (which would otherwise append the app owner's
  // Kreisverband to every card via the root layout's title template).
  // `absolute` bypasses that template; fall back to "Visitenkarte" when the
  // card has no organization set.
  const tabSuffix = card.organization?.trim() || 'Visitenkarte'

  return {
    title: { absolute: `${fullName} – ${tabSuffix}` },
    description: description || `Digitale Visitenkarte von ${fullName}`,
    openGraph: {
      title: fullName,
      description: description || `Digitale Visitenkarte von ${fullName}`,
      type: 'profile',
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullName,
      description: description || `Digitale Visitenkarte von ${fullName}`,
      images: [ogImageUrl],
    },
  }
}

/**
 * Public card viewer page.
 * Server-rendered: fetches the published card by slug from the database.
 */
export default async function CardPage({ params }: PageProps) {
  const { slug } = await params

  const card: CardRow | null = await prisma.card.findFirst({
    where: { slug, is_published: true },
  })

  if (!card) notFound()

  const siteUrl = getSiteUrl()
  const cardUrl = `${siteUrl}/c/${card.slug}`
const vcardUrl = `${siteUrl}/c/${card.slug}/vcard`
    const walletUrl = isWalletConfigured() ? `${siteUrl}/c/${card.slug}/wallet` : undefined
  const googleWalletSlug = isGoogleWalletConfigured() ? card.slug : undefined

  return (
    <CardViewer
      card={card}
      cardUrl={cardUrl}
      vcardUrl={vcardUrl}
      walletUrl={walletUrl}
      googleWalletSlug={googleWalletSlug}
    />
  )
}
