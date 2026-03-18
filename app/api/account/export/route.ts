import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getPhotoUrl } from '@/lib/photo'

/**
 * GET /api/account/export
 *
 * Exports all personal data of the authenticated user as a JSON file.
 * Implements DSGVO Art. 20 "Recht auf Datenübertragbarkeit" (right to data portability).
 *
 * Returns a structured JSON containing:
 * - Account information (email, ID, creation date)
 * - All card data
 * - Photo URLs (if any)
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert.' },
        { status: 401 },
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    const cards = await prisma.card.findMany({
      where: { user_id: session.user.id },
    })

    const exportData = {
      export_info: {
        exported_at: new Date().toISOString(),
        format: 'DSGVO Art. 20 – Datenübertragbarkeit',
        application: 'DRK Digitale Visitenkarte',
      },
      account: {
        id: user?.id,
        email: user?.email,
        created_at: user?.createdAt?.toISOString(),
      },
      cards: cards.map((card) => ({
        ...card,
        created_at: card.created_at.toISOString(),
        updated_at: card.updated_at.toISOString(),
        photo_url: getPhotoUrl(card.photo_path),
      })),
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    const filename = `drk-visitenkarte-export-${new Date().toISOString().slice(0, 10)}.json`

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('Data export error:', err)
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten.' },
      { status: 500 },
    )
  }
}
