# Running AI Live Chat with Docker + Ollama

This guide shows you how to run the entire AI-powered live chat system using Docker, including Ollama for AI responses.

## Prerequisites

- Docker Desktop installed and running
- At least 8GB RAM available
- ~5GB free disk space (for Ollama models)

## Quick Start (Everything in Docker)

### Step 1: Set Up Ollama

Run the setup script to install Ollama and download the AI model:

```bash
setup-ollama.bat
```

This will:
- Start Ollama container
- Download llama3 model (~4GB, takes 5-10 minutes)
- Verify installation

**Note:** The first time takes a while to download the model. Be patient!

### Step 2: Start All Services

```bash
docker-compose up -d
```

This starts:
- **Ollama** (AI service) on `http://localhost:11434`
- **LiveChat** (chat server) on `http://localhost:3000`

### Step 3: Access the Chat

- **Widget**: http://localhost:3000/widget
- **Admin**: http://localhost:3000/admin
  - Email: `admin@digimax.com`
  - Password: `admin123`

---

## Alternative: Ollama in Docker, LiveChat Locally

If you want to develop locally but use Ollama in Docker:

### Step 1: Start Ollama Only

```bash
start-ollama-docker.bat
```

### Step 2: Pull AI Model (if not already done)

```bash
docker exec digimax-ollama ollama pull llama3
```

### Step 3: Run LiveChat Locally

```bash
npm install
npm start
```

The local server will connect to Ollama running in Docker.

---

## Useful Docker Commands

### View Logs

```bash
# Ollama logs
docker logs digimax-ollama -f

# LiveChat logs
docker logs digimax-livechat -f

# All logs
docker-compose logs -f
```

### Check Status

```bash
# Check running containers
docker-compose ps

# Check Ollama models
docker exec digimax-ollama ollama list

# Check Ollama API
curl http://localhost:11434/api/tags
```

### Restart Services

```bash
# Restart everything
docker-compose restart

# Restart specific service
docker-compose restart livechat
docker-compose restart ollama
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

---

## AI Model Management

### Pull Different Models

```bash
# Llama 3 (recommended, ~4GB)
docker exec digimax-ollama ollama pull llama3

# Mistral (smaller, faster, ~4GB)
docker exec digimax-ollama ollama pull mistral

# Llama 2 (alternative, ~3.8GB)
docker exec digimax-ollama ollama pull llama2

# Smaller models for testing
docker exec digimax-ollama ollama pull tinyllama
docker exec digimax-ollama ollama pull phi
```

### Change Active Model

Edit `docker-compose.yml` or `.env`:
```yaml
environment:
  - AI_MODEL=mistral  # Change this
```

Then restart:
```bash
docker-compose restart livechat
```

### List Available Models

```bash
docker exec digimax-ollama ollama list
```

### Remove Models

```bash
docker exec digimax-ollama ollama rm llama2
```

---

## Troubleshooting

### "Ollama is not running"

**Check if container is running:**
```bash
docker ps | findstr ollama
```

**If not running, start it:**
```bash
docker-compose up -d ollama
```

**Check logs for errors:**
```bash
docker logs digimax-ollama
```

### "Model not found"

**Pull the model:**
```bash
docker exec digimax-ollama ollama pull llama3
```

**Verify it's downloaded:**
```bash
docker exec digimax-ollama ollama list
```

### "Connection refused" (livechat can't reach Ollama)

**Make sure both containers are on the same network:**
```bash
docker network inspect livechat_livechat-network
```

**Restart services:**
```bash
docker-compose restart
```

### "Out of memory" / "Ollama crashes"

Ollama models need RAM:
- llama3: ~8GB RAM
- mistral: ~8GB RAM
- tinyllama: ~1GB RAM

**Solutions:**
1. Use a smaller model (tinyllama, phi)
2. Increase Docker memory limit (Docker Desktop → Settings → Resources)
3. Close other applications

### "Port already in use"

**Check what's using port 3000 or 11434:**
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :11434
```

**Kill the process or change ports in docker-compose.yml**

---

## Architecture

```
┌─────────────────────┐
│  Browser (User)     │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Docker Container   │
│  LiveChat :3000     │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Docker Container   │
│  Ollama :11434      │
│  (AI Models)        │
└─────────────────────┘
```

Both containers communicate via Docker network `livechat-network`.

---

## Performance Tips

### For Development
- Use smaller models: `tinyllama` or `phi`
- Reduce `AI_MAX_TOKENS` to 200-300
- Set `AI_TEMPERATURE` to 0.5 for faster responses

### For Production
- Use `llama3` or `mistral` for quality
- Consider cloud AI (OpenAI, Claude) for better reliability
- Monitor container resources

---

## Switching to Cloud AI (No Ollama Needed)

If Ollama is too resource-intensive, switch to cloud AI:

### OpenAI (GPT-4)

Edit `docker-compose.yml`:
```yaml
environment:
  - AI_PROVIDER=openai
  - AI_MODEL=gpt-4o-mini
  - AI_API_KEY=sk-your-key-here
```

Then:
```bash
docker-compose down ollama  # Stop Ollama
docker-compose up -d livechat  # Start chat only
```

### Claude (Anthropic)

```yaml
environment:
  - AI_PROVIDER=claude
  - AI_MODEL=claude-3-haiku-20240307
  - AI_API_KEY=your-key-here
```

### Hugging Face

```yaml
environment:
  - AI_PROVIDER=huggingface
  - AI_MODEL=mistralai/Mistral-7B-Instruct-v0.2
  - AI_API_KEY=hf_your-token-here
```

---

## Data Persistence

All data is stored in Docker volumes:

- **ollama-data**: AI models (~4-5GB)
- **database**: Chat database (SQLite)
- **logs**: Application logs

These persist even if you stop/restart containers.

### Backup Data

```bash
# Backup database
docker cp digimax-livechat:/app/database ./database-backup

# Export volumes
docker run --rm -v livechat_ollama-data:/data -v ${PWD}:/backup alpine tar czf /backup/ollama-backup.tar.gz /data
```

### Fresh Start (Delete All Data)

```bash
docker-compose down -v
```

---

## System Requirements

### Minimum
- 8GB RAM
- 4 CPU cores
- 10GB disk space
- Docker Desktop

### Recommended
- 16GB RAM
- 8 CPU cores
- 20GB disk space
- SSD storage

---

## Next Steps

1. ✅ Run `setup-ollama.bat`
2. ✅ Wait for model download
3. ✅ Run `docker-compose up -d`
4. ✅ Test at http://localhost:3000/widget
5. ✅ Customize AI prompts in `server/services/aiService.js`
6. 🚀 Deploy to production!

---

For more details on AI configuration, see **AI_SETUP.md**
