import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/cards/check-slug?slug=xxx&excludeId=yyy
 *
 * Returns { available: true/false } depending on whether the slug is free.
 * When editing an existing card, pass excludeId so the current card's own slug
 * isn't flagged as taken.
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')
  const excludeId = request.nextUrl.searchParams.get('excludeId')

  if (!slug) {
    return NextResponse.json({ error: 'Slug fehlt.' }, { status: 400 })
  }

  const existing = await prisma.card.findUnique({
    where: { slug },
    select: { id: true },
  })

  const available = !existing || existing.id === excludeId

  return NextResponse.json({ available })
}
