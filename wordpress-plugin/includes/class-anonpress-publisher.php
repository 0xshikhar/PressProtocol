<?php

class AnonPress_Publisher {
    
    /**
     * Publish a WordPress post to AnonPress
     */
    public function publish_post($post) {
        // Get wallet address from settings
        $wallet_address = get_option('anonpress_wallet_address');
        
        if (empty($wallet_address)) {
            return new WP_Error('no_wallet', 'Please configure your wallet address in AnonPress settings');
        }
        
        // Extract content
        $title = $post->post_title;
        $content = $this->prepare_content($post);
        $tags = $this->get_post_tags($post);
        
        // Publish via API
        $api_client = new AnonPress_API_Client();
        $result = $api_client->publish_content($title, $content, $tags, $wallet_address);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        // Store publication in database
        $this->store_publication($post->ID, $result);
        
        return $result;
    }
    
    /**
     * Prepare content for publishing
     */
    private function prepare_content($post) {
        $content = apply_filters('the_content', $post->post_content);
        
        // Create complete HTML
        $html = '<!DOCTYPE html>';
        $html .= '<html lang="en">';
        $html .= '<head>';
        $html .= '<meta charset="UTF-8">';
        $html .= '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
        $html .= '<title>' . esc_html($post->post_title) . '</title>';
        $html .= '<style>';
        $html .= $this->get_default_styles();
        $html .= '</style>';
        $html .= '</head>';
        $html .= '<body>';
        $html .= '<article>';
        $html .= '<header>';
        $html .= '<h1>' . esc_html($post->post_title) . '</h1>';
        $html .= '<div class="meta">';
        $html .= '<time datetime="' . get_the_date('c', $post) . '">' . get_the_date('', $post) . '</time>';
        $html .= '</div>';
        $html .= '</header>';
        $html .= '<div class="content">';
        $html .= $content;
        $html .= '</div>';
        
        // Add featured image if exists
        if (has_post_thumbnail($post)) {
            $html .= '<div class="featured-image">';
            $html .= get_the_post_thumbnail($post, 'large');
            $html .= '</div>';
        }
        
        $html .= '</article>';
        $html .= '<footer>';
        $html .= '<p>Published with <a href="https://anonpress.io">AnonPress</a></p>';
        $html .= '</footer>';
        $html .= '</body>';
        $html .= '</html>';
        
        return $html;
    }
    
    /**
     * Get default CSS styles
     */
    private function get_default_styles() {
        return '
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
                background: #f9fafb;
            }
            article {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 { font-size: 2.5rem; margin-bottom: 1rem; color: #111; }
            h2 { font-size: 2rem; margin: 1.5rem 0 1rem; }
            h3 { font-size: 1.5rem; margin: 1.5rem 0 1rem; }
            p { margin-bottom: 1rem; }
            .meta { color: #666; margin-bottom: 2rem; font-size: 0.9rem; }
            .content { margin-top: 2rem; }
            .content img { max-width: 100%; height: auto; border-radius: 4px; }
            .featured-image { margin-top: 2rem; }
            .featured-image img { width: 100%; border-radius: 4px; }
            footer { text-align: center; margin-top: 3rem; padding-top: 2rem; color: #666; }
            a { color: #0066cc; text-decoration: none; }
            a:hover { text-decoration: underline; }
            blockquote {
                border-left: 4px solid #ddd;
                padding-left: 1rem;
                margin: 1rem 0;
                color: #666;
            }
            code {
                background: #f4f4f4;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
            }
            pre {
                background: #f4f4f4;
                padding: 1rem;
                border-radius: 4px;
                overflow-x: auto;
                margin: 1rem 0;
            }
            ul, ol { margin: 1rem 0 1rem 2rem; }
            li { margin-bottom: 0.5rem; }
        ';
    }
    
    /**
     * Get post tags
     */
    private function get_post_tags($post) {
        $tags = array();
        
        $post_tags = get_the_tags($post->ID);
        if ($post_tags) {
            foreach ($post_tags as $tag) {
                $tags[] = $tag->name;
            }
        }
        
        $categories = get_the_category($post->ID);
        if ($categories) {
            foreach ($categories as $category) {
                $tags[] = $category->name;
            }
        }
        
        return array_unique($tags);
    }
    
    /**
     * Store publication in database
     */
    private function store_publication($post_id, $result) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'anonpress_publications';
        
        $wpdb->insert(
            $table_name,
            array(
                'post_id' => $post_id,
                'cid' => $result['cid'],
                'ipfs_url' => $result['mirrors']['ipfs'] ?? '',
                'tor_url' => $result['mirrors']['tor'] ?? '',
                'gateway_url' => $result['mirrors']['gateway'] ?? '',
            ),
            array('%d', '%s', '%s', '%s', '%s')
        );
    }
}
