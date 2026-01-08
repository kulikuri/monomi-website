# DigiMax Live Chat System

A real-time live chat system for social media agencies with admin dashboard and embeddable widget.

## Features

- ✅ Real-time messaging with Socket.io
- ✅ Admin dashboard for managing conversations
- ✅ Embeddable chat widget for websites
- ✅ User authentication for admin panel
- ✅ SQLite database for data persistence
- ✅ Typing indicators and online status
- ✅ Mobile responsive design
- ✅ Docker containerization
- ✅ Professional UI/UX design

## Quick Start

### Option 1: Using Docker (Recommended)

1. **Clone and setup:**
   ```bash
   cd livechat
   cp .env.example .env
   ```

2. **Build and run:**
   ```bash
   docker-compose up --build
   ```

3. **Access the system:**
   - Admin Dashboard: http://localhost:3000/admin
   - Chat Widget Demo: http://localhost:3000/widget
   - API: http://localhost:3000/api

### Option 2: Manual Installation

1. **Install dependencies:**
   ```bash
   cd livechat
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## Admin Access

**Default Admin Credentials:**
- Email: `admin@digimax.com`
- Password: `admin123`

⚠️ **Important:** Change these credentials in production!

## Embedding the Chat Widget

### Method 1: Direct Embed (Simple)

Add this code before the closing `</body>` tag of your website:

```html
<!-- DigiMax Live Chat Widget -->
<script>
    window.DIGIMAX_CHAT_URL = 'http://localhost:3000'; // Change to your domain
</script>
<script src="http://localhost:3000/public/embed.js"></script>
```

### Method 2: Custom Integration

```javascript
// Load the widget programmatically
(function() {
    const script = document.createElement('script');
    script.src = 'http://localhost:3000/public/embed.js';
    script.onload = function() {
        // Widget is ready
        console.log('DigiMax Chat loaded');
    };
    document.head.appendChild(script);
})();
```

### Widget API

Once embedded, you can control the widget programmatically:

```javascript
// Open chat widget
DigiMaxChat.open();

// Close chat widget
DigiMaxChat.close();

// Toggle chat widget
DigiMaxChat.toggle();

// Hide widget completely
DigiMaxChat.hide();

// Show widget
DigiMaxChat.show();
```

## Project Structure

```
livechat/
├── server/
│   ├── app.js              # Main application server
│   ├── models/
│   │   └── database.js     # Database models and queries
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   └── chat.js         # Chat API routes
│   └── socket/
│       └── chatHandler.js  # Socket.io event handlers
├── client/
│   ├── admin/              # Admin dashboard
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   ├── widget/             # Chat widget
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   └── public/
│       └── embed.js        # Widget embed script
├── database/               # SQLite database files
├── docker-compose.yml      # Docker composition
├── Dockerfile             # Docker image configuration
└── package.json           # Node.js dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/status` - Check auth status
- `POST /api/auth/logout` - Admin logout

### Chat Management
- `GET /api/chat/conversations` - Get all conversations (Admin only)
- `GET /api/chat/conversations/:id` - Get specific conversation (Admin only)
- `GET /api/chat/conversations/:id/messages` - Get conversation messages (Admin only)
- `PUT /api/chat/conversations/:id/status` - Update conversation status (Admin only)
- `POST /api/chat/visitor` - Create new visitor and conversation
- `GET /api/chat/online-users` - Get online users (Admin only)

### System
- `GET /health` - Health check endpoint
- `GET /` - API information

## Socket.io Events

### Client to Server
- `join_chat` - Join a chat room
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `admin_join_conversation` - Admin joins specific conversation
- `admin_leave_conversation` - Admin leaves specific conversation

### Server to Client
- `new_message` - New message received
- `user_typing` - User is typing
- `user_stop_typing` - User stopped typing
- `user_online` - User came online
- `user_offline` - User went offline
- `online_users` - List of online users
- `conversation_updated` - Conversation was updated

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User name
- `email` - User email (optional)
- `ip_address` - IP address
- `user_agent` - Browser user agent
- `is_admin` - Admin flag
- `password` - Admin password (hashed)
- `created_at` - Creation timestamp

### Conversations Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `status` - Conversation status (active/closed/pending)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Messages Table
- `id` - Primary key
- `conversation_id` - Foreign key to conversations
- `sender_id` - Foreign key to users
- `message` - Message content
- `message_type` - Message type (text/image/file)
- `status` - Message status (sent/delivered/read)
- `created_at` - Creation timestamp

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./database/chat.db
SESSION_SECRET=your-secret-key-here
ADMIN_EMAIL=admin@digimax.com
ADMIN_PASSWORD=admin123
MAX_MESSAGE_LENGTH=1000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

## Production Deployment

### 1. Update Configuration

```bash
# Update environment variables
cp .env.example .env
# Edit .env with your production values
```

### 2. Build and Deploy

```bash
# Using Docker
docker-compose -f docker-compose.yml up -d

# Or build for production
npm ci --only=production
NODE_ENV=production npm start
```

### 3. Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL Certificate

```bash
# Using Certbot
sudo certbot --nginx -d your-domain.com
```

## Customization

### Styling

Edit the CSS files in `client/admin/style.css` and `client/widget/style.css` to match your brand:

```css
:root {
    --primary-color: #your-brand-color;
    --secondary-color: #your-secondary-color;
    --accent-color: #your-accent-color;
}
```

### Branding

Update the following in the code:
- Company name in headers
- Logo/icons
- Color scheme
- Welcome messages

## Troubleshooting

### Common Issues

1. **Socket.io connection fails**
   - Check CORS configuration
   - Verify server URL in embed code
   - Check firewall settings

2. **Admin login doesn't work**
   - Verify default credentials
   - Check database permissions
   - Review server logs

3. **Widget doesn't appear**
   - Check embed script URL
   - Verify CORS settings
   - Check browser console for errors

### Debug Mode

Enable debug logs:

```bash
DEBUG=* npm start
```

### Health Check

```bash
curl http://localhost:3000/health
```

## Support

For support and questions:
- Check the logs: `docker-compose logs livechat`
- Review the API responses
- Check browser developer console

## License

MIT License - Feel free to modify and use for your projects.

---

**DigiMax Live Chat System v1.0.0**  
Built with ❤️ for social media agencies