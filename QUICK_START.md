# 🚀 Quick Vercel Deployment

## Step-by-Step Instructions

### 1️⃣ Update Your Project Files

**Add these files to your project root:**

1. Copy `vercel.json` to project root
2. Copy `api/index.js` to project root (create `api/` folder first)
3. Copy `.vercelignore` to project root
4. Copy `scripts/copy-providers.js` to project root (create `scripts/` folder first)

**Update `package.json`:**
Add the `vercel-build` script:
```json
"scripts": {
  "vercel-build": "npm run build && node scripts/copy-providers.js"
}
```

### 2️⃣ Push to GitHub

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### 3️⃣ Deploy to Vercel

**Option A: Using Vercel Dashboard** (Recommended for beginners)

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Other
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** (leave empty)
   - **Install Command:** `npm install`

5. Add Environment Variables:
   - `TMDB_API_KEY` = your TMDB API key
   
6. Click "Deploy"

**Option B: Using Vercel CLI** (Recommended for developers)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variable
vercel env add TMDB_API_KEY production

# Deploy to production
vercel --prod
```

### 4️⃣ Test Your Deployment

Once deployed, test your API:

```bash
# Replace YOUR_VERCEL_URL with your actual URL
curl https://YOUR_VERCEL_URL.vercel.app/health

# Test movie sources
curl https://YOUR_VERCEL_URL.vercel.app/sources/movie/550

# Test TV sources
curl https://YOUR_VERCEL_URL.vercel.app/sources/tv/1396/1/1
```

## 📁 Final Project Structure

```
your-project/
├── api/
│   └── index.js          # Vercel serverless function
├── scripts/
│   └── copy-providers.js # Build script
├── src/
│   ├── config.ts
│   ├── server.ts
│   └── providers/
├── .vercelignore
├── vercel.json
├── package.json          # Updated with vercel-build script
└── tsconfig.json
```

## ⚠️ Common Issues & Solutions

### Issue: "Build failed - Cannot find module"
**Solution:** Make sure all dependencies are in `package.json` dependencies (not devDependencies)

### Issue: "TMDB_API_KEY is not defined"
**Solution:** Add the environment variable in Vercel dashboard under Settings → Environment Variables

### Issue: "No providers found"
**Solution:** Check that `scripts/copy-providers.js` ran successfully in build logs

### Issue: "Function timeout"
**Solution:** Some providers may be slow. Consider:
- Upgrading to Vercel Pro for longer timeouts
- Optimizing provider code
- Reducing number of providers loaded

## 🎯 What Happens During Deployment

1. ✅ Vercel runs `npm install`
2. ✅ Vercel runs `npm run vercel-build`
   - Compiles TypeScript → JavaScript
   - Copies providers to `api/providers/`
   - Copies config to `api/config.js`
3. ✅ Vercel deploys `api/index.js` as serverless function
4. ✅ Routes all requests to the serverless function

## 🔗 Your API Endpoints

After deployment, you'll have:

- **Base URL:** `https://your-project.vercel.app`
- **Movie Sources:** `/sources/movie/{tmdbId}`
- **TV Sources:** `/sources/tv/{tmdbId}/{season}/{episode}`
- **Health Check:** `/health`
- **Providers List:** `/providers`

## 📊 Monitor Your Deployment

View logs and analytics in Vercel dashboard:
- https://vercel.com/dashboard
- Select your project
- Check "Deployments" for build logs
- Check "Analytics" for usage stats

---

**Need help?** Check the full guide in `VERCEL_DEPLOYMENT.md`
