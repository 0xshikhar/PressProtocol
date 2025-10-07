# AnonPress WordPress Plugin

WordPress plugin for publishing content to the AnonPress decentralized network.

## Features

- **One-Click Publishing** - Publish posts directly from WordPress editor
- **Multi-Network Distribution** - Automatic IPFS, Tor, and gateway mirrors
- **Identity Management** - Ed25519 cryptographic signing
- **Mirror Monitoring** - Health checks and status display
- **WordPress Integration** - Meta box, dashboard, and settings pages

## Installation

### Manual Installation

1. Download or clone this repository
2. Copy to `wp-content/plugins/anonpress`
3. Activate in WordPress admin
4. Configure settings at **AnonPress > Settings**

### Configuration

Required settings:

- **Backend API URL** - Default: `http://localhost:4000`
- **Wallet Address** - Your Ethereum address for identity

## Usage

### Publishing a Post

1. Create or edit a post
2. Look for "AnonPress Publishing" meta box in sidebar
3. Click "Publish to AnonPress" button
4. Copy the `anonpress://` share link
5. Share anywhere!

### Viewing Publications

Go to **AnonPress > Dashboard** to see:

- All published posts
- Mirror status
- Copy links
- View content

## Requirements

- WordPress 6.0+
- PHP 8.0+
- AnonPress Backend API running
- Wallet address

## API Integration

The plugin communicates with the AnonPress backend API:

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

- Go to AnonPress > Settings
- Enter your Ethereum wallet address
- Save settings

### "Failed to publish"

- Check backend logs
- Verify Pinata API keys are configured
- Ensure post has title and content

## License

MIT License - See LICENSE file

## Support

- Documentation: https://docs.anonpress.io
- GitHub: https://github.com/anonpress/wordpress-plugin
- Issues: https://github.com/anonpress/wordpress-plugin/issues
