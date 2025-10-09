# Architecture Correction - Web App is Frontend Only

## Summary of Changes

The web app has been corrected to be a **pure frontend application** with no database or backend services. All database operations, IPFS uploads, and Tor services are handled by the separate `anonpress-backend` repository.

## What Was Changed

### ✅ Removed
1. **Prisma/PostgreSQL integration**
   - Removed `prisma` dependency from package.json
   - Removed `@prisma/extension-accelerate` dependency
   - Removed Prisma-related environment variables
   - Removed `build:prisma` script
   - Converted all Prisma imports to proxy calls

2. **Database environment variables**
   - Removed `DATABASE_URL`
   - Removed `JWT_SECRET`
   - Removed `PINATA_API_KEY`
   - Removed `PINATA_SECRET_KEY`

### ✅ Converted to Proxy Routes

All API routes now act as **proxies** to the backend API:

**Before (incorrect - had Prisma/DB)**:
```typescript
// src/app/api/content/route.ts
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await prisma.user.create(...);
  const content = await prisma.content.create(...);
  // ... database operations
}
```

**After (correct - proxy only)**:
```typescript
// src/app/api/content/route.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export async function POST(req: NextRequest) {
  const response = await fetch(`${BACKEND_URL}/api/content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await req.json()),
  });
  return NextResponse.json(await response.json());
}
```

### ✅ Updated Files

1. **src/app/api/content/route.ts** - Now proxies to backend
2. **src/app/api/content/[cid]/route.ts** - Now proxies to backend
3. **src/app/api/identity/route.ts** - Now proxies to backend
4. **src/env.mjs** - Removed server-side variables
5. **.env.example** - Simplified to frontend-only variables
6. **package.json** - Removed Prisma dependencies, updated scripts
7. **README.md** - Updated architecture documentation

### ✅ Kept (Frontend Features)

- ✅ Rich text editor (Tiptap)
- ✅ Privy authentication
- ✅ Discovery feed UI
- ✅ Publishing interface
- ✅ Reader view
- ✅ Dashboard
- ✅ All UI components
- ✅ API client library
- ✅ shadcn/ui components

## Current Architecture

```
┌─────────────────────────────────────────┐
│        AnonPress Web App                │
│        (Frontend Only)                  │
│                                         │
│  - Next.js 14 (App Router)             │
│  - React Components                     │
│  - Privy Auth                          │
│  - Tiptap Editor                       │
│  - UI Components                       │
│  - API Proxy Routes                    │
│                                         │
│  NO DATABASE ❌                         │
│  NO IPFS CLIENT ❌                      │
│  NO TOR ❌                              │
└─────────────────────────────────────────┘
              ↓ HTTP Requests
              ↓
┌─────────────────────────────────────────┐
│      AnonPress Backend API              │
│      (Separate Repository)              │
│                                         │
│  - Fastify Server                      │
│  - Prisma + PostgreSQL                 │
│  - IPFS via Pinata                     │
│  - Tor Service Management              │
│  - Ed25519 Identity                    │
│  - IPFS DHT Integration                │
└─────────────────────────────────────────┘
```

## Environment Variables (Corrected)

### Web App (.env)
```env
# Frontend only - no database
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:4000
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

### Backend (.env) - In anonpress-backend repo
```env
# Backend has the database
DATABASE_URL=postgresql://user:password@localhost:5432/anonpress
JWT_SECRET=your_jwt_secret
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PORT=4000
```

## API Flow

### Publishing Flow
```
User (Browser)
  ↓
Web App (localhost:3000)
  ↓ Rich text editor, collect data
  ↓
/api/content (Proxy Route)
  ↓ Forward request
  ↓
Backend API (localhost:4000)
  ↓ Save to PostgreSQL
  ↓ Upload to IPFS
  ↓ Create Tor onion
  ↓ Return CID + mirrors
  ↓
/api/content (Proxy Route)
  ↓ Forward response
  ↓
Web App
  ↓ Display success
  ↓
User sees share link
```

## Benefits of This Architecture

1. **Clear Separation of Concerns**
   - Frontend: UI and user experience
   - Backend: Data, IPFS, Tor, database

2. **Independent Deployment**
   - Web app → Vercel (static/frontend)
   - Backend → Railway/Render (API server)

3. **Scalability**
   - Frontend can be CDN-cached
   - Backend scales independently

4. **Security**
   - No database credentials in frontend
   - API keys only in backend
   - Clean API boundary

5. **Development**
   - Frontend developers don't need PostgreSQL
   - Backend developers don't need to run Next.js
   - Easier to test in isolation

## Next Steps

1. **Install dependencies** (no Prisma needed):
   ```bash
   bun install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Add NEXT_PUBLIC_BACKEND_API_URL and NEXT_PUBLIC_PRIVY_APP_ID
   ```

3. **Start development** (backend must be running first):
   ```bash
   bun dev
   ```

4. **Deploy**:
   - Frontend: `vercel deploy`
   - Backend: See anonpress-backend repo

## File Changes Summary

### Modified Files
- `src/app/api/content/route.ts` - Converted to proxy
- `src/app/api/content/[cid]/route.ts` - Converted to proxy
- `src/app/api/identity/route.ts` - Converted to proxy
- `src/env.mjs` - Removed server variables
- `.env.example` - Simplified
- `package.json` - Removed Prisma, updated scripts
- `README.md` - Updated architecture docs

### Files to Delete (if they exist)
- `prisma/` directory
- `src/lib/prisma.ts` (if it exists)
- Any migration files

### No Changes Needed
- All pages (`src/app/page.tsx`, `src/app/publish/page.tsx`, etc.)
- All components (`src/components/**`)
- API client library (`src/lib/api-client.ts`)
- UI components
- Styling files

## Verification Checklist

- [ ] No `prisma` imports in any file
- [ ] No database connections in web app
- [ ] All API routes are simple proxies
- [ ] Environment variables are frontend-only
- [ ] `package.json` has no Prisma dependencies
- [ ] README clearly states "frontend only"
- [ ] Backend API URL is configurable

## Common Mistakes to Avoid

❌ **Don't** add database operations to web app
❌ **Don't** import Prisma client in web app
❌ **Don't** add IPFS client to web app
❌ **Don't** manage Tor in web app

✅ **Do** keep web app as pure frontend
✅ **Do** use API client to call backend
✅ **Do** proxy all backend requests
✅ **Do** handle UI/UX in web app

---

**Status**: Architecture corrected to match ProjectIdea_final.md specifications.

**Web App**: Frontend only ✅  
**Backend**: Separate repository (to be implemented) ⏳
