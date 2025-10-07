<div class="anonpress-meta-box">
    <?php if ($publication): ?>
        <div class="anonpress-published">
            <p class="success">✅ Published to AnonPress</p>
            
            <div class="publication-info">
                <div class="info-row">
                    <strong>CID:</strong>
                    <code><?php echo esc_html($publication->cid); ?></code>
                </div>
                
                <div class="info-row">
                    <strong>Share URL:</strong>
                    <input type="text" readonly value="anonpress://<?php echo esc_attr($publication->cid); ?>" class="widefat" onclick="this.select()" />
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
                    <button type="button" class="button" onclick="navigator.clipboard.writeText('anonpress://<?php echo esc_js($publication->cid); ?>')">
                        Copy Share Link
                    </button>
                </div>
            </div>
            
            <p class="published-date">
                <small>Published: <?php echo esc_html($publication->published_at); ?></small>
            </p>
            
            <button type="button" class="button button-primary button-large" id="anonpress-republish" data-post-id="<?php echo esc_attr($post->ID); ?>">
                Republish to AnonPress
            </button>
        </div>
    <?php else: ?>
        <div class="anonpress-unpublished">
            <p>This post has not been published to AnonPress yet.</p>
            
            <?php if (empty(get_option('anonpress_wallet_address'))): ?>
                <p class="notice notice-warning">
                    ⚠️ Please configure your wallet address in <a href="<?php echo admin_url('admin.php?page=anonpress-settings'); ?>">AnonPress Settings</a> first.
                </p>
            <?php else: ?>
                <button type="button" class="button button-primary button-large" id="anonpress-publish" data-post-id="<?php echo esc_attr($post->ID); ?>">
                    🚀 Publish to AnonPress
                </button>
                
                <p class="description">
                    Your content will be published to IPFS, Tor, and gateway mirrors for censorship-resistant access.
                </p>
            <?php endif; ?>
        </div>
    <?php endif; ?>
    
    <div id="anonpress-status" style="display: none;"></div>
</div>
