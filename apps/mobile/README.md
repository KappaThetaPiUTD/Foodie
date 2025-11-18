# FoodieMaps Mobile App

React Native mobile app for FoodieMaps built with Expo.

## Setup Instructions

### 1. Copy Environment Variables

```bash
cd apps/mobile
cp .env.example .env
```

Then edit `.env` and add your API keys (same as web app).

### 2. Provide Google Maps API Key

The Expo config now reads the Google Maps API key from your `.env` file via `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`. Add it when you create `.env`; no need to edit the config file manually.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm start
```

This will open Expo DevTools in your browser and show a QR code.

## Running the App

### Option 1: On Your Phone (Easiest)

1. Install **Expo Go** app from:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Run `npm start`

3. Scan the QR code:
   - **iOS**: Use Camera app to scan QR code
   - **Android**: Use Expo Go app to scan QR code

4. The app will open in Expo Go!

### Option 2: iOS Simulator (Mac only)

1. Install Xcode from Mac App Store

2. Run:
```bash
npm run ios
```

This will open the iOS Simulator with your app.

### Option 3: Android Emulator

1. Install [Android Studio](https://developer.android.com/studio)

2. Set up an Android Virtual Device (AVD)

3. Run:
```bash
npm run android
```

## Running with Backend

From the root directory:

```bash
# Run backend + mobile app
npm run dev:all:mobile
```

Or separately:

```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Mobile app
npm run dev:mobile
```

## Features Implemented

- Firebase Authentication (Login/Sign Up)
- Landing Page with team info
- Session Management with Socket.IO
- Google Maps with React Native Maps
- Real-time location tracking
- Restaurant search and display
- User Profile & Settings
- Default Preferences Management
- Bottom Tab Navigation
- Clean mobile UI

## Project Structure

```
apps/mobile/
├── App.js                       # Main app with navigation
├── app.config.js               # Expo configuration (loads env vars)
├── src/
│   ├── screens/
│   │   ├── LandingScreen.js     # Landing page
│   │   ├── LoginScreen.js       # Login/Sign up screen
│   │   ├── MapScreen.js         # Main map interface
│   │   └── ProfileScreen.js     # User profile & settings
│   ├── context/
│   │   └── UserContext.js       # User state management
│   └── lib/
│       ├── firebase.js          # Firebase config
│       └── socketClient.js      # Socket.IO client
```

## Navigation Structure

The app uses a hybrid navigation approach:

**Unauthenticated Flow:**
- Landing Screen -> Login Screen

**Authenticated Flow:**
- Bottom Tabs:
  - Map Tab (Main session/map interface)
  - Profile Tab (User settings & preferences)

## User Features

### Profile Screen
- View user statistics (sessions joined, restaurants discovered, favorites)
- Set default food preferences:
  - Favorite cuisines (multi-select)
  - Default price range
  - Open now preference
- Sign out functionality
- Preferences sync with server and are used as defaults in new sessions

## Troubleshooting

### "Cannot connect to Metro"
- Make sure you're on the same WiFi network as your computer
- Check your firewall settings

### "Unable to resolve module"
- Run `npm install` again
- Clear cache: `npx expo start -c`

### Maps not showing
- Verify Google Maps API key is set in `.env` (EXPO_PUBLIC_GOOGLE_MAPS_API_KEY)
- Check that Maps SDK is enabled in Google Cloud Console

## Next Steps

To add more features from your web app:
1. Copy hooks from `apps/web/src/hooks/`
2. Adapt UI for mobile screens
3. Test on real devices for best results
