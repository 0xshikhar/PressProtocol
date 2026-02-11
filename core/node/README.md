# AnonPress Backend

Backend API for AnonPress - Decentralized censorship-resistant publishing platform.

## Features

- **IPFS Storage** - Content distribution via Pinata
- **Tor Integration** - Onion service creation for anonymous access
- **Ed25519 Identity** - Cryptographic content signing and verification
- **Multi-Mirror Management** - IPFS, Tor, and gateway mirrors with health checks
- **Discovery Feed** - Content discovery with tag-based filtering
- **PostgreSQL Database** - Prisma ORM for data persistence

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Fastify
- **Database**: PostgreSQL + Prisma
- **Storage**: Pinata (IPFS)
- **Identity**: @noble/ed25519
- **Tor**: SOCKS5 proxy integration

## Prerequisites

- Node.js 20+ or Bun
- PostgreSQL database
- Pinata API credentials
- (Optional) Tor daemon for real onion services

## Installation

```bash
# Install dependencies
npm install

# Or use pnpm/bun
pnpm install
bun install
```

## Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Required environment variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/anonpress
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt
JWT_SECRET=your_jwt_secret
```

## Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

## Development

```bash
npm run dev
```

Server runs at `http://localhost:4000`

## Production

```bash
# Build
npm run build

# Start
npm start
```

## API Endpoints

### Content Management

- `POST /api/content` - Publish new content
- `GET /api/content` - List content
- `GET /api/content/:cid` - Get specific content

### Resolution

- `GET /api/resolve/:cid` - Resolve content with mirrors
- `GET /api/resolve/:cid/mirrors` - Get available mirrors
- `GET /api/resolve/:cid/metadata` - Get metadata only

### Discovery

- `GET /api/discovery` - Discovery feed
- `GET /api/discovery/search?q=query` - Search content
- `GET /api/discovery/tags` - Trending tags
- `GET /api/discovery/publisher/:address` - Publisher content

### Identity

- `POST /api/identity` - Create Ed25519 identity
- `GET /api/identity/:walletAddress` - Get user identities
- `POST /api/identity/verify` - Verify signature

### Mirrors

- `GET /api/mirrors/:cid/health` - Check mirror health
- `GET /api/mirrors/:cid/fastest` - Get fastest mirror

### Health

- `GET /health` - Basic health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

## Publishing Flow

```typescript
// 1. Publish content
POST /api/content
{
  "title": "Article Title",
  "content": "<html>content</html>",
  "tags": ["journalism", "freedom"],
  "walletAddress": "0x..."
}

// Response
{
  "success": true,
  "data": {
    "cid": "Qm...",
    "shareUrl": "anonpress://Qm...",
    "mirrors": {
      "ipfs": "https://gateway.pinata.cloud/ipfs/Qm...",
      "tor": "http://abc123.onion",
      "gateway": "https://anonpress.io/read/Qm..."
    }
  }
}
```

## Resolution Flow

```typescript
// 1. Resolve content
GET /api/resolve/Qm...

// Response
{
  "success": true,
  "data": {
    "cid": "Qm...",
    "title": "Article Title",
    "content": "<html>...</html>",
    "mirrors": {
      "ipfs": { "url": "...", "available": true, "latency": 120 },
      "tor": { "url": "...", "available": true, "latency": 450 },
      "gateway": { "url": "...", "available": true, "latency": 200 }
    },
    "recommended": "ipfs"
  }
}
```

## Architecture

```
┌─────────────────┐
│   Web App       │
│   (Next.js)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │
│  (Fastify)      │
└────────┬────────┘
         │
    ┌────┴────┬─────────┬──────────┐
    ▼         ▼         ▼          ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌─────────┐
│ Pinata │ │  Tor │ │ DB   │ │ Gateway │
│ (IPFS) │ │      │ │(Pg)  │ │         │
└────────┘ └──────┘ └──────┘ └─────────┘
```

## Services

### StorageService
- IPFS uploads via Pinata
- Content pinning and retrieval
- Gateway URL generation

### TorService
- Onion service creation
- SOCKS5 proxy integration
- Mock onion addresses (dev mode)

### IdentityService
- Ed25519 keypair generation
- Content signing
- Signature verification

### MirrorService
- Mirror health checks
- Latency measurement
- Fastest mirror selection

### ResolverService
- Content resolution
- Mirror recommendation
- Metadata fetching

### DiscoveryService
- Content feed generation
- Tag-based filtering
- Search functionality

## Testing

```bash
# Run tests (when implemented)
npm test

# Manual testing
curl http://localhost:4000/health
```

## Deployment

### Railway

```bash
railway login
railway init
railway up
```

### Render

1. Connect GitHub repository
2. Select "Web Service"
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t anonpress-backend .
docker run -p 4000:4000 --env-file .env anonpress-backend
```

## License

MIT
