import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPhoto } from '@/lib/storage'
import { getPhotoSourceCandidateKeys } from '@/lib/photo'

/**
 * GET /api/photos/source?path=<storage-key>
 *
 * Returns an authenticated user's best available source image for editing.
 * The endpoint prefers a stored non-destructive source file and falls back to
 * the final cropped avatar if no source exists yet.
 */
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht authentifiziert.' }, { status: 401 })
  }

  const photoPath = request.nextUrl.searchParams.get('path')
  if (!photoPath) {
    return NextResponse.json({ error: 'Foto-Pfad fehlt.' }, { status: 400 })
  }

  if (!photoPath.startsWith(`${session.user.id}/`)) {
    return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 })
  }

  const candidateKeys = [...getPhotoSourceCandidateKeys(photoPath), photoPath]

  try {
    for (const key of candidateKeys) {
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
      } catch {
        // Try next candidate key.
      }
    }

    return NextResponse.json({ error: 'Foto konnte nicht geladen werden.' }, { status: 404 })
  } catch (err) {
    console.error('Photo source fetch error:', err)
    return NextResponse.json(
      { error: 'Foto konnte nicht geladen werden.' },
      { status: 404 },
    )
  }
}
