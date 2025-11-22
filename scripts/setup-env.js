#!/usr/bin/env node
/**
 * Setup script to create .env.example files for FoodieMaps
 * Run with: npm run setup:env
 */

const fs = require('fs');
const path = require('path');

const webEnvExample = `# ============================================
# Web App Environment Variables
# ============================================
# Copy this file to .env.local and fill in your actual values
# 
# IMPORTANT: Never commit .env.local to git!
# ============================================

# Google Maps API Key
# Get from: https://console.cloud.google.com/apis/credentials
# Required APIs: Maps JavaScript API, Places API, Geocoding API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Firebase Configuration
# Get from: https://console.firebase.google.com/ → Project Settings → General
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Backend Socket.IO URL
# For local development: http://localhost:5000
# For production: https://your-backend-url.com
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
`;

const serverEnvExample = `# ============================================
# Server Environment Variables
# ============================================
# Copy this file to .env and fill in your actual values
# 
# IMPORTANT: Never commit .env to git!
# ============================================

# MongoDB Connection String
# Get from: https://www.mongodb.com/cloud/atlas
# Format: mongodb+srv://username:password@cluster.mongodb.net/database_name
# Optional: Server works without MongoDB, but features will be limited
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/foodiemaps

# Server Port (optional, defaults to 5000)
PORT=5000

# Node Environment
# development | production
NODE_ENV=development
`;

const mobileEnvExample = `# ============================================
# Mobile App Environment Variables
# ============================================
# Copy this file to .env and fill in your actual values
# 
# IMPORTANT: Never commit .env to git!
# ============================================

# Google Maps API Key
# Get from: https://console.cloud.google.com/apis/credentials
# Required APIs: Maps JavaScript API, Places API, Geocoding API
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Firebase Configuration
# Get from: https://console.firebase.google.com/ → Project Settings → General
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Backend Socket.IO URL
# For local development: use your computer's local IP (not localhost)
# Find your IP: ipconfig (Windows) or ifconfig (Mac/Linux)
# Example: http://192.168.1.100:5000
EXPO_PUBLIC_SOCKET_URL=http://YOUR_LOCAL_IP:5000
`;

function createEnvExample(dir, content, filename = '.env.example') {
  const filePath = path.join(process.cwd(), dir, filename);
  const dirPath = path.dirname(filePath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Write file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Created ${dir}/${filename}`);
}

console.log('🚀 Setting up .env.example files...\n');

// Create .env.example files
createEnvExample('apps/web', webEnvExample);
createEnvExample('apps/server', serverEnvExample);
createEnvExample('apps/mobile', mobileEnvExample);

console.log('\n✨ Done! Next steps:');
console.log('1. Copy .env.example files to create your .env files:');
console.log('   cp apps/web/.env.example apps/web/.env.local');
console.log('   cp apps/server/.env.example apps/server/.env');
console.log('   cp apps/mobile/.env.example apps/mobile/.env');
console.log('\n2. Fill in your API keys (see API_KEY_SETUP.md for detailed instructions)');
console.log('\n3. Run: npm run dev:all');

