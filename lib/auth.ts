import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './db'
import { authConfig } from './auth.config'

/**
 * Full Auth.js (NextAuth v5) configuration with Prisma adapter.
 * Extends the edge-compatible base config with the database adapter
 * and JWT session strategy.
 *
 * Use this module in server components, API routes, and anywhere that
 * runs in the Node.js runtime. The middleware uses auth.config.ts directly
 * to avoid pulling Prisma into the Edge Runtime.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
})
