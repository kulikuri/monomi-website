(function() {
    console.log('DigiMax Simple Chat Widget - Email Collection v1.0');
    
    const CHAT_URL = window.DIGIMAX_CHAT_URL || 'http://localhost:3001';
    
    // Load Socket.IO client
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
    document.head.appendChild(script);

    // Widget styles
    const css = `
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
        }

        #chat-container.open {
            display: block;
        }

        .chat-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chat-header h3 {
            margin: 0;
            font-size: 16px;
        }

        #minimize-btn {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 18px;
        }

        .chat-messages {
            height: 350px;
            padding: 16px;
            overflow-y: auto;
            background: #f8fafc;
        }

        .message {
            margin-bottom: 12px;
            padding: 8px 12px;
            border-radius: 12px;
            max-width: 80%;
        }

        .message.user {
            background: #667eea;
            color: white;
            margin-left: auto;
        }

        .message.bot {
            background: white;
            border: 1px solid #e5e7eb;
        }

        .chat-input-container {
            padding: 16px;
            border-top: 1px solid #e5e7eb;
        }

        .chat-input-wrapper {
            display: flex;
            gap: 8px;
        }

        #message-input {
            flex: 1;
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 24px;
            outline: none;
        }

        #send-btn {
            background: #667eea;
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
        }
    `;

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // Widget HTML
    const widgetHTML = `
        <div id="digimax-chat-widget">
            <button id="chat-button" title="Chat with us">💬</button>
            <div id="chat-container">
                <div class="chat-header">
                    <h3>DigiMax Support</h3>
                    <button id="minimize-btn">−</button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="message bot">
                        <p>👋 Welcome! How can we help you today?</p>
                    </div>
                </div>
                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <input type="text" id="message-input" placeholder="Type your message...">
                        <button id="send-btn">→</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    function initializeWidget() {
        const waitForSocketIO = () => {
            if (typeof io !== 'undefined') {
                setupChat();
            } else {
                setTimeout(waitForSocketIO, 100);
            }
        };
        waitForSocketIO();
    }

    function setupChat() {
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
        let userName = null;
        let userEmail = null;
        let isConnected = false;

        function collectUserInfo() {
            userEmail = prompt("Enter your email (optional):") || null;
            userName = prompt("Enter your name (optional):") || "Website Visitor";
            console.log('User info collected:', { name: userName, email: userEmail });
            connectToServer();
        }

        function connectToServer() {
            if (isConnected) return;
            
            socket = io(CHAT_URL);
            
            socket.on('connect', () => {
                console.log('Connected to chat server');
                isConnected = true;
                
                // Generate user session
                userId = 'visitor_' + Math.random().toString(36).substr(2, 9);
                conversationId = 'conv_' + Math.random().toString(36).substr(2, 9);
                
                // Join chat with user info
                socket.emit('join_chat', {
                    user_id: userId,
                    conversation_id: conversationId,
                    is_admin: false,
                    user_name: userName,
                    user_email: userEmail
                });
                
                console.log('Sent user info to server:', { userId, conversationId, userName, userEmail });
            });

            socket.on('new_message', (data) => {
                if (data.sender_id !== userId) {
                    addMessage(data.message, false);
                }
            });
        }

        function toggleChat() {
            if (!isConnected) {
                collectUserInfo();
                isOpen = true;
                chatContainer.classList.add('open');
                messageInput.focus();
            } else {
                isOpen = !isOpen;
                chatContainer.classList.toggle('open', isOpen);
                if (isOpen) messageInput.focus();
            }
        }

        function addMessage(text, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
            messageDiv.innerHTML = `<p>${text}</p>`;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message || !socket || !isConnected) return;

            addMessage(message, true);
            messageInput.value = '';

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
            if (e.key === 'Enter') sendMessage();
        });
    }

    // Inject widget and initialize
    function injectWidget() {
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
        initializeWidget();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectWidget);
    } else {
        injectWidget();
    }
})();