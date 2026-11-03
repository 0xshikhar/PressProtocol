# Multi-Architecture Sovereign Community Node Dockerfile
# Platforms: linux/amd64, linux/arm64 (Raspberry Pi 4/5, Apple Silicon, VPS)
# Target: PressProtocol Complete Sovereign Infrastructure (Wave 4)
#
# Build context: REPOSITORY ROOT (the node depends on the workspace @pressprotocol/sdk)
#   fly deploy --config deploy/fly.toml        (context is the repo root)
#   docker build -f core/node/Dockerfile .

FROM node:22-alpine AS builder

WORKDIR /app

# Install build essentials & core tools
RUN apk add --no-cache curl wget bash python3 make g++

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

# Copy workspace manifests for a filtered install
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/sdk/package.json packages/sdk/package.json
COPY core/node/package.json core/node/package.json
COPY core/node/tsconfig.json core/node/tsconfig.json
COPY core/node/prisma core/node/prisma

# Install only the node + sdk dependency subgraph
RUN pnpm install --frozen-lockfile --filter anonpress-backend --filter @pressprotocol/sdk

# Copy sources and build SDK first, then node (prisma generate + tsc)
COPY packages/sdk ./packages/sdk
COPY core/node/src ./core/node/src
RUN pnpm --dir packages/sdk run build && pnpm --dir core/node run build

# Produce an isolated production bundle (vendors the workspace SDK + prod deps)
RUN pnpm deploy --filter anonpress-backend --prod --legacy /app/deploy

# Generate the Prisma client inside the deployed bundle (@prisma/client is a prod dep)
RUN cd /app/deploy && npx -y prisma@6 generate

# --- Production Image ---
FROM node:22-alpine AS runner

LABEL org.opencontainers.image.title="PressProtocol Sovereign Community Node"
LABEL org.opencontainers.image.description="Autonomous, zero-SPOF censorship-resistant publishing node with embedded Helia IPFS and Tor v3"
LABEL org.opencontainers.image.version="1.1.0"
LABEL org.opencontainers.image.source="https://github.com/0xshikhar/PressProtocol"

WORKDIR /app

# Install runtime system packages: Tor daemon, su-exec for non-root execution, curl & wget
RUN apk add --no-cache tor su-exec bash curl wget ca-certificates

# Create unprivileged system user for pressprotocol
RUN addgroup -g 10001 -S pressprotocol && \
    adduser -u 10001 -S pressprotocol -G pressprotocol

# Copy the isolated production bundle (node_modules + dist + prisma schema)
COPY --from=builder /app/deploy/node_modules ./node_modules
COPY --from=builder /app/deploy/dist ./dist
COPY --from=builder /app/deploy/prisma ./prisma
COPY --from=builder /app/deploy/package.json ./package.json

# Copy entrypoint script
COPY core/node/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Create mount directories
RUN mkdir -p /data/ipfs /data/tor/onion_service /data/db /data/identity /data/content-cache && \
    chown -R 10001:10001 /data /app

# Volume for all persistent sovereign data (IPFS blockstore, Tor keys, embedded DB, node identity)
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
