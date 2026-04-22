'use client'

import type { Area } from 'react-easy-crop'
import { MAX_PHOTO_SIZE, getPhotoExtension } from '@/lib/photo'

/** Maximum source photo size accepted before client-side processing begins. */
export const MAX_SOURCE_PHOTO_SIZE = 15 * 1024 * 1024

/** Output sizes tried from largest to smallest square export. */
const OUTPUT_SIZES = [800, 700, 600, 500]

/** Quality steps used to fit the optimized file within the upload limit. */
const OUTPUT_QUALITIES = [0.92, 0.86, 0.8, 0.74, 0.68]

const OUTPUT_TYPES = ['image/webp', 'image/jpeg'] as const

/**
 * Validates the original user-selected photo before cropping.
 * Larger files are allowed than the final upload size, but an upper cap helps
 * avoid excessive client memory use from very large camera images.
 */
export function validateSourcePhoto(file: File): string | null {
  if (file.size > MAX_SOURCE_PHOTO_SIZE) {
    return 'Das Foto darf maximal 15 MB groß sein.'
  }

  return null
}

/** Loads a local object URL into an image element for canvas processing. */
async function loadImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Das Bild konnte nicht geladen werden.'))
    image.src = src
  })
}

/** Converts a canvas export into a Blob using the requested MIME type. */
async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Das Bild konnte nicht verarbeitet werden.'))
        return
      }

      resolve(blob)
    }, type, quality)
  })
}

/** Builds the optimized upload filename from the exported MIME type. */
function buildOptimizedFileName(originalName: string, mimeType: string): string {
  const extension = getPhotoExtension(mimeType)
  const baseName = originalName.replace(/\.[^.]+$/, '') || 'profilfoto'
  return `${baseName}.${extension}`
}

/**
 * Crops the selected image to a fixed square and exports an optimized file.
 * The function retries with smaller dimensions and lower quality until the
 * final upload fits below the strict server-side limit.
 */
export async function createOptimizedPhotoFile(params: {
  file: File
  imageSrc: string
  cropAreaPixels: Area
}): Promise<File> {
  const { file, imageSrc, cropAreaPixels } = params
  const image = await loadImage(imageSrc)

  const sourceX = Math.max(0, Math.round(cropAreaPixels.x))
  const sourceY = Math.max(0, Math.round(cropAreaPixels.y))
  const sourceWidth = Math.max(1, Math.round(cropAreaPixels.width))
  const sourceHeight = Math.max(1, Math.round(cropAreaPixels.height))

  let smallestBlob: Blob | null = null
  let smallestType: (typeof OUTPUT_TYPES)[number] = OUTPUT_TYPES[0]

  for (const outputType of OUTPUT_TYPES) {
    for (const outputSize of OUTPUT_SIZES) {
      const canvas = document.createElement('canvas')
      canvas.width = outputSize
      canvas.height = outputSize

      const context = canvas.getContext('2d')
      if (!context) {
        throw new Error('Das Bild konnte nicht verarbeitet werden.')
      }

      if (outputType === 'image/jpeg') {
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, outputSize, outputSize)
      }

      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputSize,
        outputSize,
      )

      for (const quality of OUTPUT_QUALITIES) {
        const blob = await canvasToBlob(canvas, outputType, quality)

        if (!smallestBlob || blob.size < smallestBlob.size) {
          smallestBlob = blob
          smallestType = outputType
        }

        if (blob.size <= MAX_PHOTO_SIZE) {
          return new File([blob], buildOptimizedFileName(file.name, outputType), {
            type: outputType,
            lastModified: Date.now(),
          })
        }
      }
    }
  }

  if (smallestBlob) {
    throw new Error(
      `Das Bild konnte nicht ausreichend verkleinert werden. Bitte wählen Sie ein anderes Foto (beste Version: ${Math.ceil(smallestBlob.size / 1024)} KB, ${smallestType === 'image/webp' ? 'WebP' : 'JPEG'}).`,
    )
  }

  throw new Error('Das Bild konnte nicht verarbeitet werden.')
}
