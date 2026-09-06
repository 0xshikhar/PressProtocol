# PressProtocol Browser Extension

**Lightweight, dependency-free Chromium MV3 extension** — Pure TypeScript Manifest V3 client for decentralized reader failover and protocol link navigation.

## Features

- ✅ Protocol handler for `pressprotocol://` (and legacy `anonpress://`) links
- ✅ Multi-gateway mirror health checking & failover
- ✅ Extension popup with gateway status telemetry
- ✅ Context menu integration for instant decentralized resolution
- ✅ Zero native dependencies

## Quick Start

```bash
# Build the extension
pnpm --filter pressprotocol-extension build

# Load in Chrome / Brave / Edge
# 1. Open chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the 'integrations/browser-extension/dist' folder
```

## Development

```bash
# Watch for changes
pnpm --filter pressprotocol-extension dev
```

## Production Configuration

Configured in `src/background.ts`:

```typescript
const API_URL = "https://api.pressprotocol.com";
const WEB_APP_URL = "https://pressprotocol.com";
```
