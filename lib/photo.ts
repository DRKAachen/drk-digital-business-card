/**
 * Builds the public URL for a card photo stored in S3/Garage.
 * Photos are stored under the key: {user_id}/{slug}.ext
 */
export function getPhotoUrl(photoPath: string | null): string | null {
  if (!photoPath) return null
  return `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${photoPath}`
}

/** Maximum allowed photo file size in bytes (2 MB) */
export const MAX_PHOTO_SIZE = 2 * 1024 * 1024

/** Maximum allowed original source photo size in bytes (15 MB). */
export const MAX_SOURCE_PHOTO_SIZE = 15 * 1024 * 1024

/** Accepted photo MIME types */
export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** Maps allowed photo MIME types to their canonical file extensions. */
const PHOTO_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/**
 * Validates a photo file before upload.
 * Returns an error message or null if valid.
 */
export function validatePhoto(file: File): string | null {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
    return 'Nur JPEG, PNG und WebP Dateien sind erlaubt.'
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return 'Das Foto darf maximal 2 MB groß sein.'
  }
  return null
}

/**
 * Validates a larger source photo used for non-destructive re-editing.
 * Returns an error message or null if valid.
 */
export function validateSourcePhoto(file: File): string | null {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
    return 'Nur JPEG, PNG und WebP Dateien sind erlaubt.'
  }
  if (file.size > MAX_SOURCE_PHOTO_SIZE) {
    return 'Das Foto darf maximal 15 MB groß sein.'
  }
  return null
}

/** Returns the canonical file extension for an accepted photo MIME type. */
export function getPhotoExtension(mimeType: string): string {
  return PHOTO_EXTENSIONS[mimeType] || 'jpg'
}

/** Removes the file extension from a storage key. */
export function getPhotoBaseKey(photoPath: string): string {
  return photoPath.replace(/\.[^./]+$/, '')
}

/** Builds the source-photo key for a given final photo path and MIME type. */
export function getPhotoSourceKey(photoPath: string, mimeType: string): string {
  return `${getPhotoBaseKey(photoPath)}.source.${getPhotoExtension(mimeType)}`
}

/** Returns all possible source-photo keys for a final photo path. */
export function getPhotoSourceCandidateKeys(photoPath: string): string[] {
  const baseKey = getPhotoBaseKey(photoPath)
  return ACCEPTED_PHOTO_TYPES.map((type) => `${baseKey}.source.${getPhotoExtension(type)}`)
}
