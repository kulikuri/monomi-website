# Hugging Face Account Setup - Step by Step

Visual guide to create your Hugging Face account for deployment.

---

## Step 1: Create Account (2 minutes)

### Go to Sign Up Page

**URL:** https://huggingface.co/join

### Fill in the Form

**Username:**
- This will be in your URL!
- Example: If you choose `mycompany`
  - Your Space: `mycompany-digimax-livechat.hf.space`
- Requirements:
  - Lowercase letters and numbers only
  - No spaces or special characters
  - 3-30 characters
  - Must be unique

**Good examples:**
- `yourname` → `yourname-digimax-livechat.hf.space`
- `mycompany` → `mycompany-digimax-livechat.hf.space`
- `chatbot123` → `chatbot123-digimax-livechat.hf.space`

**Email:**
- Your valid email address
- You'll need to verify it

**Password:**
- At least 8 characters
- Mix of letters and numbers recommended
- Save it in a password manager!

**Click:** "Sign Up"

---

## Step 2: Verify Email (1 minute)

### Check Your Inbox

1. Open your email
2. Look for email from Hugging Face
3. Subject: "Verify your Hugging Face email"

### Click Verification Link

1. Click the link in the email
2. Browser opens
3. You see: "Email verified successfully!" ✅

**If you don't see the email:**
- Check spam/junk folder
- Wait a few minutes
- Click "Resend verification email" on HF

---

## Step 3: Complete Profile (Optional - 2 minutes)

### Add Profile Picture

1. Click your avatar (top right)
2. Click "Settings"
3. Click "Change avatar"
4. Upload image (or use default)

### Add Bio (Optional)

1. Go to Settings → Profile
2. Add a short bio:
   ```
   Building AI-powered customer support tools
   ```
3. Add website, social links (optional)
4. Click "Save"

---

## Step 4: Get Access Token (3 minutes)

### This is the MOST IMPORTANT step for deployment!

### Navigate to Tokens Page

**URL:** https://huggingface.co/settings/tokens

Or:
1. Click avatar (top right)
2. Click "Settings"
3. Click "Access Tokens" in left menu

### Create New Token

1. Click **"New token"** button

2. **Fill in the form:**

   **Name:** (what it's for)
   ```
   DigiMax Chat Deployment
   ```

   **Type:** (IMPORTANT!)
   - Select **"Write"** ⚠️
   - NOT "Read" - needs Write permission!

   **Permissions:** (leave defaults)
   - ✅ Read access to orgs
   - ✅ Write access to orgs
   - ✅ Manage repos

3. Click **"Generate token"**

### Copy Your Token

**You'll see your token:**
```
hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**IMPORTANT:**
- ⚠️ **Copy it NOW** - you won't see it again!
- ⚠️ **Save it securely** - in password manager or document
- ⚠️ **Don't share it** - it's like a password!

**Save your token here (temporarily):**
```
Token: hf_________________________________
```

---

## Step 5: Create a Space (3 minutes)

### Navigate to New Space

**URL:** https://huggingface.co/new-space

Or:
1. Click "+" icon (top right)
2. Select "New Space"

### Fill in Space Details

**Owner:**
- Select your username (should be pre-selected)

**Space name:**
```
digimax-livechat
```
- Or choose your own name
- This becomes part of your URL
- Use lowercase, hyphens OK
- No spaces

**Examples:**
- `digimax-livechat` ✅
- `my-ai-chat` ✅
- `customer-support-bot` ✅
- `My AI Chat` ❌ (spaces not allowed)

**License:**
- Select: **MIT**
- (open source, allows commercial use)

**Select SDK:** ⚠️ **VERY IMPORTANT!**

Click **"Docker"** - NOT Gradio, Streamlit, or Static!

```
○ Gradio
○ Streamlit
○ Static
● Docker     ← Select this one!
```

**Space hardware:**
- Leave default: **CPU basic - Free**
- No need to upgrade

**Space visibility:**
- **Public** (free) - anyone can see
- OR **Private** (requires HF Pro) - only you can see

Click **"Create Space"**

---

## Step 6: Note Your Information

### Your Space is Created!

**You'll see:**
- Space URL: `https://huggingface.co/spaces/YOUR_USERNAME/digimax-livechat`
- Status: "Building..." (but empty for now)

### Write Down These Details

**Complete this form for reference:**

```
===========================================
MY HUGGING FACE INFORMATION
===========================================

Username: _________________________

Email: ____________________________

Space Name: _______________________

Access Token: hf___________________
                  ___________________
                  ___________________

Space URL: https://huggingface.co/spaces/
           _____/_____________________

Live URL: https://___________________
                 .hf.space

Admin Credentials (for chat):
  Email: admin@digimax.com
  Password: admin123 (change after deploy!)

===========================================
```

**Keep this safe!** You'll need it for deployment.

---

## Step 7: Set Up Repository Secrets (Optional but Recommended)

### Navigate to Settings

1. Go to your Space URL
2. Click "Settings" tab
3. Scroll down to "Repository secrets"

### Add Secrets

**Why use secrets?**
- More secure than .env file
- Not visible in public repo
- Can be changed without redeploying

**Add these secrets:**

1. **AI_API_KEY** (if using Hugging Face AI)
   - Click "New secret"
   - Name: `AI_API_KEY`
   - Value: Your HF token (starts with `hf_...`)
   - Click "Add"

2. **SESSION_SECRET** (recommended)
   - Click "New secret"
   - Name: `SESSION_SECRET`
   - Value: Random string (32+ characters)
   - Example: `my-super-secret-key-change-me-12345`
   - Click "Add"

3. **ADMIN_PASSWORD** (recommended)
   - Click "New secret"
   - Name: `ADMIN_PASSWORD`
   - Value: Your strong password
   - Example: `MySecurePassword123!`
   - Click "Add"

**Secrets are encrypted and secure!** ✅

---

## Verification Checklist

Before deploying, verify:

- [ ] Account created ✅
- [ ] Email verified ✅
- [ ] Access token generated and saved ✅
- [ ] Space created (Docker SDK) ✅
- [ ] Space name noted ✅
- [ ] Username noted ✅
- [ ] All information written down ✅

---

## Common Issues

### "Username already taken"

**Solution:** Try variations:
- Add numbers: `myname123`
- Add underscores: `my_name`
- Try different name: `mycompany_chat`

### "Can't verify email"

**Solutions:**
1. Check spam folder
2. Wait 5 minutes
3. Request new verification email
4. Try different email

### "Token not working"

**Check:**
1. Token type is "Write" (not "Read")
2. Token copied completely (starts with `hf_`)
3. No extra spaces when pasting
4. Token not expired

### "Space creation failed"

**Check:**
1. Space name is unique
2. No spaces in name
3. Docker SDK selected
4. Try different name

---

## What's Next?

✅ **You now have:**
- Hugging Face account
- Access token
- Empty Space (Docker)
- All credentials saved

✅ **Ready for deployment!**

**Next steps:**
1. Test your app locally (if not done)
2. Run `deploy-to-hf.bat`
3. Enter your credentials
4. Wait 5 minutes
5. Your app is LIVE! 🚀

---

## Quick Reference

### Important URLs

- **Hugging Face:** https://huggingface.co
- **Sign Up:** https://huggingface.co/join
- **Tokens:** https://huggingface.co/settings/tokens
- **New Space:** https://huggingface.co/new-space
- **Your Space:** https://huggingface.co/spaces/YOUR_USERNAME/digimax-livechat
- **Live URL:** https://YOUR_USERNAME-digimax-livechat.hf.space

### Need Help?

- **HF Docs:** https://huggingface.co/docs/hub/spaces
- **Community:** https://discuss.huggingface.co
- **Support:** support@huggingface.co

---

**🎉 Congratulations! Your Hugging Face account is ready for deployment!**

**Next:** Run `deploy-to-hf.bat` to go live!
