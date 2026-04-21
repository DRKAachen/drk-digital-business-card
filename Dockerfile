# ------------------------------------------------------------------------------
# Stage 1: Install dependencies (cached unless package.json/lock/schema change)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# ------------------------------------------------------------------------------
# Stage 2: Build the Next.js application
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Production image – only standalone output and static assets
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma CLI + generated client + schema/migrations are needed at runtime
# so we can run `prisma migrate deploy` automatically on container start.
# The Next.js standalone output does not include these by default.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# Apply any pending Prisma migrations against the DATABASE_URL, then start Next.
# Safe on a brand-new empty PROD database: creates the schema from 0_init.
# For an existing database that was initialised via `prisma db push` (no
# _prisma_migrations table), run once manually:
#   npx prisma migrate resolve --applied 0_init
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
