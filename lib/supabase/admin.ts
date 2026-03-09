import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase admin client using the secret API key (sb_secret_...).
 * This client bypasses RLS and should ONLY be used in server-side API routes
 * for privileged operations like account deletion (DSGVO Art. 17).
 *
 * Uses the new secret key format instead of the legacy service_role JWT:
 * - Independent rotation without affecting other keys
 * - Automatically blocked in browsers (User-Agent check)
 * - No long-lived JWT expiry concerns
 *
 * NEVER import this in client components or expose the secret key.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !secretKey) {
    throw new Error('Missing SUPABASE_SECRET_KEY environment variable')
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
