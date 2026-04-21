/**
 * Auth.js catch-all API route.
 * Handles sign-in, sign-out, callbacks, and session endpoints
 * at /api/auth/* automatically.
 */
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
