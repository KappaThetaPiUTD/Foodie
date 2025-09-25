# FoodieMaps

A collaborative food discovery app where people can join lobbies, share food preferences, and find restaurants that satisfy everyone in the group using Google Maps and Places API.

## 🏗️ Project Structure

```
FoodieMaps/
├── apps/
│   ├── web/                    # 🎨 FRONTEND ONLY
│   │   ├── .env.local         # Frontend environment variables
│   │   ├── package.json       # Frontend dependencies
│   │   ├── next.config.js     # Next.js configuration
│   │   ├── pages/
│   │   │   └── index.js       # Main page component
│   │   └── src/components/
│   │       └── Map.jsx        # Map component with all UI logic
│   └── server/                 # 🔧 BACKEND ONLY
│       ├── .env               # Backend environment variables
│       ├── package.json       # Backend dependencies
│       └── src/
│           └── index.js       # Express server + Socket.IO
├── package.json               # Root workspace configuration
├── package-lock.json          # Dependency lock file
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

### File Classification

#### 🎨 Frontend Files (`apps/web/`)
- **`pages/index.js`** - Main Next.js page that renders the app
- **`src/components/Map.jsx`** - Core React component containing:
  - Google Maps integration
  - User interface (forms, buttons, preferences)
  - State management (React hooks)
  - Browser APIs (geolocation, localStorage)
  - Client-side routing and restaurant search logic
- **`package.json`** - Frontend dependencies (React, Next.js, Google Maps)
- **`next.config.js`** - Next.js build configuration
- **`.env.local`** - Frontend environment variables (API keys)

#### 🔧 Backend Files (`apps/server/`)
- **`src/index.js`** - Express.js server containing:
  - HTTP server setup
  - Socket.IO WebSocket handling
  - MongoDB connection (optional)
  - API routes for sessions and preferences
  - CORS configuration
- **`package.json`** - Backend dependencies (Express, Socket.IO, Mongoose)
- **`.env`** - Backend environment variables (database connections)

#### 📁 Root Files
- **`package.json`** - Workspace configuration (manages both apps)
- **`package-lock.json`** - Dependency versions for entire project
- **`.gitignore`** - Prevents sensitive files from being committed
- **`README.md`** - Documentation (this file)

## 📋 Requirements

### System Requirements
- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher (for workspaces support)

### API Keys Required
- **Google Maps JavaScript API** (with billing enabled)
- **Google Places API** (text search)
- **Google Geocoding API** (address to coordinates)

### Optional
- **MongoDB Atlas** account (for data persistence)

## 🚀 Quick Start

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

### 3. Environment Variables

Create `apps/web/.env.local`:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Create `apps/server/.env` (optional):
```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/foodiemaps
```

### 4. Run the Application

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

## 🎮 How to Use

1. **Join a Session**
   - Enter the same session ID in both browser tabs
   - Click "Join Session"

2. **Set Preferences**
   - Select cuisine types (Italian, Mexican, etc.)
   - Choose price range ($, $$, $$$, $$$$)
   - Toggle "Open Now" if needed

3. **Set Start Locations**
   - Enter your starting address
   - Click "Share Start" to broadcast to other users

4. **Find Restaurants**
   - Click "Find Restaurants"
   - App finds restaurants between all users' locations
   - Results show on map and in list below

## 🛠️ Available Scripts

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
npm run build:web
```

## 🏗️ Tech Stack

### Frontend (`apps/web/`)
- **Next.js 15** - React framework
- **React 18** - UI library
- **@react-google-maps/api** - Google Maps integration
- **Tailwind CSS** - Styling (configured)
- **Socket.IO Client** - Real-time communication

### Backend (`apps/server/`)
- **Node.js** - Runtime
- **Express** - Web framework
- **Socket.IO** - WebSocket communication
- **Mongoose** - MongoDB ODM (optional)
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

## 🔧 Architecture

### Data Flow
1. Users join sessions via session IDs
2. Preferences stored locally + broadcast via Socket.IO
3. Start locations geocoded to coordinates
4. Midpoint calculated between all user locations
5. Google Places API searches for restaurants
6. Results filtered by common preferences
7. Sorted by fairness (sum of distances to all users)

### Real-time Features
- Cross-tab synchronization via `BroadcastChannel`
- Multi-user sync via Socket.IO
- Local persistence via `localStorage`

## 🚨 Troubleshooting

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

## 📝 Environment Variables

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

