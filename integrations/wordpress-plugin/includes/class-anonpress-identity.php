<?php

class AnonPress_Identity {
    
    /**
     * Get or create identity for user
     */
    public static function get_or_create_identity($wallet_address) {
        // The signing keypair is generated and kept locally by AnonPress_Signer
        return array(
            'publicKey' => AnonPress_Signer::get_public_key_hex(),
        );
    }
}
