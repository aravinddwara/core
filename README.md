# Vercel Deployment Files for CinePro Core

This package contains all the necessary files to deploy CinePro Core to Vercel.

## 📦 What's Included

### Configuration Files
- **`vercel.json`** - Vercel platform configuration
- **`.vercelignore`** - Files to exclude from deployment
- **`package-updated.json`** - Updated package.json with vercel-build script

### Code Files
- **`api/index.js`** - Serverless function entry point
- **`scripts/copy-providers.js`** - Build script to prepare deployment

### Documentation
- **`QUICK_START.md`** - Quick deployment instructions
- **`VERCEL_DEPLOYMENT.md`** - Comprehensive deployment guide

## 🚀 How to Use

### Step 1: Add Files to Your Project

Copy these files to your CinePro Core project:

```bash
# In your project root directory

# 1. Copy configuration files
cp vercel.json .
cp .vercelignore .

# 2. Create directories and copy code files
mkdir -p api scripts
cp api/index.js api/
cp scripts/copy-providers.js scripts/

# 3. Update package.json
# Merge the scripts from package-updated.json into your package.json
# Add: "vercel-build": "npm run build && node scripts/copy-providers.js"
```

### Step 2: Update package.json

Add the `vercel-build` script to your existing `package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "vercel-build": "npm run build && node scripts/copy-providers.js",  // ← ADD THIS
    "start": "npm run build && node dist/server.js",
    "format": "prettier --write src",
    "clean": "npx rimraf dist api/providers api/config.js"  // ← UPDATED THIS
  }
}
```

### Step 3: Deploy

Follow the instructions in `QUICK_START.md` for deployment steps.

## 📁 Final Project Structure

After adding these files, your project should look like:

```
your-cinepro-core/
├── api/
│   └── index.js                 # ← NEW: Serverless function
├── scripts/
│   └── copy-providers.js        # ← NEW: Build helper
├── src/
│   ├── config.ts
│   ├── server.ts
│   └── providers/
│       ├── rgshows/
│       ├── uembed/
│       ├── vidrock/
│       ├── vidzee/
│       └── vixsrc/
├── .env.example
├── .gitignore
├── .vercelignore                # ← NEW: Vercel ignore rules
├── LICENSE
├── package.json                 # ← MODIFIED: Added vercel-build
├── README.md
├── tsconfig.json
└── vercel.json                  # ← NEW: Vercel config
```

## 🔑 Required Environment Variables

Set in Vercel dashboard:

- `TMDB_API_KEY` - Your TMDB API key (required)

## ✅ Verification Checklist

Before deploying, verify:

- [ ] All files copied to correct locations
- [ ] `package.json` has `vercel-build` script
- [ ] `.vercelignore` is in root directory
- [ ] `vercel.json` is in root directory
- [ ] `api/index.js` exists
- [ ] `scripts/copy-providers.js` exists
- [ ] Code committed to Git repository
- [ ] TMDB API key ready

## 🆘 Need Help?

1. **Read `QUICK_START.md`** - Step-by-step deployment guide
2. **Read `VERCEL_DEPLOYMENT.md`** - Comprehensive documentation
3. **Check Vercel Dashboard** - View build logs and errors
4. **GitHub Discussions** - Ask the community

## 📞 Support

- Documentation: https://cinepro.mintlify.app
- GitHub: https://github.com/cinepro-org/core
- Discussions: https://github.com/orgs/cinepro-org/discussions

---

**Ready to deploy?** Start with `QUICK_START.md`!
