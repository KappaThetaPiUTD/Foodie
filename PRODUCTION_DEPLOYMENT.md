# 🚀 FoodieMaps Production Deployment Guide

## Overview

This guide walks you through deploying FoodieMaps to production using:
- **Frontend**: Vercel (free tier)
- **Backend**: Railway (free tier)
- **Database**: MongoDB Atlas (already configured)

## Step 1: Backend Deployment (Railway)

### 1.1 Prepare Backend
```bash
# Your backend is ready! No additional setup needed.
# Railway will automatically detect your Node.js app
```

### 1.2 Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select your FoodieMaps repository
5. Railway will auto-detect multiple services

### 1.3 Configure Railway Service
1. **Select Backend Service**: Choose `apps/server`
2. **Set Root Directory**: `apps/server`
3. **Start Command**: `npm start` (already configured)
4. **Environment Variables**:
   ```
   MONGO_URI=mongodb+srv://Foodie-Admin:Ibrahimovic-2004@cluster0.j6yyzme.mongodb.net/foodiemaps?retryWrites=true&w=majority&appName=Cluster0
   PORT=5000
   NODE_ENV=production
   ```

### 1.4 Get Backend URL
- After deployment, Railway will give you a URL like: `https://your-app-name.up.railway.app`
- **Save this URL** - you'll need it for frontend configuration

## Step 2: Frontend Deployment (Vercel)

### 2.1 Prepare Frontend Environment
Create `apps/web/.env.production`:
```bash
NEXT_PUBLIC_SOCKET_URL=https://your-railway-backend-url.up.railway.app
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCXBFnwrhM--SXqabtELIgzdtTJNW8KBfo
```

### 2.2 Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Import Git Repository"
4. Select your FoodieMaps repository

### 2.3 Configure Vercel Project
1. **Framework Preset**: Next.js
2. **Root Directory**: `apps/web`
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next` (auto-detected)

### 2.4 Set Environment Variables in Vercel
In Vercel dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_SOCKET_URL=https://your-railway-backend-url.up.railway.app
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCXBFnwrhM--SXqabtELIgzdtTJNW8KBfo
```

## Step 3: Update Production Configuration

### 3.1 Update Backend CORS
Edit `apps/server/config/production.js`:
```javascript
corsOrigins: [
  'https://your-vercel-app.vercel.app',
  'https://your-custom-domain.com', // if you have one
],
```

### 3.2 Update Google API Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Edit your API key restrictions
4. Add your production domains:
   ```
   https://your-vercel-app.vercel.app/*
   https://your-custom-domain.com/*
   ```

### 3.3 Update Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: "foodie-fd73a"
3. Go to Authentication → Settings → Authorized domains
4. Add your production domain: `your-vercel-app.vercel.app`

## Step 4: Test Production Deployment

### 4.1 Basic Functionality Test
1. Visit your Vercel URL
2. Test user registration
3. Test user login
4. Test session creation
5. Test real-time sync
6. Test restaurant search

### 4.2 Cross-Device Test
1. Open on mobile and desktop
2. Login with same account
3. Join same session
4. Verify real-time sync works

## Step 5: Custom Domain (Optional)

### 5.1 Frontend Domain (Vercel)
1. In Vercel dashboard → Domains
2. Add your custom domain
3. Update DNS records as instructed

### 5.2 Backend Domain (Railway)
1. In Railway dashboard → Settings → Domains
2. Add custom domain
3. Update DNS records

## Environment Variables Summary

### Backend (Railway)
```bash
MONGO_URI=mongodb+srv://Foodie-Admin:Ibrahimovic-2004@cluster0.j6yyzme.mongodb.net/foodiemaps?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
NODE_ENV=production
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_SOCKET_URL=https://your-railway-backend.up.railway.app
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCXBFnwrhM--SXqabtELIgzdtTJNW8KBfo
```

## Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in both platforms
- [ ] CORS updated with production domains
- [ ] Google API restrictions updated
- [ ] Firebase authorized domains updated
- [ ] Authentication flow tested
- [ ] Real-time sync tested
- [ ] Restaurant search tested
- [ ] Cross-device functionality verified

## Troubleshooting

### Common Issues

1. **CORS Error**: Update production.js with correct frontend URL
2. **Firebase Auth Error**: Add domain to Firebase authorized domains
3. **Google Maps Error**: Update API key restrictions
4. **MongoDB Connection**: Verify MONGO_URI in Railway environment
5. **Socket.IO Connection**: Check NEXT_PUBLIC_SOCKET_URL

### Logs
- **Backend Logs**: Railway dashboard → Deployments → View logs
- **Frontend Logs**: Vercel dashboard → Functions → View logs
- **MongoDB Logs**: Atlas dashboard → Monitoring

## Cost Estimation

### Free Tier Limits
- **Vercel**: 100GB bandwidth, 1000 deployments/month
- **Railway**: $5 credit/month, ~550 hours uptime
- **MongoDB Atlas**: 512MB storage, shared cluster

### Paid Upgrades
- **Vercel Pro**: $20/month for teams
- **Railway**: $10/month for hobby plan
- **MongoDB**: $9/month for dedicated cluster

## Monitoring

### Key Metrics to Watch
- **Response Time**: < 1 second for API calls
- **Uptime**: > 99.9%
- **Database Connections**: Monitor Atlas dashboard
- **Error Rates**: Check logs for 500 errors

### Alerts Setup
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure error alerts in Railway/Vercel
- Monitor MongoDB Atlas alerts

## Security

### Production Security Checklist
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] API rate limiting enabled
- [ ] HTTPS enforced
- [ ] Firebase security rules updated
- [ ] Database access restricted

Your FoodieMaps app is now production-ready! 🎉
