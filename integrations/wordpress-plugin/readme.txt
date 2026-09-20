=== PressProtocol Plugin ===
Contributors: pressprotocol
Tags: decentralized, ipfs, tor, censorship-resistant, publishing, blockchain
Requires at least: 6.0
Tested up to: 6.4
Stable tag: 1.1.0
Requires PHP: 8.0
License: MIT
License URI: https://opensource.org/licenses/MIT

Publish your WordPress content to a decentralized, censorship-resistant network (IPFS + Tor + DHT).

== Description ==

PressProtocol enables censorship-resistant publishing by distributing your WordPress content across multiple decentralized networks:

* **IPFS** - Distributed storage that can't be taken down
* **Tor** - Anonymous onion services for private access
* **Gateway Mirrors** - Web-accessible fallback

= Key Features =

* **One-Click Publishing** - Publish directly from WordPress editor
* **Multi-Network Distribution** - IPFS, Tor, and web gateway simultaneously
* **Cryptographic Signing** - Ed25519 signatures for content verification
* **Anonymous Publishing** - No wallet required, maximum privacy
* **Authenticated Publishing** - Optional Ethereum wallet for persistent identity
* **Mirror Health Checks** - Real-time availability monitoring
* **Decentralized Discovery** - DHT announcements for content discovery
* **Beautiful Content** - Standalone HTML with responsive styling

= How It Works =

1. Write your post in WordPress
2. Click "Publish to PressProtocol" button
3. Content is uploaded to IPFS (immutable storage)
4. Tor onion service created (anonymous access)
5. Announced to DHT (decentralized discovery)
6. Get shareable `https://pressprotocol.com/read/{CID}` link

= networks Used =

* **IPFS** - Distributed, immutable storage via Pinata
* **Tor** - Anonymous .onion service access
* **DHT** - Decentralized content discovery
* **Web Gateway** - Fast HTTP fallback

= Use Cases =

* Journalists in restrictive regions
* Whistleblowers and activists
* Content creators seeking permanence
* Researchers sharing uncensorable data
* Anyone wanting censorship-resistant publishing

= Requirements =

* WordPress 6.0 or higher
* PHP 8.0 or higher
* PressProtocol Backend API (production: https://api.pressprotocol.com)
* (Optional) Ethereum wallet for authenticated publishing

== Installation ==

= Automatic Installation =

1. Go to Plugins > Add New
2. Search for "PressProtocol"
3. Click Install Now
4. Activate the plugin

= Manual Installation =

1. Download the plugin ZIP file
2. Go to Plugins > Add New > Upload Plugin
3. Choose the ZIP file and click Install Now
4. Activate the plugin

= Configuration =

1. Go to **PressProtocol > Settings**
2. **Backend API URL** is pre-configured to `https://api.pressprotocol.com`
3. Click **Test Connection** to verify
4. (Optional) Enter your **Ethereum wallet address** for authenticated publishing
5. Click **Save Settings**

= First Publish =

1. Create or edit a post
2. Look for **PressProtocol Publishing** meta box in the sidebar
3. Click **Publish to PressProtocol**
4. Wait 10-30 seconds for processing
5. Copy your `https://pressprotocol.com/read/{CID}` share link!

== Frequently Asked Questions ==

= Do I need to run my own backend? =

The plugin comes pre-configured with the production PressProtocol backend. You can also run your own backend for full control. See documentation for setup instructions.

= Is my content really censorship-resistant? =

Yes! Content is stored on IPFS (distributed across multiple nodes) and accessible via Tor (anonymous network). There's no single point of failure or censorship.

= Can I publish anonymously? =

Absolutely! Leave the wallet address empty in settings. Each publish will use a fresh ephemeral identity with maximum privacy.

= What happens to my WordPress posts? =

They remain unchanged in WordPress. PressProtocol creates a separate, standalone copy on the decentralized network.

= How do readers access my content? =

They can use:
- `https://pressprotocol.com/read/{CID}` links (public)
- IPFS gateway URLs (public)
- Tor .onion URLs (anonymous)
- Web gateway (fast)

= Is content signed cryptographically? =

Yes! All content is signed with Ed25519 keys. Readers can verify authenticity using your public key.

= Can I update published content? =

IPFS content is immutable. To update, republish the post (creates new CID). Future versions will support IPNS for mutable content.

= What about images and media? =

Featured images are included in the published HTML. External images are referenced by URL. For full decentralization, upload images to IPFS separately.

= Does this work with custom post types? =

Yes! You can extend the plugin to support custom post types using WordPress hooks. See documentation.

= How much does it cost? =

The plugin is free and open source (MIT license). You'll need:
- IPFS storage (Pinata free tier: 1GB)
- Backend hosting (can run on free tier)
- (Optional) Domain and SSL certificate

== Screenshots ==

1. Post editor with PressProtocol publish button and status
2. Admin dashboard showing all publications with stats
3. Settings page with API configuration and connection test
4. Published content meta box with mirror links
5. Beautiful standalone HTML output on IPFS

== Changelog ==

= 1.1.0 =
* Tor v3 Onion integration: direct circuit persistence in post meta and live Tor link in sovereign badge
* Updated default API endpoint to production PressProtocol gateway (https://api.pressprotocol.com)
* Enhanced censorship-resistant syndication with RFC 8032 Ed25519 signing validation
* Multi-transport fallback and health probe reliability improvements

= 1.0.0 - 2024-10-14 =
* Initial release
* IPFS publishing via Pinata API
* Tor onion service creation
* DHT announcement for discovery
* Anonymous publishing mode (no wallet required)
* Authenticated publishing mode (Ethereum wallet)
* Ed25519 cryptographic signing
* Mirror health checks
* Connection testing
* WordPress dashboard integration
* Responsive HTML generation
* Featured image support
* Category and tag extraction
* WordPress hooks and filters for extensibility
* Comprehensive error handling
* Real-time status updates

== Upgrade Notice ==

= 1.0.0 =
Initial release of PressProtocol. Publish censorship-resistant content to IPFS, Tor, and DHT with one click!

== Technical Details ==

= Architecture =

WordPress Plugin → Backend API → IPFS + Tor + DHT

= API Endpoints =

* `POST /api/content` - Publish content
* `GET /api/content/:cid` - Retrieve content
* `GET /api/mirrors/:cid/health` - Check mirrors
* `POST /api/identity` - Create identity

= Database =

Plugin creates `wp_anonpress_publications` table to track publications locally.

= WordPress Hooks =

**Actions:**
* `anonpress_before_publish` - Before publishing
* `anonpress_after_publish` - After successful publish

**Filters:**
* `anonpress_prepare_content` - Modify content before publishing
* `anonpress_show_author` - Control author display

= Security =

* CSRF protection with nonces
* Input validation and sanitization
* Capability checks
* Optional private key encryption
* Anonymous mode for maximum privacy

== Support ==

* **Documentation**: https://docs.pressprotocol.com
* **GitHub**: https://github.com/pressprotocol/wordpress-plugin
* **Issues**: https://github.com/pressprotocol/wordpress-plugin/issues
* **Email**: support@pressprotocol.com

== Privacy Policy ==

PressProtocol respects your privacy:

* **Anonymous Mode**: No personal data collected or stored
* **Authenticated Mode**: Only wallet address stored (no private keys in plaintext)
* **Content**: Published to public decentralized networks (IPFS, Tor)
* **Backend API**: May log requests for debugging (check your backend provider's policy)

== License ==

This plugin is licensed under the MIT License. See LICENSE file for details.

== Credits ==

Built with:
* IPFS (InterPlanetary File System)
* Tor (The Onion Router)
* Pinata (IPFS pinning service)
* Ed25519 cryptographic signatures

== Roadmap ==

Planned features:
* IPNS support for mutable content
* Arweave integration for permanent storage
* MetaMask integration for wallet connection
* Bulk publishing
* Content analytics
* Custom HTML templates
* Media optimization
* Scheduled publishing Hackathon

== Support ==

* Documentation: https://docs.pressprotocol.com
* GitHub: https://github.com/pressprotocol
