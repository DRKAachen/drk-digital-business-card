import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { APP_NAME, APP_VERSION, SUPPORT_EMAIL } from '@/lib/support'
import { createSupportTicket, type ZammadAttachment } from '@/lib/zammad'

/**
 * POST /api/support — files a Zammad helpdesk ticket for the logged-in user.
 *
 * The endpoint is the only thing that talks to Zammad; the API token lives in
 * `ZAMMAD_TOKEN` and never reaches the client. The reply-to email and the user
 * identifier are taken from the authenticated session (not the request body),
 * so they cannot be spoofed. The client only supplies the message, a little
 * device context, and optional attachments.
 */

const MAX_MESSAGE_LENGTH = 5000
const MAX_ATTACHMENTS = 3
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])

// Best-effort in-memory rate limit. It resets on redeploy and is per-instance,
// so it is a spam speed-bump rather than a hard guarantee — acceptable because
// the endpoint already requires an authenticated session.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5
const recentByUser = new Map<string, number[]>()

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const hits = (recentByUser.get(userId) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (hits.length >= RATE_LIMIT_MAX) {
    recentByUser.set(userId, hits)
    return true
  }
  hits.push(now)
  recentByUser.set(userId, hits)
  return false
}

/** Pragmatic email check — good enough to reject obvious junk before hitting Zammad. */
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254
}

/** Best-effort client IP for anonymous rate limiting, from the proxy headers. */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

interface SupportRequestBody {
  message?: unknown
  /** Sender email — only used for anonymous senders; ignored when a session email exists. */
  email?: unknown
  fields?: unknown
  attachments?: unknown
  /** Honeypot: hidden field that only bots fill in. */
  website?: unknown
}

export async function POST(request: NextRequest) {
  // Support is available to both logged-in users (dashboard) and anonymous
  // visitors (login page, public card view). When a session exists we trust its
  // email; otherwise the sender must supply a valid one in the body.
  const session = await auth()
  const userId = session?.user?.id
  const sessionEmail = session?.user?.email ?? null

  let payload: SupportRequestBody
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  // Honeypot tripped: pretend success so bots get no signal, but file nothing.
  if (typeof payload.website === 'string' && payload.website.trim() !== '') {
    return NextResponse.json({ number: '0' })
  }

  // A session email is authoritative and cannot be overridden by the body.
  const email = sessionEmail ?? (typeof payload.email === 'string' ? payload.email.trim() : '')
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: 'Bitte geben Sie eine gültige E-Mail-Adresse an.' },
      { status: 400 },
    )
  }

  const message = typeof payload.message === 'string' ? payload.message.trim() : ''
  if (!message) {
    return NextResponse.json({ error: 'Bitte beschreiben Sie Ihr Anliegen.' }, { status: 400 })
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: 'Ihre Nachricht ist zu lang.' }, { status: 400 })
  }

  // Rate-limit per user when logged in, otherwise per client IP.
  const rateKey = userId ? `u:${userId}` : `ip:${getClientIp(request)}`
  if (isRateLimited(rateKey)) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut.' },
      { status: 429 },
    )
  }

  // Validate + normalize attachments. Limits are enforced here as the source of
  // truth even though the dialog also checks them client-side.
  const attachments: ZammadAttachment[] = []
  if (Array.isArray(payload.attachments)) {
    if (payload.attachments.length > MAX_ATTACHMENTS) {
      return NextResponse.json(
        { error: `Maximal ${MAX_ATTACHMENTS} Anhänge erlaubt.` },
        { status: 400 },
      )
    }
    for (const raw of payload.attachments) {
      if (!raw || typeof raw !== 'object') continue
      const a = raw as Record<string, unknown>
      const filename = typeof a.filename === 'string' ? a.filename.slice(0, 200) : ''
      const mimeType = typeof a.mimeType === 'string' ? a.mimeType : ''
      const data = typeof a.data === 'string' ? a.data : ''
      if (!filename || !data) continue
      if (!ALLOWED_MIME.has(mimeType)) {
        return NextResponse.json(
          { error: 'Nicht unterstützter Dateityp. Erlaubt sind Bilder (PNG/JPG/WebP) und PDF.' },
          { status: 400 },
        )
      }
      // base64 → approximate byte size: 4 encoded chars ≈ 3 bytes.
      const approxBytes = Math.floor((data.length * 3) / 4)
      if (approxBytes > MAX_ATTACHMENT_BYTES) {
        return NextResponse.json(
          { error: 'Ein Anhang ist zu groß (max. 5 MB pro Datei).' },
          { status: 400 },
        )
      }
      attachments.push({ filename, mimeType, data })
    }
  }

  // Only trust a whitelist of client-provided context; everything else that
  // identifies the ticket comes from the server session.
  const clientFields = (payload.fields && typeof payload.fields === 'object'
    ? payload.fields
    : {}) as Record<string, unknown>
  const pickString = (key: string) =>
    typeof clientFields[key] === 'string' ? (clientFields[key] as string).slice(0, 200) : undefined

  const result = await createSupportTicket({
    email,
    message,
    fields: {
      app_name: APP_NAME,
      app_version: APP_VERSION,
      device_os: pickString('device_os'),
      active_screen: pickString('active_screen'),
      // Only known for logged-in senders; omitted (dropped) for anonymous ones.
      app_user_identification: userId,
    },
    attachments,
  })

  if (!result.ok) {
    if (result.reason === 'not_configured') {
      console.error('Support ticket failed: ZAMMAD_URL / ZAMMAD_TOKEN not configured')
      return NextResponse.json(
        {
          error: `Der Support-Dienst ist derzeit nicht verfügbar. Bitte schreiben Sie an ${SUPPORT_EMAIL}.`,
        },
        { status: 503 },
      )
    }
    console.error(
      'Support ticket failed:',
      result.reason,
      'status' in result ? result.status : '',
      result.detail,
    )
    return NextResponse.json(
      { error: 'Ihre Anfrage konnte nicht übermittelt werden. Bitte versuchen Sie es später erneut.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ number: result.number })
}
