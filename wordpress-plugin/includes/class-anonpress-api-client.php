<?php

class AnonPress_API_Client {
    private $api_url;
    
    public function __construct() {
        $this->api_url = get_option('anonpress_api_url', 'http://localhost:4000');
    }
    
    /**
     * Publish content to AnonPress backend
     */
    public function publish_content($title, $content, $tags, $wallet_address) {
        $endpoint = $this->api_url . '/api/content';
        
        $data = array(
            'title' => $title,
            'content' => $content,
            'tags' => $tags,
            'walletAddress' => $wallet_address,
        );
        
        $response = wp_remote_post($endpoint, array(
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'body' => wp_json_encode($data),
            'timeout' => 60,
        ));
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);
        
        if (!$result || !$result['success']) {
            return new WP_Error('api_error', $result['error'] ?? 'Failed to publish content');
        }
        
        return $result['data'];
    }
    
    /**
     * Get content by CID
     */
    public function get_content($cid) {
        $endpoint = $this->api_url . '/api/content/' . urlencode($cid);
        
        $response = wp_remote_get($endpoint, array(
            'timeout' => 30,
        ));
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);
        
        if (!$result || !$result['success']) {
            return new WP_Error('api_error', 'Failed to fetch content');
        }
        
        return $result['data'];
    }
    
    /**
     * Check mirror health
     */
    public function check_mirror_health($cid) {
        $endpoint = $this->api_url . '/api/mirrors/' . urlencode($cid) . '/health';
        
        $response = wp_remote_get($endpoint, array(
            'timeout' => 30,
        ));
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);
        
        if (!$result || !$result['success']) {
            return new WP_Error('api_error', 'Failed to check mirror health');
        }
        
        return $result['data'];
    }
    
    /**
     * Create identity
     */
    public function create_identity($wallet_address) {
        $endpoint = $this->api_url . '/api/identity';
        
        $data = array(
            'walletAddress' => $wallet_address,
        );
        
        $response = wp_remote_post($endpoint, array(
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'body' => wp_json_encode($data),
            'timeout' => 30,
        ));
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);
        
        if (!$result || !$result['success']) {
            return new WP_Error('api_error', 'Failed to create identity');
        }
        
        return $result['data'];
    }
}
