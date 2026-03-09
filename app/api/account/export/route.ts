import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { CardRow } from '@/lib/supabase/types'

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
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert.' },
        { status: 401 },
      )
    }

    const { data: cards } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', user.id)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    /** Build photo URL from storage path */
    function buildPhotoUrl(photoPath: string | null): string | null {
      if (!photoPath) return null
      return `${supabaseUrl}/storage/v1/object/public/photos/${photoPath}`
    }

    const exportData = {
      export_info: {
        exported_at: new Date().toISOString(),
        format: 'DSGVO Art. 20 – Datenübertragbarkeit',
        application: 'DRK Digitale Visitenkarte',
      },
      account: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      },
      cards: (cards || []).map((card: CardRow) => ({
        ...card,
        photo_url: buildPhotoUrl(card.photo_path),
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
