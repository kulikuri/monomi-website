const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, '../../database/chat.db'), (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to SQLite database');
                this.init();
            }
        });
    }

    init() {
        this.db.serialize(() => {
            // Users table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT,
                    ip_address TEXT,
                    user_agent TEXT,
                    is_admin INTEGER DEFAULT 0,
                    password TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Conversations table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS conversations (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    status TEXT DEFAULT 'active',
                    mode TEXT DEFAULT 'ai',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Messages table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    conversation_id TEXT NOT NULL,
                    sender_id TEXT NOT NULL,
                    message TEXT NOT NULL,
                    message_type TEXT DEFAULT 'text',
                    status TEXT DEFAULT 'sent',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Sessions table
            this.db.run(`
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    user_id INTEGER,
                    socket_id TEXT,
                    is_online INTEGER DEFAULT 1,
                    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            `);

            // Create default admin user
            this.createDefaultAdmin();
        });
    }

    createDefaultAdmin() {
        const bcrypt = require('bcrypt');
        const adminPassword = bcrypt.hashSync('admin123', 10);
        
        this.db.get("SELECT * FROM users WHERE is_admin = 1", (err, row) => {
            if (!row) {
                this.db.run(
                    "INSERT INTO users (id, name, email, is_admin, password) VALUES (?, ?, ?, ?, ?)",
                    ['admin_1', 'Admin', 'admin@digimax.com', 1, adminPassword],
                    (err) => {
                        if (err) {
                            console.error('Error creating admin user:', err);
                        } else {
                            console.log('Default admin user created - Email: admin@digimax.com, Password: admin123');
                        }
                    }
                );
            }
        });
    }

    // User methods
    createUser(userData, callback) {
        const { id, name, email, ip_address, user_agent, is_admin = 0, password } = userData;
        if (id) {
            // Create with specific ID
            this.db.run(
                "INSERT OR IGNORE INTO users (id, name, email, ip_address, user_agent, is_admin, password) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [id, name, email || null, ip_address, user_agent, is_admin, password],
                function(err) {
                    if (callback) callback(err, id);
                }
            );
        } else {
            // Auto-generate numeric ID for legacy compatibility
            this.db.run(
                "INSERT INTO users (id, name, email, ip_address, user_agent, is_admin, password) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [Date.now().toString(), name, email || null, ip_address, user_agent, is_admin, password],
                function(err) {
                    if (callback) callback(err, Date.now().toString());
                }
            );
        }
    }

    getUserById(id, callback) {
        this.db.get("SELECT * FROM users WHERE id = ?", [id], callback);
    }

    getUserByEmail(email, callback) {
        this.db.get("SELECT * FROM users WHERE email = ?", [email], callback);
    }

    // Conversation methods
    createConversation(conversationData, callback) {
        if (typeof conversationData === 'string' || typeof conversationData === 'number') {
            // Legacy support: just userId
            this.db.run(
                "INSERT INTO conversations (user_id, mode) VALUES (?, ?)",
                [conversationData, 'ai'],
                function(err) {
                    if (callback) callback(err, this ? this.lastID : null);
                }
            );
        } else {
            // New support: object with id, user_id, status, mode
            const { id, user_id, status = 'active', mode = 'ai' } = conversationData;
            if (id) {
                // Create with custom ID
                this.db.run(
                    "INSERT OR IGNORE INTO conversations (id, user_id, status, mode) VALUES (?, ?, ?, ?)",
                    [id, user_id, status, mode],
                    function(err) {
                        if (callback) callback(err, id);
                    }
                );
            } else {
                // Auto-generate ID
                this.db.run(
                    "INSERT INTO conversations (user_id, status, mode) VALUES (?, ?, ?)",
                    [user_id, status, mode],
                    function(err) {
                        if (callback) callback(err, this ? this.lastID : null);
                    }
                );
            }
        }
    }

    getConversation(id, callback) {
        this.db.get(`
            SELECT c.*, u.name as user_name, u.email as user_email, u.ip_address
            FROM conversations c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [id], callback);
    }

    getAllConversations(callback) {
        this.db.all(`
            SELECT c.*, u.name as user_name, u.email as user_email,
                   COUNT(m.id) as message_count,
                   MAX(m.created_at) as last_message_time
            FROM conversations c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN messages m ON c.id = m.conversation_id
            GROUP BY c.id
            ORDER BY c.updated_at DESC
        `, callback);
    }

    updateConversationStatus(id, status, callback) {
        this.db.run(
            "UPDATE conversations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [status, id],
            callback
        );
    }

    updateConversationMode(id, mode, callback) {
        this.db.run(
            "UPDATE conversations SET mode = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [mode, id],
            callback
        );
    }

    // Message methods
    createMessage(messageData, callback) {
        const { conversation_id, sender_id, message, message_type = 'text' } = messageData;
        const self = this; // Store reference to this
        this.db.run(
            "INSERT INTO messages (conversation_id, sender_id, message, message_type) VALUES (?, ?, ?, ?)",
            [conversation_id, sender_id, message, message_type],
            function(err) {
                if (!err) {
                    // Update conversation timestamp
                    self.db.run(
                        "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                        [conversation_id]
                    );
                }
                if (callback) callback(err, this ? this.lastID : null);
            }
        );
    }

    getMessages(conversationId, limit = 50, offset = 0, callback) {
        this.db.all(`
            SELECT m.*, u.name as sender_name, u.is_admin
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = ?
            ORDER BY m.created_at ASC
            LIMIT ? OFFSET ?
        `, [conversationId, limit, offset], callback);
    }

    updateMessageStatus(id, status, callback) {
        this.db.run(
            "UPDATE messages SET status = ? WHERE id = ?",
            [status, id],
            callback
        );
    }

    // Session methods
    createSession(sessionData, callback) {
        const { id, user_id, socket_id } = sessionData;
        this.db.run(
            "INSERT OR REPLACE INTO sessions (id, user_id, socket_id) VALUES (?, ?, ?)",
            [id, user_id, socket_id],
            callback
        );
    }

    updateSessionStatus(sessionId, isOnline, callback) {
        this.db.run(
            "UPDATE sessions SET is_online = ?, last_activity = CURRENT_TIMESTAMP WHERE id = ?",
            [isOnline, sessionId],
            callback
        );
    }

    getOnlineUsers(callback) {
        this.db.all(`
            SELECT u.*, s.socket_id
            FROM users u
            JOIN sessions s ON u.id = s.user_id
            WHERE s.is_online = 1 AND u.is_admin = 0
        `, callback);
    }

    close() {
        this.db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed');
            }
        });
    }
}

module.exports = Database;