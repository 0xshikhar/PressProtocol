FROM node:20-alpine AS builder

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies with retry and timeout settings
RUN npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retries 5 && \
    npm ci --prefer-offline --no-audit

# Copy source
COPY src ./src
COPY prisma ./prisma

# Generate Prisma client with --no-engine for Accelerate
RUN npx prisma generate --no-engine

# Build
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./

# Install production dependencies with retry settings (include prisma for generation)
RUN npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retries 5 && \
    npm ci --omit=dev --prefer-offline --no-audit && \
    npm install -g prisma@6.17.0

# Copy built files and prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

# Expose port
EXPOSE 4000

# Start with Prisma generation at runtime to ensure fresh client
CMD ["sh", "-c", "prisma generate --no-engine && node dist/index.js"]
