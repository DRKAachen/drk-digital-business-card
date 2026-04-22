import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadPhoto } from '@/lib/storage'
import { getPhotoExtension, validatePhoto } from '@/lib/photo'

/**
 * POST /api/photos/upload
 *
 * Accepts a multipart form with `file` (the image) and `slug` (used for the filename).
 * Validates auth plus the final optimized upload, then stores it in S3/Garage.
 * Returns the storage key so the caller can save it on the card record.
 */
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht authentifiziert.' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const slug = formData.get('slug') as string | null

  if (!file || !slug) {
    return NextResponse.json(
      { error: 'Datei und Slug sind erforderlich.' },
      { status: 400 },
    )
  }

  const validationError = validatePhoto(file)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  try {
    const ext = getPhotoExtension(file.type)
    const key = `${session.user.id}/${slug}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    await uploadPhoto(key, buffer, file.type)

    return NextResponse.json({ path: key })
  } catch (err) {
    console.error('Photo upload error:', err)
    return NextResponse.json(
      { error: 'Foto-Upload fehlgeschlagen.' },
      { status: 500 },
    )
  }
}
