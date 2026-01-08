const AIService = require('../services/aiService');
const RAGService = require('../services/ragService');

class ChatHandler {
    constructor(db) {
        this.db = db;
        this.connectedUsers = new Map(); // socketId -> userInfo
        this.adminSockets = new Map(); // socketId -> adminInfo

        // Initialize RAG or AI service based on provider
        const aiProvider = process.env.AI_PROVIDER || 'ollama';

        if (aiProvider === 'rag') {
            // Initialize RAG service with ChromaDB and HuggingFace
            this.ragService = new RAGService({
                apiKey: process.env.HUGGINGFACE_API_KEY,
                embeddingModel: process.env.AI_MODEL || 'sentence-transformers/all-MiniLM-L6-v2',
                chromaHost: process.env.CHROMA_HOST || 'localhost',
                chromaPort: parseInt(process.env.CHROMA_PORT) || 8000,
                collectionName: process.env.CHROMA_COLLECTION || 'digimax_knowledge_base',
                similarityThreshold: parseFloat(process.env.RAG_SIMILARITY_THRESHOLD) || 0.8,
                topK: parseInt(process.env.RAG_TOP_K) || 3,
                fallbackMessage: process.env.RAG_FALLBACK_MESSAGE ||
                    'Maaf mungkin pertanyaan yang anda ajukan tidak sesuai, saya akan hubungkan ke live agent'
            });

            // Initialize RAG service asynchronously
            this.ragService.initialize()
                .then(() => console.log('✅ RAG Service initialized successfully'))
                .catch(err => console.error('❌ RAG Service initialization failed:', err));

            console.log(`🔍 RAG Service initialized (ChromaDB + HuggingFace)`);
        } else {
            // Initialize traditional AI service
            this.aiService = new AIService({
                provider: aiProvider,
                model: process.env.AI_MODEL || 'llama3',
                apiUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
                apiKey: process.env.AI_API_KEY || null,
                temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
                maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 500
            });

            console.log(`🤖 AI Service initialized with provider: ${this.aiService.provider}`);
        }
    }

    handleConnection(socket, io) {
        console.log('New connection:', socket.id);

        // Join user to chat
        socket.on('join_chat', (data) => {
            const { user_id, conversation_id, is_admin = false, user_name, user_email } = data;
            console.log('📧 JOIN_CHAT received:', { user_id, conversation_id, is_admin, user_name, user_email });
            
            if (is_admin) {
                this.adminSockets.set(socket.id, { user_id, socket });
                socket.join('admin_room');
                console.log(`Admin ${user_id} joined`);
                
                // Send current online users to admin
                this.sendOnlineUsersToAdmin(socket);
            } else {
                // Create user if they don't exist (for widget visitors)
                this.db.getUserById(user_id, (err, existingUser) => {
                    if (!existingUser) {
                        // Create visitor user with provided info
                        this.db.createUser({
                            id: user_id,
                            name: user_name || 'Website Visitor',
                            email: user_email,
                            is_admin: 0
                        }, (err, newUserId) => {
                            if (err) console.error('Error creating visitor user:', err);
                            else {
                                console.log(`Created visitor user: ${user_name || 'Website Visitor'} (${user_email || 'no email'})`);
                            }
                        });
                    }
                });

                // Create conversation if it doesn't exist
                this.db.createConversation({
                    id: conversation_id,
                    user_id: user_id,
                    status: 'active'
                }, (err) => {
                    if (err) console.error('Error creating conversation:', err);
                });

                this.connectedUsers.set(socket.id, { 
                    user_id, 
                    conversation_id, 
                    socket 
                });
                socket.join(`conversation_${conversation_id}`);
                console.log(`User ${user_id} joined conversation ${conversation_id}`);
                
                // Notify admins of new user
                this.notifyAdminsUserOnline(user_id, conversation_id);
            }

            // Update session status
            this.db.updateSessionStatus(socket.id, 1, (err) => {
                if (err) console.error('Error updating session status:', err);
            });
        });

        // Handle new message
        socket.on('send_message', async (data) => {
            const { conversation_id, sender_id, message, message_type = 'text' } = data;

            if (!conversation_id || !sender_id || !message) {
                socket.emit('error', { message: 'Missing required fields' });
                return;
            }

            const messageData = {
                conversation_id,
                sender_id,
                message: message.trim(),
                message_type
            };

            this.db.createMessage(messageData, (err, messageId) => {
                if (err) {
                    console.error('Error saving message:', err);
                    socket.emit('error', { message: 'Failed to send message' });
                    return;
                }

                // Get sender info for the message
                this.db.getUserById(sender_id, async (err, sender) => {
                    if (err) {
                        console.error('Error getting sender info:', err);
                        return;
                    }

                    // Fallback if sender not found
                    const senderInfo = sender || { name: 'Unknown User', is_admin: 0 };

                    const messageWithInfo = {
                        id: messageId,
                        conversation_id,
                        sender_id,
                        message: messageData.message,
                        message_type,
                        sender_name: senderInfo.name,
                        is_admin: senderInfo.is_admin,
                        created_at: new Date().toISOString(),
                        status: 'sent'
                    };

                    // Send to conversation room
                    io.to(`conversation_${conversation_id}`).emit('new_message', messageWithInfo);

                    // Send to admin room if sender is not admin (but exclude admins already in the conversation)
                    if (!senderInfo.is_admin) {
                        // Get all sockets in the conversation room
                        const conversationRoom = io.sockets.adapter.rooms.get(`conversation_${conversation_id}`);
                        const conversationSocketIds = conversationRoom ? Array.from(conversationRoom) : [];

                        // Send to admins who are NOT in the specific conversation room
                        this.adminSockets.forEach((admin, socketId) => {
                            if (!conversationSocketIds.includes(socketId)) {
                                admin.socket.emit('new_message', messageWithInfo);
                                admin.socket.emit('conversation_updated', { conversation_id });
                            }
                        });

                        // Check if we should generate AI response
                        this.db.getConversation(conversation_id, async (err, conversation) => {
                            if (err || !conversation) {
                                console.error('Error getting conversation:', err);
                                return;
                            }

                            // Check if conversation is in AI mode
                            if (conversation.mode === 'ai') {
                                console.log(`🤖 AI mode active for conversation ${conversation_id}`);

                                // Check which AI provider to use
                                if (this.ragService) {
                                    // RAG MODE
                                    try {
                                        // Send typing indicator
                                        io.to(`conversation_${conversation_id}`).emit('ai_typing', { conversation_id });

                                        // Get conversation history (optional for RAG)
                                        const messages = await this.getMessagesAsync(conversation_id, 5, 0);

                                        // Generate RAG response
                                        const responseData = await this.ragService.generateResponse(
                                            messageData.message,
                                            messages || []
                                        );

                                        // Check if handoff is needed
                                        if (responseData.needsHandoff) {
                                            // Send fallback message first
                                            await this.sendAIResponse(conversation_id, responseData.response, io);

                                            // Trigger human handoff
                                            await this.handleHumanHandoff(
                                                conversation_id,
                                                io,
                                                'Low similarity - question not in knowledge base'
                                            );
                                            return; // STOP - no more AI responses
                                        }

                                        // Send RAG response with sources
                                        await this.sendAIResponse(conversation_id, responseData.response, io);

                                    } catch (error) {
                                        console.error('RAG error:', error);
                                        const fallbackMsg = this.ragService.fallbackMessage;
                                        await this.sendAIResponse(conversation_id, fallbackMsg, io);
                                        await this.handleHumanHandoff(conversation_id, io, 'RAG service error');
                                    }
                                } else {
                                    // TRADITIONAL AI SERVICE MODE
                                    // Check if message triggers human handoff
                                    if (this.aiService.shouldHandoffToHuman(messageData.message)) {
                                        console.log(`👤 Human handoff triggered by keywords in message`);
                                        await this.handleHumanHandoff(conversation_id, io, 'User requested human agent');
                                        return;
                                    }

                                    // Check FAQ first for faster response
                                    let aiResponse = this.aiService.getFAQResponse(messageData.message);

                                    // If no FAQ match, generate AI response
                                    if (!aiResponse) {
                                        try {
                                            // Send typing indicator
                                            io.to(`conversation_${conversation_id}`).emit('ai_typing', { conversation_id });

                                            // Get conversation history for context
                                            this.db.getMessages(conversation_id, 10, 0, async (err, messages) => {
                                                if (err) {
                                                    console.error('Error getting messages:', err);
                                                    aiResponse = this.aiService.getFallbackResponse();
                                                } else {
                                                    // Generate AI response with context
                                                    aiResponse = await this.aiService.generateResponse(
                                                        messageData.message,
                                                        messages || []
                                                    );
                                                }

                                                // Send AI response
                                                await this.sendAIResponse(conversation_id, aiResponse, io);
                                            });
                                        } catch (error) {
                                            console.error('AI generation error:', error);
                                            aiResponse = this.aiService.getFallbackResponse();
                                            await this.sendAIResponse(conversation_id, aiResponse, io);

                                            // If AI fails, suggest human handoff
                                            if (error.message && error.message.includes('Ollama')) {
                                                await this.handleHumanHandoff(conversation_id, io, 'AI service unavailable');
                                            }
                                        }
                                    } else {
                                        // Send FAQ response immediately
                                        await this.sendAIResponse(conversation_id, aiResponse, io);
                                    }
                                }
                            }
                        });
                    }

                    console.log(`Message sent in conversation ${conversation_id}:`, messageData.message);
                });
            });
        });

        // Handle typing indicators
        socket.on('typing_start', (data) => {
            const { conversation_id, user_name } = data;
            socket.to(`conversation_${conversation_id}`).emit('user_typing', {
                user_name,
                conversation_id
            });
        });

        socket.on('typing_stop', (data) => {
            const { conversation_id } = data;
            socket.to(`conversation_${conversation_id}`).emit('user_stop_typing', {
                conversation_id
            });
        });

        // Handle message status updates
        socket.on('message_read', (data) => {
            const { message_id } = data;
            this.db.updateMessageStatus(message_id, 'read', (err) => {
                if (err) {
                    console.error('Error updating message status:', err);
                }
            });
        });

        // Handle admin joining specific conversation
        socket.on('admin_join_conversation', (data) => {
            const { conversation_id } = data;
            socket.join(`conversation_${conversation_id}`);
        });

        // Handle admin leaving specific conversation
        socket.on('admin_leave_conversation', (data) => {
            const { conversation_id } = data;
            socket.leave(`conversation_${conversation_id}`);
        });

        // Handle request for human agent
        socket.on('request_human', async (data) => {
            const { conversation_id } = data;
            if (!conversation_id) return;

            console.log(`👤 Manual human handoff requested for conversation ${conversation_id}`);
            await this.handleHumanHandoff(conversation_id, io, 'User requested human agent');
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);

            const user = this.connectedUsers.get(socket.id);
            const admin = this.adminSockets.get(socket.id);

            if (user) {
                this.connectedUsers.delete(socket.id);
                this.notifyAdminsUserOffline(user.user_id);
            }

            if (admin) {
                this.adminSockets.delete(socket.id);
            }

            // Update session status
            this.db.updateSessionStatus(socket.id, 0, (err) => {
                if (err) console.error('Error updating session status:', err);
            });
        });
    }

    /**
     * Send AI response as a message in the conversation
     */
    async sendAIResponse(conversation_id, aiResponse, io) {
        const aiUserId = 'ai_assistant';

        // Create AI user if doesn't exist
        this.db.getUserById(aiUserId, (err, existingUser) => {
            if (!existingUser) {
                this.db.createUser({
                    id: aiUserId,
                    name: 'AI Assistant',
                    email: null,
                    is_admin: 1
                }, (err) => {
                    if (err) console.error('Error creating AI user:', err);
                });
            }
        });

        // Save AI message to database
        const messageData = {
            conversation_id,
            sender_id: aiUserId,
            message: aiResponse,
            message_type: 'text'
        };

        this.db.createMessage(messageData, (err, messageId) => {
            if (err) {
                console.error('Error saving AI message:', err);
                return;
            }

            const messageWithInfo = {
                id: messageId,
                conversation_id,
                sender_id: aiUserId,
                message: aiResponse,
                message_type: 'text',
                sender_name: 'AI Assistant',
                is_admin: 1,
                is_ai: true,
                created_at: new Date().toISOString(),
                status: 'sent'
            };

            // Send to conversation room
            io.to(`conversation_${conversation_id}`).emit('new_message', messageWithInfo);

            // Send to admins
            this.adminSockets.forEach((admin) => {
                admin.socket.emit('new_message', messageWithInfo);
            });

            console.log(`🤖 AI response sent in conversation ${conversation_id}`);
        });
    }

    /**
     * Handle handoff from AI to human agent
     */
    async handleHumanHandoff(conversation_id, io, reason = 'User request') {
        // Update conversation mode to human
        this.db.updateConversationMode(conversation_id, 'human', (err) => {
            if (err) {
                console.error('Error updating conversation mode:', err);
                return;
            }

            console.log(`✅ Conversation ${conversation_id} switched to human mode. Reason: ${reason}`);

            // Send system message to conversation
            const systemMessage = {
                conversation_id,
                sender_id: 'system',
                message: `You've been connected to our support team. A human agent will respond shortly.`,
                message_type: 'system'
            };

            this.db.createMessage(systemMessage, (err, messageId) => {
                if (err) {
                    console.error('Error saving system message:', err);
                    return;
                }

                const messageWithInfo = {
                    id: messageId,
                    conversation_id,
                    sender_id: 'system',
                    message: systemMessage.message,
                    message_type: 'system',
                    sender_name: 'System',
                    is_admin: 0,
                    created_at: new Date().toISOString(),
                    status: 'sent'
                };

                // Notify conversation participants
                io.to(`conversation_${conversation_id}`).emit('new_message', messageWithInfo);
                io.to(`conversation_${conversation_id}`).emit('mode_changed', {
                    conversation_id,
                    mode: 'human',
                    reason
                });

                // Notify all admins with high priority
                this.adminSockets.forEach((admin) => {
                    admin.socket.emit('human_agent_needed', {
                        conversation_id,
                        reason,
                        priority: 'high'
                    });
                    admin.socket.emit('new_message', messageWithInfo);
                });
            });
        });
    }

    sendOnlineUsersToAdmin(adminSocket) {
        const onlineUsers = Array.from(this.connectedUsers.values()).map(user => ({
            user_id: user.user_id,
            conversation_id: user.conversation_id
        }));
        
        adminSocket.emit('online_users', onlineUsers);
    }

    notifyAdminsUserOnline(userId, conversationId) {
        this.adminSockets.forEach((admin) => {
            admin.socket.emit('user_online', {
                user_id: userId,
                conversation_id: conversationId
            });
        });
    }

    notifyAdminsUserOffline(userId) {
        this.adminSockets.forEach((admin) => {
            admin.socket.emit('user_offline', {
                user_id: userId
            });
        });
    }

    // Get current online users count
    getOnlineUsersCount() {
        return this.connectedUsers.size;
    }

    // Get current admin count
    getAdminCount() {
        return this.adminSockets.size;
    }

    /**
     * Helper method to convert callback-based getMessages to Promise
     * Used for RAG service integration
     */
    getMessagesAsync(conversationId, limit, offset) {
        return new Promise((resolve, reject) => {
            this.db.getMessages(conversationId, limit, offset, (err, messages) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(messages);
                }
            });
        });
    }
}

module.exports = ChatHandler;