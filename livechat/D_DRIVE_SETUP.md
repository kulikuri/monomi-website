# Ollama Installation on D: Drive

Complete guide to installing Ollama with models stored on D: drive instead of C: drive.

## Overview

**What gets stored where:**
- **C: drive:** Ollama program (~50MB) - unavoidable, Windows default
- **D: drive:** AI models (~4-5GB per model) - we'll configure this

## Step-by-Step Installation

### Step 1: Run Setup Script

```bash
setup-ollama-d-drive.bat
```

This will:
1. Create `D:\Ollama\models` directory
2. Set `OLLAMA_MODELS` environment variable to D: drive
3. Open Ollama download page

### Step 2: Install Ollama

1. Download will start automatically (or go to https://ollama.ai/download/windows)
2. Run `OllamaSetup.exe`
3. Click through the installer
   - Program installs to C: drive (~50MB)
   - This is normal and can't be changed
4. **Close the installer when done**

### Step 3: Open NEW Terminal

**IMPORTANT:** Environment variables only work in new terminals!

Close current terminal and open a **NEW** Command Prompt or PowerShell.

Navigate to project:
```bash
cd D:\porto\livechat
```

### Step 4: Download AI Model to D: Drive

```bash
pull-model-d-drive.bat
```

This downloads llama3 (~4GB) to `D:\Ollama\models`

**Takes 5-10 minutes** depending on internet speed.

### Step 5: Start Ollama Server

```bash
start-ollama-d-drive.bat
```

You should see:
```
Model storage: D:\Ollama\models
Starting Ollama server...
Ollama is running on http://localhost:11434
```

**Keep this terminal open!**

### Step 6: Start Live Chat

Open **another NEW terminal**:

```bash
cd D:\porto\livechat
npm start
```

You should see:
```
🤖 AI Service initialized with provider: ollama
🚀 DigiMax Live Chat System running on port 3000
```

### Step 7: Test!

Open: http://localhost:3000/widget

- Enter your name
- Look for "AI Assistant" badge
- Send a message
- AI should respond!

---

## Verify D: Drive Storage

Check that models are on D: drive:

```bash
dir D:\Ollama\models
```

You should see folders like:
- `blobs\`
- `manifests\`

Check size:
```powershell
Get-ChildItem D:\Ollama\models -Recurse | Measure-Object -Property Length -Sum
```

Should show ~4GB+ for llama3.

---

## Alternative: Smaller Models

If 4GB is still too much, use a smaller model:

### TinyLlama (~600MB)
```bash
set OLLAMA_MODELS=D:\Ollama\models
ollama pull tinyllama
```

Update `.env`:
```env
AI_MODEL=tinyllama
```

### Phi (~1.6GB)
```bash
set OLLAMA_MODELS=D:\Ollama\models
ollama pull phi
```

Update `.env`:
```env
AI_MODEL=phi
```

---

## Troubleshooting

### "Environment variable not working"

**Solution:** Open a **NEW** terminal after running setup script.

```bash
# Check if variable is set
echo %OLLAMA_MODELS%
```

Should show: `D:\Ollama\models`

**If not set, manually set it:**
```bash
setx OLLAMA_MODELS "D:\Ollama\models"
```

Then open NEW terminal.

### "Models still downloading to C: drive"

**Check where models are going:**
```bash
ollama list
```

**Set variable for current session:**
```bash
set OLLAMA_MODELS=D:\Ollama\models
ollama pull llama3
```

### "Ollama not found"

Ollama might not be in PATH.

**Add to PATH manually:**
1. Open System Environment Variables
2. Edit PATH
3. Add: `C:\Users\YourName\AppData\Local\Programs\Ollama`
4. Open NEW terminal

### "Permission denied on D: drive"

**Run Command Prompt as Administrator:**
1. Right-click Command Prompt
2. "Run as administrator"
3. Run setup script again

---

## Daily Usage

### Start Everything (2 Terminals)

**Terminal 1: Start Ollama**
```bash
cd D:\porto\livechat
start-ollama-d-drive.bat
```

**Terminal 2: Start Chat**
```bash
cd D:\porto\livechat
npm start
```

### Quick Start (Single Script)

Create `start-all.bat`:
```batch
@echo off
start cmd /k "cd D:\porto\livechat && start-ollama-d-drive.bat"
timeout /t 5 /nobreak
start cmd /k "cd D:\porto\livechat && npm start"
```

---

## Cleanup / Uninstall

### Remove Models (Free D: Drive Space)
```bash
rmdir /s /q "D:\Ollama\models"
```

### Uninstall Ollama Program
1. Settings → Apps → Ollama → Uninstall
2. Delete `D:\Ollama` folder

### Remove Environment Variable
```bash
reg delete "HKCU\Environment" /F /V OLLAMA_MODELS
```

---

## Disk Space Summary

| Component | Location | Size |
|-----------|----------|------|
| Ollama Program | C:\Users\...\AppData\Local\Programs\Ollama | ~50MB |
| llama3 Model | D:\Ollama\models | ~4GB |
| tinyllama Model | D:\Ollama\models | ~600MB |
| phi Model | D:\Ollama\models | ~1.6GB |
| Chat Database | D:\porto\livechat\database | <10MB |
| Chat Code | D:\porto\livechat | ~50MB |

**Total on C: drive:** ~50MB (program only)
**Total on D: drive:** ~4-5GB (models + project)

---

## Advanced: Multiple Models

You can have multiple models on D: drive:

```bash
set OLLAMA_MODELS=D:\Ollama\models
ollama pull llama3      # 4GB
ollama pull mistral     # 4GB
ollama pull tinyllama   # 600MB
ollama pull phi         # 1.6GB
```

Switch between them in `.env`:
```env
AI_MODEL=llama3
# or
AI_MODEL=tinyllama
```

Total space: ~10GB for all models.

---

## Environment Variable Reference

```bash
# Where Ollama stores models
OLLAMA_MODELS=D:\Ollama\models

# Ollama server URL (default, don't change)
OLLAMA_HOST=http://localhost:11434
```

---

## Next Steps

✅ Ollama installed (C: drive, 50MB)
✅ Models on D: drive (4GB+)
✅ Environment variables configured
✅ Chat server ready

Now:
1. ✅ Test AI chat: http://localhost:3000/widget
2. 🎨 Customize AI prompts
3. 📝 Add more FAQs
4. 🚀 Deploy to production

---

## Still Have C: Drive Space Issues?

If even 50MB is too much on C:, your only options are:

1. **Use Docker** (models in D:\porto\livechat volumes)
2. **Use Cloud AI** (no local installation)
   - OpenAI GPT-4
   - Claude
   - Hugging Face

See `AI_SETUP.md` for cloud AI configuration.

---

**Questions? Check the troubleshooting section or read `AI_SETUP.md`**
