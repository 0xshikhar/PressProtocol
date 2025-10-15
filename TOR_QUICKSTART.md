# Tor Onion Routing - Quick Start Guide

## 🎯 What You Get

Real Tor `.onion` addresses for your WordPress site, making it accessible via Tor Browser with full anonymity.

## 🚀 Quick Start (5 Minutes)

### 1. Start Services

```bash
cd anonpress
docker-compose up -d
```

### 2. Wait for Onion Address (~30 seconds)

```bash
# Watch the logs
docker logs -f anonpress-onionize

# Check when ready (press Ctrl+C to exit)
```

### 3. Get Your .onion URL

```bash
# Option A: Via Docker
docker exec anonpress-onionize cat /var/lib/tor/onion_services/anonpress-wordpress/hostname

# Option B: Via API
curl http://localhost:4000/api/mirrors/onion-url | jq
```

**Example Output:**
```json
{
  "success": true,
  "onionUrl": "http://abc123def456ghi789jkl012mno345pqr678stu901vwx234yz.onion",
  "available": true,
  "message": "Access this URL using Tor Browser for anonymous access"
}
```

### 4. Test in Tor Browser

1. **Download Tor Browser:** https://www.torproject.org/download/
2. **Open Tor Browser**
3. **Paste your .onion URL**
4. **See your WordPress site!**

## ✅ Verify It's Working

### Check 1: Onionize Container Running

```bash
docker ps | grep onionize
# Should see: anonpress-onionize (running)
```

### Check 2: Hostname File Exists

```bash
docker exec anonpress-onionize ls -la /var/lib/tor/onion_services/anonpress-wordpress/
# Should see: hostname, hs_ed25519_public_key, hs_ed25519_secret_key
```

### Check 3: API Returns URL

```bash
curl http://localhost:4000/api/mirrors/onion-url
# Should return: success: true, onionUrl: "http://...onion"
```

### Check 4: WordPress Accessible

```bash
curl http://localhost:8080
# Should return: WordPress HTML
```

## 📝 Integration Examples

### WordPress Plugin

```php
<?php
// Get onion URL
$response = wp_remote_get('http://backend:4000/api/mirrors/onion-url');
$data = json_decode(wp_remote_retrieve_body($response), true);

if ($data['success']) {
    $onion_url = $data['onionUrl'];
    echo '<p>Tor Access: <a href="' . esc_url($onion_url) . '">' . esc_html($onion_url) . '</a></p>';
}
?>
```

### React Frontend

```typescript
// Fetch onion URL
const { data } = await axios.get('http://localhost:4000/api/mirrors/onion-url');

if (data.success) {
  setOnionUrl(data.onionUrl);
  console.log('🧅 Tor access:', data.onionUrl);
}
```

### Publishing Metadata

```typescript
// Include in content manifest
const manifest = {
  cid: 'Qm...',
  title: 'My Publication',
  mirrors: {
    ipfs: 'https://ipfs.io/ipfs/Qm...',
    tor: onionUrl, // Real .onion address
    gateway: 'https://gateway.pinata.cloud/ipfs/Qm...'
  }
};
```

## 🔧 Troubleshooting

### ❌ "Onion service not available yet"

**Wait 30-60 seconds**, then retry. Onion generation takes time on first startup.

### ❌ "Hostname file not found"

**Check onionize logs:**
```bash
docker logs anonpress-onionize
```

**Restart onionize:**
```bash
docker-compose restart onionize
```

### ❌ Tor Browser can't connect

**Verify WordPress is running:**
```bash
curl http://localhost:8080
# Should return HTML
```

**Check Docker network:**
```bash
docker network inspect anonpress_anonpress
# WordPress and onionize should be on same network
```

## 🎓 How It Works

1. **onionize** monitors Docker containers via socket
2. Detects `ONIONSERVICE_NAME` environment variable on WordPress
3. Automatically creates Tor hidden service
4. Generates v3 `.onion` address (56 characters)
5. Stores in shared volume: `/var/lib/tor/onion_services/`
6. Backend reads hostname file and returns to API
7. Frontend/plugin displays to users

## 📊 Comparison to Mock Implementation

| Feature | Before (Mock) | After (Real) |
|---------|---------------|--------------|
| **Tor Integration** | ❌ Fake Tor2Web URLs | ✅ Real .onion addresses |
| **Accessibility** | ⚠️ Via IPFS gateway only | ✅ Via Tor Browser |
| **Anonymity** | ❌ No Tor routing | ✅ Full Tor anonymity |
| **Setup Complexity** | None | Minimal (docker-compose) |
| **Persistence** | N/A | ✅ Same .onion across restarts |

## 🔐 Security Benefits

1. **True Anonymity** - Readers access via Tor network
2. **No IP Exposure** - Publisher IP hidden from readers
3. **Censorship Resistance** - Can't be blocked by IP/DNS
4. **End-to-End Encryption** - Tor provides encryption layer
5. **Location Privacy** - Server location remains private

## 📚 Next Steps

- ✅ Test .onion URL in Tor Browser
- ✅ Integrate into WordPress plugin publish flow
- ✅ Display .onion in web app dashboard
- ✅ Include .onion in content manifests
- ✅ Announce .onion via Waku discovery

## 🆘 Need Help?

1. **Check logs:** `docker-compose logs -f`
2. **Read full guide:** `TOR_IMPLEMENTATION.md`
3. **Verify setup:** Run all checks above
4. **Restart services:** `docker-compose restart`

---

**You now have real Tor onion routing! 🧅🎉**

Share your `.onion` URL with readers who want anonymous access.
