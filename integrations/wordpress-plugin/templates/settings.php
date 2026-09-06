<div class="wrap">
    <h1>PressProtocol Settings</h1>
    
    <?php settings_errors(); ?>
    
    <div class="anonpress-settings-page">
        <div class="settings-main">
            <form method="post" action="options.php">
                <?php
                settings_fields('anonpress_settings');
                do_settings_sections('anonpress-settings');
                submit_button('Save Settings');
                ?>
            </form>
        </div>
        
        <div class="settings-sidebar">
            <div class="sidebar-card">
                <h3>📖 Quick Start</h3>
                <ol>
                    <li>Enter your wallet address</li>
                    <li>Configure Backend API URL (if self-hosting)</li>
                    <li>Create or edit a post</li>
                    <li>Click "Publish to PressProtocol" button</li>
                    <li>Share the pressprotocol.com link</li>
                </ol>
            </div>
            
            <div class="sidebar-card">
                <h3>ℹ️ About</h3>
                <p>
                    PressProtocol publishes your WordPress content to a decentralized network:
                </p>
                <ul>
                    <li><strong>IPFS</strong> - Distributed storage</li>
                    <li><strong>Tor</strong> - Anonymous access</li>
                    <li><strong>Gateway</strong> - Web fallback</li>
                </ul>
            </div>
            
            <div class="sidebar-card">
                <h3>🔗 Resources</h3>
                <ul>
                    <li><a href="https://pressprotocol.com" target="_blank">Website</a></li>
                    <li><a href="https://docs.pressprotocol.com" target="_blank">Documentation</a></li>
                    <li><a href="https://github.com/pressprotocol" target="_blank">GitHub</a></li>
                </ul>
            </div>
            
            <div class="sidebar-card">
                <h3>⚙️ System Status</h3>
                <div id="anonpress-system-status">
                    <p>Loading...</p>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    // Check system status
    $.get('<?php echo get_option('anonpress_api_url', 'https://api.pressprotocol.com'); ?>/health')
        .done(function(data) {
            $('#anonpress-system-status').html(
                '<p class="status-ok">✅ Backend API: Connected</p>' +
                '<p><small>Service: ' + data.service + '</small></p>'
            );
        })
        .fail(function() {
            $('#anonpress-system-status').html(
                '<p class="status-error">❌ Backend API: Not Connected</p>' +
                '<p><small>Check your API URL setting</small></p>'
            );
        });
});
</script>
