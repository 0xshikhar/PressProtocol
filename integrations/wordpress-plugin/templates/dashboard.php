<div class="wrap">
    <h1>PressProtocol Dashboard</h1>
    
    <div class="anonpress-dashboard">
        <?php
        global $wpdb;
        $table_name = $wpdb->prefix . 'anonpress_publications';
        
        $publications = $wpdb->get_results(
            "SELECT p.*, posts.post_title 
             FROM $table_name p 
             LEFT JOIN {$wpdb->posts} posts ON p.post_id = posts.ID 
             ORDER BY p.published_at DESC 
             LIMIT 20"
        );
        ?>
        
        <div class="anonpress-stats">
            <div class="stat-card">
                <h3><?php echo count($publications); ?></h3>
                <p>Published Posts</p>
            </div>
            
            <div class="stat-card">
                <h3><?php echo get_option('anonpress_wallet_address') ? '✓' : '✗'; ?></h3>
                <p>Wallet Connected</p>
            </div>
            
            <div class="stat-card">
                <h3><?php echo get_option('anonpress_public_key') ? '✓' : '✗'; ?></h3>
                <p>Identity Created</p>
            </div>
        </div>
        
        <?php if (empty(get_option('anonpress_wallet_address'))): ?>
            <div class="notice notice-warning">
                <p>
                    <strong>Setup Required:</strong> 
                    Please <a href="<?php echo admin_url('admin.php?page=anonpress-settings'); ?>">configure your wallet address</a> to start publishing (optional - can publish anonymously).
                </p>
            </div>
        <?php endif; ?>
        
        <h2>Recent Publications</h2>
        
        <?php if (empty($publications)): ?>
            <div class="anonpress-empty">
                <p>No publications yet. Start by publishing a post!</p>
                <a href="<?php echo admin_url('post-new.php'); ?>" class="button button-primary">Create New Post</a>
            </div>
        <?php else: ?>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>Post Title</th>
                        <th>CID</th>
                        <th>Published</th>
                        <th>Mirrors</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($publications as $pub): ?>
                        <tr>
                            <td>
                                <strong>
                                    <a href="<?php echo get_edit_post_link($pub->post_id); ?>">
                                        <?php echo esc_html($pub->post_title ?: 'Untitled'); ?>
                                    </a>
                                </strong>
                            </td>
                            <td>
                                <code><?php echo esc_html(substr($pub->cid, 0, 12)); ?>...</code>
                            </td>
                            <td>
                                <?php echo esc_html(mysql2date('Y-m-d H:i', $pub->published_at)); ?>
                            </td>
                            <td>
                                <span class="mirror-badge" title="IPFS">📦</span>
                                <span class="mirror-badge" title="Tor">🧅</span>
                                <span class="mirror-badge" title="Gateway">🌐</span>
                            </td>
                            <td>
                                <a href="<?php echo esc_url($pub->gateway_url); ?>" target="_blank" class="button button-small">View</a>
                                <button class="button button-small" onclick="navigator.clipboard.writeText('https://pressprotocol.com/read/<?php echo esc_js($pub->cid); ?>')">Copy Link</button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</div>
