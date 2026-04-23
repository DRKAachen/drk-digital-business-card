import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadPhoto } from '@/lib/storage'
import {
  getPhotoExtension,
  getPhotoSourceKey,
  validatePhoto,
  validateSourcePhoto,
} from '@/lib/photo'

/**
 * POST /api/photos/upload
 *
 * Accepts a multipart form with:
 * - `file` (optimized final avatar image),
 * - optional `source_file` (larger non-destructive master source),
 * - `slug` (used for the filename).
 * Validates auth plus file constraints, then stores in S3/Garage.
 * Returns the storage key so the caller can save it on the card record.
 */
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht authentifiziert.' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const sourceFile = formData.get('source_file') as File | null
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

  if (sourceFile) {
    const sourceValidationError = validateSourcePhoto(sourceFile)
    if (sourceValidationError) {
      return NextResponse.json({ error: sourceValidationError }, { status: 400 })
    }
  }

  try {
    const ext = getPhotoExtension(file.type)
    const key = `${session.user.id}/${slug}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    await uploadPhoto(key, buffer, file.type)

    if (sourceFile) {
      const sourceKey = getPhotoSourceKey(key, sourceFile.type)
      const sourceBuffer = Buffer.from(await sourceFile.arrayBuffer())
      await uploadPhoto(sourceKey, sourceBuffer, sourceFile.type)
    }

    return NextResponse.json({ path: key })
  } catch (err) {
    console.error('Photo upload error:', err)
    return NextResponse.json(
      { error: 'Foto-Upload fehlgeschlagen.' },
      { status: 500 },
    )
  }
}
