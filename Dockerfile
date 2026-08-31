# Multi-stage Dockerfile for FarmGo Backend Monorepo
# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace configurations and manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install all dependencies (including devDependencies for TypeScript compilation)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY shared ./shared
COPY backend ./backend

# Build shared library and backend
RUN pnpm --filter farmgo-shared build
RUN pnpm --filter farmgo-backend build

# Copy schema.sql to dist directory for standalone runtime
RUN mkdir -p /app/backend/dist/db && cp /app/backend/src/db/schema.sql /app/backend/dist/db/schema.sql || true

# Prune devDependencies for a lean production image
RUN pnpm --filter farmgo-backend --prod deploy /app/pruned-backend

# Stage 2: Lean Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy compiled files and node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/src/db/schema.sql ./dist/db/schema.sql
COPY --from=builder /app/backend/src/db/schema.sql ./src/db/schema.sql
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/backend/package.json ./package.json

EXPOSE 3001

# Run health check against /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3001}/api/health || exit 1

CMD ["node", "dist/index.js"]
