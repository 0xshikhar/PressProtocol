<?php
/**
 * Plugin Name: PressProtocol Plugin
 * Plugin URI: https://pressprotocol.com
 * Description: Publish your WordPress content to a decentralized, censorship-resistant network (IPFS + Tor)
 * Version: 1.0.0
 * Author: PressProtocol Team
 * Author URI: https://pressprotocol.com
 * License: MIT
 * Text Domain: pressprotocol
 */

if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('ANONPRESS_VERSION', '1.0.0');
define('ANONPRESS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ANONPRESS_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include files
require_once ANONPRESS_PLUGIN_DIR . 'includes/class-anonpress-settings.php';
require_once ANONPRESS_PLUGIN_DIR . 'includes/class-anonpress-publisher.php';
require_once ANONPRESS_PLUGIN_DIR . 'includes/class-anonpress-api-client.php';
require_once ANONPRESS_PLUGIN_DIR . 'includes/class-anonpress-identity.php';

/**
 * Main AnonPress class
 */
class AnonPress {
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->init_hooks();
    }
    
    private function init_hooks() {
        // Activation/Deactivation
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Admin hooks
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('add_meta_boxes', array($this, 'add_meta_box'));
        
        // AJAX actions
        add_action('wp_ajax_anonpress_publish', array($this, 'ajax_publish'));
        add_action('wp_ajax_anonpress_check_status', array($this, 'ajax_check_status'));

        // Frontend hooks
        add_filter('the_content', array($this, 'append_sovereign_badge'));
    }
    
    public function activate() {
        // Create database tables if needed
        global $wpdb;
        $table_name = $wpdb->prefix . 'anonpress_publications';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            post_id bigint(20) NOT NULL,
            cid varchar(100) NOT NULL,
            ipfs_url varchar(255) NOT NULL,
            tor_url varchar(255) NOT NULL,
            gateway_url varchar(255) NOT NULL,
            published_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY post_id (post_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    public function deactivate() {
        // Cleanup if needed
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'PressProtocol',
            'PressProtocol',
            'manage_options',
            'anonpress',
            array($this, 'render_dashboard'),
            'dashicons-shield-alt',
            30
        );
        
        add_submenu_page(
            'anonpress',
            'Settings',
            'Settings',
            'manage_options',
            'anonpress-settings',
            array('AnonPress_Settings', 'render_page')
        );
    }
    
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'anonpress') !== false || $hook === 'post.php' || $hook === 'post-new.php') {
            wp_enqueue_style('anonpress-admin', ANONPRESS_PLUGIN_URL . 'assets/admin.css', array(), ANONPRESS_VERSION);
            wp_enqueue_script('anonpress-admin', ANONPRESS_PLUGIN_URL . 'assets/admin.js', array('jquery'), ANONPRESS_VERSION, true);
            
            wp_localize_script('anonpress-admin', 'anonpressData', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('anonpress_nonce'),
            ));
        }
    }
    
    public function add_meta_box() {
        add_meta_box(
            'anonpress_publish',
            'PressProtocol Publishing',
            array($this, 'render_meta_box'),
            array('post', 'page'),
            'side',
            'high'
        );
    }
    
    public function render_meta_box($post) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'anonpress_publications';
        
        $publication = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE post_id = %d ORDER BY id DESC LIMIT 1",
            $post->ID
        ));
        
        wp_nonce_field('anonpress_meta_box', 'anonpress_meta_box_nonce');
        
        include ANONPRESS_PLUGIN_DIR . 'templates/meta-box.php';
    }
    
    public function render_dashboard() {
        include ANONPRESS_PLUGIN_DIR . 'templates/dashboard.php';
    }
    
    public function ajax_publish() {
        check_ajax_referer('anonpress_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Unauthorized');
        }
        
        $post_id = intval($_POST['post_id']);
        $post = get_post($post_id);
        
        if (!$post) {
            wp_send_json_error('Post not found');
        }
        
        $publisher = new AnonPress_Publisher();
        $result = $publisher->publish_post($post);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        }
        
        wp_send_json_success($result);
    }
    
    public function ajax_check_status() {
        check_ajax_referer('anonpress_nonce', 'nonce');
        
        $cid = sanitize_text_field($_POST['cid']);
        
        $api_client = new AnonPress_API_Client();
        $mirrors = $api_client->check_mirror_health($cid);
        
        if (is_wp_error($mirrors)) {
            wp_send_json_error($mirrors->get_error_message());
        }
        
        wp_send_json_success($mirrors);
    }

    /**
     * Appends sovereign cryptographic verification badge to single posts
     */
    public function append_sovereign_badge($content) {
        if (!is_singular('post') || !in_the_loop() || !is_main_query()) {
            return $content;
        }

        global $post;
        if (!$post) {
            return $content;
        }

        $cid = get_post_meta($post->ID, '_pressprotocol_cid', true);
        if (empty($cid)) {
            $cid = get_post_meta($post->ID, '_anonpress_cid', true);
        }

        if (empty($cid)) {
            return $content;
        }

        $read_url = 'https://pressprotocol.com/read/' . esc_attr($cid);
        $embed_url = 'https://pressprotocol.com/embed/' . esc_attr($cid) . '?theme=cyber';

        $badge_html = '
        <div class="pressprotocol-sovereign-badge" style="margin-top: 2.5rem; padding: 1.25rem 1.5rem; background: #09090b; border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #f4f4f5; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981;"></span>
                    <strong style="color: #06b6d4; font-size: 0.85rem; letter-spacing: 0.05em; text-transform: uppercase;">Verified Sovereign Publication</strong>
                </div>
                <span style="font-size: 0.75rem; color: #71717a;">RFC 8032 Ed25519 Signed</span>
            </div>
            <p style="margin: 0 0 0.75rem 0; font-size: 0.8rem; line-height: 1.5; color: #a1a1aa;">
                This post is cryptographically signed and syndicated to the decentralized censorship-resistant web across IPFS and Tor v3 onion services.
            </p>
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; font-size: 0.75rem;">
                <div style="color: #71717a;">
                    CID: <code style="color: #22d3ee; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px;">' . esc_html(substr($cid, 0, 16)) . '...' . esc_html(substr($cid, -8)) . '</code>
                </div>
                <div style="display: flex; gap: 0.75rem;">
                    <a href="' . esc_url($read_url) . '" target="_blank" rel="noopener noreferrer" style="color: #06b6d4; text-decoration: none; font-weight: 600;">↗ Open Reader</a>
                    <a href="' . esc_url($embed_url) . '" target="_blank" rel="noopener noreferrer" style="color: #a1a1aa; text-decoration: none;">↗ Inspect Embed</a>
                </div>
            </div>
        </div>';

        return $content . $badge_html;
    }
}

// Initialize plugin
AnonPress::get_instance();
