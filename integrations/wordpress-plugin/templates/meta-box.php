<div class="anonpress-meta-box">
    <?php if ($publication): ?>
        <div class="anonpress-published">
            <p class="success">✅ Published to PressProtocol</p>
            
            <div class="publication-info">
                <div class="info-row">
                    <strong>CID:</strong>
                    <code><?php echo esc_html($publication->cid); ?></code>
                </div>
                
                <div class="info-row">
                    <strong>Share URL:</strong>
                    <input type="text" readonly value="https://pressprotocol.com/read/<?php echo esc_attr($publication->cid); ?>" class="widefat" onclick="this.select()" />
                </div>

                <div class="info-row" style="margin-top: 10px;">
                    <strong>Sovereign Embed Code:</strong>
                    <textarea readonly class="widefat" rows="3" style="font-family: monospace; font-size: 11px;" onclick="this.select()">&lt;iframe src="https://pressprotocol.com/embed/<?php echo esc_attr($publication->cid); ?>?theme=cyber" width="100%" height="600" frameborder="0" loading="lazy" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups"&gt;&lt;/iframe&gt;</textarea>
                </div>
                
                <div class="mirrors">
                    <h4>Mirrors:</h4>
                    
                    <?php if ($publication->ipfs_url): ?>
                    <div class="mirror-item">
                        <span class="mirror-type">IPFS:</span>
                        <a href="<?php echo esc_url($publication->ipfs_url); ?>" target="_blank" class="mirror-url">
                            <?php echo esc_html($publication->ipfs_url); ?>
                        </a>
                        <span class="status available">✓</span>
                    </div>
                    <?php endif; ?>
                    
                    <?php if ($publication->tor_url): ?>
                    <div class="mirror-item">
                        <span class="mirror-type">Tor:</span>
                        <span class="mirror-url"><?php echo esc_html($publication->tor_url); ?></span>
                        <span class="status available">✓</span>
                    </div>
                    <?php endif; ?>
                    
                    <?php if ($publication->gateway_url): ?>
                    <div class="mirror-item">
                        <span class="mirror-type">Gateway:</span>
                        <a href="<?php echo esc_url($publication->gateway_url); ?>" target="_blank" class="mirror-url">
                            View
                        </a>
                        <span class="status available">✓</span>
                    </div>
                    <?php endif; ?>
                </div>
                
                <div class="actions">
                    <button type="button" class="button" id="anonpress-check-status" data-cid="<?php echo esc_attr($publication->cid); ?>">
                        Check Mirror Status
                    </button>
                    <button type="button" class="button" onclick="navigator.clipboard.writeText('https://pressprotocol.com/read/<?php echo esc_js($publication->cid); ?>')">
                        Copy Share Link
                    </button>
                </div>
            </div>
            
            <p class="published-date">
                <small>Published: <?php echo esc_html($publication->published_at); ?></small>
            </p>
            
            <button type="button" class="button button-primary button-large" id="anonpress-republish" data-post-id="<?php echo esc_attr($post->ID); ?>">
                Republish to PressProtocol
            </button>
        </div>
    <?php else: ?>
        <div class="anonpress-unpublished">
            <p>This post has not been published to PressProtocol yet.</p>
            
            <?php if (empty(get_option('anonpress_wallet_address'))): ?>
                <p class="notice notice-info" style="background: #e7f3ff; border-left-color: #2196F3;">
                    ℹ️ <strong>Anonymous Publishing Mode:</strong> No wallet configured. Content will be published with a temporary identity. <a href="<?php echo admin_url('admin.php?page=anonpress-settings'); ?>">Add wallet</a> for persistent identity.
                </p>
            <?php else: ?>
                <p class="notice notice-success" style="background: #e8f5e9; border-left-color: #4CAF50;">
                    ✓ <strong>Authenticated Publishing Mode:</strong> Content will be signed with your wallet identity.
                </p>
            <?php endif; ?>
            
            <button type="button" class="button button-primary button-large" id="anonpress-publish" data-post-id="<?php echo esc_attr($post->ID); ?>">
                🚀 Publish to PressProtocol
            </button>
            
            <p class="description">
                Your content will be published to IPFS, Tor, and gateway mirrors for censorship-resistant access.
            </p>
        </div>
    <?php endif; ?>
    
    <div id="anonpress-status" style="display: none;"></div>
</div>
