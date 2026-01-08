# Storage Configuration Guide

Choose the best installation method based on your available disk space.

## 🎯 Quick Decision Guide

| Situation | Recommended Method | Guide |
|-----------|-------------------|-------|
| **C: drive full** | D: drive setup | `D_DRIVE_SETUP.md` |
| **Have Docker** | Docker setup | `DOCKER_AI_SETUP.md` |
| **Simple setup** | Local default | `QUICK_START.md` |
| **Cloud only** | No local AI | `AI_SETUP.md` |

---

## Option 1: D: Drive Setup (Recommended for Limited C: Drive)

**What gets stored where:**
- C: drive: ~50MB (Ollama program)
- D: drive: ~4-5GB (AI models)

**Setup:**
```bash
setup-ollama-d-drive.bat
# Follow prompts, then:
pull-model-d-drive.bat
start-ollama-d-drive.bat
```

**Start daily:**
```bash
start-all.bat
```

📖 **Full Guide:** `D_DRIVE_SETUP.md`

---

## Option 2: Docker (Everything in Project Folder)

**Requirements:**
- Docker Desktop installed
- 8GB+ RAM available

**What gets stored where:**
- D:\porto\livechat\volumes: ~5GB (everything)
- C: drive: 0 bytes (Docker manages)

**Setup:**
```bash
# Start Docker Desktop first
setup-ollama.bat
docker-compose up -d
```

📖 **Full Guide:** `DOCKER_AI_SETUP.md`

---

## Option 3: Default C: Drive Install

**What gets stored where:**
- C:\Users\...\AppData\Local\Programs\Ollama: ~50MB
- C:\Users\...\.ollama\models: ~4-5GB

**Setup:**
```bash
install-ollama-local.bat
# Then:
ollama pull llama3
ollama serve
```

📖 **Full Guide:** `QUICK_START.md`

---

## Option 4: Cloud AI (No Local Storage)

**What gets stored where:**
- C: drive: 0 bytes
- D: drive: Only project code (~50MB)
- Cloud: AI processing

**Providers:**
- OpenAI GPT-4 ($)
- Claude/Anthropic ($)
- Hugging Face (free tier)

**Setup:**
1. Get API key from provider
2. Edit `.env`:
   ```env
   AI_PROVIDER=openai
   AI_MODEL=gpt-4o-mini
   AI_API_KEY=sk-your-key
   ```
3. Start:
   ```bash
   npm start
   ```

📖 **Full Guide:** `AI_SETUP.md`

---

## Disk Space Comparison

| Method | C: Drive | D: Drive | Total | Speed |
|--------|----------|----------|-------|-------|
| **D: Drive** | 50MB | 4-5GB | ~5GB | Fast |
| **Docker** | 0MB* | 5GB** | ~5GB | Fast |
| **C: Default** | 4-5GB | 0MB | ~5GB | Fast |
| **Cloud AI** | 0MB | 50MB | ~50MB | Slower |

\* Docker uses C: drive for Docker itself (~2GB)
\** In project folder volumes

---

## Model Size Reference

| Model | Size | Quality | Speed | RAM |
|-------|------|---------|-------|-----|
| **llama3** | 4.0GB | Excellent | Medium | 8GB |
| **mistral** | 4.0GB | Excellent | Medium | 8GB |
| **phi** | 1.6GB | Good | Fast | 4GB |
| **tinyllama** | 600MB | Basic | Very Fast | 2GB |

**Recommendation:**
- Limited space: Use `tinyllama` or cloud AI
- Normal use: Use `llama3`
- Best quality: Use `llama3` or cloud AI

---

## Changing Model Storage Location

### Already Installed on C:? Move to D:

**Step 1: Set environment variable**
```bash
setx OLLAMA_MODELS "D:\Ollama\models"
```

**Step 2: Open NEW terminal**

**Step 3: Re-download models**
```bash
set OLLAMA_MODELS=D:\Ollama\models
ollama pull llama3
```

**Step 4: Delete old models from C:**
```bash
rmdir /s /q "%USERPROFILE%\.ollama\models"
```

---

## Free Up Space

### Remove Unused Models
```bash
# List models
ollama list

# Remove specific model
ollama rm llama2
ollama rm mistral
```

### Clean Docker Volumes
```bash
docker-compose down -v
docker system prune -a
```

### Clean Project
```bash
cd D:\porto\livechat
rm -rf node_modules
npm install
```

---

## Performance vs Storage Trade-offs

### Best Performance (5GB)
```bash
AI_MODEL=llama3
AI_MAX_TOKENS=500
AI_TEMPERATURE=0.7
```

### Balanced (1.6GB)
```bash
AI_MODEL=phi
AI_MAX_TOKENS=300
AI_TEMPERATURE=0.6
```

### Minimal Storage (50MB)
```bash
AI_PROVIDER=huggingface
AI_MODEL=google/flan-t5-small
AI_API_KEY=your_hf_token
```

---

## Recommended Setups by Use Case

### Development (Your Computer)
- **Best:** D: Drive setup with llama3
- **Backup:** Docker with tinyllama

### Testing (Low Resources)
- **Best:** Cloud AI (Hugging Face free)
- **Backup:** tinyllama on D: drive

### Production (Server)
- **Best:** Docker with llama3
- **Backup:** Cloud AI (OpenAI/Claude)

---

## Summary

**Most users with C: drive issues:**
1. Run `setup-ollama-d-drive.bat`
2. Install Ollama (~50MB on C:)
3. Run `pull-model-d-drive.bat` (4GB on D:)
4. Run `start-all.bat` (starts everything)

**Total C: drive usage: 50MB**
**Total D: drive usage: 4-5GB**

---

## Need Help?

- Limited C: drive → `D_DRIVE_SETUP.md`
- Have Docker → `DOCKER_AI_SETUP.md`
- Simple setup → `QUICK_START.md`
- All options → `AI_SETUP.md`

---

**Questions? Issues? Check the troubleshooting sections in the guides!**
