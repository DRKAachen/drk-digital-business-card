/**
 * Re-exports the Prisma Card type as CardRow for backward compatibility.
 * All components that previously imported CardRow from Supabase types
 * can now import it from here with no further changes needed.
 */
export type { Card as CardRow } from '@prisma/client'
