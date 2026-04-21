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

/** Accepted photo MIME types */
export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

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
