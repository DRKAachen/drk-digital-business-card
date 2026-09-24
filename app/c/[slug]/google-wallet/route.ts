import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateGoogleWalletJWT, isGoogleWalletConfigured } from '@/lib/google-wallet'
import type { CardRow } from '@/lib/types'

interface RouteContext {
  params: Promise<{ slug: string }>
}

/**
 * Liefert den signierten JWT für „Zu Google Wallet hinzufügen" einer veröffentlichten Karte.
 * Der Button leitet damit auf https://pay.google.com/gp/v/save/<jwt> weiter.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params

  if (!isGoogleWalletConfigured()) {
    return NextResponse.json({ error: 'Google Wallet ist nicht konfiguriert' }, { status: 503 })
  }

  const card: CardRow | null = await prisma.card.findFirst({
    where: { slug, is_published: true },
  })

  if (!card) {
    return NextResponse.json({ error: 'Karte nicht gefunden' }, { status: 404 })
  }

  try {
    const jwt = generateGoogleWalletJWT(card)
    return NextResponse.json({ jwt }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[google-wallet] JWT-Erstellung fehlgeschlagen:', err)
    return NextResponse.json({ error: 'JWT-Erstellung fehlgeschlagen' }, { status: 500 })
  }
}
