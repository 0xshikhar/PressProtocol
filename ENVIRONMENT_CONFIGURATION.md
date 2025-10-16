# Environment Configuration Guide

## Overview

Both the **Web App** and **WordPress Plugin** now support automatic environment detection with proper defaults for production and development.

---

## Web App Configuration

### Default Behavior

The web app automatically detects the environment and uses the appropriate backend URL:

| Environment | Backend URL | When Used |
|------------|-------------|-----------|
| **Production** | `https://anonpress-production.up.railway.app` | `NODE_ENV=production` or deployed |
| **Development** | `http://localhost:4000` | `NODE_ENV=development` or local |
| **Custom** | Set via env variable | When `NEXT_PUBLIC_BACKEND_API_URL` is set |

### Setup

1. **Local Development** (default):
   ```bash
   # No configuration needed!
   npm run dev
   # Automatically uses: http://localhost:4000
   ```

2. **Production Deployment**:
   ```bash
   # No configuration needed!
   npm run build
   npm start
   # Automatically uses: https://anonpress-production.up.railway.app
   ```

3. **Custom Backend** (optional):
   ```env
   # .env.local or .env
   NEXT_PUBLIC_BACKEND_API_URL=https://your-custom-backend.com
   ```

### Files Updated

- ✅ **`src/config/backend.ts`** - New centralized configuration
- ✅ **`src/lib/api-client.ts`** - Uses new config
- ✅ **`src/lib/discovery.ts`** - Uses new config
- ✅ **`src/app/api/content/route.ts`** - Auto-detects environment
- ✅ **`src/app/api/identity/route.ts`** - Auto-detects environment
- ✅ **`src/app/api/content/[cid]/route.ts`** - Auto-detects environment
- ✅ **`src/app/api/upload/image/route.ts`** - Auto-detects environment
- ✅ **`.env.example`** - Updated with instructions

### How It Works

```typescript
// src/config/backend.ts
export function getBackendUrl(): string {
  // 1. Check environment variable (highest priority)
  if (process.env.NEXT_PUBLIC_BACKEND_API_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_API_URL;
  }

  // 2. Production: use Railway deployment
  if (process.env.NODE_ENV === "production") {
    return "https://anonpress-production.up.railway.app";
  }

  // 3. Development: use localhost
  return "http://localhost:4000";
}
```

---

## WordPress Plugin Configuration

### Default Behavior

The plugin uses the production backend by default:

- **Default URL**: `https://anonpress-production.up.railway.app`
- **Local Development**: Change in plugin settings to `http://localhost:4000`

### Setup

1. **Production/Normal Use** (default):
   - Install plugin
   - Backend URL is pre-configured
   - No changes needed!

2. **Local Development**:
   - Go to **PressProtocol > Settings**
   - Change Backend API URL to: `http://localhost:4000`
   - Click **Save Settings**

### Files Updated

- ✅ **`includes/class-anonpress-api-client.php`** - Default: production URL
- ✅ **`includes/class-anonpress-settings.php`** - Default: production URL
- ✅ **`templates/settings.php`** - Default: production URL

---

## Production URL

```
https://anonpress-production.up.railway.app
```

**Used for:**
- Production web app deployment
- WordPress plugin (default)
- All published content URLs: `https://pressprotocol.com/read/{CID}`

---

## Development URL

```
http://localhost:4000
```

**Used for:**
- Local development
- Testing new features
- Running backend on your machine

---

## Testing the Configuration

### Web App

```bash
# Test Development Mode
npm run dev
# Should connect to: http://localhost:4000

# Test Production Build
npm run build
npm start
# Should connect to: https://anonpress-production.up.railway.app

# Check Console
# Look for: "Backend URL:" in browser console or server logs
```

### WordPress Plugin

1. Install plugin
2. Go to **PressProtocol > Settings**
3. Click **Test Connection** button
4. Should show: "✅ Successfully connected to PressProtocol backend"

---

## Environment Variables Reference

### Web App (.env.local or .env)

```env
# Frontend URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend URL (optional - auto-detected if not set)
# Production: https://anonpress-production.up.railway.app
# Development: http://localhost:4000
NEXT_PUBLIC_BACKEND_API_URL=
```

### Deployment Platforms

**Vercel / Netlify / Railway:**
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_BACKEND_API_URL= (leave empty for auto-detect)
```

---

## Troubleshooting

### Web App Shows "Connection Error"

1. **Check Backend URL:**
   ```bash
   # In browser console
   console.log(process.env.NEXT_PUBLIC_BACKEND_API_URL)
   ```

2. **Verify Environment:**
   ```bash
   # Check if production or development
   console.log(process.env.NODE_ENV)
   ```

3. **Test Backend Directly:**
   ```bash
   curl https://anonpress-production.up.railway.app/health
   ```

### WordPress Plugin Cannot Connect

1. Go to **PressProtocol > Settings**
2. Check Backend API URL field
3. Click **Test Connection**
4. If fails:
   - Verify URL is correct
   - Check server can access the URL (firewall/network)
   - Try adding the URL to allowed hosts

---

## Summary

✅ **Web App:**
- Auto-detects environment
- Production: uses Railway backend
- Development: uses localhost
- Can override with environment variable

✅ **WordPress Plugin:**
- Default: production backend
- Can change in settings for local dev
- Always uses configured URL

✅ **Share Links:**
- Format: `https://pressprotocol.com/read/{CID}`
- Works in all environments

---

**Last Updated:** October 17, 2025
**Status:** ✅ Production Ready
