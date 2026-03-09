/**
 * Generates a URL-friendly slug from first and last name.
 * Handles German umlauts and special characters.
 */
export function generateSlug(firstName: string, lastName: string): string {
  const raw = `${firstName}-${lastName}`.toLowerCase()

  const germanReplacements: Record<string, string> = {
    'ä': 'ae',
    'ö': 'oe',
    'ü': 'ue',
    'ß': 'ss',
  }

  let slug = raw
  for (const [from, to] of Object.entries(germanReplacements)) {
    slug = slug.replaceAll(from, to)
  }

  return slug
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Validates a slug: only lowercase letters, numbers, and hyphens.
 * Must be between 3 and 80 characters.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$/.test(slug)
}
