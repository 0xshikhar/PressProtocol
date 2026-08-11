# Multi-Architecture Sovereign Community Node Dockerfile
# Platforms: linux/amd64, linux/arm64 (Raspberry Pi 4/5, Apple Silicon, VPS)
# Target: PressProtocol Complete Sovereign Infrastructure (Wave 4)

FROM node:20-alpine AS builder

WORKDIR /app

# Install build essentials & core tools
RUN apk add --no-cache curl wget bash python3 make g++

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifest files
COPY package.json pnpm-lock.yaml* tsconfig.json ./

# Install dependencies with pnpm
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source and prisma definitions
COPY src ./src
COPY prisma ./prisma

# Generate Prisma client and compile TypeScript
RUN npx prisma generate --no-engine 2>/dev/null || true
RUN pnpm run build

# --- Production Image ---
FROM node:20-alpine AS runner

LABEL org.opencontainers.image.title="PressProtocol Sovereign Community Node"
LABEL org.opencontainers.image.description="Autonomous, zero-SPOF censorship-resistant publishing node with embedded Helia IPFS and Tor v3"
LABEL org.opencontainers.image.version="1.0.0-sovereign"

WORKDIR /app

# Install runtime system packages: Tor daemon, su-exec for non-root execution, curl & wget
RUN apk add --no-cache tor su-exec bash curl wget ca-certificates

# Create unprivileged system user for pressprotocol
RUN addgroup -g 10001 -S pressprotocol && \
    adduser -u 10001 -S pressprotocol -G pressprotocol

# Enable pnpm in production runner
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy production package descriptors and install prod-only dependencies
COPY package.json pnpm-lock.yaml* tsconfig.json ./
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# Copy built application and prisma client from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma 2>/dev/null || true
COPY prisma ./prisma

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Create mount directories
RUN mkdir -p /data/ipfs /data/tor/onion_service /data/db && \
    chown -R 10001:10001 /data /app

# Volume for all persistent sovereign data (IPFS blockstore, Tor keys, embedded DB)
VOLUME ["/data"]

# Expose ports:
# 4000: Node HTTP API & Gateway
# 4001: Helia / libp2p Swarm & DHT
# 9050: Tor SOCKS5 Proxy
EXPOSE 4000 4001 9050

# Default environment flags for sovereign operation
ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_DIR=/data
ENV TOR_ENABLED=true

# Container healthcheck targeting the sovereign health probe
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=15s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/node/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
