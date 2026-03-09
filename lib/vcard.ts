import type { CardRow } from './supabase/types'

/**
 * Generates a vCard 3.0 string (.vcf) from a card database row.
 * vCard 3.0 is used for maximum compatibility across iOS, Android, and desktop.
 * Photos are embedded as base64 for iOS contact app compatibility.
 * See RFC 2426 for the specification.
 */
export async function generateVCard(card: CardRow, photoUrl?: string): Promise<string> {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(card.last_name)};${esc(card.first_name)};;;`,
    `FN:${esc(card.first_name)} ${esc(card.last_name)}`,
  ]

  if (card.organization) {
    lines.push(`ORG:${esc(card.organization)}`)
  }

  if (card.title) {
    lines.push(`TITLE:${esc(card.title)}`)
  }

  if (card.email) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK:${esc(card.email)}`)
  }

  if (card.phone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${esc(card.phone)}`)
  }

  if (card.mobile) {
    lines.push(`TEL;TYPE=CELL:${esc(card.mobile)}`)
  }

  if (card.street || card.city || card.zip || card.country) {
    const adr = [
      '',
      '',
      esc(card.street ?? ''),
      esc(card.city ?? ''),
      '',
      esc(card.zip ?? ''),
      esc(card.country ?? ''),
    ].join(';')
    lines.push(`ADR;TYPE=WORK:${adr}`)
  }

  if (card.website) {
    lines.push(`URL:${esc(card.website)}`)
  }

  if (photoUrl) {
    const photoBase64 = await fetchPhotoAsBase64(photoUrl)
    if (photoBase64) {
      lines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${photoBase64}`)
    }
  }

  lines.push(`REV:${new Date().toISOString()}`)
  lines.push('END:VCARD')

  return lines.join('\r\n')
}

/**
 * Fetches a photo from a URL and returns it as a base64-encoded string.
 * Returns null if the fetch fails so the vCard can still be generated without a photo.
 */
async function fetchPhotoAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const buffer = await response.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  } catch {
    return null
  }
}

/** Escapes vCard special characters (semicolons, commas, backslashes, newlines) */
function esc(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}
