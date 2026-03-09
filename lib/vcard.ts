import type { CardRow } from './supabase/types'

/**
 * Generates a vCard 3.0 string (.vcf) from a card database row.
 * vCard 3.0 is used for maximum compatibility across iOS, Android, and desktop.
 * See RFC 2426 for the specification.
 */
export function generateVCard(card: CardRow, photoUrl?: string): string {
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
    lines.push(`PHOTO;VALUE=URI:${esc(photoUrl)}`)
  }

  lines.push(`REV:${new Date().toISOString()}`)
  lines.push('END:VCARD')

  return lines.join('\r\n')
}

/** Escapes vCard special characters (semicolons, commas, backslashes, newlines) */
function esc(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}
