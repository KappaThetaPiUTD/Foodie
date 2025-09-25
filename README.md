## Monorepo layout

apps/
- web (Next.js frontend)
- server (Node/Express backend)

## Setup

1) Install deps (root uses npm workspaces):
```
npm install
```

2) Env files
- apps/web/.env.local
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_BROWSER_MAPS_API_KEY
# Optional if you re-enable sockets in web:
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```
- apps/server/.env (optional for Mongo)
```
MONGO_URI=mongodb+srv://...
```

## Run (same behavior as before)

Single web + server (recommended):
```
npm run dev:all
```
- Frontend: http://localhost:3001
- Backend: http://localhost:5000

Two web instances (simulate two users on same machine):
```
npm run dev:all:two-web
```
- Frontend A: http://localhost:3001
- Frontend B: http://localhost:3002
- Backend: http://localhost:5000

Then, in both web tabs:
- Enter the same session ID, click Join
- Set preferences and start locations
- Click Find Restaurants to get a shared list and markers

## Notes
- MongoDB is optional; backend starts without it. Set `MONGO_URI` to enable persistence.
- Google APIs required: Maps JavaScript API, Places API, Geocoding API.
