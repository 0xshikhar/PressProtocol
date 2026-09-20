<?php

class AnonPress_Publisher {
    
    /**
     * Publish a WordPress post to AnonPress
     */
    public function publish_post($post) {
        // Validate post
        if (empty($post->post_title)) {
            return new WP_Error('invalid_post', 'Post must have a title');
        }
        
        if (empty($post->post_content)) {
            return new WP_Error('invalid_post', 'Post must have content');
        }
        
        // Get wallet address from settings (optional - can publish anonymously)
        $wallet_address = get_option('anonpress_wallet_address');
        $private_key = get_option('anonpress_private_key'); // Encrypted/hashed storage recommended
        
        // Allow hook to modify publishing behavior
        do_action('anonpress_before_publish', $post->ID);
        
        // Extract content
        $title = $post->post_title;
        $content = $this->prepare_content($post);
        $tags = $this->get_post_tags($post);
        
        // Allow filtering content before publishing
        $content = apply_filters('anonpress_prepare_content', $content, $post);
        
        // Publish via API
        $api_client = new AnonPress_API_Client();
        $result = $api_client->publish_content($title, $content, $tags, $wallet_address, $private_key);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        // Store publication in database
        $this->store_publication($post->ID, $result);
        
        // Trigger after publish hook
        do_action('anonpress_after_publish', $post->ID, $result);
        
        return $result;
    }
    
    /**
     * Prepare content for publishing
     */
    private function prepare_content($post) {
        $content = apply_filters('the_content', $post->post_content);
        
        // Get post excerpt if available
        $excerpt = has_excerpt($post) ? get_the_excerpt($post) : '';
        
        // Get author info (optional)
        $author_name = get_the_author_meta('display_name', $post->post_author);
        
        // Create complete HTML
        $html = '<!DOCTYPE html>';
        $html .= '<html lang="en">';
        $html .= '<head>';
        $html .= '<meta charset="UTF-8">';
        $html .= '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
        $html .= '<meta name="generator" content="PressProtocol WordPress Plugin">';
        $html .= '<title>' . esc_html($post->post_title) . '</title>';
        
        // Add meta tags for better display
        if (!empty($excerpt)) {
            $html .= '<meta name="description" content="' . esc_attr($excerpt) . '">';
        }
        
        $html .= '<style>';
        $html .= $this->get_default_styles();
        $html .= '</style>';
        $html .= '</head>';
        $html .= '<body>';
        $html .= '<article>';
        $html .= '<header>';
        $html .= '<h1>' . esc_html($post->post_title) . '</h1>';
        $html .= '<div class="meta">';
        $html .= '<time datetime="' . get_the_date('c', $post) . '">' . get_the_date('F j, Y', $post) . '</time>';
        
        // Add author if not anonymous
        if (apply_filters('anonpress_show_author', false, $post)) {
            $html .= ' <span class="author">by ' . esc_html($author_name) . '</span>';
        }
        
        $html .= '</div>';
        $html .= '</header>';
        
        // Add featured image if exists
        if (has_post_thumbnail($post)) {
            $featured_img = get_the_post_thumbnail_url($post, 'large');
            $html .= '<div class="featured-image">';
            $html .= '<img src="' . esc_url($featured_img) . '" alt="' . esc_attr($post->post_title) . '" />';
            $html .= '</div>';
        }
        
        $html .= '<div class="content">';
        $html .= $content;
        $html .= '</div>';
        
        // Add categories and tags
        $categories = get_the_category($post->ID);
        $tags = get_the_tags($post->ID);
        
        if (!empty($categories) || !empty($tags)) {
            $html .= '<div class="taxonomy">';
            
            if (!empty($categories)) {
                $html .= '<div class="categories">';
                $html .= '<strong>Categories:</strong> ';
                $cat_names = array_map(function($cat) { return esc_html($cat->name); }, $categories);
                $html .= implode(', ', $cat_names);
                $html .= '</div>';
            }
            
            if (!empty($tags)) {
                $html .= '<div class="tags">';
                $html .= '<strong>Tags:</strong> ';
                $tag_names = array_map(function($tag) { return esc_html($tag->name); }, $tags);
                $html .= implode(', ', $tag_names);
                $html .= '</div>';
            }
            
            $html .= '</div>';
        }
        
        $html .= '</article>';
        $html .= '<footer>';
        $html .= '<p>Published with <a href="https://pressprotocol.com" target="_blank" rel="noopener">PressProtocol</a> - Censorship-resistant publishing</p>';
        $html .= '<p class="disclaimer">Content published on decentralized networks (IPFS, Tor) for permanent accessibility</p>';
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
            .meta .author { margin-left: 1rem; }
            .content { margin-top: 2rem; }
            .taxonomy { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; color: #666; font-size: 0.9rem; }
            .taxonomy > div { margin-bottom: 0.5rem; }
            .content img { max-width: 100%; height: auto; border-radius: 4px; }
            .featured-image { margin-top: 2rem; }
            .featured-image img { width: 100%; border-radius: 4px; }
            footer { text-align: center; margin-top: 3rem; padding-top: 2rem; color: #666; border-top: 1px solid #e5e7eb; }
            footer .disclaimer { font-size: 0.8rem; margin-top: 0.5rem; color: #999; }
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
        
        // Check if already exists
        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM $table_name WHERE post_id = %d AND cid = %s",
            $post_id,
            $result['cid']
        ));
        
        if ($existing) {
            // Update existing record
            $wpdb->update(
                $table_name,
                array(
                    'ipfs_url' => $result['mirrors']['ipfs'] ?? '',
                    'tor_url' => $result['mirrors']['tor'] ?? '',
                    'gateway_url' => $result['mirrors']['gateway'] ?? '',
                    'published_at' => current_time('mysql'),
                ),
                array('id' => $existing),
                array('%s', '%s', '%s', '%s'),
                array('%d')
            );
        } else {
            // Insert new record
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
        
        // Store additional metadata
        if (isset($result['cid'])) {
            update_post_meta($post_id, '_pressprotocol_cid', sanitize_text_field($result['cid']));
            update_post_meta($post_id, '_anonpress_cid', sanitize_text_field($result['cid']));
            $embed_code = sprintf(
                '<iframe src="https://pressprotocol.com/embed/%s?theme=cyber" width="100%%" height="600" frameborder="0" loading="lazy" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups"></iframe>',
                esc_attr($result['cid'])
            );
            update_post_meta($post_id, '_pressprotocol_embed_code', $embed_code);
        }

        if (!empty($result['mirrors']['tor'])) {
            update_post_meta($post_id, '_pressprotocol_tor_url', esc_url_raw($result['mirrors']['tor']));
        }

        if (isset($result['publisher'])) {
            update_post_meta($post_id, '_anonpress_public_key', $result['publisher']['publicKey']);
            update_post_meta($post_id, '_anonpress_is_anonymous', $result['publisher']['isAnonymous'] ? '1' : '0');
        }
        
        if (isset($result['dht'])) {
            update_post_meta($post_id, '_anonpress_dht_announced', $result['dht']['announced'] ? '1' : '0');
            update_post_meta($post_id, '_anonpress_manifest_cid', $result['dht']['manifestCid']);
        }
    }
    
    /**
     * Get publication info for a post
     */
    public function get_publication($post_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'anonpress_publications';
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE post_id = %d ORDER BY id DESC LIMIT 1",
            $post_id
        ));
    }
}
