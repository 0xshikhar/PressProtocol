<?php

class AnonPress_API_Client {
    private $api_url;
    private $timeout_default = 30;
    private $timeout_publish = 60;
    
    public function __construct() {
        $this->api_url = rtrim(get_option('anonpress_api_url', 'http://localhost:4000'), '/');
    }
    
    /**
     * Test API connection
     */
    public function test_connection() {
        $endpoint = $this->api_url . '/api/content?limit=1';
        
        $response = wp_remote_get($endpoint, array(
            'timeout' => 10,
        ));
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'error' => $response->get_error_message(),
            );
        }
        
        $code = wp_remote_retrieve_response_code($response);
        if ($code !== 200) {
            return array(
                'success' => false,
                'error' => 'API returned status code: ' . $code,
            );
        }
        
        return array(
            'success' => true,
            'message' => 'Successfully connected to AnonPress backend',
        );
    }
    
    /**
     * Publish content to AnonPress backend
     */
    public function publish_content($title, $content, $tags, $wallet_address, $private_key = null) {
        $endpoint = $this->api_url . '/api/content';
        
        $data = array(
            'title' => $title,
            'content' => $content,
            'tags' => $tags,
        );
        
        // Add wallet address for authenticated publishing
        if (!empty($wallet_address)) {
            $data['walletAddress'] = $wallet_address;
        }
        
        // Add private key if available (for signing)
        if (!empty($private_key)) {
            $data['privateKey'] = $private_key;
        }
        
        $response = wp_remote_post($endpoint, array(
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'body' => wp_json_encode($data),
            'timeout' => $this->timeout_publish,
        ));
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);
        
        // Handle different HTTP status codes
        if ($code !== 201 && $code !== 200) {
            $error_message = isset($result['error']) ? $result['error'] : "API returned status code: {$code}";
            return new WP_Error('api_error', $error_message);
        }
        
        if (!$result || !isset($result['success']) || !$result['success']) {
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
            'timeout' => $this->timeout_default,
        ));
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);
        
        if ($code === 404) {
            return new WP_Error('not_found', 'Content not found');
        }
        
        if ($code !== 200) {
            return new WP_Error('api_error', "API returned status code: {$code}");
        }
        
        if (!$result || !isset($result['success']) || !$result['success']) {
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
            'timeout' => $this->timeout_default,
        ));
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);
        
        if ($code !== 200) {
            return new WP_Error('api_error', "API returned status code: {$code}");
        }
        
        if (!$result || !isset($result['success']) || !$result['success']) {
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
            'timeout' => $this->timeout_default,
        ));
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);
        
        if ($code !== 201 && $code !== 200) {
            $error_message = isset($result['error']) ? $result['error'] : "API returned status code: {$code}";
            return new WP_Error('api_error', $error_message);
        }
        
        if (!$result || !isset($result['success']) || !$result['success']) {
            return new WP_Error('api_error', 'Failed to create identity');
        }
        
        return $result['data'];
    }
    
    /**
     * Get API statistics and health
     */
    public function get_health() {
        $endpoint = $this->api_url . '/health';
        
        $response = wp_remote_get($endpoint, array(
            'timeout' => 10,
        ));
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'error' => $response->get_error_message(),
            );
        }
        
        $code = wp_remote_retrieve_response_code($response);
        if ($code !== 200) {
            return array(
                'success' => false,
                'error' => "Health check failed with code: {$code}",
            );
        }
        
        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);
        
        return array(
            'success' => true,
            'data' => $result,
        );
    }
}
