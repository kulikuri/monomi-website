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

// Initialize database (shared with admin server)
const db = new Database();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development
}));

// Rate limiting (more restrictive for visitors)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50 // limit each IP to 50 requests per windowMs
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
    secret: 'digimax-visitor-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve visitor static files
app.use('/widget', express.static(path.join(__dirname, '../client/widget')));
app.use('/public', express.static(path.join(__dirname, '../client/public')));

// Limited API routes for visitors (no admin routes)
const chatRoutes = require('./routes/chat')(db);
app.use('/api/chat', chatRoutes);

// Visitor-specific routes
app.get('/', (req, res) => {
    res.redirect('/widget');
});

app.get('/widget', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/widget/index.html'));
});

// Embed script endpoint
app.get('/embed.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, '../client/public/embed.js'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        server: 'visitor',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Socket.io connection handling (visitor-focused)
const chatHandler = new ChatHandler(db);
io.on('connection', (socket) => {
    // Mark this connection as visitor-side
    socket.isVisitor = true;
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
    console.log('\nShutting down visitor server gracefully...');
    server.close(() => {
        console.log('Visitor HTTP server closed');
        process.exit(0);
    });
});

const PORT = process.env.VISITOR_PORT || 8080;
server.listen(PORT, () => {
    console.log(`\n💬 DigiMax Visitor Server running on port ${PORT}`);
    console.log(`🌐 Chat Widget: http://localhost:${PORT}/widget`);
    console.log(`📦 Embed Script: http://localhost:${PORT}/embed.js`);
    console.log(`🔗 API: http://localhost:${PORT}/api/chat\n`);
});

module.exports = { app, server, io };