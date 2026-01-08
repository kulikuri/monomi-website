# AI-Powered Live Chat Setup Guide

## Overview

Your live chat system now includes **AI-powered automatic responses** with intelligent handoff to human agents. The system uses a hybrid approach where AI handles general questions, and humans take over when needed.

---

## How It Works

### AI Mode (Default)
- **Automatic Responses**: AI automatically responds to visitor messages
- **FAQ Matching**: Instant answers to common questions
- **Context-Aware**: Remembers conversation history
- **Fast & Helpful**: Provides immediate assistance 24/7

### Human Handoff
The system automatically switches to human mode when:
1. User clicks **"Talk to Human"** button
2. User types keywords like "human agent", "live person", "speak to someone"
3. AI detects questions it cannot handle
4. AI service is unavailable

**After handoff:**
- AI stops responding to that conversation
- Admin gets high-priority notification
- Human agent takes over completely

---

## Installation & Setup

### Option 1: Using Ollama (Recommended for Development)

#### Step 1: Install Ollama
Download and install Ollama from: https://ollama.ai

```bash
# Windows: Download installer from ollama.ai
# Mac: brew install ollama
# Linux: curl https://ollama.ai/install.sh | sh
```

#### Step 2: Pull a Model
```bash
# Pull Llama 3 (recommended, ~4GB)
ollama pull llama3

# Or use Mistral (smaller, ~4GB)
ollama pull mistral

# Or use Llama 2 (alternative, ~3.8GB)
ollama pull llama2
```

#### Step 3: Start Ollama Server
```bash
ollama serve
```

Keep this running in a terminal window. Ollama runs on `http://localhost:11434` by default.

#### Step 4: Configure .env
Your `.env` file is already configured for Ollama:
```env
AI_PROVIDER=ollama
AI_MODEL=llama3
OLLAMA_URL=http://localhost:11434
```

#### Step 5: Start Live Chat Server
```bash
npm start
```

---

### Option 2: Using Hugging Face

#### Step 1: Get API Key
1. Go to https://huggingface.co
2. Sign up / Log in
3. Go to Settings → Access Tokens
4. Create a new token

#### Step 2: Update .env
```env
AI_PROVIDER=huggingface
AI_MODEL=mistralai/Mistral-7B-Instruct-v0.2
AI_API_KEY=your_huggingface_token_here
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=500
```

#### Step 3: Start Server
```bash
npm start
```

---

### Option 3: Using OpenAI (GPT-4)

#### Step 1: Get API Key
1. Go to https://platform.openai.com
2. Create API key

#### Step 2: Update .env
```env
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
AI_API_KEY=sk-your-openai-api-key-here
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=500
```

#### Step 3: Start Server
```bash
npm start
```

---

### Option 4: Using Claude (Anthropic)

#### Step 1: Get API Key
1. Go to https://console.anthropic.com
2. Create API key

#### Step 2: Update .env
```env
AI_PROVIDER=claude
AI_MODEL=claude-3-haiku-20240307
AI_API_KEY=your_anthropic_api_key_here
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=500
```

#### Step 3: Start Server
```bash
npm start
```

---

## Testing the AI System

### 1. Start the Chat Widget
1. Open http://localhost:3000/widget
2. Enter your name and start chat
3. Look for the **"AI Assistant"** badge in the header

### 2. Test AI Responses
Try these messages:
- "What services do you offer?"
- "What are your business hours?"
- "How much does it cost?"
- "Can you help me with SEO?"

### 3. Test Human Handoff

**Method 1: Click Button**
- Click the **"Talk to Human"** button
- System message appears: "You've been connected to our support team"
- Badge changes to **"Human Agent"**
- Button disappears

**Method 2: Use Keywords**
- Type: "I want to speak to a human"
- Type: "Can I talk to a real person?"
- Type: "Connect me to an agent"

### 4. Verify Mode Change
- Open admin dashboard: http://localhost:3000/admin
- Login with `admin@digimax.com` / `admin123`
- You should see a notification for human agent needed
- The conversation should show it's in "Human" mode

---

## Features

### For Visitors

✅ **AI Badge**: Shows when AI is responding
✅ **Robot Icon**: AI messages have a robot avatar
✅ **Talk to Human Button**: One-click handoff
✅ **System Messages**: Clear notifications when mode changes
✅ **Instant Responses**: FAQ answers in milliseconds
✅ **Context-Aware**: AI remembers previous messages

### For Admins

✅ **Mode Indicator**: See which conversations are AI vs Human
✅ **High Priority Alerts**: Get notified when human help is needed
✅ **Full Chat History**: See all AI and human messages
✅ **Manual Override**: Admins can take over any conversation

### Built-in FAQs

The system has intelligent FAQ matching for:
- Business hours
- Pricing inquiries
- Service information
- Contact details

### Smart Handoff Detection

AI automatically detects when to hand off based on:
- Keywords (human, agent, representative, etc.)
- Complex questions it can't answer
- Service failures or errors

---

## Configuration Options

### AI Settings (.env file)

```env
# Provider: ollama | huggingface | openai | claude
AI_PROVIDER=ollama

# Model name (depends on provider)
AI_MODEL=llama3

# Ollama server URL (if using Ollama)
OLLAMA_URL=http://localhost:11434

# API Key (if using cloud providers)
AI_API_KEY=your_api_key_here

# Response randomness (0.0 to 1.0)
# Lower = more consistent, Higher = more creative
AI_TEMPERATURE=0.7

# Maximum response length (in tokens)
AI_MAX_TOKENS=500
```

### Customizing AI Behavior

Edit `livechat/server/services/aiService.js`:

**Change System Prompt** (line 27):
```javascript
this.systemPrompt = `Your custom instructions here...`;
```

**Add/Modify FAQs** (line 85):
```javascript
const faqs = {
    'your_topic': {
        keywords: ['keyword1', 'keyword2'],
        response: 'Your answer here'
    }
};
```

**Add Handoff Keywords** (line 25):
```javascript
this.handoffKeywords = [
    'human', 'agent', 'your_custom_keyword'
];
```

---

## Troubleshooting

### "Ollama is not running"
```bash
# Start Ollama server
ollama serve
```

### "Model not found"
```bash
# Pull the model first
ollama pull llama3
```

### "AI not responding"
1. Check server console for errors
2. Verify `.env` configuration
3. Test Ollama: `curl http://localhost:11434/api/tags`
4. Check browser console for JavaScript errors

### "API rate limit exceeded" (Cloud providers)
- Reduce AI_MAX_TOKENS
- Add rate limiting
- Consider switching to Ollama

### "AI responses are slow"
- Use a smaller model (mistral instead of llama3)
- Reduce AI_MAX_TOKENS
- Use Ollama instead of cloud APIs

---

## Migration to Hugging Face

When you're ready to deploy to Hugging Face:

### 1. Create Hugging Face Account
https://huggingface.co/join

### 2. Get API Token
Settings → Access Tokens → New Token

### 3. Update .env
```env
AI_PROVIDER=huggingface
AI_MODEL=mistralai/Mistral-7B-Instruct-v0.2
AI_API_KEY=hf_your_token_here
```

### 4. Deploy
```bash
# Install dependencies
npm install

# Start server
npm start
```

### Recommended Hugging Face Models:
- `mistralai/Mistral-7B-Instruct-v0.2` (Best quality)
- `google/flan-t5-large` (Faster, smaller)
- `facebook/blenderbot-400M-distill` (Chat optimized)

---

## Architecture

```
User Message
    ↓
Check Conversation Mode
    ↓
┌─────────────────────────┐
│   AI Mode?              │
│   ├─ Yes → AI Response │
│   └─ No → Wait for     │
│          Human         │
└─────────────────────────┘
    ↓
Check Handoff Triggers
    ↓
┌─────────────────────────┐
│ Keywords Detected?      │
│ ├─ Yes → Switch to     │
│ │        Human Mode     │
│ └─ No → Continue AI     │
└─────────────────────────┘
```

---

## API Reference

### Socket Events (Client → Server)

```javascript
// Request human agent
socket.emit('request_human', {
    conversation_id: 'conv_123'
});
```

### Socket Events (Server → Client)

```javascript
// Mode changed notification
socket.on('mode_changed', (data) => {
    // data.conversation_id
    // data.mode ('ai' or 'human')
    // data.reason
});

// AI typing indicator
socket.on('ai_typing', (data) => {
    // data.conversation_id
});

// Human agent needed (admin only)
socket.on('human_agent_needed', (data) => {
    // data.conversation_id
    // data.reason
    // data.priority ('high')
});
```

---

## Performance Tips

### For Development
- Use Ollama with smaller models (mistral, llama2)
- Keep AI_MAX_TOKENS low (200-500)
- Test locally first

### For Production
- Use cloud APIs for reliability (OpenAI, Claude)
- Set up error monitoring
- Implement response caching for FAQs
- Add rate limiting per user

---

## Security Considerations

✅ **Input Validation**: All user messages are sanitized
✅ **Rate Limiting**: Prevents spam and abuse
✅ **API Key Protection**: Never expose keys in frontend
✅ **Conversation Isolation**: Each conversation is separate
✅ **Admin Authentication**: Protected admin routes

---

## Next Steps

1. **Test locally** with Ollama
2. **Customize FAQs** for your business
3. **Adjust AI prompt** to match your brand voice
4. **Train your team** on handoff workflows
5. **Monitor performance** and adjust settings
6. **Deploy to production** when ready

---

## Support

For issues or questions:
- Check server console logs
- Review browser console errors
- Test with `curl` commands
- Read Ollama documentation: https://ollama.ai/docs

---

**Built with ❤️ for DigiMax Live Chat**
