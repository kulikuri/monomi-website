require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const Database = require('./models/database');
const ChatHandler = require('./socket/chatHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize database
const db = new Database();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development
    crossOriginResourcePolicy: false, // Allow cross-origin resource loading
    crossOriginOpenerPolicy: false, // Allow cross-origin opener
    frameguard: false, // Allow iframe embedding
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for correct IP addresses
app.set('trust proxy', 1);

// Session middleware
app.use(session({
    secret: 'digimax-livechat-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use('/admin', express.static(path.join(__dirname, '../client/admin')));
app.use('/widget', express.static(path.join(__dirname, '../client/widget')));
app.use('/public', express.static(path.join(__dirname, '../client/public')));

// API routes
const authRoutes = require('./routes/auth')(db);
const chatRoutes = require('./routes/chat')(db);

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Main routes
app.get('/', (req, res) => {
    res.json({
        message: 'DigiMax Live Chat System',
        version: '1.0.0',
        endpoints: {
            admin: '/admin',
            widget: '/widget',
            api: '/api'
        }
    });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/admin/index.html'));
});

app.get('/widget', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/widget/index.html'));
});


// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Socket.io connection handling
const chatHandler = new ChatHandler(db);
io.on('connection', (socket) => {
    chatHandler.handleConnection(socket, io);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
        console.log('HTTP server closed');
        db.close();
        process.exit(0);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\n🚀 DigiMax Live Chat System running on port ${PORT}`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`💬 Chat Widget: http://localhost:${PORT}/widget`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
    console.log(`\n👤 Default Admin Credentials:`);
    console.log(`   Email: admin@digimax.com`);
    console.log(`   Password: admin123\n`);
});

module.exports = { app, server, io };

