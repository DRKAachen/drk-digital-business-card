/**
 * Server-only Zammad helpdesk client.
 *
 * This module holds the DRK helpdesk API token (`ZAMMAD_TOKEN`) and must never
 * be imported into client code — the token stays on the backend at all times.
 * The app's Support button posts to `/api/support`, and only that route calls
 * {@link createSupportTicket}, which in turn calls Zammad's `POST /api/v1/tickets`.
 *
 * Three things here are load-bearing for a usable ticket (see the integration guide):
 *   1. We resolve the sender's numeric Zammad user id up front (creating the user
 *      if needed) instead of relying on the `guess:<email>` shorthand, so we can
 *      set `origin_by_id`.
 *   2. `sender: "Customer"` + `from: <email>` — makes the article read as coming
 *      from the user.
 *   3. `origin_by_id: <userId>` — attributes the article to the requester, not the
 *      bot agent. This is the field that actually makes a Zammad "Reply" go back
 *      to the user; for API-created articles `sender`/`from` alone are not enough.
 *      If the id can't be resolved we fall back to `customer_id: "guess:<email>"`
 *      (ticket still links to the user; reply-to may target the bot — old behaviour).
 */

/**
 * Hard ceiling on the whole Zammad flow so a hung helpdesk never blocks our route.
 * Covers up to three sequential calls (create/lookup customer, then create ticket).
 */
const TIMEOUT_MS = 8000

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
 * Resolve the customer's numeric Zammad user id, creating them if needed.
 *
 * We need the real id (not the `guess:<email>` shorthand) so we can set the
 * article's `origin_by_id`. That's what makes an agent's "Reply" address the
 * customer: Zammad otherwise attributes an API-created article to the token's
 * user (the bot), so Reply would go to the bot. Returns null if it can't be
 * resolved — the caller then falls back to `guess:` (ticket still links; the
 * reply-to may be wrong, i.e. the old behaviour).
 */
async function resolveCustomerId(
  baseUrl: string,
  token: string,
  email: string,
  signal: AbortSignal,
): Promise<number | null> {
  const headers = {
    Authorization: `Token token=${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  try {
    // Create first — authoritative, needs no search index. 201 for new users;
    // 422 when the email already exists.
    const create = await fetch(`${baseUrl}/api/v1/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, roles: ['Customer'] }),
      signal,
    })
    if (create.ok) {
      const user = (await create.json().catch(() => ({}))) as { id?: number }
      return user.id ?? null
    }
    // Already exists → look them up by email.
    const search = await fetch(
      `${baseUrl}/api/v1/users/search?query=${encodeURIComponent(email)}&limit=50`,
      { headers, signal },
    )
    if (!search.ok) return null
    const users = (await search.json().catch(() => [])) as Array<{ id?: number; email?: string }>
    const hit = Array.isArray(users)
      ? users.find((u) => (u.email ?? '').toLowerCase() === email.toLowerCase())
      : undefined
    return hit?.id ?? null
  } catch (err) {
    // Bubble up the abort so the caller maps it to a timeout; swallow the rest.
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    console.error('[zammad] customer resolve failed:', err)
    return null
  }
}

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

  // The article body is ONLY the user's message. The technical context lives in
  // the structured custom fields below (visible in the ticket sidebar), never in
  // the body — otherwise Zammad quotes it back into the agent's "Reply" mail,
  // dumping the user's own device/browser data into the response to them.
  const body = message

  // Drop empty/blank fields — Zammad silently ignores unknown/empty keys, but we
  // keep tickets tidy and only send what's actually populated.
  const cleanFields = Object.fromEntries(
    Object.entries(f).filter(([, v]) => typeof v === 'string' && v.trim() !== ''),
  )

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    // Resolve the requester's numeric id up front so we can attribute the article
    // to them (origin_by_id) — otherwise an agent's "Reply" targets the bot agent.
    const customerId = await resolveCustomerId(baseUrl, token, email, controller.signal)

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
        customer_id: customerId ?? `guess:${email}`,
        article: {
          subject: 'Support-Anfrage',
          type: 'web',
          sender: 'Customer',
          from: email,
          origin_by_id: customerId ?? undefined,
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
