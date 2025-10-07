<?php

class AnonPress_Identity {
    
    /**
     * Get or create identity for user
     */
    public static function get_or_create_identity($wallet_address) {
        $public_key = get_option('anonpress_public_key');
        
        if (!empty($public_key)) {
            return array(
                'publicKey' => $public_key,
            );
        }
        
        // Create new identity via API
        $api_client = new AnonPress_API_Client();
        $result = $api_client->create_identity($wallet_address);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        // Store public key
        update_option('anonpress_public_key', $result['publicKey']);
        
        // NOTE: Private key should be stored securely
        // For demo purposes, we're not storing it in WordPress
        // In production, use encrypted storage or hardware wallet
        
        return $result;
    }
}
