<?php

class AnonPress_Settings {
    
    public static function init() {
        add_action('admin_init', array(__CLASS__, 'register_settings'));
    }
    
    public static function register_settings() {
        register_setting('anonpress_settings', 'anonpress_api_url');
        register_setting('anonpress_settings', 'anonpress_wallet_address');
        register_setting('anonpress_settings', 'anonpress_public_key');
        
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
    }
    
    public static function api_url_callback() {
        $value = get_option('anonpress_api_url', 'http://localhost:4000');
        echo '<input type="text" name="anonpress_api_url" value="' . esc_attr($value) . '" class="regular-text" />';
        echo '<p class="description">URL of your AnonPress backend API (default: http://localhost:4000)</p>';
    }
    
    public static function wallet_address_callback() {
        $value = get_option('anonpress_wallet_address', '');
        echo '<input type="text" name="anonpress_wallet_address" value="' . esc_attr($value) . '" class="regular-text" />';
        echo '<p class="description">Your Ethereum wallet address for identity</p>';
    }
    
    public static function public_key_callback() {
        $value = get_option('anonpress_public_key', '');
        echo '<textarea name="anonpress_public_key" rows="4" class="large-text">' . esc_textarea($value) . '</textarea>';
        echo '<p class="description">Your Ed25519 public key (generated automatically on first publish)</p>';
    }
    
    public static function render_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        include ANONPRESS_PLUGIN_DIR . 'templates/settings.php';
    }
}

AnonPress_Settings::init();
