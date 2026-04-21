import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadPhoto } from '@/lib/storage'
import { ACCEPTED_PHOTO_TYPES, MAX_PHOTO_SIZE } from '@/lib/photo'

/**
 * POST /api/photos/upload
 *
 * Accepts a multipart form with `file` (the image) and `slug` (used for the filename).
 * Validates auth, file type and size, then uploads to S3/Garage.
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

  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Nur JPEG, PNG und WebP Dateien sind erlaubt.' },
      { status: 400 },
    )
  }

  if (file.size > MAX_PHOTO_SIZE) {
    return NextResponse.json(
      { error: 'Das Foto darf maximal 2 MB groß sein.' },
      { status: 400 },
    )
  }

  try {
    const ext = file.name.split('.').pop() || 'jpg'
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
