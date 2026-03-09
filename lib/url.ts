/**
 * Returns the configured site URL with protocol guaranteed.
 * Prevents broken links if NEXT_PUBLIC_SITE_URL is set without https://.
 */
export function getSiteUrl(): string {
  let url = process.env.NEXT_PUBLIC_SITE_URL || ''
  if (url && !/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  return url.replace(/\/+$/, '')
}
