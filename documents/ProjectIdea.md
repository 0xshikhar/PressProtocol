
# Project Name: DeepMirror ( AnonPress will be the final name )

AnonPress acts as an intelligent content distribution layer that sits between WordPress and the internet, automatically ensuring content is always accessible through multiple pathways while optimizing for speed, privacy, and censorship resistance.




## 💡 Core AnonPress Flow (Extension + Web App) 

### 1. Publisher Flow (Power/Non-technical User) 
Install the DeepMirror browser extension.
When ready to publish, log in to the web app (or use plugin for WordPress/Notion/etc.).
User writes post, uploads media (optional: tags, “content safety” slider, privacy settings: e.g., Tor required, globally public, only via mirrors).
On “PUBLISH”:
Extension hashes and signs the content locally (never leaks metadata).
Extension and web app coordinate to:
Host on IPFS  
Spin up Tor onion service (extension can interact with local Tor daemon, or web app relays via backend relay)
Optionally mirror to Arweave/Filecoin (with fee/credit)
Register content hash with minimal index (ENS/DHT/small on-chain registry if required)
User is given a single link (e.g., AnonPress://hash or an ENS/IPNS/Arweave shortlink).
Dashboard lets you check content status on all layers (extension can probe availability from “clean” networks).
2. Reader Flow
Click a DeepMirror link (on social, web, messenger).
If user has browser extension:
Extension intercepts, checks which mirrors are available from their network.
Fastest/unblocked source is used transparently (IPFS public gateway, Tor, Arweave, etc).
Extension warns if the content integrity has issues, or content is only available on less-anonymous channels.
If no extension, web app fallback (gateway) attempts to resolve content (while warning about reduced anonymity, and offering the extension for best privacy).
End user can now read, download, or bookmark content, even under heavy censorship.

## 🗺️ Application Architecture & User Experience    

### Components:

Browser extension: Handles all client-side privacy, routes, and OS integrations
Web dashboard: Unified portal to see published, mirrored, and available content
Background services: Optionally run network relays and gateway (P2P node, Tor relay, IPFS Node, etc.)
Lightweight smart contract or DHT option for index

### Distinguishing Features (vs FreePress):

True multi-layer redundancy: Not just IPFS or Tor, but all major decentralized networks and normal web/CDN fallback
Seamless routing/auto-fallback: User always gets fastest, safest route; publisher doesn’t need to care
Privacy-first and locally-handled: All sensitive actions (hashing, signing, tagging) on device, never on server
Optional “turbo mode”: If publisher wants public speed, allows CDN fallback (with warning)
Pluggable identity: Optionally, tie anonymous ENS, Nostr, or other identity for authenticity/continuity



## Project Structure ( initial )

AnonPress/
├── web-app/                     # Next.js application
│   ├── src/
│   │   ├── app/                 # App router
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── publish/page.tsx
│   │   │   │   ├── content/page.tsx
│   │   │   │   └── analytics/page.tsx
│   │   │   ├── reader/
│   │   │   │   └── [contentId]/page.tsx
│   │   │   ├── api/
│   │   │   │   ├── content/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/route.ts
│   │   │   │   ├── mirrors/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── health/route.ts
│   │   │   │   ├── resolve/
│   │   │   │   │   └── [hash]/route.ts
│   │   │   │   └── discovery/
│   │   │   │       └── route.ts
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui
│   │   │   ├── auth/
│   │   │   │   ├── PrivyProvider.tsx
│   │   │   │   └── WalletConnect.tsx
│   │   │   ├── editor/
│   │   │   │   ├── RichEditor.tsx
│   │   │   │   ├── MediaUpload.tsx
│   │   │   │   └── PrivacySettings.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── ContentList.tsx
│   │   │   │   ├── MirrorStatus.tsx
│   │   │   │   └── PublishFlow.tsx
│   │   │   └── reader/
│   │   │       ├── ContentViewer.tsx
│   │   │       └── MirrorSelector.tsx
│   │   ├── lib/
│   │   │   ├── auth.ts           # Privy configuration
│   │   │   ├── api.ts            # API client
│   │   │   ├── utils.ts
│   │   │   ├── storage/
│   │   │   │   ├── ipfs.ts
│   │   │   │   ├── arweave.ts ( later implementation)
│   │   │   │   └── tor.ts
│   │   │   ├── crypto/
│   │   │   │   ├── hashing.ts
│   │   │   │   └── signatures.ts
│   │   │   └── discovery/
│   │   │       ├── waku.ts       # Waku integration
│   │   │       └── dht.ts        # DHT fallback
│   │   ├── hooks/
│   │   │   ├── useContent.ts
│   │   │   ├── useMirrors.ts
│   │   │   ├── useDiscovery.ts
│   │   │   └── useExtension.ts
│   │   ├── store/
│   │   │   ├── useContentStore.ts
│   │   │   ├── useUserStore.ts
│   │   │   └── useMirrorStore.ts
│   │   └── types/
│   │       ├── content.ts
│   │       ├── mirror.ts
│   │       ├── discovery.ts
│   │       └── api.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── browser-extension/           # Chrome extension
│   ├── src/
│   │   ├── background/
│   │   │   ├── background.ts
│   │   │   ├── messaging.ts
│   │   │   ├── mirrors.ts
│   │   │   └── discovery.ts      # Waku/DHT integration
│   │   ├── content/
│   │   │   ├── content.ts
│   │   │   └── linkInterceptor.ts
│   │   ├── popup/
│   │   │   ├── popup.tsx
│   │   │   ├── popup.html
│   │   │   └── components/
│   │   │       ├── MirrorStatus.tsx
│   │   │       ├── Settings.tsx
│   │   │       └── WalletConnect.tsx
│   │   ├── lib/
│   │   │   ├── storage.ts
│   │   │   ├── resolver.ts
│   │   │   ├── crypto.ts
│   │   │   ├── mirrors/
│   │   │   │   ├── ipfs.ts
│   │   │   │   ├── tor.ts
│   │   │   │   └── arweave.ts ( later implementation)
│   │   │   └── discovery/
│   │   │       ├── waku.ts
│   │   │       └── dht.ts
│   │   └── types/
│   │       └── extension.ts
│   ├── public/
│   │   ├── manifest.json
│   │   ├── icons/
│   │   └── popup.html
│   ├── webpack.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── backend-api/                 # Separate API service
│   ├── src/
│   │   ├── routes/
│   │   │   ├── content.ts
│   │   │   ├── mirrors.ts
│   │   │   ├── resolve.ts
│   │   │   ├── discovery.ts
│   │   │   └── auth.ts
│   │   ├── services/
│   │   │   ├── StorageService.ts
│   │   │   ├── MirrorService.ts
│   │   │   ├── DiscoveryService.ts # Waku/DHT service
│   │   │   ├── ipfs/
│   │   │   │   └── IPFSService.ts
│   │   │   ├── tor/
│   │   │   │   └── TorService.ts
│   │   │   └── arweave/
│   │   │       └── ArweaveService.ts ( later implementation)
│   │   ├── models/
│   │   │   ├── Content.ts
│   │   │   ├── Mirror.ts
│   │   │   ├── User.ts
│   │   │   └── Discovery.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── cors.ts
│   │   │   └── validation.ts
│   │   ├── workers/
│   │   │   ├── mirrorHealth.ts
│   │   │   ├── contentSync.ts
│   │   │   └── discovery.ts      # Waku message handling
│   │   ├── utils/
│   │   │   ├── crypto.ts
│   │   │   ├── validation.ts
│   │   │   └── logger.ts
│   │   └── config/
│   │       ├── database.ts
│   │       ├── redis.ts
│   │       ├── waku.ts
│   │       └── storage.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   └── tsconfig.json
│
├── shared-types/                # Shared TypeScript types
│   ├── src/
│   │   ├── content.ts
│   │   ├── mirror.ts
│   │   ├── discovery.ts
│   │   ├── auth.ts
│   │   └── api.ts
│   ├── package.json
│   └── tsconfig.json
│
└── docs/
    ├── api/
    ├── architecture/
    └── setup/


## Tech Stack

### Web App
{
  "framework": "Next.js 14 (App Router)",
  "auth": "Privy (Web3 + Web2)",
  "database": "Prisma + PostgreSQL",
  "styling": "Tailwind + shadcn/ui",
  "state": "Zustand + React Query",
  "deployment": "Vercel"
}

### Backend API
{
  "runtime": "Node.js 18+",
  "framework": "Fastify/Express",
  "database": "Prisma + PostgreSQL", 
  "discovery": "Waku/libp2p ( later implementation )",
  "deployment": "Railway/Render"
}

### Browser Extension
{
  "framework": "Chrome Extension (Manifest V3)",
  "language": "TypeScript",
  "bundler": "Webpack 5",
  "ui": "React + Tailwind",
  "storage": "Chrome Storage API"
}

### Storage Integrations
{
  "ipfs": "js-ipfs + Kubo API",
  "tor": "Tor proxy + stem (Python bridge)",
  "arweave": "Arweave SDK", ( later implementation )
  "backup": "AWS S3 (optional fallback)"
}


### Discovery Architecture (Waku Integration - later implementation) 
Publication Flow with Waku: 
// When content is published
async function publishToDiscovery(content: ContentMetadata) {
  const wakuMessage = {
    contentHash: content.hash,
    topic: content.category,
    timestamp: Date.now(),
    mirrors: content.mirrors.map(m => ({
      type: m.type,
      url: m.url,
      privacy: m.privacyLevel
    })),
    // No sensitive metadata
    signature: signContent(content.hash)
  };
  
  await waku.relay.send({
    contentTopic: `/AnonPress/1/discovery/proto`,
    payload: encode(wakuMessage)
  });
}


### Discovery Flow:
// Extension/Reader discovery
async function discoverContent(query: string) {
  // Subscribe to discovery messages
  const subscription = await waku.relay.subscribe(
    [`/AnonPress/1/discovery/proto`],
    (message) => {
      const content = decode(message.payload);
      if (matchesQuery(content, query)) {
        addToDiscoveryResults(content);
      }
    }
  );
  
  // Also query DHT for backup discovery
  const dhtResults = await queryDHT(query);
  
  return mergeResults(subscription, dhtResults);
}

### Updated flow

Frontend: Next.js + Privy + Prisma + PostgreSQL
Backend: Node.js/Fastify + Prisma + PostgreSQL (same DB)
No Queues: Direct synchronous calls
No Complex Monitoring: Simple health checks
Focus: Core storage + resolution functionality

Services We Actually Need:
StorageService: Handle IPFS uploads, Filecoin deals
MirrorService: Check if content is available on each network
ResolverService: Smart routing to best available mirror
DiscoveryService: IPFS DHT for content discovery (Waku later) 



these things will be removed:

❌ BullMQ + Redis (overkill)
❌ Self-hosted IPFS (Pinata API easier)
❌ Arweave (post demo feature)
❌ Waku (post-demo feature)

 ## 🔄 Detailed Technical Flow

### 1. Publishing Flow

```mermaid
    participant U as User
    participant WA as Web App
    participant BE as Backend
    participant EXT as Extension
    participant IPFS as IPFS Network
    participant TOR as Tor Network
    participant AR as Arweave
    U->>WA: Write content + privacy settings
    WA->>EXT: Request local hashing
    EXT->>EXT: Generate content hash + signature
    EXT->>WA: Return hash + metadata
    WA->>BE: Submit content + mirror preferences
    
    par Parallel Mirroring
        BE->>IPFS: Upload to IPFS
        BE->>TOR: Create onion service
        BE->>AR: Upload to Arweave (if paid)
    end
    
    BE->>BE: Store mirror URLs + status
    BE->>WA: Return DeepMirror URL
    WA->>U: Display shareable link + status
```

### 2. Resolution Flow

```mermaid
    participant R as Reader
    participant EXT as Extension
    participant WA as Web App
    participant BE as Backend
    participant IPFS as IPFS
    participant TOR as Tor
    participant AR as Arweave
    R->>EXT: Click DeepMirror link
    EXT->>BE: Query mirror availability
    BE->>EXT: Return available mirrors
    
    par Availability Check
        EXT->>IPFS: Test IPFS gateway
        EXT->>TOR: Test onion service
        EXT->>AR: Test Arweave gateway
    end
    
    EXT->>EXT: Choose fastest available mirror
    EXT->>R: Load content from chosen mirror
    
    alt If extension not installed
        R->>WA: Access via web gateway
        WA->>BE: Request content resolution
        BE->>R: Serve via fastest mirror
    end
```

## Revised Implementation Timeline

### Phase 1: Core Foundation (Week 1)
Day 1-2: Next.js setup + Privy auth + basic UI
Day 3-4: Prisma schema + basic CRUD APIs
Day 5-7: Chrome extension + basic link interception
### Phase 2: Storage Integration (Week 2)
Day 8-9: IPFS upload/retrieval
Day 10-11: Tor service integration
Day 12-14: Arweave integration + freemium model
### Phase 3: Discovery Layer (Week 3)
Day 15-17: Waku integration for discovery
Day 18-19: DHT fallback mechanism
Day 20-21: Extension discovery features
### Phase 4: Polish & Demo (Week 4)
Day 22-24: UX polish + dashboard
Day 25-26: Demo content + testing
Day 27-28: Documentation + hackathon video
