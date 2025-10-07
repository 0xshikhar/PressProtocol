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
        $status.removeClass('success error').addClass('loading').show().text('⏳ Publishing to AnonPress network...');
        
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
                    
                    $status.removeClass('loading').addClass('success').html(
                        '✅ Successfully published to AnonPress!<br>' +
                        '<strong>Share URL:</strong> <code>anonpress://' + data.cid + '</code><br>' +
                        '<button class="button" onclick="navigator.clipboard.writeText(\'anonpress://' + data.cid + '\')">Copy Link</button>'
                    );
                    
                    // Reload page after 2 seconds to show updated meta box
                    setTimeout(function() {
                        location.reload();
                    }, 2000);
                } else {
                    $status.removeClass('loading').addClass('error').text('❌ Error: ' + response.data);
                    $button.prop('disabled', false).text('🚀 Publish to AnonPress');
                }
            },
            error: function(xhr, status, error) {
                $status.removeClass('loading').addClass('error').text('❌ Error: ' + error);
                $button.prop('disabled', false).text('🚀 Publish to AnonPress');
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
    
    // Copy link helper
    window.copyAnonPressLink = function(cid) {
        const link = 'anonpress://' + cid;
        
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
