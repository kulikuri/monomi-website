# DigiMax LiveChat - Split Server Setup

## Quick Start Commands

### Install Dependencies (first time only)
```bash
cd livechat
npm install
```

### Option 1: Run Both Servers Together (Recommended)
```bash
npm run start:split
```
This starts both servers simultaneously:
- **Admin Dashboard**: http://localhost:3000/admin
- **Visitor Widget**: http://localhost:8080/widget

### Option 2: Run Servers Separately

**Terminal 1 - Admin Server:**
```bash
npm run start:admin
```
Access: http://localhost:3000/admin

**Terminal 2 - Visitor Server:**
```bash
npm run start:visitor
```
Access: http://localhost:8080/widget

### Development Mode (with auto-restart)
```bash
# Both servers with nodemon
npm run dev:split

# Or separately:
npm run dev:admin    # Terminal 1
npm run dev:visitor  # Terminal 2
```

## Server Configuration

### Admin Server (Port 3000)
- Admin dashboard interface
- Full API access
- User management
- Conversation management
- Real-time chat monitoring

### Visitor Server (Port 8080)
- Visitor chat widget
- Limited API access (chat only)
- Embed script serving
- Public-facing interface

## Admin Credentials
- **Email**: admin@digimax.com
- **Password**: admin123

## Testing the Setup
1. Open http://localhost:3000/admin (login with admin credentials)
2. Open http://localhost:8080/widget (start a visitor chat)
3. Watch messages appear in real-time on both interfaces

## Benefits of Split Setup
- **Security**: Admin and visitor interfaces are isolated
- **Scaling**: Can deploy admin and visitor servers independently
- **Performance**: Separate resource allocation
- **Development**: Test both perspectives simultaneously