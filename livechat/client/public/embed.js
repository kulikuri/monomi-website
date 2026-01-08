(function() {
    // Configuration
    const CHAT_SERVER_URL = window.DIGIMAX_CHAT_URL || 'http://localhost:8081';
    
    // Prevent multiple installations
    if (window.DigiMaxChatInstalled) {
        return;
    }
    window.DigiMaxChatInstalled = true;

    // Create iframe container
    function createChatWidget() {
        const iframe = document.createElement('iframe');
        iframe.id = 'digimax-chat-widget';
        iframe.src = `${CHAT_SERVER_URL}/widget`;
        iframe.style.cssText = `
            position: fixed !important;
            bottom: 0 !important;
            right: 0 !important;
            width: 420px !important;
            height: 600px !important;
            border: none !important;
            z-index: 2147483647 !important;
            background: transparent !important;
            pointer-events: none !important;
        `;
        
        // Allow pointer events on iframe content
        iframe.onload = function() {
            iframe.style.pointerEvents = 'auto';
        };

        document.body.appendChild(iframe);

        // Handle mobile responsiveness
        function handleResize() {
            if (window.innerWidth <= 480) {
                iframe.style.width = '100% !important';
                iframe.style.height = '100% !important';
                iframe.style.left = '0 !important';
                iframe.style.right = '0 !important';
                iframe.style.bottom = '0 !important';
            } else {
                iframe.style.width = '420px !important';
                iframe.style.height = '600px !important';
                iframe.style.left = 'auto !important';
                iframe.style.right = '0 !important';
                iframe.style.bottom = '0 !important';
            }
        }

        window.addEventListener('resize', handleResize);
        handleResize();

        return iframe;
    }

    // Initialize chat widget
    function initChat() {
        const iframe = createChatWidget();
        
        // Expose global API
        window.DigiMaxChat = {
            open: function() {
                iframe.contentWindow.postMessage({ action: 'open' }, CHAT_SERVER_URL);
            },
            close: function() {
                iframe.contentWindow.postMessage({ action: 'close' }, CHAT_SERVER_URL);
            },
            toggle: function() {
                iframe.contentWindow.postMessage({ action: 'toggle' }, CHAT_SERVER_URL);
            },
            hide: function() {
                iframe.style.display = 'none';
            },
            show: function() {
                iframe.style.display = 'block';
            }
        };

        // Listen for messages from iframe
        window.addEventListener('message', function(event) {
            if (event.origin !== CHAT_SERVER_URL) {
                return;
            }

            const data = event.data;
            switch (data.action) {
                case 'resize':
                    if (data.height) {
                        iframe.style.height = data.height + 'px';
                    }
                    break;
                case 'notification':
                    // Handle notifications from chat widget
                    console.log('DigiMax Chat Notification:', data.message);
                    break;
            }
        });
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChat);
    } else {
        initChat();
    }

})();