jQuery(document).ready(function($) {
    'use strict';
    
    // Publish button handler
    $(document).on('click', '#anonpress-publish, #anonpress-republish', function(e) {
        e.preventDefault();
        
        const $button = $(this);
        const postId = $button.data('post-id');
        const $status = $('#anonpress-status');
        
        // Disable button and show loading
        $button.prop('disabled', true).text('Publishing...');
        $status.removeClass('success error').addClass('loading').show().text('⏳ Publishing to PressProtocol network...');
        
        $.ajax({
            url: anonpressData.ajax_url,
            type: 'POST',
            data: {
                action: 'anonpress_publish',
                nonce: anonpressData.nonce,
                post_id: postId
            },
            success: function(response) {
                if (response.success) {
                    const data = response.data;
                    
                    const shareUrl = 'https://pressprotocol.com/read/' + data.cid;
                    $status.removeClass('loading').addClass('success').html(
                        '✅ Successfully published to PressProtocol!<br>' +
                        '<strong>Share URL:</strong><br>' +
                        '<input type="text" readonly value="' + shareUrl + '" style="width: 100%; margin: 5px 0;" onclick="this.select()" /><br>' +
                        '<button class="button" onclick="navigator.clipboard.writeText(\'' + shareUrl + '\');">Copy Link</button>'
                    );
                    
                    // Reload page after 2 seconds to show updated meta box
                    setTimeout(function() {
                        location.reload();
                    }, 2000);
                } else {
                    $status.removeClass('loading').addClass('error').text('❌ Error: ' + response.data);
                    $button.prop('disabled', false).text('🚀 Publish to PressProtocol');
                }
            },
            error: function(xhr, status, error) {
                $status.removeClass('loading').addClass('error').text('❌ Error: ' + error);
                $button.prop('disabled', false).text('🚀 Publish to PressProtocol');
            }
        });
    });
    
    // Check mirror status button handler
    $(document).on('click', '#anonpress-check-status', function(e) {
        e.preventDefault();
        
        const $button = $(this);
        const cid = $button.data('cid');
        const $status = $('#anonpress-status');
        
        $button.prop('disabled', true).text('Checking...');
        $status.removeClass('success error').addClass('loading').show().text('⏳ Checking mirror status...');
        
        $.ajax({
            url: anonpressData.ajax_url,
            type: 'POST',
            data: {
                action: 'anonpress_check_status',
                nonce: anonpressData.nonce,
                cid: cid
            },
            success: function(response) {
                if (response.success) {
                    const mirrors = response.data;
                    let html = '✅ Mirror Status:<br>';
                    
                    mirrors.forEach(function(mirror) {
                        const icon = mirror.available ? '✓' : '✗';
                        const status = mirror.available ? 'Available' : 'Unavailable';
                        const latency = mirror.latency ? ` (${mirror.latency}ms)` : '';
                        
                        html += `<strong>${mirror.type}:</strong> ${icon} ${status}${latency}<br>`;
                    });
                    
                    $status.removeClass('loading').addClass('success').html(html);
                } else {
                    $status.removeClass('loading').addClass('error').text('❌ Error: ' + response.data);
                }
                
                $button.prop('disabled', false).text('Check Mirror Status');
            },
            error: function(xhr, status, error) {
                $status.removeClass('loading').addClass('error').text('❌ Error: ' + error);
                $button.prop('disabled', false).text('Check Mirror Status');
            }
        });
    });
    
    // Test connection button handler
    $(document).on('click', '#anonpress-test-connection', function(e) {
        e.preventDefault();
        
        const $button = $(this);
        const $status = $('#connection-status');
        
        $button.prop('disabled', true).text('Testing...');
        $status.removeClass('success error').html('');
        
        $.ajax({
            url: anonpressData.ajax_url,
            type: 'POST',
            data: {
                action: 'anonpress_test_connection',
                nonce: anonpressData.nonce
            },
            success: function(response) {
                if (response.success) {
                    $status.addClass('notice notice-success').html('<p>✅ ' + response.data + '</p>');
                } else {
                    $status.addClass('notice notice-error').html('<p>❌ Error: ' + response.data + '</p>');
                }
                $button.prop('disabled', false).text('Test Connection');
            },
            error: function(xhr, status, error) {
                $status.addClass('notice notice-error').html('<p>❌ Connection failed: ' + error + '</p>');
                $button.prop('disabled', false).text('Test Connection');
            }
        });
    });
    
    // Copy link helper
    window.copyPressProtocolLink = function(cid) {
        const link = 'https://pressprotocol.com/read/' + cid;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link).then(function() {
                alert('Link copied to clipboard!');
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = link;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('Link copied to clipboard!');
        }
    };
});
