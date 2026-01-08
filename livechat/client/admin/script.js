class AdminDashboard {
    constructor() {
        this.socket = null;
        this.currentUser = null;
        this.currentConversation = null;
        this.conversations = [];
        this.onlineUsers = [];
        
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.bindEvents();
    }

    bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Refresh conversations
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadConversations();
        });

        // Message form
        document.getElementById('messageForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Auto-resize message input
        const messageInput = document.getElementById('messageInput');
        messageInput.addEventListener('input', () => {
            messageInput.style.height = 'auto';
            messageInput.style.height = Math.min(messageInput.scrollHeight, 100) + 'px';
        });

        // Enter key to send message, Shift+Enter for new line
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Typing indicators
        let typingTimeout;
        messageInput.addEventListener('input', () => {
            if (this.currentConversation && this.socket) {
                this.socket.emit('typing_start', {
                    conversation_id: this.currentConversation.id,
                    user_name: this.currentUser.name
                });

                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    this.socket.emit('typing_stop', {
                        conversation_id: this.currentConversation.id
                    });
                }, 1000);
            }
        });

        // Close chat button
        document.getElementById('closeChatBtn').addEventListener('click', () => {
            this.closeChatScreen();
        });
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/status');
            const data = await response.json();
            
            if (data.authenticated) {
                this.currentUser = data.user;
                this.showDashboard();
                this.initSocket();
            } else {
                this.showLoginModal();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showLoginModal();
        }
    }

    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                this.showDashboard();
                this.initSocket();
                errorDiv.classList.remove('show');
            } else {
                errorDiv.textContent = data.error || 'Login failed';
                errorDiv.classList.add('show');
            }
        } catch (error) {
            errorDiv.textContent = 'Connection error. Please try again.';
            errorDiv.classList.add('show');
        }
    }

    async logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
            }
            this.currentUser = null;
            this.showLoginModal();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    showLoginModal() {
        document.getElementById('loginModal').classList.add('active');
        document.getElementById('dashboard').classList.remove('active');
    }

    showDashboard() {
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('dashboard').classList.add('active');
        document.getElementById('adminName').textContent = this.currentUser.name;
        this.loadConversations();
        this.requestNotificationPermission();
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted');
                }
            });
        }
    }

    initSocket() {
        this.socket = io();

        // Join admin room
        this.socket.emit('join_chat', {
            user_id: this.currentUser.id,
            is_admin: true
        });

        // Socket event listeners
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('new_message', (message) => {
            this.handleNewMessage(message);
        });

        this.socket.on('user_online', (data) => {
            this.handleUserOnline(data);
        });

        this.socket.on('user_offline', (data) => {
            this.handleUserOffline(data);
        });

        this.socket.on('online_users', (users) => {
            this.onlineUsers = users;
            this.updateOnlineUsersCount();
        });

        this.socket.on('user_typing', (data) => {
            this.showTypingIndicator(data);
        });

        this.socket.on('user_stop_typing', () => {
            this.hideTypingIndicator();
        });

        this.socket.on('conversation_updated', (data) => {
            this.loadConversations();
        });

        this.socket.on('human_agent_needed', (data) => {
            this.handleHumanAgentNeeded(data);
        });

        this.socket.on('mode_changed', (data) => {
            this.handleModeChanged(data);
        });
    }

    async loadConversations() {
        try {
            const response = await fetch('/api/chat/conversations');
            const conversations = await response.json();
            
            this.conversations = conversations;
            this.renderConversations();
            this.updateStats();
        } catch (error) {
            console.error('Failed to load conversations:', error);
        }
    }

    renderConversations() {
        const container = document.getElementById('conversationsList');
        
        if (this.conversations.length === 0) {
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: #64748b;">
                    <i class="fas fa-comments" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    <p>No conversations yet</p>
                    <small>Conversations will appear here when customers start chatting</small>
                </div>
            `;
            return;
        }

        container.innerHTML = this.conversations.map(conversation => {
            const isOnline = this.onlineUsers.some(user => user.conversation_id === conversation.id);
            const timeAgo = this.timeAgo(conversation.last_message_time || conversation.created_at);
            
            return `
                <div class="conversation-item ${this.currentConversation?.id === conversation.id ? 'active' : ''}" 
                     data-conversation-id="${conversation.id}">
                    <div class="conversation-header">
                        <div class="conversation-name">
                            <span class="${isOnline ? 'online' : 'offline'}-indicator"></span>
                            ${conversation.user_name}
                        </div>
                        <div class="conversation-time">${timeAgo}</div>
                    </div>
                    <div class="conversation-preview">
                        ${conversation.user_email || 'No email provided'}
                    </div>
                    <div class="conversation-stats">
                        <span class="message-count">${conversation.message_count || 0} messages</span>
                        <span class="status-badge status-${conversation.status}">${conversation.status}</span>
                        <span class="mode-badge ${conversation.mode || 'ai'}-mode">
                            <i class="fas fa-${conversation.mode === 'human' ? 'user' : 'robot'}"></i>
                            ${conversation.mode === 'human' ? 'Human' : 'AI'}
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        // Bind click events
        container.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const conversationId = item.dataset.conversationId;
                this.selectConversation(conversationId);
            });
        });
    }

    async selectConversation(conversationId) {
        try {
            const [conversationResponse, messagesResponse] = await Promise.all([
                fetch(`/api/chat/conversations/${conversationId}`),
                fetch(`/api/chat/conversations/${conversationId}/messages`)
            ]);

            const conversation = await conversationResponse.json();
            const messages = await messagesResponse.json();

            this.currentConversation = conversation;
            this.showChatScreen(conversation, messages);
            
            // Join conversation room
            if (this.socket) {
                this.socket.emit('admin_join_conversation', {
                    conversation_id: conversationId
                });
            }

            // Update active state in sidebar
            document.querySelectorAll('.conversation-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-conversation-id="${conversationId}"]`).classList.add('active');

        } catch (error) {
            console.error('Failed to load conversation:', error);
        }
    }

    showChatScreen(conversation, messages) {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('chatScreen').classList.remove('hidden');
        
        // Update chat header
        document.getElementById('chatUserName').textContent = conversation.user_name;
        const isOnline = this.onlineUsers.some(user => user.conversation_id === conversation.id);
        document.getElementById('chatUserStatus').textContent = isOnline ? 'Online' : 'Offline';
        
        // Load messages
        this.renderMessages(messages);
        this.scrollToBottom();
    }

    closeChatScreen() {
        document.getElementById('chatScreen').classList.add('hidden');
        document.getElementById('welcomeScreen').style.display = 'flex';
        
        if (this.currentConversation && this.socket) {
            this.socket.emit('admin_leave_conversation', {
                conversation_id: this.currentConversation.id
            });
        }
        
        this.currentConversation = null;
        
        // Remove active state from sidebar
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    renderMessages(messages) {
        const container = document.getElementById('messagesContainer');
        
        container.innerHTML = messages.map(message => {
            const isAdmin = message.is_admin;
            const timeString = new Date(message.created_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="message ${isAdmin ? 'admin' : 'user'}">
                    <div class="message-bubble">
                        ${this.escapeHtml(message.message)}
                    </div>
                    <div class="message-info">
                        <span>${message.sender_name}</span>
                        <span>•</span>
                        <span>${timeString}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message || !this.currentConversation || !this.socket) {
            return;
        }

        this.socket.emit('send_message', {
            conversation_id: this.currentConversation.id,
            sender_id: this.currentUser.id,
            message: message
        });

        input.value = '';
        input.style.height = 'auto';
    }

    handleNewMessage(message) {
        if (this.currentConversation && message.conversation_id === this.currentConversation.id) {
            this.appendMessage(message);
            this.scrollToBottom();
        }
        
        // Update conversation list
        this.loadConversations();
    }

    appendMessage(message) {
        const container = document.getElementById('messagesContainer');
        const isAdmin = message.is_admin;
        const timeString = new Date(message.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const messageElement = document.createElement('div');
        messageElement.className = `message ${isAdmin ? 'admin' : 'user'}`;
        messageElement.innerHTML = `
            <div class="message-bubble">
                ${this.escapeHtml(message.message)}
            </div>
            <div class="message-info">
                <span>${message.sender_name}</span>
                <span>•</span>
                <span>${timeString}</span>
            </div>
        `;

        container.appendChild(messageElement);
    }

    showTypingIndicator(data) {
        if (this.currentConversation && data.conversation_id === this.currentConversation.id) {
            const indicator = document.getElementById('typingIndicator');
            indicator.querySelector('.typing-text').textContent = `${data.user_name} is typing...`;
            indicator.classList.remove('hidden');
        }
    }

    hideTypingIndicator() {
        document.getElementById('typingIndicator').classList.add('hidden');
    }

    handleUserOnline(data) {
        this.onlineUsers.push(data);
        this.updateOnlineUsersCount();
        this.renderConversations();
    }

    handleUserOffline(data) {
        this.onlineUsers = this.onlineUsers.filter(user => user.user_id !== data.user_id);
        this.updateOnlineUsersCount();
        this.renderConversations();
    }

    handleHumanAgentNeeded(data) {
        console.log('Human agent needed:', data);

        // Show desktop notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('DigiMax Live Chat', {
                body: `Customer needs human assistance (Conversation #${data.conversation_id})`,
                icon: '/favicon.ico',
                tag: `conversation-${data.conversation_id}`
            });
        }

        // Play notification sound
        this.playNotificationSound();

        // Reload conversations to show updated status
        this.loadConversations();

        // Show toast notification
        this.showToast(`Customer needs human assistance - Conversation #${data.conversation_id}`, 'warning');
    }

    handleModeChanged(data) {
        console.log('Mode changed:', data);

        // If viewing this conversation, update the UI
        if (this.currentConversation && this.currentConversation.id === data.conversation_id) {
            this.currentConversation.mode = data.mode;
            this.updateChatHeader();
        }

        // Reload conversations to reflect mode change
        this.loadConversations();
    }

    playNotificationSound() {
        // Create a simple beep sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    updateChatHeader() {
        if (!this.currentConversation) return;

        const isOnline = this.onlineUsers.some(user => user.conversation_id === this.currentConversation.id);
        document.getElementById('chatUserStatus').textContent = isOnline ? 'Online' : 'Offline';

        // Update mode badge if needed (you can add a mode badge to the chat header)
        const modeBadge = document.getElementById('chatModeBadge');
        if (modeBadge) {
            modeBadge.textContent = this.currentConversation.mode === 'ai' ? 'AI Mode' : 'Human Mode';
            modeBadge.className = `mode-badge ${this.currentConversation.mode}-mode`;
        }
    }

    updateStats() {
        document.getElementById('totalConversations').textContent = this.conversations.length;
    }

    updateOnlineUsersCount() {
        document.getElementById('onlineUsersCount').textContent = this.onlineUsers.length;
    }

    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        container.scrollTop = container.scrollHeight;
    }

    timeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});