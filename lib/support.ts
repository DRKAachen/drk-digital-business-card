/**
 * Shared constants for the Support flow.
 *
 * The Support button used to open a plain `mailto:` link; it now posts to
 * `/api/support`, which files a ticket in the Zammad helpdesk server-side (the
 * API token never reaches the client). This module is the single place that
 * holds the user-facing support address and the app identity we attach to
 * every ticket, so both the client dialog and the server route stay in sync.
 */

/**
 * Fallback support mailbox, shown to the user whenever the ticket API is unavailable.
 * This address is monitored by Zammad: mails sent here are turned into tickets
 * automatically, so the fallback path lands in the same helpdesk as the in-app form.
 */
export const SUPPORT_EMAIL = 'support.visitenkarte@drk-digital.io'

/** Application name attached to every ticket (Zammad top-level `app_name`). */
export const APP_NAME = 'Visitenkarte'

/**
 * Application version attached to every ticket (Zammad top-level `app_version`).
 * Kept in sync manually with package.json — there is a single deployed web build,
 * so a constant is simpler and more reliable than trying to read it at runtime.
 */
export const APP_VERSION = '1.0.0'
