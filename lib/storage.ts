import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'

/**
 * S3-compatible storage client configured for Garage.
 * forcePathStyle is required because Garage does not support virtual-hosted-style URLs.
 */
const s3 = new S3Client({
  region: 'garage',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
})

const BUCKET = process.env.S3_BUCKET || 'photos'

/** Uploads a file to the photos bucket under the given key. */
export async function uploadPhoto(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )
}

/** Deletes a single object by key from the photos bucket. */
export async function deletePhoto(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
  )
}

/**
 * Deletes all objects under a user's folder prefix.
 * Used during account deletion (DSGVO Art. 17) to remove orphaned uploads.
 */
export async function deleteUserPhotos(userId: string): Promise<void> {
  const listed = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: `${userId}/`,
    }),
  )

  if (listed.Contents) {
    for (const obj of listed.Contents) {
      if (obj.Key) {
        await deletePhoto(obj.Key)
      }
    }
  }
}

/** Builds the public URL for a given storage key. */
export function getPublicPhotoUrl(key: string): string {
  return `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${key}`
}
