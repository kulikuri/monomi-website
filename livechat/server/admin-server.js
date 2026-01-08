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
        origin: ["http://localhost:8080", "http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});

// Initialize database
const db = new Database();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS
app.use(cors({
    origin: ["http://localhost:8080", "http://localhost:3000"],
    credentials: true
}));

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

// Serve admin static files
app.use('/admin', express.static(path.join(__dirname, '../client/admin')));
app.use('/public', express.static(path.join(__dirname, '../client/public')));

// API routes
const authRoutes = require('./routes/auth')(db);
const chatRoutes = require('./routes/chat')(db);

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Admin routes only
app.get('/', (req, res) => {
    res.redirect('/admin');
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/admin/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        server: 'admin',
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
    console.log('\nShutting down admin server gracefully...');
    server.close(() => {
        console.log('Admin HTTP server closed');
        db.close();
        process.exit(0);
    });
});

const PORT = process.env.ADMIN_PORT || 3000;
server.listen(PORT, () => {
    console.log(`\n🔐 DigiMax Admin Server running on port ${PORT}`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
    console.log(`\n👤 Default Admin Credentials:`);
    console.log(`   Email: admin@digimax.com`);
    console.log(`   Password: admin123\n`);
});

module.exports = { app, server, io };