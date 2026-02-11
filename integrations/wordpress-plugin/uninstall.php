<?php
/**
 * Uninstall script for AnonPress plugin
 * 
 * This file is called when the plugin is deleted via WordPress admin.
 * It cleans up all plugin data from the database.
 */

// If uninstall not called from WordPress, exit
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

global $wpdb;

// Delete plugin options
delete_option('anonpress_api_url');
delete_option('anonpress_wallet_address');
delete_option('anonpress_public_key');
delete_option('anonpress_private_key');

// Delete plugin tables
$table_name = $wpdb->prefix . 'anonpress_publications';
$wpdb->query("DROP TABLE IF EXISTS {$table_name}");

// Delete post meta
$wpdb->query("DELETE FROM {$wpdb->postmeta} WHERE meta_key LIKE '_anonpress_%'");

// Clear any cached data
wp_cache_flush();
