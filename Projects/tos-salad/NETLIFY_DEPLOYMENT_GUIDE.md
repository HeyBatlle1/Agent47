# 🚀 Netlify Deployment Guide for ToS Salad

## ✅ Build Configuration Fixed

### 1. Package.json Verification
- ✅ **Build Script**: `"build": "next build"` confirmed in `frontend/package.json`
- ✅ **Local Build Test**: Successfully creates `.next` directory (106MB)
- ✅ **Next.js Version**: 15.5.3 with App Router

### 2. Netlify Configuration (`netlify.toml`)
```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NEXT_TELEMETRY_DISABLED = "1"
  NPM_FLAGS = "--legacy-peer-deps"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## 🔧 Required Environment Variables

**Add these in Netlify Dashboard > Site Settings > Environment Variables:**

### Database Configuration
```
DATABASE_URL = postgresql://neondb_owner:npg_N8SU2rbhfViZ@ep-solitary-dawn-aedihqsd-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### AI Analysis (Google Gemini)
```
GEMINI_API_KEY = AIzaSyD0l1nJnll9K-xjGyFwzoCPhBiRn9aBel8
GOOGLE_GEMINI_API_KEY = AIzaSyD0l1nJnll9K-xjGyFwzoCPhBiRn9aBel8
```

### Authentication (Supabase Auth)
```
NEXT_PUBLIC_SUPABASE_URL = https://fbjjqwfcmzrpmytieajp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiampxd2ZjbXpycG15dGllYWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0OTE4OTQsImV4cCI6MjA1MTA2Nzg5NH0.qG-vI_LAwMw9Az_iK6k8DsspQoQ-sT_fquSzYMwFe1g
SUPABASE_URL = https://fbjjqwfcmzrpmytieajp.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiampxd2ZjbXpycG15dGllYWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0OTE4OTQsImV4cCI6MjA1MTA2Nzg5NH0.qG-vI_LAwMw9Az_iK6k8DsspQoQ-sT_fquSzYMwFe1g
```

### Performance Settings (Optional)
```
RATE_LIMIT_REQUESTS_PER_MINUTE = 30
RATE_LIMIT_WINDOW_MS = 60000
CACHE_TTL_SECONDS = 3600
```

## 🚀 Deployment Steps

### 1. Connect Repository
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "New site from Git"
3. Choose GitHub and select `HeyBatlle1/ToS-Salad`

### 2. Build Settings (Auto-configured via netlify.toml)
- **Base directory**: `frontend` ✅
- **Build command**: `npm run build` ✅
- **Publish directory**: `.next` ✅

### 3. Add Environment Variables
1. Go to Site Settings > Environment Variables
2. Add all variables listed above
3. Save changes

### 4. Deploy
1. Click "Deploy site"
2. Netlify will automatically use the `netlify.toml` configuration
3. Build should complete successfully with Next.js plugin

## 🔍 Troubleshooting

### Build Failures
- ✅ **Node Version**: Confirmed 18 (required for Next.js 15.5.3)
- ✅ **Build Command**: Confirmed `npm run build` runs successfully
- ✅ **Output Directory**: Confirmed `.next` directory created (106MB)

### Runtime Issues
- **Database Connection**: Verify `DATABASE_URL` is correct for NeonDB
- **API Keys**: Ensure `GEMINI_API_KEY` is valid
- **Authentication**: Verify Supabase keys are active

### Security Dependencies
⚠️ **Note**: GitHub detected 32 vulnerabilities. Run this after deployment:
```bash
cd frontend && npm audit fix
```

## ✅ Verification Checklist

- [ ] Netlify site connected to GitHub repo
- [ ] Environment variables added to Netlify
- [ ] Build completes successfully
- [ ] Site loads with database connection
- [ ] AI analysis features work
- [ ] User authentication functions

## 🎯 Expected Result

Your ToS Salad transparency platform will be live with:
- ✅ 27 company analyses available
- ✅ AI-powered quote-and-explain analysis
- ✅ NeonDB backend with educational content
- ✅ Supabase authentication system
- ✅ Optimized performance and security headers