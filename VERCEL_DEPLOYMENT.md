# Vercel Deployment Guide for CinePro Core

This guide will help you deploy CinePro Core to Vercel for serverless streaming.

## 📋 Prerequisites

- A Vercel account ([sign up here](https://vercel.com/signup))
- Git repository with your CinePro Core code
- TMDB API Key ([get one here](https://www.themoviedb.org/settings/api))

## 🚀 Quick Deploy

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add TMDB_API_KEY
   # Enter your TMDB API key when prompted
   ```

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Import Project:**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Click "Import Project"
   - Select your Git repository

2. **Configure Build Settings:**
   - Framework Preset: `Other`
   - Build Command: `npm run vercel-build`
   - Output Directory: `api`
   - Install Command: `npm install`

3. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add the following:
     ```
     TMDB_API_KEY=your_tmdb_api_key_here
     NODE_ENV=production
     ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete

## 📁 Required Files

Make sure these files are in your repository:

### 1. `vercel.json` (Root Directory)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. `api/index.js` (API Directory)
This file is already created in the `api/` directory.

### 3. `.vercelignore` (Root Directory)
Already created - excludes unnecessary files from deployment.

### 4. Updated `package.json`
Add the `vercel-build` script:
```json
{
  "scripts": {
    "vercel-build": "tsc && node scripts/copy-providers.js"
  }
}
```

## 🔧 Environment Variables

Set these in your Vercel project settings:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `TMDB_API_KEY` | ✅ Yes | Your TMDB API key | `abc123...` |
| `NODE_ENV` | ⚠️ Auto-set | Environment mode | `production` |
| `VERCEL_URL` | ⚠️ Auto-set | Vercel deployment URL | Auto-generated |

## 📡 API Endpoints

After deployment, your API will be available at:

```
https://your-project.vercel.app
```

### Available Endpoints:

1. **Get Movie Sources:**
   ```
   GET /sources/movie/{tmdbId}
   ```

2. **Get TV Show Sources:**
   ```
   GET /sources/tv/{tmdbId}/{season}/{episode}
   ```

3. **Health Check:**
   ```
   GET /health
   ```

4. **Provider Info:**
   ```
   GET /providers
   ```

### Example Usage:

```bash
# Get movie sources
curl https://your-project.vercel.app/sources/movie/550

# Get TV episode sources
curl https://your-project.vercel.app/sources/tv/1396/1/1

# Check health
curl https://your-project.vercel.app/health
```

## ⚠️ Important Notes

### Limitations on Vercel:

1. **No Redis Support:** 
   - Vercel serverless functions don't support persistent Redis connections
   - The deployment uses in-memory caching (cache resets on each cold start)

2. **Cold Starts:**
   - First request after inactivity may be slower
   - Subsequent requests will be faster

3. **Execution Time Limit:**
   - Free tier: 10 seconds max
   - Pro tier: 60 seconds max
   - May need optimization for slow providers

4. **File System:**
   - Serverless functions have read-only file system
   - Provider discovery happens on initialization

### Recommended Optimizations:

1. **Use Vercel Pro** for:
   - Longer execution times
   - More concurrent requests
   - Better performance

2. **Add Redis Cloud** (Optional):
   - Use external Redis service like Upstash
   - Update `api/index.js` to use Redis connection string
   - Set `REDIS_URL` environment variable

3. **Enable Edge Caching:**
   - Add cache headers in responses
   - Use Vercel Edge Network for static assets

## 🐛 Troubleshooting

### Build Fails

**Error:** `Cannot find module '@omss/framework'`
- **Solution:** Make sure `package.json` includes all dependencies
- Run `npm install` locally to verify

**Error:** `TypeScript compilation failed`
- **Solution:** Check `tsconfig.json` is properly configured
- Run `npm run build` locally to test

### Runtime Errors

**Error:** `TMDB_API_KEY is not defined`
- **Solution:** Add environment variable in Vercel dashboard
- Redeploy after adding variables

**Error:** `Function timeout`
- **Solution:** 
  - Optimize slow providers
  - Upgrade to Vercel Pro
  - Reduce timeout in provider code

**Error:** `No providers found`
- **Solution:** 
  - Check provider files are in `dist/providers/` after build
  - Verify build script copies providers correctly

## 📊 Monitoring

### View Logs:
```bash
vercel logs [deployment-url]
```

### Monitor Performance:
- Check Vercel Dashboard → Your Project → Analytics
- Monitor response times and error rates

## 🔄 Updates

To deploy updates:

```bash
# Via CLI
git push origin main
vercel --prod

# Via Dashboard
# Push to main branch - auto-deploys
```

## 🎯 Next Steps

After successful deployment:

1. ✅ Test all endpoints
2. ✅ Verify providers are working
3. ✅ Set up custom domain (optional)
4. ✅ Configure CORS if needed
5. ✅ Set up monitoring/alerts

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [OMSS Framework](https://github.com/omss-spec)
- [CinePro Docs](https://cinepro.mintlify.app)

## ⚡ Performance Tips

1. **Cold Start Optimization:**
   - Keep dependencies minimal
   - Use dynamic imports where possible
   - Consider Vercel Edge Functions for static routes

2. **Caching Strategy:**
   - Implement proper cache headers
   - Use Vercel's CDN for proxy responses
   - Consider external caching service

3. **Error Handling:**
   - Implement proper error boundaries
   - Return appropriate HTTP status codes
   - Log errors for debugging

---

**Need Help?** 
- [GitHub Discussions](https://github.com/orgs/cinepro-org/discussions/)
- [Report Issues](https://github.com/cinepro-org/core/issues)
