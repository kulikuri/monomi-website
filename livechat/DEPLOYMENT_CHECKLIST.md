# Deployment Checklist

Complete checklist for deploying to Hugging Face Spaces.

## ✅ Pre-Deployment

### 1. Test Locally
- [ ] Run `npm install`
- [ ] Run `npm start`
- [ ] Test at http://localhost:3000/widget
- [ ] Test AI responses
- [ ] Test human handoff
- [ ] Test admin dashboard
- [ ] Check for console errors

### 2. Configure for Production
- [ ] Update `.env`:
  ```env
  NODE_ENV=production
  PORT=7860
  AI_PROVIDER=huggingface
  AI_MODEL=mistralai/Mistral-7B-Instruct-v0.2
  ```
- [ ] Change admin password (if not using secrets)
- [ ] Update CORS origins if needed
- [ ] Review rate limits

### 3. Prepare Repository
- [ ] Delete `node_modules` (will be installed on HF)
- [ ] Delete local database (will be recreated on HF)
- [ ] Check `.spaceignore` is configured
- [ ] Commit all changes: `git add . && git commit -m "Ready for deployment"`

## ✅ Hugging Face Setup

### 1. Create Account
- [ ] Sign up at https://huggingface.co/join
- [ ] Verify email
- [ ] Complete profile

### 2. Get Access Token
- [ ] Go to https://huggingface.co/settings/tokens
- [ ] Create new token (Write access)
- [ ] Copy token (starts with `hf_...`)
- [ ] Save securely (you'll need it for deployment)

### 3. Create Space
- [ ] Go to https://huggingface.co/new-space
- [ ] Fill in details:
  - Owner: Your username
  - Space name: `digimax-livechat`
  - License: MIT
  - SDK: **Docker** (important!)
  - Visibility: Public or Private
- [ ] Click "Create Space"
- [ ] Space URL: `https://huggingface.co/spaces/YOUR_USERNAME/digimax-livechat`

### 4. Configure Secrets (Optional but Recommended)
- [ ] Go to Space → Settings → Repository Secrets
- [ ] Add secrets:
  - `AI_API_KEY` = Your Hugging Face token
  - `SESSION_SECRET` = Random string (32+ chars)
  - `ADMIN_PASSWORD` = Strong password
- [ ] Click "Add" for each

## ✅ Deployment

### Method 1: Automated Script (Recommended)

- [ ] Run `deploy-to-hf.bat`
- [ ] Enter Hugging Face username
- [ ] Enter Space name
- [ ] Provide credentials when prompted
  - Username: Your HF username
  - Password: Your HF access token (NOT your account password!)
- [ ] Wait for deployment (2-5 minutes)

### Method 2: Manual Git

```bash
# Initialize and deploy
git init
git add .
git commit -m "Initial deployment"
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/digimax-livechat
git push hf main
```

## ✅ Post-Deployment

### 1. Verify Deployment
- [ ] Check build logs: Space → Logs tab
- [ ] Wait for "Running" status (green)
- [ ] No errors in logs

### 2. Test Live Application
- [ ] Open Space URL: `https://YOUR_USERNAME-digimax-livechat.hf.space`
- [ ] Test widget: `/widget`
  - [ ] Can enter name
  - [ ] Can send message
  - [ ] AI responds
  - [ ] "Talk to Human" button works
- [ ] Test admin: `/admin`
  - [ ] Can login
  - [ ] Can see conversations
  - [ ] Can send messages
  - [ ] Receives notifications
- [ ] Test health endpoint: `/health`
  - [ ] Returns 200 OK
  - [ ] Shows uptime

### 3. Verify AI
- [ ] AI responds to messages
- [ ] Response quality is good
- [ ] Handoff to human works
- [ ] No API errors in logs

### 4. Security Check
- [ ] Admin password is strong (not default!)
- [ ] Secrets are configured (not in .env file)
- [ ] CORS is properly configured
- [ ] Rate limiting is active

## ✅ Final Steps

### 1. Update Space README
- [ ] Space shows description
- [ ] Demo instructions are clear
- [ ] Contact info is correct

### 2. Set Up Monitoring
- [ ] Check Space Analytics
- [ ] Set up error notifications (if available)
- [ ] Bookmark logs URL

### 3. Document URLs
- [ ] Space URL: _______________
- [ ] Live URL: _______________
- [ ] Admin URL: _______________
- [ ] Health Check: _______________

### 4. Share with Team
- [ ] Share live URL
- [ ] Share admin credentials (securely!)
- [ ] Share documentation
- [ ] Train team on admin dashboard

## ✅ Optional Enhancements

### 1. Custom Domain (Pro only)
- [ ] Upgrade to Hugging Face Pro
- [ ] Configure custom domain
- [ ] Update DNS records

### 2. Staging Environment
- [ ] Create second Space: `digimax-livechat-staging`
- [ ] Add staging remote: `git remote add hf-staging ...`
- [ ] Test updates on staging first

### 3. Backup Strategy
- [ ] Clone repository locally
- [ ] Set up automatic backups
- [ ] Document restore procedure

### 4. Monitoring & Analytics
- [ ] Set up uptime monitoring
- [ ] Configure analytics
- [ ] Set up alerts

## 🚨 Troubleshooting

### Build Fails
- [ ] Check logs for specific error
- [ ] Verify Dockerfile syntax
- [ ] Check package.json dependencies
- [ ] Test Docker build locally

### App Won't Start
- [ ] Check port is 7860
- [ ] Verify environment variables
- [ ] Check health endpoint
- [ ] Review startup logs

### AI Not Working
- [ ] Verify AI_API_KEY secret is set
- [ ] Check model name is correct
- [ ] Test API quota
- [ ] Review AI service logs

### Can't Access Admin
- [ ] Verify admin credentials
- [ ] Check SESSION_SECRET is set
- [ ] Clear browser cookies
- [ ] Test in incognito mode

## 📝 Deployment Notes

**Date Deployed:** __________

**Deployed By:** __________

**Version/Commit:** __________

**Issues Encountered:**
-
-
-

**Resolved How:**
-
-
-

**Next Steps:**
-
-
-

---

## 🎉 Deployment Complete!

Congratulations! Your AI Live Chat is now live on Hugging Face!

**What's Next?**
1. Share the live URL with your team
2. Monitor the logs for any issues
3. Test with real users
4. Gather feedback
5. Iterate and improve

**Need to Update?**
- Run `update-hf.bat "Your message"`
- Changes deploy in 2-5 minutes

**Need to Rollback?**
- Run `rollback-hf.bat`
- Previous version restores in 1-2 minutes

---

**Questions?** Check `HUGGINGFACE_DEPLOYMENT.md` for detailed guide.
