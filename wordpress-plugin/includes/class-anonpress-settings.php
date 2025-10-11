<?php

class AnonPress_Settings {
    
    public static function init() {
        add_action('admin_init', array(__CLASS__, 'register_settings'));
        add_action('wp_ajax_anonpress_test_connection', array(__CLASS__, 'ajax_test_connection'));
    }
    
    public static function register_settings() {
        register_setting('anonpress_settings', 'anonpress_api_url', array(
            'sanitize_callback' => array(__CLASS__, 'sanitize_api_url'),
        ));
        register_setting('anonpress_settings', 'anonpress_wallet_address', array(
            'sanitize_callback' => array(__CLASS__, 'sanitize_wallet_address'),
        ));
        register_setting('anonpress_settings', 'anonpress_public_key');
        register_setting('anonpress_settings', 'anonpress_private_key');
        
        add_settings_section(
            'anonpress_main_section',
            'API Configuration',
            array(__CLASS__, 'section_callback'),
            'anonpress-settings'
        );
        
        add_settings_field(
            'anonpress_api_url',
            'Backend API URL',
            array(__CLASS__, 'api_url_callback'),
            'anonpress-settings',
            'anonpress_main_section'
        );
        
        add_settings_field(
            'anonpress_wallet_address',
            'Wallet Address',
            array(__CLASS__, 'wallet_address_callback'),
            'anonpress-settings',
            'anonpress_main_section'
        );
        
        add_settings_field(
            'anonpress_public_key',
            'Public Key',
            array(__CLASS__, 'public_key_callback'),
            'anonpress-settings',
            'anonpress_main_section'
        );
    }
    
    public static function section_callback() {
        echo '<p>Configure your AnonPress backend API connection and identity.</p>';
        echo '<p><strong>Note:</strong> Wallet address is optional. You can publish anonymously without it.</p>';
    }
    
    public static function api_url_callback() {
        $value = get_option('anonpress_api_url', 'http://localhost:4000');
        echo '<input type="text" id="anonpress_api_url" name="anonpress_api_url" value="' . esc_attr($value) . '" class="regular-text" />';
        echo ' <button type="button" id="anonpress-test-connection" class="button">Test Connection</button>';
        echo '<div id="connection-status" style="margin-top: 10px;"></div>';
        echo '<p class="description">URL of your AnonPress backend API (default: http://localhost:4000)</p>';
    }
    
    public static function wallet_address_callback() {
        $value = get_option('anonpress_wallet_address', '');
        echo '<input type="text" name="anonpress_wallet_address" value="' . esc_attr($value) . '" class="regular-text" placeholder="0x..." />';
        echo '<p class="description">Your Ethereum wallet address for identity (optional - leave empty for anonymous publishing)</p>';
    }
    
    public static function public_key_callback() {
        $value = get_option('anonpress_public_key', '');
        echo '<textarea name="anonpress_public_key" rows="4" class="large-text" readonly>' . esc_textarea($value) . '</textarea>';
        echo '<p class="description">Your Ed25519 public key (generated automatically on first publish)</p>';
    }
    
    public static function render_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        include ANONPRESS_PLUGIN_DIR . 'templates/settings.php';
    }
    
    public static function sanitize_api_url($value) {
        $value = trim($value);
        $value = rtrim($value, '/');
        
        if (!filter_var($value, FILTER_VALIDATE_URL)) {
            add_settings_error(
                'anonpress_api_url',
                'invalid_url',
                'Please enter a valid URL for the API endpoint'
            );
            return get_option('anonpress_api_url', 'http://localhost:4000');
        }
        
        return $value;
    }
    
    public static function sanitize_wallet_address($value) {
        $value = trim($value);
        
        if (empty($value)) {
            return '';
        }
        
        if (!preg_match('/^0x[a-fA-F0-9]{40}$/', $value)) {
            add_settings_error(
                'anonpress_wallet_address',
                'invalid_address',
                'Please enter a valid Ethereum wallet address (must start with 0x and be 42 characters)'
            );
            return get_option('anonpress_wallet_address', '');
        }
        
        return strtolower($value);
    }
    
    public static function ajax_test_connection() {
        check_ajax_referer('anonpress_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Unauthorized');
        }
        
        $api_client = new AnonPress_API_Client();
        $result = $api_client->test_connection();
        
        if ($result['success']) {
            wp_send_json_success($result['message']);
        } else {
            wp_send_json_error($result['error']);
        }
    }
}

AnonPress_Settings::init();
