=== AnonPress ===
Contributors: anonpress
Tags: ipfs, decentralized, censorship-resistant, tor, publishing
Requires at least: 6.0
Tested up to: 6.4
Requires PHP: 8.0
Stable tag: 1.0.0
License: MIT
License URI: https://opensource.org/licenses/MIT

Publish your WordPress content to a decentralized, censorship-resistant network (IPFS + Tor).

== Description ==

AnonPress enables censorship-resistant publishing by distributing your WordPress content across multiple decentralized networks:

* **IPFS** - Distributed storage that can't be taken down
* **Tor** - Anonymous onion services for private access
* **Gateway Mirrors** - Web-accessible fallback

= Key Features =

* One-click publishing from WordPress editor
* Automatic multi-network distribution
* Ed25519 cryptographic content signing
* Mirror health monitoring
* Shareable `anonpress://` links
* Local WordPress publishing (run your own node)

= How It Works =

1. Write content in WordPress as usual
2. Click "Publish to AnonPress" button
3. Content is uploaded to IPFS, published to Tor, and mirrored
4. Receive shareable `anonpress://` link
5. Readers can access via browser extension or web gateway

= Requirements =

* WordPress 6.0+
* PHP 8.0+
* AnonPress Backend API (self-hosted or managed)
* Wallet address for identity

== Installation ==

1. Upload `anonpress` folder to `/wp-content/plugins/`
2. Activate the plugin through 'Plugins' menu
3. Go to AnonPress > Settings
4. Configure your wallet address and API URL
5. Start publishing!

== Frequently Asked Questions ==

= Do I need to run my own backend? =

For the hackathon demo, a managed backend is provided. For production use, you can self-host the AnonPress backend.

= Is my content truly censorship-resistant? =

Yes. Once published to IPFS and Tor, your content is distributed across the network and cannot be taken down by any single entity.

= Can readers access content without the extension? =

Yes. The web gateway provides fallback access, though the browser extension provides better routing and automatic mirror selection.

= How do I get Pinata API keys? =

Sign up at pinata.cloud and create an API key. This is used for IPFS uploads.

== Screenshots ==

1. Meta box on post editor
2. Dashboard showing publications
3. Settings page
4. Mirror status display

== Changelog ==

= 1.0.0 =
* Initial release
* IPFS publishing via Pinata
* Tor onion service creation
* Ed25519 identity management
* Mirror health checks
* WordPress admin integration

== Upgrade Notice ==

= 1.0.0 =
Initial release for RealFi Hackathon

== Support ==

* Documentation: https://docs.anonpress.io
* GitHub: https://github.com/anonpress
* Issues: https://github.com/anonpress/wordpress-plugin/issues
