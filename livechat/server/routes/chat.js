const express = require('express');
const router = express.Router();

// Middleware to check if user is authenticated admin
const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.is_admin) {
        next();
    } else {
        res.status(401).json({ error: 'Admin access required' });
    }
};

module.exports = (db) => {
    // Get all conversations (admin only)
    router.get('/conversations', requireAdmin, (req, res) => {
        db.getAllConversations((err, conversations) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(conversations);
        });
    });

    // Get specific conversation
    router.get('/conversations/:id', requireAdmin, (req, res) => {
        const conversationId = req.params.id;
        
        db.getConversation(conversationId, (err, conversation) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!conversation) {
                return res.status(404).json({ error: 'Conversation not found' });
            }

            res.json(conversation);
        });
    });

    // Get messages for a conversation
    router.get('/conversations/:id/messages', requireAdmin, (req, res) => {
        const conversationId = req.params.id;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        db.getMessages(conversationId, limit, offset, (err, messages) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(messages);
        });
    });

    // Update conversation status
    router.put('/conversations/:id/status', requireAdmin, (req, res) => {
        const conversationId = req.params.id;
        const { status } = req.body;
        
        if (!['active', 'closed', 'pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        db.updateConversationStatus(conversationId, status, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true });
        });
    });

    // Create new visitor user
    router.post('/visitor', (req, res) => {
        const { name, email } = req.body;
        const ip_address = req.ip;
        const user_agent = req.get('User-Agent');

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const userData = { name, email, ip_address, user_agent };
        
        db.createUser(userData, (err, userId) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            // Create conversation for the user
            db.createConversation(userId, (err, conversationId) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                res.json({
                    success: true,
                    user_id: userId,
                    conversation_id: conversationId
                });
            });
        });
    });

    // Get online users (admin only)
    router.get('/online-users', requireAdmin, (req, res) => {
        db.getOnlineUsers((err, users) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(users);
        });
    });

    return router;
};