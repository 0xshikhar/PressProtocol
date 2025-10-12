# Decentralized Discovery - Alternatives to Centralized Phase 2

## 🎯 Problem Statement

Phase 2 features (trending, recommendations, search) rely heavily on centralized backend:
- **Trending**: Requires tracking views/claps in database
- **Recommendations**: Needs centralized algorithm
- **Search**: Requires indexing server

**This contradicts our censorship-resistance goals.**

---

## ✅ Decentralized Alternatives

### Option 1: IPFS DHT + Client-Side (Recommended)

**How it works:**
1. Content metadata stored on IPFS (not just content)
2. Client fetches metadata from IPFS DHT
3. Trending/recommendations calculated client-side
4. No backend dependency for discovery

**Pros:**
- ✅ Fully decentralized
- ✅ No single point of failure
- ✅ Privacy-preserving
- ✅ Works offline with cached data

**Cons:**
- ⚠️ Slower initial load (DHT queries)
- ⚠️ Limited to what's in DHT
- ⚠️ Can't track real-time engagement

**Implementation:**
```typescript
// Metadata stored on IPFS
interface ContentManifest {
  cid: string;
  title: string;
  tags: string[];
  publishedAt: number;
  publisher: string;
  
  // Engagement (self-reported, untrusted)
  engagement?: {
    views: number;
    claps: number;
  };
}

// Client-side trending
async function getTrendingContent(): Promise<ContentManifest[]> {
  // Query IPFS DHT for recent content
  const recentCids = await queryDHT('anonpress-content-*');
  
  // Fetch manifests
  const manifests = await Promise.all(
    recentCids.map(cid => ipfs.dag.get(cid))
  );
  
  // Calculate trending client-side
  return manifests
    .sort((a, b) => calculateTrendingScore(a) - calculateTrendingScore(b))
    .slice(0, 20);
}
```

---

### Option 2: Blockchain-Based Engagement (Expensive but Trustless)

**How it works:**
1. Engagement (claps, views) recorded on blockchain
2. Smart contract tracks metrics
3. Anyone can query blockchain for trending
4. Fully transparent and censorship-resistant

**Pros:**
- ✅ Trustless (no backend manipulation)
- ✅ Permanent record
- ✅ Verifiable engagement

**Cons:**
- ❌ Gas fees for every interaction
- ❌ Slow (blockchain confirmation time)
- ❌ Not scalable
- ❌ Expensive for users

**Not recommended for MVP.**

---

### Option 3: Hybrid - Optional Backend Indexing

**How it works:**
1. Content on IPFS (source of truth)
2. Multiple indexing services (backend, third-party)
3. Users choose which indexer to use
4. If all indexers fail, still works via direct IPFS

**Pros:**
- ✅ Fast discovery when indexers available
- ✅ Fallback to pure P2P
- ✅ No single point of failure
- ✅ Community can run indexers

**Cons:**
- ⚠️ More complex architecture
- ⚠️ Indexers can be biased
- ⚠️ Still some centralization

**Implementation:**
```typescript
interface IndexerConfig {
  url: string;
  type: 'official' | 'community' | 'self-hosted';
  trusted: boolean;
}

const DEFAULT_INDEXERS: IndexerConfig[] = [
  { url: 'https://api.anonpress.io', type: 'official', trusted: true },
  { url: 'https://anonpress.community', type: 'community', trusted: false },
  { url: 'http://localhost:4000', type: 'self-hosted', trusted: true },
];

// Try indexers, fallback to DHT
async function discoverContent(): Promise<Content[]> {
  for (const indexer of DEFAULT_INDEXERS) {
    try {
      const content = await fetch(`${indexer.url}/api/discovery`);
      if (content.ok) return content.json();
    } catch (e) {
      console.log(`Indexer ${indexer.url} failed, trying next...`);
    }
  }
  
  // All indexers failed, use DHT
  return await discoverViaIPFSDHT();
}
```

---

### Option 4: Nostr-Style Relays

**How it works:**
1. Multiple relay servers store content metadata
2. Users connect to multiple relays
3. Relays sync with each other
4. No single relay is critical

**Pros:**
- ✅ Decentralized but fast
- ✅ Battle-tested (Nostr uses this)
- ✅ Easy to run own relay
- ✅ Censorship-resistant

**Cons:**
- ⚠️ Need to maintain relay list
- ⚠️ Relays can go down
- ⚠️ Additional infrastructure

**Similar to Option 3 but with standardized protocol.**

---

## 🎯 Recommended Approach: Hybrid (Option 3)

### Architecture

```
┌─────────────────────────────────────────┐
│         Content on IPFS (immutable)     │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
   ┌────────┐  ┌────────┐  ┌────────┐
   │Official│  │Community│ │Self    │
   │Indexer │  │Indexers │ │-Hosted │
   └────────┘  └────────┘  └────────┘
        │           │           │
        └───────────┼───────────┘
                    │
            ┌───────▼────────┐
            │  User's Client │
            │  (tries all,   │
            │  fallback DHT) │
            └────────────────┘
```

### Implementation Plan

#### 1. Make Backend Optional

```typescript
// web-app/src/lib/discovery.ts

export class DiscoveryService {
  private indexers: IndexerConfig[];
  private ipfs: IPFSClient;
  
  constructor() {
    this.indexers = loadIndexersFromConfig();
    this.ipfs = new IPFSClient();
  }
  
  async discoverContent(): Promise<Content[]> {
    // Try configured indexers first
    for (const indexer of this.indexers) {
      try {
        const content = await this.fetchFromIndexer(indexer);
        if (content.length > 0) {
          console.log(`✅ Discovered via ${indexer.url}`);
          return content;
        }
      } catch (e) {
        console.log(`⚠️ Indexer ${indexer.url} failed`);
      }
    }
    
    // Fallback to IPFS DHT
    console.log('📡 Falling back to IPFS DHT discovery');
    return await this.discoverViaDHT();
  }
  
  private async discoverViaDHT(): Promise<Content[]> {
    // Query DHT for content manifests
    const manifests = await this.ipfs.dht.findProvs('anonpress-manifest');
    
    // Fetch manifests from IPFS
    const content = await Promise.all(
      manifests.map(async (cid) => {
        const manifest = await this.ipfs.dag.get(cid);
        return manifest.value;
      })
    );
    
    return content;
  }
}
```

#### 2. Store Manifests on IPFS

```typescript
// When publishing, create manifest
interface ContentManifest {
  cid: string;              // Content CID
  title: string;
  excerpt: string;
  tags: string[];
  publisher: string;
  publishedAt: number;
  version: string;
}

// Upload manifest to IPFS
const manifest: ContentManifest = {
  cid: contentCid,
  title,
  excerpt: content.substring(0, 200),
  tags,
  publisher: publicKey,
  publishedAt: Date.now(),
  version: '1.0',
};

const manifestCid = await ipfs.dag.put(manifest);

// Announce to DHT
await ipfs.dht.provide(manifestCid);
await ipfs.dht.put('/anonpress/manifest/' + manifestCid, manifestCid);
```

#### 3. Client-Side Trending

```typescript
// Calculate trending without backend
function calculateClientSideTrending(
  manifests: ContentManifest[]
): ContentManifest[] {
  const now = Date.now();
  
  return manifests
    .map(m => ({
      manifest: m,
      score: calculateScore(m, now)
    }))
    .sort((a, b) => b.score - a.score)
    .map(x => x.manifest);
}

function calculateScore(manifest: ContentManifest, now: number): number {
  const ageHours = (now - manifest.publishedAt) / (1000 * 60 * 60);
  
  // Exponential time decay (48 hour half-life)
  const timeDecay = Math.exp(-ageHours / 48);
  
  // Tag popularity (estimate based on tag frequency)
  const tagScore = manifest.tags.length * 0.1;
  
  // Recency bonus
  const recencyBonus = ageHours < 24 ? 0.5 : 0;
  
  return (timeDecay * 100) + tagScore + recencyBonus;
}
```

#### 4. Settings for Indexers

```typescript
// User can configure indexers
interface UserSettings {
  indexers: IndexerConfig[];
  preferDecentralized: boolean;  // Skip indexers, use DHT only
  cacheDiscovery: boolean;       // Cache for offline
}

// Settings UI
export function DiscoverySettings() {
  const [settings, setSettings] = useState<UserSettings>({
    indexers: DEFAULT_INDEXERS,
    preferDecentralized: false,
    cacheDiscovery: true,
  });
  
  return (
    <div>
      <h3>Discovery Settings</h3>
      
      <Switch
        checked={settings.preferDecentralized}
        onCheckedChange={(checked) => 
          setSettings({ ...settings, preferDecentralized: checked })
        }
      >
        Use only decentralized discovery (slower but more private)
      </Switch>
      
      <h4>Indexer Services</h4>
      {settings.indexers.map(indexer => (
        <div key={indexer.url}>
          <input value={indexer.url} />
          <button>Remove</button>
        </div>
      ))}
      <button>Add Custom Indexer</button>
    </div>
  );
}
```

---

## 📊 Comparison

| Feature | Centralized | IPFS DHT Only | Hybrid | Blockchain |
|---------|-------------|---------------|--------|------------|
| Speed | ⚡ Fast | 🐌 Slow | ⚡ Fast | 🐌 Slow |
| Privacy | ❌ Tracked | ✅ Private | ⚠️ Optional | ✅ Public |
| Censorship Resistance | ❌ Low | ✅ High | ✅ High | ✅ High |
| Scalability | ✅ High | ⚠️ Medium | ✅ High | ❌ Low |
| Cost | 💰 Server | Free | 💰 Optional | 💰💰💰 Gas |
| Complexity | Simple | Medium | High | Very High |

---

## 🎯 Recommendation

**Use Hybrid Approach (Option 3) with these principles:**

1. **Content Always on IPFS** (never only in database)
2. **Backend is Optional Indexer** (improves UX but not required)
3. **Multiple Indexer Support** (community can run own)
4. **Graceful Degradation** (works without any indexer)
5. **User Choice** (can disable indexers for max privacy)

### Benefits
- ✅ Fast when indexers available
- ✅ Still works when all indexers down
- ✅ Community can run indexers
- ✅ True censorship resistance
- ✅ User controls privacy level

---

## 🚀 Implementation Priority

### Phase 2A: Make Backend Optional (Week 2)
- [ ] Store manifests on IPFS
- [ ] DHT-based discovery fallback
- [ ] Client-side trending algorithm
- [ ] Indexer configuration UI

### Phase 2B: Community Indexers (Week 4)
- [ ] Document indexer API
- [ ] Docker image for indexer
- [ ] Indexer discovery protocol
- [ ] Multi-indexer support

---

## 💡 Key Insight

**The backend should be like an IPFS gateway:**
- Optional service for convenience
- Improves speed/UX
- Not required for core functionality
- Multiple providers possible
- Users can self-host

**Never store anything ONLY in the backend database that can't be reconstructed from IPFS.**

---

Ready to implement hybrid approach for Phase 2! 🚀
