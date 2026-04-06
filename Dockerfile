# syntax=docker/dockerfile:1.9
# ============================================================
# astro-auto-adapter — Multi-stage Dockerfile
#
# Supports both standard Docker and OCI image formats.
# Configure at runtime with environment variables:
#   ASTRO_ADAPTER_MODE  — adapter to use (default: node)
#   ASTRO_OUTPUT_MODE   — output mode (default: server)
#   HOST                — bind address (default: 0.0.0.0)
#   PORT                — listen port (default: 4321)
#
# Build with secrets (never baked into image layers):
#   docker build --secret id=NPM_TOKEN,env=NPM_TOKEN .
# ============================================================

ARG NODE_VERSION=25
ARG PNPM_VERSION=10

# ────────────────────────────────────────────────────────────
# Stage 1: dependency installer
# ────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS deps

WORKDIR /app

# Enable corepack and activate pnpm
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Copy only the files needed to resolve the dependency graph
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Mount pnpm store as a cache; never baked into the image
# Mount NPM_TOKEN as a build secret if a private registry is needed
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    --mount=type=secret,id=NPM_TOKEN,required=false \
    pnpm install --frozen-lockfile --ignore-scripts

# ────────────────────────────────────────────────────────────
# Stage 2: library builder
# ────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS lib-builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the library (tsdown: src/ → dist/)
RUN pnpm build

# ────────────────────────────────────────────────────────────
# Stage 3: Astro app builder
# ────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS app-builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY --from=lib-builder /app/node_modules ./node_modules
COPY --from=lib-builder /app/dist ./dist
COPY --from=lib-builder /app/src ./src
COPY --from=lib-builder /app/package.json ./package.json
COPY --from=lib-builder /app/tsconfig.json ./tsconfig.json
COPY --from=lib-builder /app/astro.config.ts ./astro.config.ts
COPY --from=lib-builder /app/example ./example
COPY --from=lib-builder /app/env.d.ts ./env.d.ts

# Build arguments for adapter and output configuration
ARG ASTRO_ADAPTER_MODE=node
ARG ASTRO_OUTPUT_MODE=server

# Build the Astro example app in server (SSR) mode
# The node adapter generates a standalone Node.js server
RUN ASTRO_ADAPTER_MODE=${ASTRO_ADAPTER_MODE} \
    ASTRO_OUTPUT_MODE=${ASTRO_OUTPUT_MODE} \
    pnpm astro build --outDir /app/app-dist

# ────────────────────────────────────────────────────────────
# Stage 4: production runner
# Minimal Alpine image — no build tools, no source code
# ────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runner

# OCI image labels (https://github.com/opencontainers/image-spec)
LABEL org.opencontainers.image.title="astro-auto-adapter example"
LABEL org.opencontainers.image.description="Example Astro application using astro-auto-adapter"
LABEL org.opencontainers.image.source="https://github.com/okikio/astro-auto-adapter"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Copy only the Astro server bundle from the builder stage
COPY --from=app-builder /app/app-dist ./app-dist

# Create a non-root user for security best practices
RUN addgroup --system --gid 1001 astro && \
    adduser --system --uid 1001 --ingroup astro astro && \
    chown -R astro:astro /app

USER astro

# Runtime configuration via environment variables
# These can be overridden at `docker run` or in docker-compose.yml
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

EXPOSE 4321

# Health check so orchestrators know when the container is ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:${PORT}/ || exit 1

# The Astro node/standalone server entry point
CMD ["node", "app-dist/server/entry.mjs"]
