class LiveChatWidget {
    constructor() {
        this.socket = null;
        this.isOpen = false;
        this.isMinimized = false;
        this.userId = null;
        this.conversationId = null;
        this.userName = null;
        this.isConnected = false;
        this.typingTimeout = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.connectToServer();
    }

    bindEvents() {
        // Chat button click
        document.getElementById('chat-button').addEventListener('click', () => {
            this.toggleChat();
        });

        // Minimize button
        document.getElementById('minimize-btn').addEventListener('click', () => {
            this.minimizeChat();
        });

        // Start chat form
        document.getElementById('start-chat-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startChat();
        });

        // Message form
        document.getElementById('message-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Message input events
        const messageInput = document.getElementById('message-input');
        
        messageInput.addEventListener('input', () => {
            this.handleTyping();
        });

        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Outside click to close (optional)
        document.addEventListener('click', (e) => {
            const widget = document.getElementById('livechat-widget');
            if (!widget.contains(e.target) && this.isOpen && !this.isMinimized) {
                // Uncomment the line below if you want to close on outside click
                // this.closeChat();
            }
        });
    }

    connectToServer() {
        try {
            this.socket = io();

            this.socket.on('connect', () => {
                console.log('Connected to chat server');
                this.isConnected = true;
                this.updateConnectionStatus(true);
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from chat server');
                this.isConnected = false;
                this.updateConnectionStatus(false);
            });

            this.socket.on('new_message', (message) => {
                this.handleIncomingMessage(message);
            });

            this.socket.on('user_typing', (data) => {
                if (data.user_name && data.user_name !== this.userName) {
                    this.showTypingIndicator();
                }
            });

            this.socket.on('user_stop_typing', () => {
                this.hideTypingIndicator();
            });

            this.socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
                this.updateConnectionStatus(false);
            });

        } catch (error) {
            console.error('Failed to initialize socket connection:', error);
        }
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const chatWindow = document.getElementById('chat-window');
        const chatButton = document.getElementById('chat-button');
        
        chatWindow.classList.add('open');
        chatButton.classList.add('hidden');
        
        this.isOpen = true;
        this.isMinimized = false;

        // Focus on appropriate input
        if (this.conversationId) {
            setTimeout(() => {
                document.getElementById('message-input').focus();
            }, 300);
        } else {
            setTimeout(() => {
                document.getElementById('visitor-name').focus();
            }, 300);
        }
    }

    closeChat() {
        const chatWindow = document.getElementById('chat-window');
        const chatButton = document.getElementById('chat-button');
        
        chatWindow.classList.remove('open');
        chatButton.classList.remove('hidden');
        
        this.isOpen = false;
        this.isMinimized = false;
    }

    minimizeChat() {
        const chatWindow = document.getElementById('chat-window');
        
        if (this.isMinimized) {
            chatWindow.classList.remove('minimized');
            this.isMinimized = false;
            
            if (this.conversationId) {
                setTimeout(() => {
                    document.getElementById('message-input').focus();
                }, 100);
            }
        } else {
            chatWindow.classList.add('minimized');
            this.isMinimized = true;
        }
    }

    async startChat() {
        const nameInput = document.getElementById('visitor-name');
        const emailInput = document.getElementById('visitor-email');
        const submitBtn = document.querySelector('.btn-start-chat');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!name) {
            nameInput.focus();
            return;
        }

        // Disable form
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="loading"></div> Starting...';

        try {
            const response = await fetch('/api/chat/visitor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }),
            });

            const data = await response.json();

            if (data.success) {
                this.userId = data.user_id;
                this.conversationId = data.conversation_id;
                this.userName = name;
                
                // Join chat room via socket
                if (this.socket) {
                    this.socket.emit('join_chat', {
                        user_id: this.userId,
                        conversation_id: this.conversationId,
                        is_admin: false
                    });
                }

                this.showChatInterface();
                this.scrollToBottom();
                
                setTimeout(() => {
                    document.getElementById('message-input').focus();
                }, 100);

            } else {
                throw new Error(data.error || 'Failed to start chat');
            }

        } catch (error) {
            console.error('Error starting chat:', error);
            alert('Sorry, we couldn\'t connect you to chat. Please try again.');
            
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Start Chat';
        }
    }

    showChatInterface() {
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('chat-interface').classList.remove('hidden');
        
        // Update button text
        const buttonText = document.querySelector('.button-text span');
        const buttonSubtext = document.querySelector('.button-text small');
        buttonText.textContent = 'Chat Active';
        buttonSubtext.textContent = 'Click to open';
    }

    sendMessage() {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        if (!message || !this.socket || !this.conversationId) {
            return;
        }

        // Send message via socket
        this.socket.emit('send_message', {
            conversation_id: this.conversationId,
            sender_id: this.userId,
            message: message
        });

        messageInput.value = '';
        
        // Stop typing indicator
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.socket.emit('typing_stop', {
                conversation_id: this.conversationId
            });
        }
    }

    handleIncomingMessage(message) {
        if (message.conversation_id === this.conversationId) {
            this.addMessage(message);
            this.scrollToBottom();
            
            // Hide typing indicator if this message is from admin
            if (message.is_admin) {
                this.hideTypingIndicator();
            }

            // Show notification if chat is closed
            if (!this.isOpen) {
                this.showNotification(message);
            }
        }
    }

    addMessage(messageData) {
        const messagesArea = document.getElementById('messages-area');
        const isUser = messageData.sender_id === this.userId;
        const isAdmin = messageData.is_admin;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isUser ? 'user' : 'agent'}`;
        
        const timeString = new Date(messageData.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${isUser ? 'user' : 'user-tie'}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    ${this.escapeHtml(messageData.message)}
                </div>
                <div class="message-time">${timeString}</div>
            </div>
        `;

        messagesArea.appendChild(messageElement);
    }

    handleTyping() {
        if (!this.socket || !this.conversationId) return;

        // Send typing start
        this.socket.emit('typing_start', {
            conversation_id: this.conversationId,
            user_name: this.userName
        });

        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        // Set timeout to send typing stop
        this.typingTimeout = setTimeout(() => {
            this.socket.emit('typing_stop', {
                conversation_id: this.conversationId
            });
        }, 1000);
    }

    showTypingIndicator() {
        document.getElementById('typing-indicator').classList.remove('hidden');
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        document.getElementById('typing-indicator').classList.add('hidden');
    }

    showNotification(message) {
        // Simple browser notification
        if (Notification.permission === 'granted') {
            new Notification('New message from DigiMax', {
                body: message.message,
                icon: '/favicon.ico'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('New message from DigiMax', {
                        body: message.message,
                        icon: '/favicon.ico'
                    });
                }
            });
        }

        // Visual notification on button
        const chatButton = document.getElementById('chat-button');
        chatButton.style.animation = 'pulse-shadow 0.5s ease-in-out 3';
    }

    updateConnectionStatus(isConnected) {
        const statusIndicator = document.getElementById('status-indicator');
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('.status-dot + text, .status-dot').nextSibling;
        
        if (isConnected) {
            statusIndicator.innerHTML = '<span class="status-dot"></span>Online';
            statusDot.style.background = '#22c55e';
        } else {
            statusIndicator.innerHTML = '<span class="status-dot"></span>Connecting...';
            if (statusDot) statusDot.style.background = '#f59e0b';
        }
    }

    scrollToBottom() {
        const messagesArea = document.getElementById('messages-area');
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.liveChatWidget = new LiveChatWidget();
});

// Expose global functions for parent page
window.DigiMaxChat = {
    open: () => window.liveChatWidget?.openChat(),
    close: () => window.liveChatWidget?.closeChat(),
    toggle: () => window.liveChatWidget?.toggleChat()
};