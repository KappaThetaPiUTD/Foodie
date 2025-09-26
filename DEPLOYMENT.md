# 🚀 FoodieMaps Deployment Guide

## Environment Variables Setup

### Frontend (.env.local for development, .env.production for production)

```bash
# Copy your existing .env.local to .env.production and update:
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCXBFnwrhM--SXqabtELIgzdtTJNW8KBfo
```

### Backend (.env file - same for dev and prod)

```bash
# Keep your existing .env file, just ensure these are set:
MONGO_URI=mongodb+srv://Foodie-Admin:Ibrahimovic-2004@cluster0.j6yyzme.mongodb.net/foodiemaps?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
NODE_ENV=production  # Add this for production
```

## Pre-Deployment Checklist

### 1. Google API Console Updates
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to APIs & Services > Credentials
- Edit your API key restrictions
- Add your production domain: `https://your-domain.com/*`
- Keep localhost for development: `http://localhost:3001/*`

### 2. Firebase Console Updates
- Go to [Firebase Console](https://console.firebase.google.com/)
- Select your project: "foodie-fd73a"
- Go to Authentication > Settings > Authorized domains
- Add your production domain: `your-domain.com`

### 3. Update Production Config
- Edit `apps/server/config/production.js`
- Replace `https://your-frontend-domain.com` with your actual domain
- Do the same for Socket.IO CORS settings

## Hosting Platforms

### Recommended Setup:
- **Frontend**: Vercel (connects to GitHub, auto-deploys)
- **Backend**: Railway or Render (Node.js hosting)
- **Database**: MongoDB Atlas (already set up)

### Platform-Specific Instructions:

#### Vercel (Frontend)
1. Connect GitHub repo
2. Set root directory: `apps/web`
3. Add environment variables in dashboard
4. Auto-deploys on push to main

#### Railway (Backend)
1. Connect GitHub repo
2. Set root directory: `apps/server`
3. Add environment variables
4. Set start command: `node src/index.js`

## Testing Deployment

1. **Create test account** on production site
2. **Join session** with session code
3. **Test real-time sync** between devices
4. **Verify restaurant search** works
5. **Check mobile responsiveness**

## Rollback Plan

If something breaks:
1. **Check logs** in hosting platform dashboard
2. **Verify environment variables** are set correctly
3. **Test API endpoints** directly
4. **Revert to last working commit** if needed

## Security Notes

- API keys are properly restricted to your domains
- CORS is configured for production domains only
- MongoDB connection uses SSL
- Firebase handles authentication security
- No sensitive data in client-side code

## Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs in hosting dashboard
3. Verify all environment variables are set
4. Test Google APIs in browser network tab
