# Getting Started - Complete Setup Guide

Follow these steps to set up and test your AI Live Chat locally, then deploy to Hugging Face.

## Part 1: Local Setup (30 minutes)

### Step 1: Install Ollama on D: Drive (5 minutes)

**Run the setup script:**
```bash
cd D:\porto\livechat
setup-ollama-d-drive.bat
```

**What happens:**
1. Creates `D:\Ollama\models` folder
2. Sets environment variable
3. Opens download page

**Download Ollama:**
1. Browser opens to https://ollama.ai/download/windows
2. Download `OllamaSetup.exe` (~50MB)
3. Run the installer
4. Click "Next" through all steps
5. Program installs to C: drive (~50MB) - this is normal!
6. Models will be stored on D: drive (configured automatically)

### Step 2: Close All Terminals

**IMPORTANT:** After Ollama installs, close ALL terminal windows!

Environment variables only work in NEW terminals.

### Step 3: Download AI Model to D: Drive (10 minutes)

**Open NEW Command Prompt:**
```bash
cd D:\porto\livechat
pull-model-d-drive.bat
```

**What happens:**
- Downloads llama3 (~4GB) to D:\Ollama\models
- Takes 5-10 minutes depending on internet speed
- You'll see progress: "pulling manifest..." → "downloading..." → "success"

**Wait for:** `SUCCESS! Model downloaded to D:\Ollama\models`

### Step 4: Start Everything (1 minute)

**Option A: Start Everything at Once (Recommended)**
```bash
start-all.bat
```

This opens 2 windows:
- **Window 1:** Ollama server
- **Window 2:** Live Chat server

**Option B: Start Manually (2 terminals)**

**Terminal 1 - Ollama:**
```bash
cd D:\porto\livechat
start-ollama-d-drive.bat
```

**Terminal 2 - Chat Server:**
```bash
cd D:\porto\livechat
npm start
```

**Look for:**
```
🤖 AI Service initialized with provider: ollama
🚀 DigiMax Live Chat System running on port 3000
```

### Step 5: Test the AI Chat (5 minutes)

**Open your browser:**

1. **Test Widget:** http://localhost:3000/widget
   - Click "Start Chat"
   - Enter your name: "Test User"
   - Click "Start Chat"
   - Look for **"AI Assistant"** badge (blue with robot icon)

2. **Send test messages:**
   - "What services do you offer?"
   - "What are your hours?"
   - "Can you help me?"

3. **AI should respond!** 🎉
   - Wait 2-5 seconds per response
   - AI has robot icon
   - Badge shows "AI Assistant"

4. **Test human handoff:**
   - Click green **"Talk to Human"** button
   - Badge changes to **"Human Agent"** (green)
   - System message appears
   - Button disappears

5. **Test Admin Dashboard:** http://localhost:3000/admin
   - Email: `admin@digimax.com`
   - Password: `admin123`
   - See your test conversation
   - You should see "Human Agent Needed" notification

### Step 6: Verify Everything Works

**Checklist:**
- [ ] Ollama running (check Terminal 1)
- [ ] Chat server running (check Terminal 2)
- [ ] Widget opens and loads
- [ ] Can enter name and start chat
- [ ] AI responds to messages
- [ ] "Talk to Human" button works
- [ ] Admin login works
- [ ] Can see conversations in admin

**If AI doesn't respond:**
1. Check Terminal 2 for errors
2. Check Ollama is running (Terminal 1)
3. Test Ollama: `curl http://localhost:11434/api/tags`
4. Restart both terminals

---

## Part 2: Hugging Face Account Setup (10 minutes)

### Step 1: Create Account

**Go to:** https://huggingface.co/join

**Fill in:**
- **Username:** Choose wisely! This will be in your URL
  - Example: `yourname` → `yourname-digimax-livechat.hf.space`
  - Use lowercase, no spaces
  - Can be your name, company, or brand
- **Email:** Your email address
- **Password:** Strong password (save it!)

**Click:** "Sign Up"

### Step 2: Verify Email

1. Check your email inbox
2. Click verification link
3. Email is verified ✅

### Step 3: Complete Profile (Optional but Recommended)

1. Add profile picture
2. Add bio
3. Add links (website, GitHub, etc.)

### Step 4: Get Access Token

**This is important for deployment!**

1. Go to: https://huggingface.co/settings/tokens
2. Click **"New token"**
3. Fill in:
   - **Name:** `DigiMax Chat Deployment`
   - **Type:** Select **"Write"** (important!)
   - **Permissions:** Leave defaults
4. Click **"Generate token"**
5. **Copy the token** (starts with `hf_...`)
6. **SAVE IT SECURELY!** You'll need it for deployment
   - Save to password manager
   - Or write it down temporarily

**Example token:** `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 5: Create Your Space

1. Go to: https://huggingface.co/new-space
2. Fill in:
   - **Owner:** Your username
   - **Space name:** `digimax-livechat` (or your preferred name)
   - **License:** MIT
   - **Select SDK:** **Docker** ⚠️ IMPORTANT!
   - **Space hardware:** CPU basic (free) - default
   - **Visibility:** Public (or Private if you have Pro)
3. Click **"Create Space"**

**Your Space URL will be:**
```
https://huggingface.co/spaces/YOUR_USERNAME/digimax-livechat
```

**Your Live URL will be:**
```
https://YOUR_USERNAME-digimax-livechat.hf.space
```

### Step 6: Note Your Information

**Write these down:**

```
Hugging Face Username: _______________
Space Name: _______________
Access Token: hf_____________________________
Space URL: https://huggingface.co/spaces/_____/______
Live URL: https://_____-_____.hf.space
```

---

## Part 3: Test Before Deployment (5 minutes)

### Final Local Tests

**Before deploying, make sure:**

1. **AI responds correctly**
   - Test multiple questions
   - Verify response quality
   - Check response time

2. **Human handoff works**
   - Click button
   - Try keyword: "human agent"
   - Verify mode switches

3. **Admin dashboard works**
   - Login successful
   - See conversations
   - Can respond

4. **No errors in console**
   - Check Terminal 2 for errors
   - Check browser console (F12)
   - Fix any issues

5. **Database working**
   - Check `D:\porto\livechat\database\chat.db` exists
   - Conversations are saved
   - Messages persist

### Customization (Optional)

**Before deploying, you might want to:**

**Change Admin Password:**
Edit `D:\porto\livechat\.env`:
```env
ADMIN_PASSWORD=your-secure-password-here
```

**Customize AI Behavior:**
Edit `D:\porto\livechat\server\services\aiService.js`:
- Line 27: System prompt
- Line 85: FAQs
- Line 25: Handoff keywords

**Test your changes:**
```bash
# Restart server (Terminal 2)
Ctrl+C
npm start
```

---

## Part 4: Ready to Deploy!

**Once everything works locally:**

1. ✅ Ollama is running
2. ✅ AI responds correctly
3. ✅ Human handoff works
4. ✅ Admin login works
5. ✅ No errors in console

**You're ready to deploy!**

### Quick Pre-Deployment Check

```bash
# 1. Stop the local servers (both terminals)
Ctrl+C in both windows

# 2. Make sure all changes are saved
# Check your code editor

# 3. Ready to deploy? Run:
deploy-to-hf.bat
```

**Follow the prompts:**
- Enter your HF username
- Enter Space name
- Provide your access token when asked

**Wait 5 minutes... and you're LIVE!** 🚀

---

## Troubleshooting

### "Ollama not found"

**Solution:**
1. Restart terminal after Ollama installation
2. Check installation: `where ollama`
3. If not found, reinstall Ollama

### "Model not found"

**Solution:**
```bash
set OLLAMA_MODELS=D:\Ollama\models
ollama pull llama3
```

### "AI not responding"

**Checklist:**
1. Is Ollama running? (Check Terminal 1)
2. Is model downloaded? `ollama list`
3. Test Ollama: `curl http://localhost:11434/api/tags`
4. Check Terminal 2 for errors

### "Port 3000 already in use"

**Solution:**
```bash
netstat -ano | findstr :3000
taskkill //F //PID [PID_NUMBER]
```

### "Can't access D: drive"

**Solution:**
Run Command Prompt as Administrator

---

## Next Steps After Testing

1. ✅ Test locally (you're here!)
2. ✅ Create Hugging Face account
3. 🚀 Deploy with `deploy-to-hf.bat`
4. 🎉 Share your live chat!

---

## Quick Reference

### Start Local Development
```bash
start-all.bat
```

### Access Points
- Widget: http://localhost:3000/widget
- Admin: http://localhost:3000/admin
- Health: http://localhost:3000/health

### Admin Credentials
- Email: `admin@digimax.com`
- Password: `admin123`

### Stop Servers
Press `Ctrl+C` in both terminal windows

---

**Questions?** Check these guides:
- `D_DRIVE_SETUP.md` - Ollama setup
- `HUGGINGFACE_DEPLOYMENT.md` - Deployment guide
- `AI_SETUP.md` - AI configuration

**Ready to deploy?** See `DEPLOYMENT_CHECKLIST.md`
