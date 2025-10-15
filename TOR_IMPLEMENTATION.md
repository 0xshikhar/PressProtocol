# Tor Onion Routing Implementation in AnonPress

## Overview

AnonPress now has **real Tor onion routing** integrated using the `onionize` container. This provides genuine .onion addresses for WordPress, making content accessible via Tor Browser with full anonymity.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Tor Flow                            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. onionize container monitors Docker containers   │
│  2. Detects ONIONSERVICE_NAME env var               │
│  3. Automatically creates .onion hidden service     │
│  4. Stores address in /var/lib/tor/onion_services/  │
│  5. Backend reads hostname file                     │
│  6. Returns .onion URL to frontend/plugin           │
│  7. Users access via Tor Browser                    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## What Changed

### 1. Docker Compose (`backend/docker-compose.yml`)

**Location:** All Docker services are now in `backend/docker-compose.yml`

**Added:**
- `onionize` service - Tor hidden service manager
- `onion_services` volume - Shared storage for .onion addresses
- `ONIONSERVICE_NAME` env var on backend and WordPress
- Volume mount in backend for reading onion addresses

**Key Configuration:**
```yaml
services:
  onionize:
    container_name: anonpress-onionize
    image: torservers/onionize
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - onion_services:/var/lib/tor/onion_services:z
    networks:
      - anonpress
    restart: unless-stopped

  backend:
    environment:
      ONIONSERVICE_NAME: anonpress-backend  # Backend gets .onion address
    depends_on:
      - onionize
    volumes:
      - onion_services:/var/lib/tor/onion_services:ro

  wordpress:
    environment:
      ONIONSERVICE_NAME: anonpress-wordpress  # WordPress gets .onion address
    depends_on:
      - onionize
    profiles:
      - wordpress  # Optional, only for plugin testing
```

### 2. TorService (`backend/src/services/TorService.ts`)

**Replaced mock implementation with real Tor integration:**

```typescript
// Before: Mock Tor2Web gateway
async createOnionService(contentCid: string, gatewayUrl: string)

// After: Real onion service reading
async getOnionUrl(serviceName: string = 'anonpress-wordpress')
```

**New Methods:**
- `getOnionUrl()` - Reads actual .onion address from hostname file
- `checkOnionAvailability()` - Verifies onion service is ready
- `measureOnionLatency()` - Returns typical Tor latency (~450ms)

**How it works:**
1. Reads `/var/lib/tor/onion_services/anonpress-wordpress/hostname`
2. Returns actual v3 onion address (56 characters)
3. Fallback to Tor2Web if service not ready yet

### 3. API Route (`backend/src/routes/mirrors.ts`)

**New Endpoint:**
```typescript
GET /api/mirrors/onion-url

Response:
{
  "success": true,
  "onionUrl": "http://abc123...xyz.onion",
  "available": true,
  "message": "Access this URL using Tor Browser for anonymous access"
}
```

## How to Use

### For Publishers (WordPress Plugin)

1. **Start the backend stack:**
```bash
cd backend
docker-compose --profile wordpress up -d
```

2. **Wait for onion address generation** (~30-60 seconds):
```bash
# Check if onion address is ready
docker exec anonpress-onionize cat /var/lib/tor/onion_services/anonpress-wordpress/hostname
```

3. **Get your .onion URL:**
- Via API: `curl http://localhost:4000/api/mirrors/onion-url`
- Via WordPress plugin: Shows in publish meta box
- Via web app: Displays in dashboard

4. **Share your .onion URL:**
- Give to readers who want anonymous access
- Include in publication metadata
- Announce via Waku discovery network

### For Readers (Tor Browser)

1. **Download Tor Browser:**
   - Visit: https://www.torproject.org/download/
   - Install for your OS

2. **Access content:**
   - Open Tor Browser
   - Paste the .onion URL
   - Content loads anonymously
   - No tracking, no IP exposure

### For Developers (Integration)

**Frontend Integration:**
```typescript
// Fetch onion URL
const response = await fetch('http://localhost:4000/api/mirrors/onion-url');
const { onionUrl, available } = await response.json();

if (available) {
  console.log('Tor access:', onionUrl);
}
```

**WordPress Plugin Integration:**
```php
// Get onion URL for post
$response = wp_remote_get('http://backend:4000/api/mirrors/onion-url');
$data = json_decode(wp_remote_retrieve_body($response), true);

if ($data['success']) {
    $onion_url = $data['onionUrl'];
    // Display in meta box or save as post meta
}
```

## Technical Details

### Onionize Container

The `torservers/onionize` container:
- Monitors Docker socket for new containers
- Detects `ONIONSERVICE_NAME` environment variable
- Automatically configures Tor hidden service
- Creates v3 onion address (56 characters)
- Stores in `/var/lib/tor/onion_services/{service_name}/`
- Manages Tor daemon lifecycle

**File Structure:**
```
/var/lib/tor/onion_services/
└── anonpress-wordpress/
    ├── hostname          # The .onion address
    ├── hs_ed25519_public_key
    └── hs_ed25519_secret_key
```

### Security Features

1. **Persistent Onion Addresses:**
   - Keys stored in Docker volume
   - Same .onion address across restarts
   - Users can bookmark and trust the address

2. **Automatic Configuration:**
   - No manual Tor setup required
   - No torrc configuration
   - Just set ONIONSERVICE_NAME

3. **Isolation:**
   - Each service gets unique .onion address
   - Services are network-isolated
   - Tor handles all routing

## Testing

### 1. Verify Onion Service is Running

```bash
# Check onionize container
docker ps | grep onionize

# Check if hostname file exists
docker exec anonpress-onionize ls -la /var/lib/tor/onion_services/anonpress-wordpress/

# Read the .onion address
docker exec anonpress-onionize cat /var/lib/tor/onion_services/anonpress-wordpress/hostname
```

### 2. Test API Endpoint

```bash
# Get onion URL
curl http://localhost:4000/api/mirrors/onion-url

# Expected response:
{
  "success": true,
  "onionUrl": "http://abc123...xyz.onion",
  "available": true,
  "message": "Access this URL using Tor Browser for anonymous access"
}
```

### 3. Test in Tor Browser

1. Copy the .onion URL from API response
2. Open Tor Browser
3. Paste URL in address bar
4. Should see WordPress site

### 4. Test WordPress Access

```bash
# From host machine
curl http://localhost:8080

# Should return WordPress HTML
```

## Troubleshooting

### Onion URL Not Available

**Symptom:**
```json
{
  "success": false,
  "error": "Onion service not available yet"
}
```

**Solutions:**
1. **Wait 30-60 seconds** - Onion generation takes time
2. **Check onionize container:**
   ```bash
   docker logs anonpress-onionize
   ```
3. **Verify ONIONSERVICE_NAME:**
   ```bash
   docker inspect anonpress-wordpress | grep ONIONSERVICE_NAME
   ```
4. **Restart onionize:**
   ```bash
   docker-compose restart onionize
   ```

### Hostname File Not Found

**Symptom:**
```
⚠️  Onion hostname file not found: /var/lib/tor/onion_services/anonpress-wordpress/hostname
```

**Solutions:**
1. **Check volume mount:**
   ```bash
   docker exec anonpress-backend ls -la /var/lib/tor/onion_services/
   ```
2. **Verify onionize created the service:**
   ```bash
   docker exec anonpress-onionize ls /var/lib/tor/onion_services/
   ```
3. **Check Docker socket permission:**
   ```bash
   docker logs anonpress-onionize | grep -i error
   ```

### Tor Browser Can't Connect

**Symptom:**
- Tor Browser shows "Unable to connect"
- .onion URL times out

**Solutions:**
1. **Verify WordPress is running:**
   ```bash
   curl http://localhost:8080
   ```
2. **Check onionize logs:**
   ```bash
   docker logs anonpress-onionize -f
   ```
3. **Restart services:**
   ```bash
   docker-compose restart wordpress onionize
   ```

## Next Steps

### Phase 1: WordPress Plugin Integration ✅
- [x] Display .onion URL in publish meta box
- [x] Show "Access via Tor" button
- [x] Copy .onion URL to clipboard

### Phase 2: Content Publishing
- [ ] Include .onion URL in manifest
- [ ] Announce .onion via Waku discovery
- [ ] Store .onion in database (Mirror table)

### Phase 3: Browser Extension
- [ ] Detect .onion URLs in extension
- [ ] Prefer Tor mirror when available
- [ ] Show "Tor Active" indicator

### Phase 4: Advanced Features
- [ ] Multiple onion services (backend, IPFS, etc.)
- [ ] Onion service monitoring
- [ ] Latency testing via SOCKS proxy
- [ ] Automatic failover

## Resources

- **Tor Project:** https://www.torproject.org/
- **Onionize GitHub:** https://github.com/torservers/onionize
- **Tor Hidden Services:** https://community.torproject.org/onion-services/
- **Docker Tor:** https://hub.docker.com/r/torservers/onionize

## Summary

✅ **Real Tor integration is now live in AnonPress!**

- Uses proven `onionize` approach from FreePress-new
- Automatic .onion address generation
- Zero manual Tor configuration
- Ready for Tor Browser access
- Integrated with existing publishing flow

Access your WordPress via Tor Browser for true anonymous publishing! 🧅🔒
