# WordPress Plugin - Quick Start Guide

## 5-Minute Setup

### Step 1: Install Plugin
```bash
# Copy plugin to WordPress
cp -r wordpress-plugin /path/to/wordpress/wp-content/plugins/anonpress

# Or via WordPress Admin:
# Plugins → Add New → Upload Plugin → Choose ZIP file
```

### Step 2: Activate
1. Go to **WordPress Admin** → **Plugins**
2. Find **AnonPress**
3. Click **Activate**

### Step 3: Configure
1. Navigate to **AnonPress** → **Settings**
2. Enter **Backend API URL**: `http://localhost:4000`
3. Click **Test Connection** (should see ✅ success)
4. *Optional:* Enter Ethereum wallet address
5. Click **Save Changes**

### Step 4: Publish Your First Post
1. Go to **Posts** → **Add New**
2. Write your content
3. Find **AnonPress Publishing** box in sidebar
4. Click **🚀 Publish to AnonPress**
5. Wait ~30 seconds for processing
6. Copy your `anonpress://` link!

## Architecture Overview

```
WordPress Post → Plugin → Backend API → IPFS + Tor + Gateway
                                            ↓
                                    Decentralized Network
```

### What Happens When You Publish?

1. **Content Extraction**: Plugin grabs title, content, images, tags
2. **HTML Generation**: Creates standalone styled HTML page
3. **Backend Processing**: 
   - Uploads to IPFS (immutable storage)
   - Creates Tor onion service (anonymous access)
   - Announces to DHT (decentralized discovery)
4. **Result**: Get CID and multiple access URLs

## Integration with Backend

### Backend API Endpoints Used

| Endpoint | Purpose | Method |
|----------|---------|--------|
| `/api/content` | Publish content | POST |
| `/api/content/:cid` | Retrieve content | GET |
| `/api/mirrors/:cid/health` | Check mirrors | GET |
| `/api/identity` | Create identity | POST |

### Request Example

```php
// Publishing from WordPress
POST http://localhost:4000/api/content
{
    "title": "My Post Title",
    "content": "<html>...</html>",
    "tags": ["wordpress", "decentralized"],
    "walletAddress": "0x..." // optional
}
```

### Response Example

```json
{
    "success": true,
    "data": {
        "cid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        "shareUrl": "anonpress://bafybeigdyrzt...",
        "mirrors": {
            "ipfs": "https://gateway.pinata.cloud/ipfs/bafybeigdyrzt...",
            "tor": "http://xyz.onion/bafybeigdyrzt...",
            "gateway": "http://localhost:3000/read/bafybeigdyrzt..."
        },
        "publisher": {
            "publicKey": "ed25519_public_key_here",
            "isAnonymous": false
        }
    }
}
```

## Publishing Modes

### Anonymous Publishing (Default)
```
✓ No wallet required
✓ Maximum privacy
✓ Ephemeral identity
✓ No attribution
```

**How:**
- Leave wallet address empty in settings
- Each publish creates new identity
- Content is unlinked from publisher

### Authenticated Publishing
```
✓ Persistent identity
✓ Content attribution
✓ Build reputation
✓ Optional pseudonym
```

**How:**
- Enter Ethereum wallet in settings
- Same public key for all content
- Readers can verify authenticity

## Database Structure

### Publications Table
```sql
wp_anonpress_publications
- id: Auto-increment primary key
- post_id: Links to wp_posts
- cid: IPFS Content Identifier
- ipfs_url: Public IPFS gateway URL
- tor_url: Tor onion service URL
- gateway_url: Web gateway URL
- published_at: Timestamp
```

### Post Metadata
```
_anonpress_public_key: Publisher's public key
_anonpress_is_anonymous: 1 or 0
_anonpress_dht_announced: DHT status
_anonpress_manifest_cid: DHT manifest
```

## WordPress Hooks

### Available Actions

```php
// Before publishing
add_action('anonpress_before_publish', function($post_id) {
    // Your code here
});

// After publishing
add_action('anonpress_after_publish', function($post_id, $result) {
    error_log("Published: " . $result['cid']);
});
```

### Available Filters

```php
// Modify content
add_filter('anonpress_prepare_content', function($content, $post) {
    // Modify HTML before publishing
    return $content;
}, 10, 2);

// Control author display
add_filter('anonpress_show_author', function($show, $post) {
    return true; // or false
}, 10, 2);
```

## Content Format

### What Gets Published?

The plugin creates a **complete standalone HTML page**:

- ✅ Post title and content
- ✅ Featured image
- ✅ Categories and tags
- ✅ Publication date
- ✅ Modern CSS styling
- ✅ Responsive design
- ✅ Author name (optional)

### Example Output

```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Post Title</title>
    <style>/* Beautiful styling */</style>
</head>
<body>
    <article>
        <h1>Your Post Title</h1>
        <time>January 1, 2024</time>
        <img src="featured-image.jpg" />
        <div class="content">
            <!-- Your post content -->
        </div>
        <div class="taxonomy">
            Categories: Tech, Blockchain
            Tags: IPFS, Tor, Decentralization
        </div>
    </article>
    <footer>
        Published with AnonPress
    </footer>
</body>
</html>
```

## Accessing Published Content

### Multiple Ways to Read

1. **IPFS Gateway** (Public)
   ```
   https://gateway.pinata.cloud/ipfs/bafybeigdyrzt...
   ```

2. **Tor Onion** (Anonymous)
   ```
   http://xyz.onion/bafybeigdyrzt...
   ```

3. **Web Gateway** (Fast)
   ```
   https://yoursite.com/read/bafybeigdyrzt...
   ```

4. **Share Link** (Universal)
   ```
   anonpress://bafybeigdyrzt...
   ```

### Browser Extension

For best experience, readers should install AnonPress browser extension:
- Auto-selects fastest mirror
- Verifies content integrity
- Works seamlessly with share links

## Troubleshooting

### Common Issues

#### 1. "Backend API not connected"
```bash
# Check backend is running
curl http://localhost:4000/health

# Should return: {"status":"ok"}
```

**Fix:**
- Start backend: `cd backend && npm run dev`
- Verify URL in WordPress settings
- Check firewall/network

#### 2. "Failed to publish content"
```bash
# Check backend logs
cd backend
tail -f logs/app.log
```

**Common Causes:**
- Missing Pinata API keys
- IPFS upload timeout
- Network issues

**Fix:**
```env
# backend/.env
PINATA_API_KEY=your_key
PINATA_SECRET_KEY=your_secret
```

#### 3. "Invalid wallet address"

**Must be:**
- Starts with `0x`
- 42 characters total
- Valid hex (0-9, a-f)

**Example:** `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

#### 4. Publishing timeout

**Fix in WordPress:**
```php
// wp-config.php
define('WP_HTTP_TIMEOUT', 120);
```

**Fix in Plugin:**
```php
// class-anonpress-api-client.php
private $timeout_publish = 120; // Increase from 60
```

## Security Best Practices

### For Production

1. **Use HTTPS**
   ```
   Backend API: https://api.yourdomain.com
   WordPress: https://yourdomain.com
   ```

2. **Encrypt Private Keys**
   ```php
   // Don't store plaintext private keys
   $encrypted = openssl_encrypt($key, 'AES-256-CBC', WP_SALT, 0, WP_AUTH_KEY);
   ```

3. **Anonymous Mode**
   - Don't save private keys at all
   - Generate fresh per publish
   - Maximum privacy

4. **Regular Backups**
   - Database (publications table)
   - WordPress options
   - Content files

## Performance Tips

### For Large Sites

1. **Enable Caching**
   ```php
   // wp-config.php
   define('WP_CACHE', true);
   ```

2. **Async Publishing**
   ```php
   // Publish in background
   wp_schedule_single_event(time(), 'anonpress_publish', [$post_id]);
   ```

3. **Optimize Images**
   - Compress before publishing
   - Use appropriate sizes
   - Consider lazy loading

## Advanced Usage

### Bulk Publish Posts

```php
// Publish all posts
$posts = get_posts(['numberposts' => -1]);
$publisher = new AnonPress_Publisher();

foreach ($posts as $post) {
    $result = $publisher->publish_post($post);
    echo "Published: {$result['cid']}\n";
    sleep(2); // Rate limiting
}
```

### Custom Post Types

```php
// Enable for custom post type
add_action('add_meta_boxes', function() {
    add_meta_box(
        'anonpress_publish',
        'AnonPress Publishing',
        [AnonPress::get_instance(), 'render_meta_box'],
        'my_custom_type',
        'side'
    );
});
```

### Check Mirror Status Programmatically

```php
$api_client = new AnonPress_API_Client();
$health = $api_client->check_mirror_health($cid);

foreach ($health as $mirror) {
    echo "{$mirror['type']}: ";
    echo $mirror['available'] ? 'Available' : 'Down';
    echo "\n";
}
```

## Monitoring

### Track Publications

```php
function get_publication_stats() {
    global $wpdb;
    $table = $wpdb->prefix . 'anonpress_publications';
    
    return [
        'total' => $wpdb->get_var("SELECT COUNT(*) FROM $table"),
        'today' => $wpdb->get_var(
            "SELECT COUNT(*) FROM $table 
             WHERE DATE(published_at) = CURDATE()"
        )
    ];
}
```

### Schedule Health Checks

```php
// Daily mirror health check
add_action('init', function() {
    if (!wp_next_scheduled('anonpress_health_check')) {
        wp_schedule_event(time(), 'daily', 'anonpress_health_check');
    }
});

add_action('anonpress_health_check', function() {
    // Check all publications
    // Alert if mirrors down
});
```

## Next Steps

### After Setup

1. ✅ Publish test post
2. ✅ Verify all mirrors work
3. ✅ Share link on social media
4. ✅ Install browser extension (optional)
5. ✅ Configure custom styling (optional)
6. ✅ Set up monitoring (recommended)

### Learn More

- **Full Documentation**: `INTEGRATION.md`
- **Architecture Details**: `ARCHITECTURE.md`
- **Plugin Code**: `/includes/`
- **Backend API**: `/backend/src/routes/`

## Support

- **GitHub Issues**: Report bugs and feature requests
- **Discord**: Join community discussions
- **Email**: support@anonpress.io
- **Docs**: https://docs.anonpress.io

## Quick Reference

### Plugin Files
```
wordpress-plugin/
├── anonpress.php                 # Main plugin
├── includes/
│   ├── class-anonpress-api-client.php
│   ├── class-anonpress-publisher.php
│   ├── class-anonpress-settings.php
│   └── class-anonpress-identity.php
├── templates/
│   ├── meta-box.php             # Post editor UI
│   ├── dashboard.php            # Admin dashboard
│   └── settings.php             # Settings page
└── assets/
    ├── admin.css
    └── admin.js
```

### Key Functions

```php
// Publish post
$publisher = new AnonPress_Publisher();
$result = $publisher->publish_post($post);

// Get publication
$pub = $publisher->get_publication($post_id);

// Test connection
$client = new AnonPress_API_Client();
$status = $client->test_connection();

// Check mirror health
$health = $client->check_mirror_health($cid);
```

### Environment Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Configure Pinata keys
npm run dev

# WordPress
# Install WordPress
# Copy plugin
# Activate
# Configure settings
```

---

**Ready to publish censorship-resistant content? Let's go! 🚀**
