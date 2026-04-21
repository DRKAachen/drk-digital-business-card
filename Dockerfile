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
# Prisma client generated artifacts are required by the running server
# (@prisma/client loads them at runtime). The standalone trace includes
# most things, but copying .prisma explicitly guarantees availability.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# The Prisma CLI is intentionally NOT included in the runtime image to keep
# it slim. Run `npx prisma migrate deploy` from your local dev machine (or
# a short-lived migration container) with the PROD DATABASE_URL exported.
# See README.md section "Datenbank-Migrationen" for the full workflow.
CMD ["node", "server.js"]
