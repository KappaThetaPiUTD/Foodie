## Project Structure

```
FoodieMaps/
├── apps/
│   ├── web/                          # Next.js web frontend
│   │   ├── pages/
│   │   │   ├── _app.js               # Auth context + layout wrapper
│   │   │   ├── index.js              # Redirects based on auth state
│   │   │   ├── landing.js            # Marketing + onboarding page
│   │   │   ├── login.js              # Firebase auth UI
│   │   │   ├── maps.js               # Protected collaborative map
│   │   │   └── profile.js            # User preferences dashboard
│   │   └── src/
│   │       ├── components/
│   │       │   ├── Map.jsx           # Main map orchestrator
│   │       │   ├── LobbyManager.jsx
│   │       │   ├── PreferencesPanel.jsx
│   │       │   ├── LocationControls.jsx
│   │       │   ├── MapView.jsx
│   │       │   ├── RestaurantList.jsx
│   │       │   ├── PillNav.jsx       # Floating navigation pill
│   │       │   └── CardSwap.jsx      # GSAP-powered landing animation
│   │       ├── context/
│   │       │   └── AuthContext.js    # Firebase auth provider
│   │       ├── hooks/                # Reusable state machines (sessions, prefs, routing, etc.)
│   │       └── lib/
│   │           └── firebase.js
│   ├── mobile/                       # Expo / React Native app
│   │   ├── App.js
│   │   └── src/
│   │       ├── screens/
│   │       ├── context/
│   │       └── lib/
│   └── server/                       # Express + Socket.IO + MongoDB API
│       ├── package.json
│       └── src/index.js
├── .github/workflows/ci.yml          # CI: lint, test, build, deploy
├── .husky/pre-commit                 # git hook running lint-staged
├── jest.config.js / jest.setup.js    # Shared Jest config
├── .eslintrc.js / .prettierrc.js     # Monorepo lint/format rules
├── package.json                      # npm workspaces + shared scripts
├── package-lock.json
├── .env                              # Root secrets (Mongo URI, etc.)
└── README.md
```

### Important Files

**`apps/web/src/components/Map.jsx`** - Main orchestrator that coordinates all components and manages Google Maps API loading.

**`apps/web/src/hooks/useSession.js`** - Handles session joining, real-time sync via Socket.IO, and localStorage persistence.

**`apps/web/src/hooks/useRestaurants.js`** - Integrates with Google Places API to search restaurants based on user preferences and locations.

**`apps/server/src/index.js`** - Express server with Socket.IO for real-time communication and MongoDB connection for data persistence.

**`apps/web/src/context/AuthContext.js`** - Firebase authentication context providing login/signup/logout functions throughout the app.

**`apps/web/src/components/PillNav.jsx`** - Floating navigation used across marketing pages; handles hover animations and responsive menu state.

**`apps/web/src/components/CardSwap.jsx`** - Landing-page GSAP animation that only runs while visible, showcasing upcoming features.

## Requirements

### System Requirements
- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher (for workspaces support)

### API Keys Required
- **Google Maps JavaScript API** (with billing enabled)
- **Google Places API** (text search)
- **Google Geocoding API** (address to coordinates)
- **Firebase project** (for authentication)

### Optional
- **MongoDB Atlas** account (for data persistence)

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/FoodieMaps.git
cd FoodieMaps
npm install
```

### 2. Setup API Keys

**Google Maps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable billing
3. Enable APIs: Maps JavaScript API, Places API, Geocoding API
4. Create an API key

**Firebase:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project
3. Enable Authentication → Email/Password
4. Get your config from Project Settings → General

### 3. Environment Variables

**Root (`.env`):**
```bash
# MongoDB (Optional)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/foodiemaps
```

**Web App (`apps/web/.env.local`):**
```bash
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Backend Socket.IO URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

**Mobile App (`apps/mobile/.env`):**
```bash
# Same Firebase configuration as web (use EXPO_PUBLIC_ prefix)
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Backend Socket.IO URL (use your computer's IP for mobile testing)
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.100:5000
```

### 4. Run the Application

**Web + Server (Recommended):**
```bash
npm run dev:all
```
- Frontend: http://localhost:3001
- Backend: http://localhost:5000

Open `http://localhost:3001` in two browser tabs to test collaboration.

## Available Scripts

### Development Scripts
```bash
npm run dev:web         # Web app only (port 3001)
npm run dev:server      # Backend server only (port 5000)
npm run dev:mobile      # Mobile app only (Expo)
npm run dev:all         # Web + Server
npm run dev:all:mobile  # Mobile + Server
npm run dev:full        # All three: Web + Mobile + Server
```

### Build Scripts
```bash
npm run build:web     # Build web app for production
npm run build:mobile  # Build mobile app
npm run build:all     # Build web + server + mobile
```

### Code Quality Scripts
```bash
npm run lint          # Run ESLint on all apps
npm run lint:fix      # Run ESLint with auto-fix
npm run format        # Format all code with Prettier
npm run test          # Run all tests
```

## Tech Stack

### Frontend Web App (`apps/web/`)
- **Next.js 15** - React framework
- **React 19** - UI library
- **Firebase Auth** - Authentication service
- **@react-google-maps/api** - Google Maps integration
- **Socket.IO Client** - Real-time communication

### Frontend Mobile App (`apps/mobile/`)
- **Expo 54** - React Native development platform
- **React Native 0.81** - Mobile UI framework
- **React Navigation 7** - Navigation library
- **React Native Maps** - Mobile maps integration
- **Firebase Auth** - Authentication service
- **Socket.IO Client** - Real-time communication

### Backend API Server (`apps/server/`)
- **Node.js** - Runtime
- **Express 5** - Web framework
- **Socket.IO 4** - WebSocket communication
- **Mongoose 8** - MongoDB ODM
- **MongoDB Atlas** - Cloud database

### Development Tools
- **npm Workspaces** - Monorepo dependency management
- **ESLint + Prettier** - Code linting and formatting
- **Husky + lint-staged** - Git hooks for code quality
- **Jest** - Testing framework
- **GitHub Actions** - CI/CD pipeline

## How to Use

1. **Create Account or Login** - Visit the landing page and click "Get Started"
2. **Join a Session** - Enter the same session ID in multiple browser tabs/devices
3. **Set Preferences** - Select cuisine types, price range, and dietary restrictions
4. **Set Start Locations** - Enter your starting address and share with the group
5. **Find Restaurants** - Click "Find Restaurants" to discover places that match everyone's preferences

## Deployment

- **Web Frontend**: Deploy to **Vercel** (`apps/web`)
- **Mobile App**: Build with **Expo** and distribute via app stores (`apps/mobile`)
- **Backend API**: Deploy to **Railway** or **Render** (`apps/server`)
- **Database**: **MongoDB Atlas** (cloud)
