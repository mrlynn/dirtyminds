# Vercel Deployment Checklist

## Current Issue: 404 Error on Vercel

The 404 error you're seeing is likely due to one of these issues:

### ✅ Steps to Fix:

## 1. Verify Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables**

Make sure ALL four variables are set for **Production, Preview, AND Development**:

| Variable Name | Value | All Environments? |
|--------------|-------|------------------|
| `NEXT_PUBLIC_PUSHER_APP_KEY` | `27b1341170b58dacc863` | ✓ Production, Preview, Development |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | `us3` | ✓ Production, Preview, Development |
| `PUSHER_APP_ID` | `2083316` | ✓ Production, Preview, Development |
| `PUSHER_SECRET` | `c51a3487e67b22dcefdd` | ✓ Production, Preview, Development |

**Important:** After adding/changing environment variables, you MUST redeploy.

---

## 2. Enable Client Events in Pusher Dashboard

This is **REQUIRED** for the buzz-in system to work:

1. Go to https://dashboard.pusher.com/apps/2083316
2. Click **"App Settings"** tab
3. Scroll to **"Enable client events"**
4. ✓ Check the box
5. Click **"Update"**

---

## 3. Redeploy Your Vercel Project

After setting environment variables:

**Option A: Via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on your latest deployment
3. Click **"Redeploy"**
4. Make sure **"Use existing Build Cache"** is **UNCHECKED**

**Option B: Push a New Commit**
```bash
git add .
git commit -m "Fix Pusher configuration and error handling"
git push
```

**Option C: Via Vercel CLI**
```bash
vercel --prod
```

---

## 4. Check Vercel Build Logs

After redeploying, check the build logs:

1. Go to **Deployments** tab
2. Click on your latest deployment
3. Click **"Building"** or **"View Function Logs"**
4. Look for any errors related to:
   - Missing environment variables
   - Pusher initialization failures
   - API route errors

---

## 5. Test Your Deployed App

Once deployed successfully:

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Click **"Host Game"**
3. You should see a QR code and game code
4. Open your phone and click **"Join Game"**
5. Enter the game code
6. Test the buzz-in feature

---

## Common Issues & Solutions

### Issue: Still getting 404

**Solution:**
- Make sure you're visiting the root URL (`https://your-app.vercel.app`)
- Not `/host` or `/join` directly (those require state from the home page)
- Clear your browser cache and try again

### Issue: "Pusher server not configured" error

**Solution:**
- Double-check all 4 environment variables are set in Vercel
- Make sure you checked **all three environments** (Production, Preview, Development)
- Redeploy after adding variables

### Issue: Players can join but buzz-in doesn't work

**Solution:**
- Enable **Client Events** in Pusher dashboard (see step 2)
- Check browser console for errors
- Make sure you're on HTTPS (Vercel provides this automatically)

### Issue: QR code doesn't load

**Solution:**
- Check browser console for errors
- Verify `NEXT_PUBLIC_PUSHER_APP_KEY` and `NEXT_PUBLIC_PUSHER_CLUSTER` are set
- Try entering the 6-digit code manually instead

---

## Environment Variable Verification Script

Add this to your `/pages/api/health.js` to verify env vars are loaded:

```javascript
export default function handler(req, res) {
  res.status(200).json({
    pusher: {
      hasAppKey: !!process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
      hasCluster: !!process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      hasAppId: !!process.env.PUSHER_APP_ID,
      hasSecret: !!process.env.PUSHER_SECRET,
    }
  });
}
```

Visit `https://your-app.vercel.app/api/health` to check.

---

## Final Checklist

Before marking as complete:

- [ ] All 4 environment variables set in Vercel
- [ ] All variables set for Production, Preview, AND Development
- [ ] Client Events enabled in Pusher dashboard
- [ ] Redeployed after adding env vars
- [ ] Tested hosting a game on deployed URL
- [ ] Tested joining a game from mobile device
- [ ] Tested buzz-in functionality
- [ ] Verified QR code generation works

---

## Support

If you're still having issues:

1. Check Vercel function logs: `Project → Deployments → [Latest] → View Function Logs`
2. Check Pusher dashboard: `https://dashboard.pusher.com/apps/2083316/overview`
3. Look for connection errors in browser console (F12)

Your app should now be fully functional on Vercel! 🎉
