# Backend Configuration - Quick Reference

## How It Works Now

The web app **automatically** chooses the right backend URL based on your environment:

### 🚀 Production Mode
When deployed or `NODE_ENV=production`:
```
Backend: https://anonpress-production.up.railway.app
```

### 💻 Development Mode  
When running locally or `NODE_ENV=development`:
```
Backend: http://localhost:4000
```

### ⚙️ Custom Override
Set environment variable to use a different backend:
```env
NEXT_PUBLIC_BACKEND_API_URL=https://your-custom-backend.com
```

---

## Quick Start

### Local Development
```bash
# Just run - no config needed!
npm run dev
# ✅ Automatically uses http://localhost:4000
```

### Production Build
```bash
# Just build - no config needed!
npm run build
npm start
# ✅ Automatically uses https://anonpress-production.up.railway.app
```

### Custom Backend (Optional)
```bash
# Create .env.local file
echo "NEXT_PUBLIC_BACKEND_API_URL=https://my-backend.com" > .env.local
npm run dev
```

---

## Configuration File

All backend configuration is centralized in:
```
src/config/backend.ts
```

This file exports:
- `BACKEND_URL` - The current backend URL
- `getBackendUrl()` - Function to get the URL
- `isDevelopment` - Boolean for dev mode
- `isProduction` - Boolean for prod mode

---

## Usage in Code

```typescript
// Import the backend URL
import { BACKEND_URL } from "@/config/backend";

// Use it
const response = await fetch(`${BACKEND_URL}/api/content`);
```

---

## No Configuration Needed! 🎉

The system intelligently selects the right backend URL based on your environment. Just develop locally and deploy - it works automatically!
