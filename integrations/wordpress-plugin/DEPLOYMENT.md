# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Backend API Setup

✅ **Deploy Backend API** (Required)
```bash
# Option 1: Deploy to Railway/Render/Heroku
# - Push backend code to Git
# - Connect to hosting platform
# - Set environment variables
# - Deploy

# Option 2: Self-host on VPS
cd backend
npm install
npm run build
pm2 start dist/index.js --name anonpress-api
```

✅ **Environment Variables**
```env
# backend/.env
DATABASE_URL=postgresql://user:pass@host:5432/anonpress
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
TOR_PROXY=socks5://127.0.0.1:9050
CORS_ORIGIN=https://yourwordpresssite.com
PORT=4000
NODE_ENV=production
```

✅ **SSL Certificate**
- Backend API must use HTTPS in production
- Use Let's Encrypt, Cloudflare, or hosting provider SSL

✅ **Verify Backend**
```bash
curl https://api.yourdomain.com/health
# Should return: {"status":"ok","service":"anonpress-api"}
```

### 2. Plugin Preparation

✅ **Update Configuration**

Edit `anonpress.php` if needed:
```php
// Change default API URL for production
define('ANONPRESS_DEFAULT_API_URL', 'https://api.yourdomain.com');
```

✅ **Remove Development Files**

The plugin should NOT include:
- `.git/` directory
- `node_modules/`
- `.env` files
- Development logs
- Test files
- Large documentation (keep only README.md and readme.txt)

✅ **Files to Include**

Required files:
```
anonpress/
├── anonpress.php          ✅ Main plugin file
├── LICENSE                ✅ MIT license
├── README.md              ✅ GitHub readme
├── readme.txt             ✅ WordPress readme
├── uninstall.php          ✅ Cleanup script
├── includes/              ✅ PHP classes
│   ├── class-anonpress-api-client.php
│   ├── class-anonpress-publisher.php
│   ├── class-anonpress-settings.php
│   └── class-anonpress-identity.php
├── templates/             ✅ UI templates
│   ├── meta-box.php
│   ├── dashboard.php
│   └── settings.php
└── assets/                ✅ CSS/JS
    ├── admin.css
    └── admin.js
```

Optional (for users):
```
├── QUICKSTART.md          📖 Quick setup guide
├── INTEGRATION.md         📖 Integration guide
└── ARCHITECTURE.md        📖 Technical docs
```

## Deployment Methods

### Method 1: Manual Upload (Recommended for Testing)

1. **Create ZIP file**
   ```bash
   cd /path/to/anonpress/wordpress-plugin
   zip -r anonpress.zip . -x "*.git*" "*.DS_Store" "node_modules/*"
   ```

2. **Upload to WordPress**
   - Go to WordPress Admin → Plugins → Add New
   - Click "Upload Plugin"
   - Choose `anonpress.zip`
   - Click "Install Now"
   - Click "Activate"

3. **Configure**
   - Go to AnonPress → Settings
   - Enter Backend API URL: `https://api.yourdomain.com`
   - Click "Test Connection"
   - Save settings

### Method 2: FTP/SFTP Upload

1. **Connect to server**
   ```bash
   sftp user@yourserver.com
   ```

2. **Upload plugin**
   ```bash
   cd /path/to/wordpress/wp-content/plugins/
   put -r anonpress/
   ```

3. **Set permissions**
   ```bash
   chmod 755 anonpress
   chmod 644 anonpress/*.php
   ```

4. **Activate in WordPress**
   - Go to Plugins → Installed Plugins
   - Find "AnonPress"
   - Click "Activate"

### Method 3: WP-CLI (For Advanced Users)

```bash
# Install plugin
wp plugin install /path/to/anonpress.zip

# Activate plugin
wp plugin activate anonpress

# Configure settings
wp option update anonpress_api_url 'https://api.yourdomain.com'
```

### Method 4: Git Deployment (For Developers)

```bash
cd /path/to/wordpress/wp-content/plugins/
git clone https://github.com/yourusername/anonpress.git
cd anonpress
# Activate via WordPress admin
```

## Post-Deployment Configuration

### 1. Initial Setup

```bash
# In WordPress Admin:
1. Go to AnonPress → Settings
2. Enter Backend API URL
3. Click "Test Connection" (should show ✅)
4. (Optional) Enter Ethereum wallet address
5. Click "Save Settings"
```

### 2. Test Publishing

```bash
1. Create a test post
2. Click "Publish to AnonPress"
3. Wait 10-30 seconds
4. Verify you get CID and mirror URLs
5. Test accessing content via IPFS gateway
```

### 3. Verify Database

```sql
-- Check table created
SHOW TABLES LIKE 'wp_anonpress_publications';

-- Check first publication
SELECT * FROM wp_anonpress_publications LIMIT 1;
```

## Security Hardening

### 1. Private Key Encryption

**Current**: Private keys stored in plaintext (not ideal)

**Production Fix**: Encrypt before storage

```php
// Add to wp-config.php
define('ANONPRESS_ENCRYPTION_KEY', 'your-32-character-secret-key-here');

// Update class-anonpress-identity.php
function store_private_key($private_key) {
    $encrypted = openssl_encrypt(
        $private_key,
        'AES-256-CBC',
        ANONPRESS_ENCRYPTION_KEY,
        0,
        substr(ANONPRESS_ENCRYPTION_KEY, 0, 16)
    );
    update_option('anonpress_private_key', $encrypted);
}

function get_private_key() {
    $encrypted = get_option('anonpress_private_key');
    if (empty($encrypted)) return null;
    
    return openssl_decrypt(
        $encrypted,
        'AES-256-CBC',
        ANONPRESS_ENCRYPTION_KEY,
        0,
        substr(ANONPRESS_ENCRYPTION_KEY, 0, 16)
    );
}
```

### 2. API URL Validation

Already implemented in `class-anonpress-settings.php`:
```php
public static function sanitize_api_url($value) {
    $value = trim($value);
    $value = rtrim($value, '/');
    
    if (!filter_var($value, FILTER_VALIDATE_URL)) {
        add_settings_error(...);
        return get_option('anonpress_api_url', 'http://localhost:4000');
    }
    
    return $value;
}
```

### 3. Rate Limiting

Add to `wp-config.php`:
```php
// Limit publishing to prevent abuse
define('ANONPRESS_RATE_LIMIT', 10); // Max 10 publishes per hour
```

Implement in plugin:
```php
function check_rate_limit($user_id) {
    $transient_key = 'anonpress_rate_' . $user_id;
    $count = get_transient($transient_key);
    
    if ($count && $count >= ANONPRESS_RATE_LIMIT) {
        return new WP_Error('rate_limit', 'Publishing rate limit exceeded');
    }
    
    set_transient($transient_key, ($count ?: 0) + 1, HOUR_IN_SECONDS);
    return true;
}
```

### 4. HTTPS Enforcement

Add to `anonpress.php`:
```php
// Require HTTPS in production
if (defined('ANONPRESS_REQUIRE_HTTPS') && ANONPRESS_REQUIRE_HTTPS) {
    $api_url = get_option('anonpress_api_url');
    if (strpos($api_url, 'https://') !== 0) {
        add_action('admin_notices', function() {
            echo '<div class="notice notice-error"><p>';
            echo 'AnonPress: Backend API must use HTTPS in production.';
            echo '</p></div>';
        });
    }
}
```

## Performance Optimization

### 1. Enable WordPress Caching

```php
// wp-config.php
define('WP_CACHE', true);
define('WP_CACHE_KEY_SALT', 'yoursite.com');
```

### 2. Optimize Database Queries

Already implemented with indexes:
```sql
CREATE INDEX idx_post_id ON wp_anonpress_publications(post_id);
CREATE INDEX idx_cid ON wp_anonpress_publications(cid);
```

### 3. Increase Timeouts

```php
// wp-config.php
define('WP_HTTP_TIMEOUT', 120); // 2 minutes for large uploads
```

### 4. Object Caching

```php
// Cache API responses
$cache_key = 'anonpress_health_' . $cid;
$health = wp_cache_get($cache_key);

if (false === $health) {
    $health = $api_client->check_mirror_health($cid);
    wp_cache_set($cache_key, $health, '', 3600); // 1 hour
}
```

## Monitoring & Logging

### 1. Enable Error Logging

```php
// wp-config.php
define('WP_DEBUG', false); // Disable debug mode in production
define('WP_DEBUG_LOG', true); // Enable logging
define('WP_DEBUG_DISPLAY', false); // Don't display errors
```

### 2. Monitor Publications

```php
// Add to functions.php or custom plugin
add_action('anonpress_after_publish', function($post_id, $result) {
    error_log(sprintf(
        'AnonPress: Published post %d - CID: %s',
        $post_id,
        $result['cid']
    ));
});

add_action('anonpress_publish_error', function($post_id, $error) {
    error_log(sprintf(
        'AnonPress ERROR: Post %d - %s',
        $post_id,
        $error->get_error_message()
    ));
});
```

### 3. Health Check Cron

```php
// Schedule daily health checks
add_action('init', function() {
    if (!wp_next_scheduled('anonpress_daily_health_check')) {
        wp_schedule_event(time(), 'daily', 'anonpress_daily_health_check');
    }
});

add_action('anonpress_daily_health_check', function() {
    $api_client = new AnonPress_API_Client();
    $health = $api_client->get_health();
    
    if (!$health['success']) {
        // Send alert email
        wp_mail(
            get_option('admin_email'),
            'AnonPress Backend Down',
            'Backend API health check failed: ' . $health['error']
        );
    }
});
```

## Backup Strategy

### 1. Database Backup

```bash
# Backup publications table
mysqldump -u user -p database wp_anonpress_publications > anonpress_backup.sql

# Restore
mysql -u user -p database < anonpress_backup.sql
```

### 2. Plugin Settings Backup

```bash
# Export settings
wp option get anonpress_api_url
wp option get anonpress_wallet_address
wp option get anonpress_public_key

# Import settings
wp option update anonpress_api_url 'https://api.yourdomain.com'
```

### 3. Automated Backups

Use WordPress backup plugins:
- UpdraftPlus
- BackWPup
- VaultPress

## Troubleshooting

### Issue: "Backend API not connected"

**Check:**
```bash
# 1. Backend is running
curl https://api.yourdomain.com/health

# 2. CORS configured
# backend/.env should have:
CORS_ORIGIN=https://yourwordpresssite.com

# 3. Firewall allows connection
# 4. SSL certificate valid
```

### Issue: "Failed to publish content"

**Check:**
```bash
# 1. Pinata credentials
# backend/.env
PINATA_API_KEY=xxx
PINATA_SECRET_KEY=xxx

# 2. Backend logs
tail -f backend/logs/app.log

# 3. WordPress debug log
tail -f wp-content/debug.log
```

### Issue: "Timeout during publish"

**Fix:**
```php
// Increase timeout in wp-config.php
define('WP_HTTP_TIMEOUT', 180); // 3 minutes

// Or in plugin
// class-anonpress-api-client.php
private $timeout_publish = 180;
```

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check backend uptime
- Verify mirror availability

**Weekly:**
- Review failed publications
- Update plugin if new version
- Check disk space

**Monthly:**
- Database optimization
- Security audit
- Performance review
- Backup verification

### Updates

**Plugin Updates:**
```bash
# Via WordPress Admin
Plugins → Installed Plugins → AnonPress → Update

# Via WP-CLI
wp plugin update anonpress

# Manual
# 1. Deactivate plugin
# 2. Delete old files
# 3. Upload new version
# 4. Activate plugin
```

## Production Checklist

Before going live:

- [ ] Backend API deployed with HTTPS
- [ ] Pinata API keys configured
- [ ] Tor service running
- [ ] Database created and accessible
- [ ] Plugin uploaded and activated
- [ ] Settings configured
- [ ] Connection test successful
- [ ] Test post published successfully
- [ ] All mirrors accessible
- [ ] Error logging enabled
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Security hardening applied
- [ ] Performance optimized
- [ ] Documentation reviewed

## Support

If you encounter issues:

1. **Check Documentation**
   - QUICKSTART.md
   - INTEGRATION.md
   - ARCHITECTURE.md

2. **Review Logs**
   - WordPress: `wp-content/debug.log`
   - Backend: `backend/logs/app.log`
   - Server: `/var/log/nginx/error.log`

3. **Test Components**
   - Backend health: `curl https://api.yourdomain.com/health`
   - IPFS: `curl https://gateway.pinata.cloud/ipfs/test`
   - Database: `wp db check`

4. **Get Help**
   - GitHub Issues: https://github.com/anonpress/wordpress-plugin/issues
   - Discord: https://discord.gg/anonpress
   - Email: support@anonpress.io

## Success!

Your AnonPress plugin is now deployed and ready to publish censorship-resistant content! 🚀

Next steps:
1. Publish your first post
2. Share the `anonpress://` link
3. Monitor performance
4. Gather user feedback
5. Iterate and improve
