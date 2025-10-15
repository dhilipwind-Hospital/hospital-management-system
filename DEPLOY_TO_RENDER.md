# 🚀 One-Click Deploy to Render

## Quick Deploy (5 minutes)

### Step 1: Push to GitHub
```bash
cd "/Users/dhilipelango/Project Hospital 3/hospital-website"
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Render
1. Click this button: [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

2. Or manually:
   - Go to: https://render.com/
   - Sign in with GitHub
   - Click "New" → "Blueprint"
   - Connect your repository
   - Select `render.yaml`
   - Click "Apply"

### Step 3: Wait for Deployment
- Database: ~2 minutes
- Backend: ~5 minutes  
- Frontend: ~5 minutes

### Step 4: Get Your URL
Your app will be live at:
- **Frontend**: `https://ayphen-hospital-frontend.onrender.com`
- **Backend API**: `https://ayphen-hospital-backend.onrender.com`

## ✅ That's It!

Total time: ~15 minutes  
Cost: **$0 (FREE)**

---

## Alternative: Netlify (Frontend Only)

If you just want to deploy the frontend:

```bash
cd frontend
npm run build
npx netlify deploy --prod
```

---

## Need Help?

Check `RENDER_STEPS_SIMPLE.md` for detailed step-by-step instructions.
