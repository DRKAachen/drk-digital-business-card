import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPhoto } from '@/lib/storage'

/**
 * GET /api/photos/source?path=<storage-key>
 *
 * Returns an authenticated user's stored photo so the editor can reopen the
 * crop flow for an already uploaded image without depending on public-bucket
 * CORS headers in the browser.
 */
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht authentifiziert.' }, { status: 401 })
  }

  const key = request.nextUrl.searchParams.get('path')
  if (!key) {
    return NextResponse.json({ error: 'Foto-Pfad fehlt.' }, { status: 400 })
  }

  if (!key.startsWith(`${session.user.id}/`)) {
    return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 })
  }

  try {
    const photo = await getPhoto(key)
    const body = new Uint8Array(photo.body)

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': photo.contentType,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (err) {
    console.error('Photo source fetch error:', err)
    return NextResponse.json(
      { error: 'Foto konnte nicht geladen werden.' },
      { status: 404 },
    )
  }
}
