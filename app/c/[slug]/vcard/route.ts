import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateVCard } from '@/lib/vcard'
import { getPhotoUrl } from '@/lib/photo'
import type { CardRow } from '@/lib/types'

interface RouteContext {
  params: Promise<{ slug: string }>
}

/**
 * API route that generates and returns a vCard (.vcf) file for a given card slug.
 * Triggered when a user clicks "Kontakt speichern" on the public card page.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params

  const card: CardRow | null = await prisma.card.findFirst({
    where: { slug, is_published: true },
  })

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  const photoUrl = getPhotoUrl(card.photo_path) ?? undefined
  const vcf = await generateVCard(card, photoUrl)
  const filename = `${card.first_name}_${card.last_name}.vcf`

  return new NextResponse(vcf, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
