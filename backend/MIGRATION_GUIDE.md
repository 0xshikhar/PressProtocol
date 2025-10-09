# Database Migration Guide: Decentralization Refactor

## Overview

We've refactored the database schema to align with true decentralization principles:

### Key Changes

1. **✅ Removed full content storage** - Content lives on IPFS only
2. **✅ Made user relationships optional** - Anonymous publishing by default
3. **✅ Added publisher public key** - Direct Ed25519 identity
4. **✅ Removed Identity relation from Content** - Simplified anonymous model
5. **✅ Added IPNS support** - Persistent publisher identity

## Schema Changes

### Before (Centralized)
```prisma
model Content {
  content   String @db.Text  // ❌ Redundant - already on IPFS
  userId    String           // ❌ Required - breaks anonymity
  identityId String          // ❌ Complex relation
}
```

### After (Decentralized)
```prisma
model Content {
  // NO content field - fetch from IPFS ✅
  publisherPubKey String     // ✅ Direct public key
  userId          String?    // ✅ Optional - anonymous by default
}
```

## Migration Steps

### 1. Backup Current Database (IMPORTANT!)

```bash
# Export current data
npx prisma db push --skip-generate
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### 2. Update Schema

The schema has already been updated in `prisma/schema.prisma`.

### 3. Create Migration

```bash
cd backend

# Generate new Prisma client
npx prisma generate

# Create migration (will prompt for migration name)
npx prisma migrate dev --name decentralization_refactor

# This will:
# - Drop the `content` column from Content table
# - Add `publisherPubKey` column
# - Make `userId` nullable
# - Remove `identityId` column
# - Update relations
```

### 4. Data Migration Script

Since we're removing the `content` column, existing data needs to be migrated:

```bash
# Run this BEFORE the migration
node scripts/migrate-content-to-ipfs.js
```

This script will:
1. Fetch all existing Content records
2. For each record with `content` field:
   - Upload content to IPFS (if not already there)
   - Store CID in database
3. Extract `publisherPubKey` from Identity relation
4. Set `userId` from existing data

### 5. Update Code

```bash
# Regenerate Prisma client with new schema
npx prisma generate

# Restart backend
npm run dev
```

## Breaking Changes

### API Changes

#### Before
```typescript
POST /api/content
{
  "content": "<html>...</html>",  // Full HTML sent
  "walletAddress": "0x..."
}
```

#### After  
```typescript
POST /api/content
{
  // Content uploaded to IPFS automatically
  "walletAddress": "0x..." // Optional for anonymous
}
```

#### Content Retrieval - Before
```typescript
GET /api/content/:cid
Response: {
  content: "<html>...</html>",  // From database
  ...
}
```

#### Content Retrieval - After
```typescript
GET /api/content/:cid
Response: {
  cid: "Qm...",
  // Fetch full content from IPFS:
  // GET https://gateway.pinata.cloud/ipfs/{cid}
  ...
}
```

## Testing Migration

### 1. Test Content Upload

```bash
curl -X POST http://localhost:4000/api/content \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "content": "<p>Test content</p>",
    "tags": ["test"],
    "walletAddress": "0x123..."
  }'
```

Response should include:
- `cid`: IPFS hash
- `shareUrl`: `anonpress://Qm...`
- Content stored on IPFS ✅
- Only metadata in database ✅

### 2. Test Content Retrieval

```bash
# Get metadata from database
curl http://localhost:4000/api/content/Qm...

# Get full content from IPFS
curl https://gateway.pinata.cloud/ipfs/Qm...
```

### 3. Test Anonymous Publishing

```bash
curl -X POST http://localhost:4000/api/content \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Anonymous Post",
    "content": "<p>No wallet needed</p>",
    "tags": ["anonymous"]
  }'
```

Should work without `walletAddress` ✅

## Rollback Plan

If migration fails:

```bash
# 1. Restore database
psql $DATABASE_URL < backup_YYYYMMDD.sql

# 2. Revert schema
git checkout HEAD~1 prisma/schema.prisma

# 3. Regenerate client
npx prisma generate

# 4. Restart backend
npm run dev
```

## Architecture Benefits

### Before Migration
- ❌ Database = source of truth
- ❌ Content duplicated (IPFS + DB)
- ❌ Required user accounts
- ❌ Can be censored (delete DB = lose content)

### After Migration
- ✅ IPFS = source of truth
- ✅ Database = cache layer only
- ✅ Anonymous by default
- ✅ Censorship-resistant (content survives DB loss)

## Next Steps

After migration:

1. **Initialize DHT Service**
   ```bash
   # DHT now announces content automatically
   # via Pinata's built-in support
   ```

2. **Test Resilience**
   ```bash
   # Stop database
   docker stop postgres
   
   # Content still accessible via IPFS
   curl https://gateway.pinata.cloud/ipfs/Qm...
   # ✅ Still works!
   ```

3. **Update Frontend**
   - Fetch content from IPFS
   - Add fallback to database cache
   - Show "DB unavailable" warning

## Documentation Updates

Update these files:
- `README.md` - Reflect new architecture
- `API.md` - Update endpoint docs
- `ARCHITECTURE.md` - Add diagram showing IPFS as source of truth

## Questions?

See `documents/ProblemStatement.md` for hackathon requirements alignment.

---

**Remember**: This migration makes AnonPress truly decentralized and censorship-resistant! 🚀
