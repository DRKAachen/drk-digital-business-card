import { PrismaClient } from '@prisma/client'

/**
 * Singleton Prisma client instance.
 * In development, the client is stored on `globalThis` to survive hot-module reloading.
 * In production, a single instance is created and reused for the lifetime of the process.
 */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
