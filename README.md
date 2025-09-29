# FoodieMaps

A collaborative food discovery app where people can join lobbies, share food preferences, and find restaurants that satisfy everyone in the group using Google Maps and Places API.

## Project Structure

```
FoodieMaps/
├── apps/
│   ├── web/                          # FRONTEND
│   │   ├── .env.local               # FRONTEND - Environment variables
│   │   ├── .env.production.example  # FRONTEND - Production environment template
│   │   ├── package.json             # FRONTEND - Dependencies and scripts
│   │   ├── next.config.js           # FRONTEND - Next.js configuration
│   │   ├── pages/
│   │   │   ├── _app.js              # FRONTEND - App wrapper with AuthProvider
│   │   │   ├── index.js             # FRONTEND - Main routing page
│   │   │   ├── landing.js           # FRONTEND - Landing page
│   │   │   ├── login.js             # FRONTEND - Authentication page
│   │   │   └── maps.js              # FRONTEND - Protected maps page
│   │   └── src/
│   │       ├── components/          # FRONTEND - React UI components
│   │       │   ├── Map.jsx                 # FRONTEND - Main orchestrator
│   │       │   ├── LobbyManager.jsx        # FRONTEND - Session management UI
│   │       │   ├── PreferencesPanel.jsx   # FRONTEND - Food preferences UI
│   │       │   ├── LocationControls.jsx   # FRONTEND - Route planning controls
│   │       │   ├── MapView.jsx             # FRONTEND - Google Maps display
│   │       │   ├── RestaurantList.jsx     # FRONTEND - Restaurant results
│   │       │   └── ProtectedRoute.js       # FRONTEND - Authentication wrapper
│   │       ├── context/             # FRONTEND - React contexts
│   │       │   └── AuthContext.js          # FRONTEND - Firebase authentication
│   │       ├── hooks/               # FRONTEND - Custom React hooks
│   │       │   ├── useSession.js           # FRONTEND - Session management
│   │       │   ├── usePreferences.js       # FRONTEND - Preferences logic
│   │       │   ├── useRouting.js           # FRONTEND - Route calculation
│   │       │   └── useRestaurants.js       # FRONTEND - Restaurant search
│   │       └── lib/                 # FRONTEND - Configuration
│   │           └── firebase.js             # FRONTEND - Firebase setup
│   └── server/                       # BACKEND
│       ├── .env                     # BACKEND - Environment variables
│       ├── package.json             # BACKEND - Dependencies and scripts
│       ├── config/
│       │   └── production.js        # BACKEND - Production configuration
│       └── src/
│           └── index.js             # BACKEND - Express server + Socket.IO + MongoDB
├── package.json                     # SHARED - Root workspace config and scripts
├── package-lock.json                # SHARED - Dependency lock file
├── .gitignore                       # SHARED - Git ignore rules
├── DEPLOYMENT.md                    # SHARED - Deployment guide
└── README.md                        # SHARED - Documentation
```

### Frontend Architecture (Modular Components)

#### Core Components (`apps/web/src/components/`)

**`Map.jsx`** - FRONTEND Main Orchestrator (180 lines)
- Coordinates all other components
- Manages Google Maps API loading
- Handles data flow between components
- Integrates all hooks and manages application state

**`LobbyManager.jsx`** - FRONTEND Session Management
- Session ID input and joining interface
- Connection status display
- Collaboration setup UI

**`PreferencesPanel.jsx`** - FRONTEND Food Preferences UI
- Cuisine selection checkboxes (Pizza, Sushi, etc.)
- Price range dropdown ($, $$, $$$, $$$$)
- "Open now" toggle
- Peer preferences display

**`LocationControls.jsx`** - FRONTEND Route Planning
- Origin/destination autocomplete inputs
- Action buttons (Route, Share Start, Clear, Find Restaurants)
- Google Places integration

**`MapView.jsx`** - FRONTEND Pure Map Display
- Google Maps rendering and interaction
- Dual route display (user + peer routes)
- Restaurant markers with info windows
- Map centering and zoom control

**`RestaurantList.jsx`** - FRONTEND Results Display
- Formatted restaurant list with ratings
- Distance calculations to both users
- Scrollable results area

#### Custom Hooks (`apps/web/src/hooks/`)

**`useSession.js`** - FRONTEND Session Management
- Session joining and ID management
- BroadcastChannel setup for cross-tab communication
- localStorage integration for persistence
- Message broadcasting utilities

**`usePreferences.js`** - FRONTEND Food Preferences Logic
- Cuisine selection state management
- Price range and timing preferences
- Auto-broadcast changes to other users
- Preference matching algorithm

**`useRouting.js`** - FRONTEND Route Management
- Google Maps Directions API integration
- Autocomplete place selection handling
- Route calculation and display
- Origin location sharing between users

**`useRestaurants.js`** - FRONTEND Restaurant Discovery
- Google Places Text Search integration
- Geocoding and midpoint calculation
- Haversine distance formula for fairness
- Results filtering and sorting by preferences

#### Backend Files (`apps/server/`)

**`src/index.js`** - BACKEND Express Server
- HTTP server setup and configuration
- Socket.IO WebSocket handling for real-time communication
- MongoDB connection (optional database persistence)
- API routes for sessions and preferences
- CORS configuration for cross-origin requests

**`package.json`** - BACKEND Dependencies
- Express.js web framework
- Socket.IO for WebSocket communication
- Mongoose for MongoDB integration
- CORS middleware
- dotenv for environment variables

**`.env`** - BACKEND Environment Variables
- `MONGO_URI` - MongoDB connection string (optional)
- `PORT` - Server port configuration (default: 5000)

#### Shared/Root Files

**`package.json`** - SHARED Root Workspace Configuration
- npm workspaces setup for `apps/web` and `apps/server`
- Root-level scripts (`dev:all`, `dev:all:two-web`)
- Concurrently configuration for running multiple services

**`package-lock.json`** - SHARED Dependency Lock File
- Exact dependency versions for entire project
- Ensures consistent installations across environments

**`.gitignore`** - SHARED Git Configuration
- Prevents sensitive files from being committed (`.env`, `.env.local`)
- Ignores build artifacts (`node_modules`, `.next`)

**`README.md`** - SHARED Documentation
- Project documentation and setup instructions
- Architecture overview and component explanations

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

### 2. Google Maps Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. **Enable billing** (required for Maps API)
4. Enable these APIs:
   - Maps JavaScript API
   - Places API (New)
   - Geocoding API
5. Create credentials → API Key
6. Set HTTP referrer restrictions:
   ```
   http://localhost:3001/*
   http://localhost:3002/*
   ```

### 3. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication → Email/Password
4. Get your config from Project Settings → General
5. Update `apps/web/src/lib/firebase.js` with your config

### 4. Environment Variables

Create `apps/web/.env.local`:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Create `apps/server/.env` (optional):
```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/foodiemaps
PORT=5000
```

### 5. Run the Application

**Option A: Single Web Instance (Recommended)**
```bash
npm run dev:all
```
- Frontend: http://localhost:3001 (open 2 tabs)
- Backend: http://localhost:5000

**Option B: Two Web Instances**
```bash
npm run dev:all:two-web
```
- Frontend A: http://localhost:3001
- Frontend B: http://localhost:3002
- Backend: http://localhost:5000

## How to Use

1. **Create Account or Login**
   - Visit the landing page
   - Click "Get Started" to go to login page
   - Create account or sign in with existing credentials

2. **Join a Session**
   - Enter the same session ID in both browser tabs/devices
   - Click "Join Session"

3. **Set Preferences**
   - Select cuisine types (Italian, Mexican, etc.)
   - Choose price range ($, $$, $$$, $$$$)
   - Toggle "Open Now" if needed

4. **Set Start Locations**
   - Enter your starting address
   - Click "Share Start" to broadcast to other users

5. **Find Restaurants**
   - Click "Find Restaurants"
   - App finds restaurants between all users' locations
   - Results show on map and in list below

## Available Scripts

```bash
# Install all dependencies
npm install

# Run frontend + backend together
npm run dev:all

# Run with two frontend instances
npm run dev:all:two-web

# Run individual services
npm run dev:web      # Frontend only
npm run dev:server   # Backend only

# Build for production
npm run build        # Build both frontend and backend
npm run build:web    # Build frontend only
npm run build:server # Build backend only

# Production scripts
npm run start:prod   # Start both in production mode
npm run install:all  # Install all dependencies
npm run clean        # Clean build artifacts
```

## Deployment

### Production Build
```bash
# Build the entire project
npm run build

# Install dependencies for production
npm run install:all
```

### Environment Setup
1. **Frontend (.env.production)**:
   ```bash
   NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_api_key
   ```

2. **Backend (.env)**:
   ```bash
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   NODE_ENV=production
   ```



See `DEPLOYMENT.md` for detailed deployment instructions.

## Development Workflow

### Working with Components

#### Adding New Features
1. **Create Hook** (`apps/web/src/hooks/useNewFeature.js`)
   ```javascript
   export function useNewFeature() {
     // Business logic here
     return { state, actions };
   }
   ```

2. **Create Component** (`apps/web/src/components/NewFeature.jsx`)
   ```javascript
   export default function NewFeature({ onAction }) {
     // UI logic here
     return <div>...</div>;
   }
   ```

3. **Integrate in Map.jsx**
   ```javascript
   import { useNewFeature } from '../hooks/useNewFeature';
   import NewFeature from './NewFeature';
   ```

#### Debugging Components
- **LobbyManager**: Session joining issues → Check `useSession.js`
- **PreferencesPanel**: Preference sync → Check `usePreferences.js`
- **LocationControls**: Route calculation → Check `useRouting.js`
- **RestaurantList**: Search results → Check `useRestaurants.js`
- **MapView**: Map display → Check Google Maps API integration

#### Testing Individual Components
```bash
# Each component can be tested in isolation
# Create test files in apps/web/src/components/__tests__/
```

## Tech Stack

### Frontend (`apps/web/`)
- **Next.js 15** - React framework
- **React 18** - UI library
- **Firebase Auth** - Authentication service
- **@react-google-maps/api** - Google Maps integration
- **Tailwind CSS** - Styling (configured)
- **Socket.IO Client** - Real-time communication

### Backend (`apps/server/`)
- **Node.js** - Runtime
- **Express** - Web framework
- **Socket.IO** - WebSocket communication
- **Mongoose** - MongoDB ODM
- **MongoDB Atlas** - Cloud database
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables





### Data Flow Architecture
```
User Action → Component → Hook → localStorage/BroadcastChannel → Other Components
```

#### Detailed Flow:
1. **Session Management**: Users join sessions via session IDs
2. **Preference Sync**: Food preferences stored locally + broadcast via `BroadcastChannel`
3. **Location Processing**: Start locations geocoded to coordinates
4. **Midpoint Calculation**: Geographic center calculated between all user locations
5. **Restaurant Search**: Google Places API searches based on common preferences
6. **Results Processing**: Results filtered by preferences and sorted by fairness
7. **Display Updates**: All connected users see synchronized results

### Real-time Features
- **Cross-tab Sync**: `BroadcastChannel` for same-browser communication
- **Multi-device Sync**: Socket.IO for different devices/browsers
- **Data Persistence**: `localStorage` for session continuity
- **Live Updates**: Real-time preference and location sharing

## Troubleshooting

### "This page can't load Google Maps correctly"
1. Verify API key is correct in `apps/web/.env.local`
2. Check billing is enabled in Google Cloud
3. Ensure Maps JavaScript API is enabled
4. Verify HTTP referrer restrictions include your localhost URLs
5. Restart development server after env changes

### Port Already in Use
```bash
# Kill processes on specific ports
kill -9 $(lsof -t -i:3001)
kill -9 $(lsof -t -i:5000)
```

### Cross-tab Sync Not Working
- Ensure both tabs use the same origin (same port)
- `BroadcastChannel` only works within same origin
- Use single web instance with two tabs instead of two ports

## Environment Variables

### Frontend (`apps/web/.env.local`)
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Google Maps API key |
| `NEXT_PUBLIC_SOCKET_URL` | Yes | Backend Socket.IO URL |

### Backend (`apps/server/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | No | MongoDB connection string |
| `PORT` | No | Server port (default: 5000) |

