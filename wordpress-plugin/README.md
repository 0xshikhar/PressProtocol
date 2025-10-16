# PressProtocol WordPress Plugin

WordPress plugin for publishing content to the PressProtocol network.

## Features

- **One-Click Publishing** - Publish posts directly from WordPress editor
- **Multi-Network Distribution** - Automatic IPFS, Tor, and gateway mirrors
- **Identity Management** - Ed25519 cryptographic signing
- **Mirror Monitoring** - Health checks and status display
- **WordPress Integration** - Meta box, dashboard, and settings pages

## Installation

### Manual Installation

1. Download or clone this repository folder
2. Copy to `wp-content/plugins/anonpress`
3. Activate in WordPress admin
4. Configure settings at **PressProtocol > Settings**


### Zip Installation

1. Download or clone this repository folder and zip it
2. Open Wordpress admin panel and select **Plugins > Add New > Upload Plugin**
3. Upload the zip file
4. Activate in WordPress admin panel
5. Configure settings at **PressProtocol > Settings**

### Configuration

Required settings:

- **Backend API URL** - Default: `https://anonpress-production.up.railway.app`
- **Wallet Address** - Your Ethereum address for identity (optional - can publish anonymously)

## Usage

### Publishing a Post

1. Create or edit a post
2. Look for "PressProtocol Publishing" meta box in sidebar
3. Click "Publish to PressProtocol" button
4. Copy the `https://pressprotocol.com/read/{CID}` share link
5. Share anywhere!


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
| `/api/identity` | Create identity | 

### Viewing Publications

Go to **PressProtocol > Dashboard** to see:

- All published posts
- Mirror status
- Copy links
- View content

## Requirements

- WordPress 6.0+
- PHP 8.0+
- PressProtocol Backend API running
- Wallet address (optional)

## API Integration

The plugin communicates with the PressProtocol backend API:

- `POST /api/content` - Publish content
- `GET /api/content/:cid` - Fetch content
- `GET /api/mirrors/:cid/health` - Check mirrors
- `POST /api/identity` - Create identity

## Database Tables

### `wp_anonpress_publications`

Stores publication metadata:

- `post_id` - WordPress post ID
- `cid` - IPFS content identifier
- `ipfs_url` - IPFS gateway URL
- `tor_url` - Tor onion service URL
- `gateway_url` - Web gateway URL
- `published_at` - Publication timestamp

## Development

### File Structure

```
wordpress-plugin/
├── anonpress.php                          # Main plugin file
├── includes/
│   ├── class-anonpress-api-client.php    # API client
│   ├── class-anonpress-publisher.php     # Publishing logic
│   ├── class-anonpress-settings.php      # Settings page
│   └── class-anonpress-identity.php      # Identity management
├── templates/
│   ├── meta-box.php                      # Post editor meta box
│   ├── dashboard.php                     # Admin dashboard
│   └── settings.php                      # Settings page
├── assets/
│   ├── admin.css                         # Admin styles
│   └── admin.js                          # Admin scripts
└── readme.txt                            # WordPress.org readme
```

### Hooks

Available WordPress hooks:

```php
// Before publishing
do_action('anonpress_before_publish', $post_id);

// After successful publish
do_action('anonpress_after_publish', $post_id, $result);

// Filter content before publishing
apply_filters('anonpress_prepare_content', $content, $post);
```

## Troubleshooting

### "Backend API not connected"

- Check Backend API URL in settings
- Ensure backend is running
- Check firewall/network settings

### "Please configure wallet address"

- Go to PressProtocol > Settings
- Enter your Ethereum wallet address (optional - can publish anonymously)
- Save settings

### "Failed to publish"

- Check backend logs
- Verify Pinata API keys are configured
- Ensure post has title and content

## License

MIT License - See LICENSE file

## Support

- Documentation: https://docs.pressprotocol.com
- GitHub: https://github.com/pressprotocol/wordpress-plugin
- Issues: https://github.com/pressprotocol/wordpress-plugin/issues
