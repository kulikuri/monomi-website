# Deploying to Hugging Face Spaces

Complete guide to deploy your AI Live Chat to Hugging Face Spaces with easy updates and rollback.

## Why Hugging Face?

✅ **Easy Updates** - Push to Git, auto-deploys
✅ **Free Tier** - Free hosting for public apps
✅ **Built-in AI** - Native AI model support
✅ **Instant Rollback** - Revert to any previous version
✅ **No Server Management** - Fully managed platform
✅ **CI/CD Built-in** - Automatic deployment on push

---

## Deployment Methods

### Method 1: Git Push (Recommended)
- Push code to HF repo → Auto-deploys
- **Update time:** 2-5 minutes
- **Rollback:** Instant (git revert)

### Method 2: Web Interface
- Upload files via browser
- **Update time:** Manual upload
- **Rollback:** Download previous version

---

## Initial Setup

### Step 1: Create Hugging Face Account

1. Go to https://huggingface.co/join
2. Create free account
3. Verify email

### Step 2: Get Access Token

1. Go to https://huggingface.co/settings/tokens
2. Click "New token"
3. Name: "DigiMax Chat"
4. Type: "Write"
5. Copy token (starts with `hf_...`)

### Step 3: Create a Space

1. Go to https://huggingface.co/new-space
2. Fill in:
   - **Owner:** Your username
   - **Space name:** `digimax-livechat`
   - **License:** MIT
   - **SDK:** Docker
   - **Visibility:** Public (or Private)
3. Click "Create Space"

---

## Prepare Your Project

### Step 1: Create Hugging Face Config

Already created in your project:
- `Dockerfile` ✅
- `docker-compose.yml` ✅
- `.env` ✅

### Step 2: Create HF-Specific Files

I'll create these for you:
- `README.md` (for HF Space)
- `.spaceignore` (what not to upload)
- `deploy-to-hf.bat` (deployment script)

---

## Deployment Process

### Option A: Automatic Deployment (Git)

**Step 1: Initialize Git**
```bash
cd D:\porto\livechat
git init
git add .
git commit -m "Initial deployment"
```

**Step 2: Add Hugging Face Remote**
```bash
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/digimax-livechat
```

**Step 3: Push to Deploy**
```bash
git push hf main
```

**That's it!** Hugging Face automatically builds and deploys.

### Option B: Manual Deployment Script

Run:
```bash
deploy-to-hf.bat
```

This automates everything!

---

## Easy Updates (After Deployment)

### Update Your Code Locally

1. Make changes to any file
2. Test locally: `npm start`
3. Verify everything works

### Push Updates to Hugging Face

**Single Command:**
```bash
update-hf.bat "Fixed bug in AI responses"
```

Or manually:
```bash
git add .
git commit -m "Your update message"
git push hf main
```

**Deployment Time:** 2-5 minutes
**Downtime:** ~30 seconds during rebuild

---

## Rollback if Something Goes Wrong

### Method 1: Git Revert (Instant)

**See recent deployments:**
```bash
git log --oneline
```

**Rollback to previous version:**
```bash
git revert HEAD
git push hf main
```

**Or rollback to specific version:**
```bash
git reset --hard abc1234
git push hf main --force
```

### Method 2: Hugging Face Interface

1. Go to your Space
2. Click "Files and versions"
3. Click on previous commit
4. Click "Restore this version"

---

## Testing Before Deployment

### Test Locally First

**Always test before deploying:**

```bash
# Test locally
npm start

# Test with Docker (same as HF)
docker-compose up --build

# Test AI responses
curl http://localhost:3000/health
```

### Staging Environment

Create a second Space for testing:
```bash
git remote add hf-staging https://huggingface.co/spaces/YOUR_USERNAME/digimax-livechat-staging
git push hf-staging main
```

Test on staging, then push to production.

---

## Deployment Scripts

### Quick Deploy
```bash
deploy-to-hf.bat
```

### Quick Update
```bash
update-hf.bat "Your update message"
```

### Rollback
```bash
rollback-hf.bat
```

All scripts are in your project folder!

---

## Configuration for Hugging Face

### Environment Variables on HF

Set secrets in Hugging Face:

1. Go to your Space → Settings
2. Scroll to "Repository secrets"
3. Add:
   - `AI_API_KEY` (if using cloud AI)
   - `SESSION_SECRET`
   - `ADMIN_PASSWORD`

### Update .env for Production

Edit `.env`:
```env
NODE_ENV=production
PORT=7860  # HF default port
AI_PROVIDER=huggingface
AI_MODEL=mistralai/Mistral-7B-Instruct-v0.2
AI_API_KEY=  # Set in HF Secrets
```

---

## Monitoring Your Deployment

### View Build Logs

1. Go to your Space
2. Click "Logs" tab
3. See real-time deployment logs

### Check Status

**Application URL:**
```
https://YOUR_USERNAME-digimax-livechat.hf.space
```

**Health Check:**
```
https://YOUR_USERNAME-digimax-livechat.hf.space/health
```

### View Errors

All errors visible in Logs tab on Hugging Face.

---

## Common Deployment Issues

### Build Fails

**Check logs for errors:**
- Missing dependencies → Check `package.json`
- Port issues → Use port 7860
- Environment variables → Set in HF Secrets

**Fix locally, then:**
```bash
update-hf.bat "Fixed build error"
```

### App Not Responding

**Check:**
1. Logs for errors
2. Health endpoint
3. Environment variables

**Quick fix:**
```bash
rollback-hf.bat  # Go back to working version
```

### AI Not Working

**Check:**
1. `AI_API_KEY` set in HF Secrets
2. Model name correct
3. API quota not exceeded

**Switch to different AI:**
```env
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
```

Then:
```bash
update-hf.bat "Switched to OpenAI"
```

---

## Deployment Workflow

### Daily Development

```mermaid
Local Changes → Test Locally → Git Commit → Push to HF → Auto Deploy
```

**Commands:**
```bash
# 1. Make changes
code server/services/aiService.js

# 2. Test locally
npm start

# 3. Deploy
update-hf.bat "Improved AI responses"
```

### Emergency Rollback

```bash
rollback-hf.bat
```

Instant! Takes 1-2 minutes.

---

## Versioning Best Practices

### Use Semantic Versioning

```bash
git tag v1.0.0
git push hf v1.0.0

git tag v1.1.0
git push hf v1.1.0
```

### Tag Important Releases

```bash
git tag -a v1.0.0 -m "Initial production release"
git push hf v1.0.0
```

### Rollback to Tagged Version

```bash
git checkout v1.0.0
git push hf main --force
```

---

## CI/CD Pipeline

Hugging Face has built-in CI/CD:

```
Git Push → HF Detects Change → Build Docker → Run Tests → Deploy → Live
```

**Automatic steps:**
1. ✅ Pull latest code
2. ✅ Build Docker container
3. ✅ Run health checks
4. ✅ Deploy to production
5. ✅ Notify on failure

**No setup needed!** Works automatically.

---

## Cost & Limits

### Free Tier
- ✅ Public Spaces
- ✅ 2 vCPUs
- ✅ 16GB RAM
- ✅ 50GB storage
- ✅ Unlimited users*

*Fair use policy applies

### Paid Tier
- More resources
- Private Spaces
- Priority support
- Custom domains

**Your app fits free tier!**

---

## Backup & Recovery

### Backup Code

**Automatic:** Git is your backup!

```bash
# Clone to backup location
git clone https://huggingface.co/spaces/YOUR_USERNAME/digimax-livechat backup
```

### Backup Database

If using SQLite, download manually:
1. Go to Space → Files
2. Download `database/chat.db`

**Or use persistent storage:**
- HF Spaces supports persistent volumes
- Data survives across deploys

---

## Multi-Environment Setup

### Production
```
Space: digimax-livechat
URL: yourname-digimax-livechat.hf.space
Git: git push hf main
```

### Staging
```
Space: digimax-livechat-staging
URL: yourname-digimax-livechat-staging.hf.space
Git: git push hf-staging main
```

### Development
```
Local: localhost:3000
Git: Your local repository
```

**Workflow:**
```
Dev (Local) → Test → Staging (HF) → Test → Production (HF)
```

---

## Zero-Downtime Deployments

Hugging Face supports:

1. **Blue-Green Deployment**
   - Old version stays running
   - New version builds
   - Switch when ready

2. **Rolling Updates**
   - Gradual rollout
   - Automatic rollback on errors

**Enabled by default!**

---

## Monitoring & Analytics

### Built-in Metrics

HF provides:
- Request count
- Response times
- Error rates
- Resource usage

View in Space → Analytics

### Custom Monitoring

Add to your app:
```javascript
// Log to HF
console.log('AI Response:', {
    model: 'llama3',
    tokens: 150,
    time: '2.3s'
});
```

Visible in Logs tab.

---

## Domain & SSL

### Default URL
```
https://YOUR_USERNAME-digimax-livechat.hf.space
```

**SSL included automatically!**

### Custom Domain (Pro only)

1. Upgrade to Pro
2. Add CNAME record:
   ```
   chat.yourdomain.com → YOUR_USERNAME-digimax-livechat.hf.space
   ```
3. Configure in HF Settings

---

## Summary

### Update Process
```bash
# 1. Make changes locally
code file.js

# 2. Test
npm start

# 3. Deploy (one command!)
update-hf.bat "Your message"

# Wait 2-5 minutes, done!
```

### Rollback Process
```bash
# One command!
rollback-hf.bat

# Wait 1-2 minutes, back to previous version!
```

### Key Benefits
- ✅ Git-based (familiar workflow)
- ✅ Auto-deploy on push
- ✅ Instant rollback
- ✅ Built-in CI/CD
- ✅ Free tier available
- ✅ Zero config needed

---

## Next Steps

1. ✅ Create HF account
2. ✅ Create Space
3. ✅ Run `deploy-to-hf.bat`
4. ✅ Test deployment
5. 🎉 Go live!

**It's that simple!**

---

**Questions?** Check:
- Hugging Face Docs: https://huggingface.co/docs/hub/spaces
- Your deployment scripts in project folder
- Community forum: https://discuss.huggingface.co
