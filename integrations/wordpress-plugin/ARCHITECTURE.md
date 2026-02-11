# WordPress Plugin Architecture

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        WordPress Site                            │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ Post Editor  │───▶│ Meta Box     │───▶│ Publisher    │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                   │              │
│  ┌──────────────┐    ┌──────────────┐           │              │
│  │ Dashboard    │    │ Settings     │           │              │
│  └──────────────┘    └──────────────┘           │              │
│                                                   │              │
│  ┌────────────────────────────────────────────┐  │              │
│  │        API Client (HTTP)                   │◀─┘              │
│  └────────────────────────────────────────────┘                 │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │ HTTP/JSON
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AnonPress Backend API                         │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ Content API  │───▶│ Identity Svc │───▶│ Storage Svc  │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│          │                                        │              │
│          ▼                                        ▼              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ Mirror Svc   │    │ Discovery    │    │ Tor Service  │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│          │                    │                   │              │
└──────────┼────────────────────┼───────────────────┼─────────────┘
           │                    │                   │
           ▼                    ▼                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Decentralized Networks                         │
│                                                                   │
│    ┌─────────┐         ┌─────────┐         ┌─────────┐          │
│    │  IPFS   │         │   Tor   │         │   DHT   │          │
│    └─────────┘         └─────────┘         └─────────┘          │
└───────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### WordPress Plugin Components

#### 1. Main Plugin Class (`anonpress.php`)
**Responsibilities:**
- Plugin initialization and lifecycle
- Hook registration
- Admin menu setup
- AJAX handler routing

**Key Methods:**
- `activate()` - Creates database tables
- `deactivate()` - Cleanup
- `add_admin_menu()` - Registers admin pages
- `add_meta_box()` - Adds publish meta box to post editor
- `ajax_publish()` - Handles publish requests
- `ajax_check_status()` - Handles mirror health checks

#### 2. API Client (`class-anonpress-api-client.php`)
**Responsibilities:**
- HTTP communication with backend
- Request/response handling
- Error management
- Connection testing

**Key Methods:**
- `test_connection()` - Verify backend availability
- `publish_content()` - POST content to backend
- `get_content()` - Retrieve content by CID
- `check_mirror_health()` - Check mirror status
- `create_identity()` - Generate identity keypair
- `get_health()` - Backend health check

**Request Flow:**
```php
WordPress → wp_remote_post() → Backend API → JSON Response → Parse & Return
```

#### 3. Publisher (`class-anonpress-publisher.php`)
**Responsibilities:**
- Content extraction and formatting
- HTML generation
- Database storage
- Hook execution

**Key Methods:**
- `publish_post()` - Main publishing workflow
- `prepare_content()` - Generate standalone HTML
- `get_default_styles()` - CSS styling
- `get_post_tags()` - Extract taxonomy
- `store_publication()` - Save to database
- `get_publication()` - Retrieve publication info

**Content Processing:**
```php
WordPress Post → Extract (title, content, meta) → Format HTML → 
Add styles → Include images → Generate complete page
```

#### 4. Settings (`class-anonpress-settings.php`)
**Responsibilities:**
- Admin settings page
- Option validation
- Connection testing
- User configuration

**Key Methods:**
- `register_settings()` - Register WordPress options
- `sanitize_api_url()` - Validate API URL
- `sanitize_wallet_address()` - Validate Ethereum address
- `ajax_test_connection()` - AJAX connection test

#### 5. Identity (`class-anonpress-identity.php`)
**Responsibilities:**
- Identity management
- Public key storage
- Keypair coordination

**Key Methods:**
- `get_or_create_identity()` - Get or generate identity

### Database Schema

#### Publications Table
```sql
wp_anonpress_publications
├── id (mediumint, PK, AUTO_INCREMENT)
├── post_id (bigint, FK to wp_posts)
├── cid (varchar(100)) - IPFS Content ID
├── ipfs_url (varchar(255)) - IPFS gateway URL
├── tor_url (varchar(255)) - Tor onion URL
├── gateway_url (varchar(255)) - Web gateway URL
└── published_at (datetime) - Publication timestamp
```

#### WordPress Options
```
anonpress_api_url           - Backend API endpoint
anonpress_wallet_address    - Ethereum wallet (optional)
anonpress_public_key        - Ed25519 public key
anonpress_private_key       - Ed25519 private key (encrypted)
```

#### Post Meta
```
_anonpress_public_key      - Publisher's public key
_anonpress_is_anonymous    - Anonymous flag (1/0)
_anonpress_dht_announced   - DHT announcement status
_anonpress_manifest_cid    - DHT manifest CID
```

## Data Flow

### Publishing Flow (Detailed)

```
1. User clicks "Publish to AnonPress" button
   ↓
2. JavaScript (admin.js)
   - Captures click event
   - Disables button
   - Shows loading state
   - Makes AJAX request to WordPress
   ↓
3. WordPress AJAX Handler (anonpress.php)
   - Verifies nonce (security)
   - Checks user permissions
   - Retrieves post data
   ↓
4. Publisher Service (class-anonpress-publisher.php)
   - Validates post (has title, content)
   - Triggers 'anonpress_before_publish' hook
   - Extracts post metadata
   - Generates standalone HTML with CSS
   - Applies 'anonpress_prepare_content' filter
   ↓
5. API Client (class-anonpress-api-client.php)
   - Prepares JSON payload
   - Makes HTTP POST to backend API
   - Timeout: 60 seconds
   ↓
6. Backend API Processing (backend/src/routes/content.ts)
   - Receives request
   - Validates input (zod schema)
   - Gets or creates user identity
   - Signs content with Ed25519
   ↓
7. Storage Service (backend/src/services/StorageService.ts)
   - Uploads content to IPFS via Pinata
   - Returns CID (Content Identifier)
   ↓
8. Tor Service (backend/src/services/TorService.ts)
   - Creates onion service
   - Returns .onion URL
   ↓
9. Database Cache (Prisma)
   - Stores content metadata
   - Creates mirror records
   ↓
10. Discovery Service (backend/src/services/DiscoveryService.ts)
    - Announces to IPFS DHT
    - Publishes manifest
    ↓
11. Backend Response
    - Returns CID, mirrors, publisher info, DHT data
    ↓
12. API Client Receives Response
    - Parses JSON
    - Validates structure
    - Returns to Publisher
    ↓
13. Publisher Stores Publication
    - Inserts into wp_anonpress_publications
    - Saves post metadata
    - Triggers 'anonpress_after_publish' hook
    ↓
14. AJAX Success Response
    - Returns result to JavaScript
    ↓
15. JavaScript Updates UI
    - Shows success message
    - Displays CID and share URL
    - Enables copy buttons
    - Reloads page after 2 seconds
```

### Content Structure

#### Generated HTML Format

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="generator" content="AnonPress WordPress Plugin">
    <meta name="description" content="Post excerpt">
    <title>Post Title</title>
    <style>/* Embedded CSS */</style>
</head>
<body>
    <article>
        <header>
            <h1>Post Title</h1>
            <div class="meta">
                <time datetime="ISO-8601">Date</time>
                <span class="author">by Author</span> <!-- Optional -->
            </div>
        </header>
        
        <div class="featured-image">
            <img src="..." alt="...">
        </div>
        
        <div class="content">
            <!-- Post content with WordPress filters applied -->
        </div>
        
        <div class="taxonomy">
            <div class="categories">Categories: ...</div>
            <div class="tags">Tags: ...</div>
        </div>
    </article>
    
    <footer>
        <p>Published with AnonPress - Censorship-resistant publishing</p>
        <p class="disclaimer">Content published on decentralized networks</p>
    </footer>
</body>
</html>
```

## Security Architecture

### Authentication & Authorization

#### WordPress Level
```php
// Check user capability
current_user_can('edit_posts')

// Verify nonce (CSRF protection)
check_ajax_referer('anonpress_nonce', 'nonce')

// Sanitize input
$post_id = intval($_POST['post_id']);
```

#### Backend API Level
```typescript
// Optional authentication (wallet-based)
if (walletAddress) {
    // Create/retrieve authenticated user
} else {
    // Anonymous publishing
}

// Content signing
const signature = await identityService.signContent(content, privateKey);
```

### Data Privacy

#### Anonymous Publishing Mode
- No wallet address required
- Ephemeral keypair per publish
- No user tracking
- No attribution

#### Authenticated Publishing Mode
- Wallet address links identity
- Persistent public key
- Content attribution
- Optional pseudonym

### Private Key Security

⚠️ **Current Implementation:**
```php
// Stored in WordPress options (not ideal)
update_option('anonpress_private_key', $key);
```

✅ **Recommended Production:**
```php
// Encrypt before storage
$encrypted = openssl_encrypt(
    $private_key, 
    'AES-256-CBC', 
    SECURE_AUTH_KEY, 
    0, 
    AUTH_SALT
);
update_option('anonpress_private_key', $encrypted);
```

Or use external key management:
- Hardware wallets (MetaMask)
- Server-side signing service
- WordPress vault plugins

## Error Handling

### Error Flow

```
Plugin → API Client → Backend API
                ↓
         HTTP Error?
                ↓
         WP_Error Object
                ↓
         AJAX Error Response
                ↓
         JavaScript Error Display
```

### Error Types

#### Network Errors
```php
if (is_wp_error($response)) {
    return new WP_Error('network_error', $response->get_error_message());
}
```

#### HTTP Status Errors
```php
if ($code !== 200 && $code !== 201) {
    return new WP_Error('api_error', "Status: {$code}");
}
```

#### Validation Errors
```php
if (!$result['success']) {
    return new WP_Error('validation_error', $result['error']);
}
```

## Performance Considerations

### Optimization Strategies

#### 1. Caching
- WordPress object cache for settings
- Transient API for temporary data
- Database query optimization

#### 2. Async Operations
```php
wp_schedule_single_event(time(), 'anonpress_async_publish', [$post_id]);
```

#### 3. Timeout Management
- Default: 30 seconds
- Publishing: 60 seconds (IPFS upload)
- Configurable per request

#### 4. Resource Limits
```php
// Increase PHP memory for large posts
@ini_set('memory_limit', '256M');

// Increase execution time
set_time_limit(120);
```

## Testing Strategy

### Manual Testing

1. **Connection Test**
   - Settings page → Test Connection
   - Verify success message

2. **Anonymous Publish**
   - Clear wallet address
   - Publish post
   - Verify CID generated

3. **Authenticated Publish**
   - Set wallet address
   - Publish post
   - Verify public key stored

4. **Mirror Health Check**
   - Published post meta box
   - Click "Check Mirror Status"
   - Verify all mirrors available

### Automated Testing

```php
class AnonPress_Tests extends WP_UnitTestCase {
    public function test_api_client_connection() {
        $client = new AnonPress_API_Client();
        $result = $client->test_connection();
        $this->assertTrue($result['success']);
    }
    
    public function test_publish_post() {
        $post = $this->factory->post->create_and_get([
            'post_title' => 'Test Post',
            'post_content' => 'Test content'
        ]);
        
        $publisher = new AnonPress_Publisher();
        $result = $publisher->publish_post($post);
        
        $this->assertNotWPError($result);
        $this->assertArrayHasKey('cid', $result);
    }
}
```

## Deployment Checklist

### Development Environment
- [ ] WordPress 6.0+ with debug enabled
- [ ] Backend API running locally
- [ ] Database accessible
- [ ] PHP error logging enabled

### Staging Environment
- [ ] SSL certificate installed
- [ ] Backend API with staging domain
- [ ] Test wallet addresses
- [ ] Monitor logs

### Production Environment
- [ ] SSL/TLS enforced
- [ ] Backend API production URL
- [ ] Private key encryption enabled
- [ ] Error logging to file
- [ ] Monitoring and alerts
- [ ] Backup strategy
- [ ] Rate limiting configured

## Maintenance

### Regular Tasks

#### Daily
- Monitor error logs
- Check mirror health
- Verify backend uptime

#### Weekly
- Review failed publications
- Update dependencies
- Security audit

#### Monthly
- Database optimization
- Performance analysis
- User feedback review

## Future Enhancements

### Planned Features

1. **Bulk Publishing**
   - Multi-select posts
   - Queue management
   - Progress tracking

2. **Content Updates**
   - Republish with IPNS
   - Version tracking
   - Update notifications

3. **Advanced Identity**
   - MetaMask integration
   - WalletConnect support
   - Multi-wallet management

4. **Analytics Dashboard**
   - View statistics
   - Mirror performance
   - Content reach metrics

5. **Scheduled Publishing**
   - Time-delayed publish
   - Recurring updates
   - Auto-republish

## Support & Resources

- **Plugin Repository**: `/wordpress-plugin/`
- **Backend API**: `/backend/`
- **Documentation**: `/documents/`
- **Issues**: GitHub Issues
- **Community**: Discord/Forums
