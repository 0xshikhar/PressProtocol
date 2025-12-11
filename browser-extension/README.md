# AnonPress Browser Extension V2

**Simple, dependency-free browser extension** - No Plasmo, no native modules, just pure TypeScript.

## Features

- ✅ Protocol handler for `anonpress://` links
- ✅ Mirror health checking
- ✅ Extension popup with status
- ✅ Context menu integration
- ✅ Zero native dependencies (no build issues!)

## Quick Start

```bash
# Install minimal dependencies
npm install

# Build the extension
npm run build

# Load in Chrome
# 1. Open chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the 'dist' folder
```

## Development

```bash
# Watch for changes
npm run watch

# Clean build
npm run clean && npm run build
```

## Differences from V1

- ❌ No Plasmo (no native module issues)
- ✅ Simple TypeScript compilation
- ✅ Direct manifest.json
- ✅ Works on all systems without build errors
- ✅ Faster, lighter, more reliable

## Production URLs

Update these in `src/background.ts` before deploying:

```typescript
const API_URL = "https://api.anonpress.io";
const WEB_APP_URL = "https://anonpress.io";
```

And update in `popup.html` links.

## Why V2?

The original Plasmo-based extension had issues with `@parcel/watcher` native modules failing to build on some systems. This version uses vanilla TypeScript with zero native dependencies - **it just works**.
