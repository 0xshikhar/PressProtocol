# Pre-Deployment Checklist

## ✅ Complete This Before Deploying to Production

### 1. Backend API Setup

- [ ] **Backend deployed and accessible**
  - URL: `https://api.yourdomain.com`
  - Test: `curl https://api.yourdomain.com/health`
  - Expected: `{"status":"ok","service":"anonpress-api"}`

- [ ] **Environment variables configured**
  ```env
  DATABASE_URL=postgresql://...
  PINATA_API_KEY=your_key
  PINATA_SECRET_KEY=your_secret
  TOR_PROXY=socks5://127.0.0.1:9050
  CORS_ORIGIN=https://yourwordpresssite.com
  NODE_ENV=production
  ```

- [ ] **SSL certificate installed**
  - Backend must use HTTPS
  - Certificate valid and not expired

- [ ] **Database created and migrated**
  ```bash
  cd backend
  npx prisma migrate deploy
  ```

- [ ] **Pinata account setup**
  - API keys generated
  - Free tier: 1GB storage
  - Test upload works

- [ ] **Tor service running**
  - Tor proxy accessible
  - Port 9050 open (or configured port)

### 2. Plugin Files Review

- [ ] **Main plugin file** (`anonpress.php`)
  - Version number correct: `1.0.0`
  - Plugin headers complete
  - No debug code

- [ ] **Required files present**
  - [x] `anonpress.php` - Main plugin
  - [x] `LICENSE` - MIT license
  - [x] `README.md` - GitHub readme
  - [x] `readme.txt` - WordPress readme
  - [x] `uninstall.php` - Cleanup script
  - [x] `includes/` - PHP classes
  - [x] `templates/` - UI templates
  - [x] `assets/` - CSS/JS files

- [ ] **No development files included**
  - No `.git/` directory
  - No `node_modules/`
  - No `.env` files
  - No test files
  - No `.DS_Store` files

- [ ] **Documentation included** (optional but recommended)
  - [x] `QUICKSTART.md`
  - [x] `INTEGRATION.md`
  - [x] `DEPLOYMENT.md`

### 3. Code Review

- [ ] **API Client** (`includes/class-anonpress-api-client.php`)
  - Error handling implemented
  - Timeouts configured (30s default, 60s publish)
  - Connection testing works
  - All endpoints functional

- [ ] **Publisher** (`includes/class-anonpress-publisher.php`)
  - Content formatting correct
  - HTML generation works
  - Hooks implemented
  - Database storage works

- [ ] **Settings** (`includes/class-anonpress-settings.php`)
  - Input validation works
  - Sanitization implemented
  - Connection test functional
  - Error messages clear

- [ ] **JavaScript** (`assets/admin.js`)
  - No console.log statements
  - Error handling present
  - AJAX requests work
  - UI feedback clear

- [ ] **CSS** (`assets/admin.css`)
  - Responsive design
  - No conflicts with WordPress admin
  - Clean and professional

### 4. Security Checks

- [ ] **Input validation**
  - API URL validated
  - Wallet address validated (regex)
  - All user input sanitized

- [ ] **CSRF protection**
  - Nonces used for all AJAX
  - Nonces verified server-side

- [ ] **Capability checks**
  - `edit_posts` for publishing
  - `manage_options` for settings

- [ ] **Private key handling**
  - Consider encryption (see DEPLOYMENT.md)
  - Or use anonymous mode (no storage)

- [ ] **SQL injection prevention**
  - Using `$wpdb->prepare()` everywhere
  - No raw SQL queries

### 5. Testing

- [ ] **Fresh WordPress install test**
  - Install on clean WP 6.0+
  - Activate plugin
  - No PHP errors

- [ ] **Settings page test**
  - Enter API URL
  - Test connection
  - Save settings
  - Settings persist

- [ ] **Publishing test**
  - Create test post
  - Click "Publish to AnonPress"
  - Wait for completion
  - Verify CID received
  - Check all mirrors work

- [ ] **Error handling test**
  - Try with backend down
  - Try with invalid API URL
  - Try with network timeout
  - Error messages clear

- [ ] **Database test**
  - Check table created
  - Check data inserted
  - Check post meta stored

- [ ] **Uninstall test**
  - Deactivate plugin
  - Delete plugin
  - Verify cleanup (table, options, post meta)

### 6. Performance

- [ ] **Timeouts configured**
  - Default: 30 seconds
  - Publishing: 60 seconds
  - Adjustable in wp-config.php

- [ ] **Caching considered**
  - WordPress object cache compatible
  - Transients used where appropriate

- [ ] **Database optimized**
  - Indexes on post_id and cid
  - Efficient queries

### 7. Documentation

- [ ] **README.md updated**
  - Installation instructions
  - Configuration steps
  - Basic usage

- [ ] **readme.txt complete**
  - WordPress.org format
  - All sections filled
  - FAQ comprehensive
  - Changelog accurate

- [ ] **QUICKSTART.md clear**
  - 5-minute setup guide
  - Step-by-step instructions
  - Common issues covered

- [ ] **DEPLOYMENT.md comprehensive**
  - Production setup
  - Security hardening
  - Troubleshooting
  - Maintenance tasks

### 8. WordPress Compatibility

- [ ] **WordPress version**
  - Tested on WP 6.0+
  - Compatible with latest (6.4)

- [ ] **PHP version**
  - Requires PHP 8.0+
  - No deprecated functions

- [ ] **Database**
  - MySQL 5.7+ or MariaDB 10.3+
  - PostgreSQL for backend

- [ ] **Multisite**
  - Works on single site
  - Multisite support (if needed)

### 9. User Experience

- [ ] **Clear UI**
  - Meta box intuitive
  - Dashboard informative
  - Settings straightforward

- [ ] **Helpful messages**
  - Success messages clear
  - Error messages actionable
  - Loading states visible

- [ ] **Documentation accessible**
  - Links to docs in plugin
  - Help text in settings
  - FAQ comprehensive

### 10. Production Configuration

- [ ] **Default API URL**
  - Set to production URL (or localhost for self-hosted)
  - Documented in settings

- [ ] **Error logging**
  - WordPress debug log enabled
  - Errors logged, not displayed

- [ ] **Monitoring**
  - Health check cron scheduled
  - Email alerts configured (optional)

- [ ] **Backups**
  - Database backup strategy
  - Plugin settings backed up

## Packaging for Deployment

### Option 1: Use Packaging Script

```bash
cd /path/to/wordpress-plugin
chmod +x package.sh
./package.sh
```

This creates `dist/anonpress-1.0.0.zip` ready for upload.

### Option 2: Manual ZIP Creation

```bash
cd /path/to/wordpress-plugin
zip -r anonpress.zip . \
  -x "*.git*" \
  -x "*.DS_Store" \
  -x "node_modules/*" \
  -x "*.log" \
  -x "dist/*" \
  -x "package.sh"
```

### Option 3: Direct Upload via FTP

```bash
# Upload entire directory to:
/path/to/wordpress/wp-content/plugins/anonpress/
```

## Deployment Steps

### 1. Upload Plugin

**Via WordPress Admin:**
1. Go to Plugins → Add New
2. Click "Upload Plugin"
3. Choose ZIP file
4. Click "Install Now"
5. Click "Activate"

**Via FTP/SFTP:**
1. Connect to server
2. Navigate to `wp-content/plugins/`
3. Upload `anonpress/` directory
4. Activate in WordPress admin

### 2. Configure Settings

1. Go to **AnonPress → Settings**
2. Enter **Backend API URL**: `https://api.yourdomain.com`
3. Click **Test Connection** (should show ✅)
4. (Optional) Enter **Ethereum wallet address**
5. Click **Save Settings**

### 3. Test Publishing

1. Create a test post
2. Click "Publish to AnonPress"
3. Wait 10-30 seconds
4. Verify CID and mirror URLs
5. Test accessing via IPFS gateway

### 4. Monitor

1. Check WordPress debug log
2. Check backend API logs
3. Verify mirror availability
4. Monitor error rates

## Post-Deployment

- [ ] **Verify plugin active**
- [ ] **Settings saved**
- [ ] **Test post published**
- [ ] **All mirrors accessible**
- [ ] **No errors in logs**
- [ ] **Performance acceptable**
- [ ] **Users can access content**

## Rollback Plan

If issues occur:

1. **Deactivate plugin** (doesn't delete data)
2. **Check logs** for errors
3. **Fix issues**
4. **Reactivate**

Or:

1. **Delete plugin** (removes all data)
2. **Fix issues**
3. **Reinstall**
4. **Reconfigure**

## Support

If you need help:

- **Documentation**: Check QUICKSTART.md, INTEGRATION.md, DEPLOYMENT.md
- **Logs**: WordPress debug.log, backend logs
- **GitHub Issues**: https://github.com/anonpress/wordpress-plugin/issues
- **Discord**: https://discord.gg/anonpress
- **Email**: support@anonpress.io

## Ready to Deploy? ✅

Once all items are checked:

1. Run `./package.sh` to create ZIP
2. Upload to WordPress
3. Configure settings
4. Test thoroughly
5. Go live! 🚀

---

**Remember**: Test everything in a staging environment before deploying to production!
