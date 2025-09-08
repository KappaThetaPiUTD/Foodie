## Dev

Run all: two web ports + server

```
npm run dev:all
```

Open:
- http://localhost:3001
- http://localhost:3002

Enter the same session ID in both tabs and click Join to share routes live.

Server runs on http://localhost:5000 (Socket.IO). Mongo is optional; set `MONGO_URI` in `.env` if available.
