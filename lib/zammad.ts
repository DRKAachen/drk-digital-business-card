/**
 * Server-only Zammad helpdesk client.
 *
 * This module holds the DRK helpdesk API token (`ZAMMAD_TOKEN`) and must never
 * be imported into client code — the token stays on the backend at all times.
 * The app's Support button posts to `/api/support`, and only that route calls
 * {@link createSupportTicket}, which in turn calls Zammad's `POST /api/v1/tickets`.
 *
 * Two things here are load-bearing for a usable ticket (see the integration guide):
 *   1. `customer_id: "guess:<email>"` — links or creates the sender so the ticket's
 *      customer is the real user, not the bot agent.
 *   2. `sender: "Customer"` + `from: <email>` — makes the article read as coming
 *      from the user, so a Zammad "reply" goes back to them.
 */

/** Hard ceiling on the Zammad request so a hung helpdesk never blocks our route. */
const TIMEOUT_MS = 5000

/** Contextual fields that exist as global Zammad attributes and ride along as top-level keys. */
export interface ZammadTicketFields {
  app_name?: string
  app_version?: string
  device_os?: string
  app_user_identification?: string
  active_screen?: string
}

/** A single inline attachment. `data` is raw base64 (no `data:` URI prefix). */
export interface ZammadAttachment {
  filename: string
  mimeType: string
  data: string
}

export interface CreateSupportTicketInput {
  /** Reply-to address; becomes the ticket customer via `guess:<email>`. */
  email: string
  /** The user's free-text message. */
  message: string
  /** Optional context fields; empty values are dropped before sending. */
  fields?: ZammadTicketFields
  /** Optional inline attachments (already validated by the caller). */
  attachments?: ZammadAttachment[]
}

export type CreateSupportTicketResult =
  | { ok: true; number: string }
  | { ok: false; reason: 'not_configured' }
  | { ok: false; reason: 'http_error'; status: number; detail: string }
  | { ok: false; reason: 'exception'; detail: string }

/**
 * Files a support ticket in Zammad and returns the assigned ticket number.
 *
 * Never throws: every failure mode (missing config, HTTP error, network/timeout)
 * is returned as a typed result so the API route can map it to a clean response.
 */
export async function createSupportTicket({
  email,
  message,
  fields,
  attachments,
}: CreateSupportTicketInput): Promise<CreateSupportTicketResult> {
  const baseUrl = process.env.ZAMMAD_URL?.replace(/\/+$/, '')
  const token = process.env.ZAMMAD_TOKEN
  const group = process.env.ZAMMAD_GROUP || 'Visitenkarte'

  if (!baseUrl || !token) return { ok: false, reason: 'not_configured' }

  const f = { ...(fields ?? {}) }

  // The context also goes into the article body as a readable footer, so agents
  // see it inline without opening the object attributes panel.
  const body = [
    message,
    '',
    '---',
    `Screen: ${f.active_screen ?? '-'}`,
    `App: ${[f.app_name, f.app_version].filter(Boolean).join(' ') || '-'}`,
    `Device: ${f.device_os ?? '-'}`,
    `User: ${f.app_user_identification ?? '-'}`,
  ].join('\n')

  // Drop empty/blank fields — Zammad rejects nothing, but we keep tickets tidy.
  const cleanFields = Object.fromEntries(
    Object.entries(f).filter(([, v]) => typeof v === 'string' && v.trim() !== ''),
  )

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(`${baseUrl}/api/v1/tickets`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Token token=${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Support-Anfrage – Visitenkarte',
        group,
        customer_id: `guess:${email}`,
        article: {
          subject: 'Support-Anfrage',
          type: 'web',
          sender: 'Customer',
          from: email,
          internal: false,
          body,
          attachments: (attachments ?? []).map((a) => ({
            filename: a.filename,
            data: a.data,
            'mime-type': a.mimeType,
          })),
        },
        ...cleanFields,
      }),
    })

    if (!res.ok) {
      return { ok: false, reason: 'http_error', status: res.status, detail: await res.text() }
    }

    const data = (await res.json()) as { number?: string | number }
    return { ok: true, number: String(data.number ?? '') }
  } catch (e) {
    return { ok: false, reason: 'exception', detail: String(e) }
  } finally {
    clearTimeout(timer)
  }
}
