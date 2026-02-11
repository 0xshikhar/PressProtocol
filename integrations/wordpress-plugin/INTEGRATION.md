# WordPress Plugin Integration Guide

## Overview

The AnonPress WordPress plugin enables seamless integration between WordPress sites and the AnonPress decentralized publishing network. Content published through WordPress is automatically distributed across IPFS, Tor, and web gateways for censorship-resistant access.

## Architecture Integration

### System Flow

```
WordPress Post → Plugin → Backend API → Storage Services → Decentralized Networks
                                       ↓
                                   Database Cache
                                       ↓
                              Mirror Management
```

### Components Interaction

1. **WordPress Plugin** (PHP)
   - Handles WordPress UI integration
   - Extracts and formats content
   - Communicates with backend API
   - Stores publication metadata locally

2. **Backend API** (Node.js/TypeScript)
   - Receives content from plugin
   - Manages identity and signing
   - Uploads to IPFS via Pinata
   - Creates Tor onion services
   - Announces to DHT for discovery

3. **Storage Layer**
   - IPFS: Immutable content storage
   - Tor: Anonymous access layer
   - Database: Metadata cache only

## Installation & Setup

### Prerequisites

- WordPress 6.0+
- PHP 8.0+
- AnonPress backend running (default: http://localhost:4000)
- (Optional) Ethereum wallet for authenticated publishing

### Installation Steps

1. **Copy Plugin Files**
```bash
cp -r wordpress-plugin /path/to/wordpress/wp-content/plugins/anonpress
```

2. **Activate Plugin**
   - Go to WordPress Admin → Plugins
   - Find "AnonPress"
   - Click "Activate"

3. **Configure Settings**
   - Navigate to **AnonPress → Settings**
   - Enter Backend API URL (e.g., `http://localhost:4000`)
   - (Optional) Enter Ethereum wallet address
   - Click "Test Connection" to verify

## Configuration

### Backend API URL

The plugin connects to your AnonPress backend API. Default is `http://localhost:4000`.

For production:
```
https://api.yourdomain.com
```

### Identity Options

#### Anonymous Publishing (Default)
- Leave wallet address empty
- Backend generates ephemeral keypair per publish
- No persistent identity
- Maximum privacy

#### Authenticated Publishing
- Enter Ethereum wallet address (0x...)
- Backend creates persistent identity
- Public key stored in WordPress settings
- Content attributed to wallet

### Database Tables

The plugin creates `wp_anonpress_publications` table:

```sql
CREATE TABLE wp_anonpress_publications (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    post_id bigint(20) NOT NULL,
    cid varchar(100) NOT NULL,
    ipfs_url varchar(255) NOT NULL,
    tor_url varchar(255) NOT NULL,
    gateway_url varchar(255) NOT NULL,
    published_at datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY post_id (post_id)
);
```

## Publishing Workflow

### From WordPress Editor

1. **Create or Edit Post**
   - Write content in WordPress editor
   - Add categories, tags, featured images
   - Save as draft or publish

2. **Publish to AnonPress**
   - Look for "AnonPress Publishing" meta box in sidebar
   - Click "🚀 Publish to AnonPress" button
   - Wait for processing (IPFS upload, Tor service, DHT announcement)

3. **Get Share Links**
   - Copy `anonpress://CID` link
   - View on IPFS, Tor, or gateway
   - Share anywhere for censorship-resistant access

### Content Processing

The plugin automatically:
- Extracts post title, content, excerpt
- Includes featured images
- Adds categories and tags
- Creates standalone HTML page with styling
- Signs content with Ed25519 keypair
- Stores metadata locally

## API Integration Details

### Endpoints Used

#### Publish Content
```http
POST /api/content
Content-Type: application/json

{
  "title": "Post Title",
  "content": "<html>...</html>",
  "tags": ["tag1", "tag2"],
  "walletAddress": "0x..." // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cid": "bafybeigdyrzt...",
    "shareUrl": "anonpress://bafybeigdyrzt...",
    "mirrors": {
      "ipfs": "https://gateway.pinata.cloud/ipfs/...",
      "tor": "http://xyz.onion/...",
      "gateway": "https://yourdomain.com/read/..."
    },
    "publisher": {
      "publicKey": "ed25519_public_key",
      "isAnonymous": false
    },
    "dht": {
      "announced": true,
      "manifestCid": "bafybeigdyrzt..."
    }
  }
}
```

#### Check Mirror Health
```http
GET /api/mirrors/:cid/health
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "ipfs",
      "url": "https://gateway.pinata.cloud/ipfs/...",
      "available": true,
      "latency": 245
    },
    {
      "type": "tor",
      "url": "http://xyz.onion/...",
      "available": true,
      "latency": null
    }
  ]
}
```

#### Create Identity
```http
POST /api/identity
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

## WordPress Hooks & Filters

### Actions

#### Before Publishing
```php
do_action('anonpress_before_publish', $post_id);
```

Called before content is sent to backend API.

**Example:**
```php
add_action('anonpress_before_publish', function($post_id) {
    error_log("Publishing post {$post_id} to AnonPress");
});
```

#### After Publishing
```php
do_action('anonpress_after_publish', $post_id, $result);
```

Called after successful publication with result data.

**Example:**
```php
add_action('anonpress_after_publish', function($post_id, $result) {
    // Send notification
    wp_mail(
        get_option('admin_email'),
        'Content Published to AnonPress',
        "CID: {$result['cid']}"
    );
});
```

### Filters

#### Modify Content Before Publishing
```php
apply_filters('anonpress_prepare_content', $content, $post);
```

Allows modifying HTML content before upload.

**Example:**
```php
add_filter('anonpress_prepare_content', function($content, $post) {
    // Add custom watermark
    return str_replace('</body>', '<div class="watermark">©</div></body>', $content);
}, 10, 2);
```

#### Show/Hide Author
```php
apply_filters('anonpress_show_author', false, $post);
```

Control whether author name is included in published content.

**Example:**
```php
add_filter('anonpress_show_author', function($show, $post) {
    // Only show author for public posts
    return $post->post_status === 'publish';
}, 10, 2);
```

## Security Considerations

### Private Key Storage

⚠️ **Important:** The plugin currently stores private keys in WordPress options. For production:

1. **Use WordPress Encryption**
```php
// Encrypt before storing
$encrypted = openssl_encrypt($private_key, 'AES-256-CBC', SECURE_AUTH_KEY, 0, AUTH_SALT);
update_option('anonpress_private_key', $encrypted);
```

2. **External Key Management**
   - Use hardware wallets (MetaMask, Ledger)
   - Implement server-side signing service
   - Use WordPress secret management plugins

3. **Environment Variables**
```php
define('ANONPRESS_PRIVATE_KEY', getenv('ANONPRESS_PRIVATE_KEY'));
```

### Anonymous Publishing

For maximum privacy:
- Don't configure wallet address
- Each publish creates new ephemeral identity
- No attribution to specific publisher
- No persistent identity tracking

## Troubleshooting

### "Backend API not connected"

**Cause:** Plugin cannot reach backend API

**Solutions:**
1. Verify backend is running: `curl http://localhost:4000/health`
2. Check firewall settings
3. Verify API URL in settings
4. Click "Test Connection" button

### "Failed to publish content"

**Causes:**
- IPFS upload failed
- Pinata API keys missing in backend
- Network timeout

**Solutions:**
1. Check backend logs: `tail -f backend/logs/app.log`
2. Verify Pinata credentials in backend `.env`
3. Increase timeout in `class-anonpress-api-client.php`

### "Invalid wallet address"

**Cause:** Incorrect Ethereum address format

**Solution:**
- Must start with `0x`
- Must be 42 characters (0x + 40 hex)
- Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

### Publishing Stuck/Timeout

**Causes:**
- Large content size
- Slow IPFS upload
- Tor service creation delay

**Solutions:**
1. Increase PHP timeout: `set_time_limit(120);`
2. Increase WordPress timeout in `wp-config.php`:
```php
define('WP_HTTP_TIMEOUT', 120);
```

## Performance Optimization

### Caching

Enable WordPress object caching:
```php
define('WP_CACHE', true);
```

### Async Publishing

For large sites, implement async publishing:

```php
add_action('anonpress_before_publish', function($post_id) {
    wp_schedule_single_event(time(), 'anonpress_async_publish', [$post_id]);
});

add_action('anonpress_async_publish', function($post_id) {
    $post = get_post($post_id);
    $publisher = new AnonPress_Publisher();
    $publisher->publish_post($post);
});
```

## Advanced Usage

### Bulk Publishing

Publish multiple posts:

```php
$posts = get_posts(['numberposts' => -1]);
foreach ($posts as $post) {
    $publisher = new AnonPress_Publisher();
    $result = $publisher->publish_post($post);
    
    if (!is_wp_error($result)) {
        echo "Published: {$post->post_title} - CID: {$result['cid']}\n";
    }
}
```

### Custom Post Types

Enable for custom post types:

```php
add_filter('add_meta_boxes', function() {
    add_meta_box(
        'anonpress_publish',
        'AnonPress Publishing',
        [AnonPress::get_instance(), 'render_meta_box'],
        'my_custom_post_type', // Your custom post type
        'side',
        'high'
    );
});
```

### REST API Integration

Create custom endpoint:

```php
add_action('rest_api_init', function() {
    register_rest_route('anonpress/v1', '/publish/(?P<id>\d+)', [
        'methods' => 'POST',
        'callback' => function($request) {
            $post = get_post($request['id']);
            $publisher = new AnonPress_Publisher();
            return $publisher->publish_post($post);
        },
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        }
    ]);
});
```

## Monitoring & Analytics

### Track Publications

```php
function anonpress_get_stats() {
    global $wpdb;
    $table = $wpdb->prefix . 'anonpress_publications';
    
    return [
        'total' => $wpdb->get_var("SELECT COUNT(*) FROM $table"),
        'today' => $wpdb->get_var("SELECT COUNT(*) FROM $table WHERE DATE(published_at) = CURDATE()"),
        'this_week' => $wpdb->get_var("SELECT COUNT(*) FROM $table WHERE YEARWEEK(published_at) = YEARWEEK(NOW())")
    ];
}
```

### Monitor Mirror Health

Schedule daily health checks:

```php
add_action('init', function() {
    if (!wp_next_scheduled('anonpress_health_check')) {
        wp_schedule_event(time(), 'daily', 'anonpress_health_check');
    }
});

add_action('anonpress_health_check', function() {
    global $wpdb;
    $table = $wpdb->prefix . 'anonpress_publications';
    $publications = $wpdb->get_results("SELECT * FROM $table");
    
    $api_client = new AnonPress_API_Client();
    foreach ($publications as $pub) {
        $health = $api_client->check_mirror_health($pub->cid);
        // Log or alert if mirrors are down
    }
});
```

## Migration from Other Platforms

### Import from Medium/Substack

Use WordPress importers, then bulk publish:

```php
// After import
$imported_posts = get_posts([
    'meta_key' => '_imported_from_medium',
    'numberposts' => -1
]);

foreach ($imported_posts as $post) {
    $publisher = new AnonPress_Publisher();
    $publisher->publish_post($post);
}
```

## Production Deployment

### Checklist

- [ ] Backend API running with SSL (https://)
- [ ] Pinata API keys configured
- [ ] Tor service operational
- [ ] Database backups enabled
- [ ] WordPress caching enabled
- [ ] Error logging configured
- [ ] Monitor setup for uptime
- [ ] Security hardening completed

### Environment Variables

Backend `.env`:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/anonpress
PINATA_API_KEY=your_key
PINATA_SECRET_KEY=your_secret
TOR_PROXY=socks5://127.0.0.1:9050
CORS_ORIGIN=https://yourwordpress.com
```

WordPress `wp-config.php`:
```php
define('ANONPRESS_API_URL', 'https://api.yourdomain.com');
define('ANONPRESS_ENVIRONMENT', 'production');
```

## Support & Resources

- **Documentation**: https://docs.anonpress.io
- **GitHub Issues**: https://github.com/anonpress/wordpress-plugin/issues
- **Discord Community**: https://discord.gg/anonpress
- **Email Support**: support@anonpress.io

## License

MIT License - See LICENSE file in plugin directory
