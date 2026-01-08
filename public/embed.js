(function() {
    console.log('DigiMax Chat Widget v2.0 - Email Collection Enabled');
    // Get the chat URL from window variable
    const CHAT_URL = window.DIGIMAX_CHAT_URL || 'http://localhost:3001';
    
    // Load Socket.IO client
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
    document.head.appendChild(script);
    
    // Create and inject CSS
    const css = `
        /* Live Chat Widget Styles */
        #digimax-chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        #chat-button {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
        }

        #chat-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        #chat-container {
            display: none;
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid #e1e5e9;
            overflow: hidden;
            transform-origin: bottom right;
            animation: slideUp 0.3s ease-out;
        }

        #chat-container.open {
            display: block;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: scale(0.8) translateY(20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }

        .chat-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .chat-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }

        .chat-status {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            opacity: 0.9;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background: #4ade80;
            border-radius: 50%;
        }

        #minimize-btn {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 18px;
            padding: 4px;
            border-radius: 4px;
            transition: background 0.2s ease;
        }

        #minimize-btn:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .chat-body {
            height: calc(100% - 64px);
            display: flex;
            flex-direction: column;
        }

        .chat-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            min-height: 0;
        }

        .message {
            margin-bottom: 12px;
            padding: 10px 14px;
            border-radius: 18px;
            max-width: 75%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.4;
        }

        .message.user {
            background: #667eea !important;
            color: white !important;
            align-self: flex-end !important;
            margin-left: auto !important;
            margin-right: 0 !important;
            border-bottom-right-radius: 4px;
        }

        .message.bot {
            background: white !important;
            color: #374151 !important;
            border: 1px solid #e5e7eb;
            align-self: flex-start !important;
            margin-left: 0 !important;
            margin-right: auto !important;
            border-bottom-left-radius: 4px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .chat-input-container {
            padding: 16px;
            border-top: 1px solid #e5e7eb;
            background: white;
            flex-shrink: 0;
        }

        .chat-input-wrapper {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-bottom: 10px;
        }

        #message-input {
            flex: 1;
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 24px;
            outline: none;
            font-size: 14px;
            transition: border-color 0.2s ease;
        }

        #message-input:focus {
            border-color: #667eea;
        }

        #send-btn {
            background: #667eea;
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease;
        }

        #send-btn:hover {
            background: #5a67d8;
        }

        .welcome-message {
            text-align: center;
            padding: 20px;
            color: #6b7280;
        }

        .email-form {
            padding: 16px;
            background: white;
            border-bottom: 1px solid #e5e7eb;
        }

        .email-form h4 {
            margin: 0 0 12px 0;
            color: #374151;
            font-size: 14px;
            font-weight: 600;
        }

        .email-form input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            margin-bottom: 12px;
            outline: none;
            transition: border-color 0.2s ease;
        }

        .email-form input:focus {
            border-color: #667eea;
        }

        .email-form .form-buttons {
            display: flex;
            gap: 8px;
        }

        .email-form button {
            flex: 1;
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            transition: background 0.2s ease;
        }

        .email-form .btn-start {
            background: #667eea;
            color: white;
        }

        .email-form .btn-start:hover {
            background: #5a67d8;
        }

        .email-form .btn-skip {
            background: #f3f4f6;
            color: #6b7280;
        }

        .email-form .btn-skip:hover {
            background: #e5e7eb;
        }

        @media (max-width: 480px) {
            #chat-container {
                width: 300px;
                height: 450px;
                bottom: 70px;
                right: 10px;
            }
            
            #digimax-chat-widget {
                bottom: 10px;
                right: 10px;
            }
        }
    `;

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // Create widget HTML
    const widgetHTML = `
        <div id="digimax-chat-widget">
            <button id="chat-button" title="Chat with us">
                💬
            </button>
            <div id="chat-container">
                <div class="chat-header">
                    <div>
                        <h3>DigiMax Support</h3>
                        <div class="chat-status">
                            <div class="status-dot"></div>
                            <span>Online</span>
                        </div>
                    </div>
                    <button id="minimize-btn">−</button>
                </div>
                <div class="chat-body">
                    <!-- Chat Messages (hidden until chat starts) -->
                    <div class="chat-messages" id="chat-messages" style="display: none;">
                        <div class="welcome-message">
                            <p><strong>👋 Welcome to DigiMax!</strong></p>
                            <p>How can we help you today?</p>
                        </div>
                    </div>
                    <div class="chat-input-container" id="chat-input" style="display: none;">
                        <div class="chat-input-wrapper">
                            <input type="text" id="message-input" placeholder="Type your message...">
                            <button id="send-btn">→</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Inject widget HTML when DOM is ready
    function injectWidget() {
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
        initializeWidget();
    }

    function initializeWidget() {
        // Wait for Socket.IO to load
        const waitForSocketIO = () => {
            if (typeof io !== 'undefined') {
                setupRealChat();
            } else {
                setTimeout(waitForSocketIO, 100);
            }
        };
        
        waitForSocketIO();
    }

    function setupRealChat() {
        const chatButton = document.getElementById('chat-button');
        const chatContainer = document.getElementById('chat-container');
        const minimizeBtn = document.getElementById('minimize-btn');
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        const messagesContainer = document.getElementById('chat-messages');

        let isOpen = false;
        let socket = null;
        let userId = null;
        let conversationId = null;
        let userName = 'Website Visitor';
        let userEmail = null;
        let chatStarted = false;

        // Connect to server
        function connectToServer() {
            socket = io(CHAT_URL, {
                transports: ['websocket', 'polling']
            });

            socket.on('connect', () => {
                console.log('Connected to chat server');
                updateStatus('Online', true);
                
                // Generate user session
                userId = 'visitor_' + Math.random().toString(36).substr(2, 9);
                conversationId = 'conv_' + Math.random().toString(36).substr(2, 9);
                
                // Join chat as user
                socket.emit('join_chat', {
                    user_id: userId,
                    conversation_id: conversationId,
                    is_admin: false,
                    user_name: userName,
                    user_email: userEmail
                });
            });

            socket.on('disconnect', () => {
                console.log('Disconnected from chat server');
                updateStatus('Offline', false);
            });

            socket.on('new_message', (data) => {
                if (data.sender_id !== userId) {
                    addMessage(data.message, false, data.sender_name || 'Support');
                }
            });

            socket.on('user_joined', (data) => {
                console.log('User joined:', data);
            });

            socket.on('agent_joined', (data) => {
                addMessage(`Agent has joined the chat`, false, 'System');
            });

            socket.on('error', (data) => {
                console.error('Socket error:', data);
            });
        }

        // Update status indicator
        function updateStatus(text, isOnline) {
            const statusDot = document.querySelector('.status-dot');
            const statusText = document.querySelector('.chat-status span');
            if (statusDot && statusText) {
                statusDot.style.background = isOnline ? '#4ade80' : '#ef4444';
                statusText.textContent = text;
            }
        }


        // Toggle chat
        function toggleChat() {
            if (!chatStarted) {
                // First time - show external email form
                const event = new CustomEvent('digimaxShowEmailForm');
                window.dispatchEvent(event);
            } else {
                // Normal toggle
                isOpen = !isOpen;
                chatContainer.classList.toggle('open', isOpen);
                if (isOpen) {
                    messageInput.focus();
                }
            }
        }

        // Add message to chat
        function addMessage(text, isUser = false, senderName = '') {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
            
            if (!isUser && senderName && senderName !== 'System') {
                const nameDiv = document.createElement('div');
                nameDiv.style.fontSize = '11px';
                nameDiv.style.opacity = '0.6';
                nameDiv.style.marginBottom = '4px';
                nameDiv.style.fontWeight = '500';
                nameDiv.style.color = '#6b7280';
                nameDiv.textContent = senderName;
                messageDiv.appendChild(nameDiv);
            }
            
            const textDiv = document.createElement('div');
            textDiv.textContent = text;
            messageDiv.appendChild(textDiv);
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Remove welcome message if it exists
            const welcomeMsg = messagesContainer.querySelector('.welcome-message');
            if (welcomeMsg) {
                welcomeMsg.remove();
            }
        }

        // Send message
        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message || !socket || !conversationId) return;

            // Add message to UI immediately
            addMessage(message, true);
            messageInput.value = '';

            // Send to server using the correct event name and format
            socket.emit('send_message', {
                conversation_id: conversationId,
                sender_id: userId,
                message: message,
                message_type: 'text'
            });
        }

        // Event listeners
        chatButton.addEventListener('click', toggleChat);
        minimizeBtn.addEventListener('click', toggleChat);
        sendBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Listen for external start chat event
        window.addEventListener('digimaxStartChat', (e) => {
            userEmail = e.detail.email;
            userName = e.detail.name || 'Website Visitor';
            console.log('🎉 STARTING CHAT WITH EMAIL DATA:', { name: userName, email: userEmail });
            
            // Show chat interface
            document.getElementById('chat-messages').style.display = 'block';
            document.getElementById('chat-input').style.display = 'block';
            chatStarted = true;
            
            // Open chat container
            isOpen = true;
            chatContainer.classList.add('open');
            
            // Connect to server if not connected
            if (!socket) {
                connectToServer();
            }
            
            messageInput.focus();
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectWidget);
    } else {
        injectWidget();
    }
})();