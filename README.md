# FoodieMaps

Collaborative restaurant finder that helps groups discover places everyone will love. Share your location and preferences in real-time to find restaurants that match the group's tastes.

## Project Structure

```
FoodieMaps/
├── apps/
│   ├── web/                              # Next.js web frontend
│   │   ├── pages/
│   │   │   ├── _app.js                   # Auth wrapper + layout
│   │   │   ├── index.js                  # Root redirect
│   │   │   ├── landing.js                # Marketing page
│   │   │   ├── login.js                  # Auth UI
│   │   │   ├── maps.js                   # Main collaborative map
│   │   │   └── profile.js                # User preferences
│   │   ├── public/
│   │   │   ├── FoodieLogo.png
│   │   │   └── team/                     # Team photos
│   │   └── src/
│   │       ├── components/
│   │       │   ├── Map.jsx               # Main map orchestrator
│   │       │   ├── MapView.jsx           # Google Maps wrapper
│   │       │   ├── LobbyManager.jsx      # Session management
│   │       │   ├── PreferencesPanel.jsx  # Preferences UI
│   │       │   ├── LocationControls.jsx  # Location input
│   │       │   ├── RestaurantList.jsx    # Results display
│   │       │   ├── PillNav.jsx           # Navigation pill
│   │       │   ├── CardSwap.jsx          # Landing animation
│   │       │   ├── Header.jsx
│   │       │   └── ProtectedRoute.js
│   │       ├── hooks/
│   │       │   ├── useSession.js         # Socket.IO session state
│   │       │   ├── useRestaurants.js     # Google Places search
│   │       │   ├── usePreferences.js     # User preferences
│   │       │   ├── useUser.js            # User data sync
│   │       │   └── useRouting.js         # Navigation logic
│   │       ├── context/
│   │       │   └── AuthContext.js        # Firebase auth
│   │       ├── lib/
│   │       │   └── firebase.js           # Firebase config
│   │       └── styles/
│   │           └── globals.css
│   │
│   ├── mobile/                           # Expo React Native app
│   │   ├── App.js                        # Navigation + auth flow
│   │   ├── app.config.js                 # Expo config
│   │   ├── metro.config.js               # Monorepo bundler setup
│   │   ├── assets/                       # App icons
│   │   └── src/
│   │       ├── screens/
│   │       │   ├── LandingScreen.js      # Marketing page
│   │       │   ├── LoginScreen.js        # Phone auth
│   │       │   ├── MapScreen.js          # Main session/map
│   │       │   └── ProfileScreen.js      # User settings
│   │       ├── context/
│   │       │   └── UserContext.js        # User state
│   │       └── lib/
│   │           ├── firebase.js           # Firebase config
│   │           └── socketClient.js       # Socket.IO client
│   │
│   └── server/                           # Express + Socket.IO API
│       ├── config/
│       │   └── production.js             # Production config
│       └── src/
│           └── index.js                  # Main server + Socket.IO
│
├── scripts/
│   └── setup-env.js                      # Auto-generate .env.example files
├── .github/
│   ├── workflows/
│   │   └── ci.yml                        # GitHub Actions CI/CD
│   └── dependabot.yml
├── .husky/
│   └── pre-commit                        # Git hooks for linting
├── jest.config.js                        # Shared test config
├── jest.setup.js
├── package.json                          # Monorepo workspace config
└── README.md
```

## Quick Start

### 1. Install
```bash
git clone <repo-url>
cd FoodieMaps
npm install
```

### 2. Setup Environment Variables

Create environment files:
```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/server/.env.example apps/server/.env
cp apps/mobile/.env.example apps/mobile/.env
```

Fill in your API keys in each file:

**Required:**
- Google Maps API Key ([Get it here](https://console.cloud.google.com/))
  - Enable: Maps JavaScript API, Places API, Geocoding API
- Firebase Config ([Get it here](https://console.firebase.google.com/))

**Optional:**
- MongoDB Atlas URI (server works without it but with limited persistence)

### 3. Run

**Web App:**
```bash
npm run dev:all
```
Opens at http://localhost:3001

**Mobile App:**
```bash
npm run dev:all:mobile
```
Opens in Expo Go on your device or simulator

## Tech Stack

**Frontend:**
- Next.js 15 / React 19 (web)
- Expo 54 / React Native 0.81 (mobile)
- Firebase Auth
- Socket.IO Client
- Google Maps API

**Backend:**
- Express 5
- Socket.IO 4
- MongoDB (optional)

**Dev Tools:**
- npm Workspaces (monorepo)
- ESLint + Prettier
- Husky + lint-staged
- Jest


## Deployment

- Web: Vercel
- Mobile: Expo build → App stores
- Server: Railway or Render
- Database: MongoDB Atlas
