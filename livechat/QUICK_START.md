# Quick Start - AI Live Chat (No Docker)

The simplest way to get AI chat running on Windows.

## Step 1: Download & Install Ollama

1. **Download:** https://ollama.ai/download/windows
2. **Run** the installer (OllamaSetup.exe)
3. **Click through** the installation wizard
4. Ollama will install to: `C:\Users\YourName\AppData\Local\Programs\Ollama`

Or run:
```bash
install-ollama-local.bat
```

## Step 2: Pull AI Model

Open a **new** terminal (PowerShell or CMD) and run:

```bash
ollama pull llama3
```

This downloads ~4GB. Takes 5-10 minutes depending on your internet speed.

**Alternative smaller models (if llama3 is too big):**
```bash
ollama pull tinyllama   # Only 600MB
ollama pull phi         # Only 1.6GB
```

## Step 3: Start Ollama Server

In the same terminal:

```bash
ollama serve
```

**Keep this terminal open!** Ollama must be running for AI to work.

You should see:
```
Ollama is running on http://localhost:11434
```

## Step 4: Start Live Chat

Open a **NEW** terminal in the project folder:

```bash
cd D:\porto\livechat
npm start
```

You should see:
```
🤖 AI Service initialized with provider: ollama
🚀 DigiMax Live Chat System running on port 3000
```

## Step 5: Test It!

1. **Open the chat widget:** http://localhost:3000/widget
2. **Enter your name** and start chatting
3. **Look for the "AI Assistant" badge** (blue, with robot icon)
4. **Try these messages:**
   - "What services do you offer?"
   - "What are your hours?"
   - "Can you help me?"

5. **Test human handoff:**
   - Click the green "Talk to Human" button
   - OR type: "I want to speak to a human"
   - Badge changes to "Human Agent" (green)

## Verify It's Working

### Check Ollama Status
```bash
ollama list
```

Should show: `llama3:latest`

### Test Ollama API
```bash
curl http://localhost:11434/api/tags
```

Should return JSON with models.

### Check Server Logs
Look at the terminal where you ran `npm start`. You should see:
```
🤖 AI Service initialized with provider: ollama
🤖 AI mode active for conversation ...
🤖 AI response sent in conversation ...
```

---

## Troubleshooting

### "Ollama is not running"

**Solution:**
```bash
ollama serve
```
Keep this terminal open.

### "Model not found"

**Solution:**
```bash
ollama pull llama3
```

### "Can't connect to Ollama"

**Check if it's running:**
```bash
curl http://localhost:11434/api/version
```

Should return: `{"version":"..."}`

**If not working:**
1. Close all terminals
2. Open new terminal
3. Run: `ollama serve`
4. Open another terminal
5. Run: `npm start`

### "AI responses are slow"

**Solutions:**
- Use a smaller model: `ollama pull tinyllama`
- Update `.env`: `AI_MODEL=tinyllama`
- Reduce AI_MAX_TOKENS to 200

### "Out of memory"

llama3 needs ~8GB RAM.

**Solutions:**
1. Use smaller model:
   ```bash
   ollama pull tinyllama
   ```
2. Update `.env`:
   ```env
   AI_MODEL=tinyllama
   ```
3. Close other applications

---

## Running in Production

### Windows Service (Ollama runs automatically)

Ollama installer sets it up as a Windows service automatically. It starts on boot.

**Check service status:**
```powershell
Get-Service Ollama
```

**Start/Stop service:**
```powershell
Start-Service Ollama
Stop-Service Ollama
```

### Run Live Chat as Background Service

**Option 1: PM2 (Process Manager)**
```bash
npm install -g pm2
pm2 start server/app.js --name livechat
pm2 startup
pm2 save
```

**Option 2: Windows Service (NSSM)**
Download NSSM: https://nssm.cc/download
```bash
nssm install DigiMaxChat "C:\Program Files\nodejs\node.exe" "D:\porto\livechat\server\app.js"
nssm start DigiMaxChat
```

---

## What's Running

When everything is set up:

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Ollama | 11434 | http://localhost:11434 | Terminal 1 |
| LiveChat | 3000 | http://localhost:3000 | Terminal 2 |

Both must be running for AI chat to work!

---

## Daily Usage

### Start Everything

**Terminal 1:**
```bash
ollama serve
```

**Terminal 2:**
```bash
cd D:\porto\livechat
npm start
```

### Stop Everything

Press `Ctrl+C` in both terminals.

---

## Alternative: Use Docker

If you prefer Docker (better for deployment):

1. Start Docker Desktop
2. Run:
   ```bash
   cd livechat
   setup-ollama.bat
   docker-compose up -d
   ```

See **DOCKER_AI_SETUP.md** for details.

---

## Need Help?

- **Check logs:** Look at terminal output
- **Test Ollama:** `curl http://localhost:11434/api/tags`
- **Test Chat:** http://localhost:3000/health
- **Read docs:** AI_SETUP.md, DOCKER_AI_SETUP.md

---

## Next Steps

✅ Ollama installed
✅ Model downloaded
✅ Server running
✅ AI responding

Now:
1. **Customize AI responses:** Edit `server/services/aiService.js`
2. **Add more FAQs:** Update FAQ section in aiService.js
3. **Change model:** Update `.env` → `AI_MODEL=mistral`
4. **Deploy:** See production guides above

---

**Ready to go! Start chatting at http://localhost:3000/widget** 🚀
