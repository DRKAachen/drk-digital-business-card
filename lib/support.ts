/**
 * Helpers for the interim Support flow.
 *
 * Until a proper ticketing system is in place the Support button uses a plain
 * `mailto:` URL that opens the user's own mail client. No server-side state,
 * no SMTP relay, nothing to process on our side — the user sends the mail
 * themselves, which keeps the DSGVO surface at exactly zero.
 *
 * The one piece of technical sugar we add is a short random reference ID that
 * is embedded in the subject line. Ops can grep the support inbox for that
 * reference when the user follows up. When the ticketing system replaces this
 * flow, only this module and the `SupportButton` component should need to be
 * swapped out.
 */

/** Recipient mailbox for all support requests. Defined once, used everywhere. */
export const SUPPORT_EMAIL = 'digitalisierung@drk-aachen.de'

/** Fixed German prefix of the mail subject line. */
export const SUPPORT_SUBJECT_PREFIX = 'Support Anfrage DRK Visitenkarte'

export interface SupportMailtoContext {
  /** Logged-in user's email address, or undefined for anonymous/public pages. */
  userEmail?: string | null
  /** Full URL of the page the user was on when they clicked the button. */
  pageUrl?: string
  /** Short random reference ID that also appears in the subject line. */
  ref: string
  /** ISO timestamp of the click. */
  timestamp: string
}

/**
 * Generates an 8-character base36 reference ID derived from a cryptographically
 * strong random UUID. Short enough to read out loud, long enough (~10^12 values)
 * to avoid realistic collisions within a support inbox.
 *
 * Uses the Web Crypto API which is available in all modern browsers Next 15
 * targets. Falls back to Math.random() only in environments that somehow lack
 * crypto.randomUUID — this is a UX helper, not a security token, so the
 * fallback is acceptable.
 */
export function generateSupportRef(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 8)
  }
  return Math.random().toString(36).slice(2, 10).padEnd(8, '0')
}

/**
 * Builds the full `mailto:` URL with a properly encoded subject and body.
 * The body template is in German and contains a clear separator so users
 * know where to type their own message vs. where the auto-filled technical
 * context lives.
 */
export function buildSupportMailto(ctx: SupportMailtoContext): string {
  const subject = `${SUPPORT_SUBJECT_PREFIX} [Ref: ${ctx.ref}]`

  const userLine = ctx.userEmail ? ctx.userEmail : 'nicht angemeldet'
  const pageLine = ctx.pageUrl ? ctx.pageUrl : 'unbekannt'

  const body = [
    'Hallo Digitalisierungsteam,',
    '',
    '[Bitte beschreiben Sie hier Ihr Anliegen]',
    '',
    '',
    '--- Technische Informationen (bitte nicht ändern) ---',
    `Ref-ID: ${ctx.ref}`,
    `Zeitpunkt: ${ctx.timestamp}`,
    `Seite: ${pageLine}`,
    `Benutzer: ${userLine}`,
  ].join('\n')

  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
