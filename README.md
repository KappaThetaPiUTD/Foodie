# Foodie
Finding the middle ground.
/*******************************************************
 * server.js
 *******************************************************/
require("dotenv").config(); // Loads environment variables from .env

const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const axios = require("axios");

// -----------------------------------------------------
// 1. EXPRESS & SOCKET.IO SETUP
// -----------------------------------------------------
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // adjust for your frontend in production
  },
});

app.use(cors());
app.use(express.json());

// -----------------------------------------------------
// 2. CONNECT TO MONGODB (MONGOOSE)
// -----------------------------------------------------
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected:", mongoURI);
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// -----------------------------------------------------
// 3. DEFINE SESSION SCHEMA & MODEL
// -----------------------------------------------------
const SessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    unique: true,
  },
  roomCode: {
    type: String,
    unique: true,
  },
  user1Address: String,
  user2Address: String,
  preferences1: {
    type: mongoose.Schema.Types.Mixed, // allows arbitrary JSON
  },
  preferences2: {
    type: mongoose.Schema.Types.Mixed,
  },
  status: {
    type: String,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // If you plan to store lat/lon after geocoding:
  user1Lat: Number,
  user1Lon: Number,
  user2Lat: Number,
  user2Lon: Number,
});

const Session = mongoose.model("Session", SessionSchema);

// -----------------------------------------------------
// 4. HELPER FUNCTIONS
// -----------------------------------------------------
function generateRoomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// -----------------------------------------------------
// 5. SOCKET.IO - OPTIONAL REAL-TIME
// -----------------------------------------------------
io.on("connection", (socket) => {
  console.log("New socket.io connection");

  socket.on("joinSession", (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket joined room: ${sessionId}`);

    // Notify others in the room
    socket.to(sessionId).emit("userJoined", {
      sessionId,
      message: "A new user joined the session",
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
});

// -----------------------------------------------------
// 6. ROUTES
// -----------------------------------------------------

/**
 * CREATE a new session
 * Generates unique sessionId & roomCode, saves to DB
 */
app.post("/session/create", async (req, res) => {
  try {
    const sessionId = uuidv4();
    let roomCode;

    // Keep generating until we find a unique one
    while (true) {
      roomCode = generateRoomCode();
      const existing = await Session.findOne({ roomCode });
      if (!existing) break; // roomCode is unique
    }

    const newSession = await Session.create({
      sessionId,
      roomCode,
      status: "pending",
    });

    // Return link + roomCode
    return res.json({
      link: `https://yourapp.com/session/${sessionId}`,
      roomCode,
      sessionId,
    });
  } catch (err) {
    console.error("Error creating session:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * JOIN a session via roomCode
 * Returns the sessionId if found
 */
app.post("/session/join-room-code", async (req, res) => {
  try {
    const { roomCode } = req.body;
    const session = await Session.findOne({ roomCode });

    if (!session) {
      return res.status(404).json({ error: "Room not found" });
    }

    return res.json({ sessionId: session.sessionId });
  } catch (err) {
    console.error("Error joining session:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * GET session details by sessionId
 */
app.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    return res.json(session);
  } catch (err) {
    console.error("Error fetching session:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * SUBMIT user preferences
 * If user1 fields are empty, fill user1. Else fill user2.
 * Optionally geocode address to lat/lon, store them if needed
 */
app.post("/session/:sessionId/submit-preferences", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { address, preferences } = req.body;

    // 1. Find the session
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // 2. Decide if user1 is free, else user2
    let updateFields = {};

    if (!session.user1Address) {
      updateFields.user1Address = address;
      updateFields.preferences1 = preferences;
      // TODO (optional): geocode 'address' → store user1Lat, user1Lon
    } else if (!session.user2Address) {
      updateFields.user2Address = address;
      updateFields.preferences2 = preferences;
      // TODO (optional): geocode 'address' → store user2Lat, user2Lon
    } else {
      return res
        .status(400)
        .json({ error: "Both users have already submitted preferences" });
    }

    // 3. Update the session
    const updatedSession = await Session.findOneAndUpdate(
      { sessionId },
      { $set: updateFields },
      { new: true }
    );

    // 4. If both users submitted, set status = 'ready'
    if (updatedSession.user1Address && updatedSession.user2Address) {
      updatedSession.status = "ready";
      await updatedSession.save();

      // Emit socket.io event to let the room know both preferences are in
      io.to(sessionId).emit("bothPreferencesSubmitted", {
        sessionId,
        message: "Both users have submitted preferences.",
      });
    }

    return res.json({ session: updatedSession });
  } catch (err) {
    console.error("Error submitting preferences:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * GET recommended restaurants using Foursquare
 * Example: we do a simple midpoint search or single-user search
 */
app.get("/session/:sessionId/recommendations", async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 1. Find session
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // 2. Check preferences exist
    if (!session.preferences1 || !session.preferences2) {
      return res
        .status(400)
        .json({ error: "Both users have not submitted preferences yet" });
    }

    // 3. Extract/compute intersection (example: cuisine)
    const user1Prefs = session.preferences1; // e.g. { cuisines: ["Italian", "Mexican"], priceRange: "$$" }
    const user2Prefs = session.preferences2;
    const cuisines1 = user1Prefs.cuisines || [];
    const cuisines2 = user2Prefs.cuisines || [];
    const commonCuisines = cuisines1.filter((c) => cuisines2.includes(c));

    // 4. Decide on a location to search (e.g. midpoint or user1’s location)
    //    For demo, let's do a static lat/lon or assume user1Lat & user1Lon exist
    //    If you haven't geocoded, you might just pick an arbitrary city
    const lat = session.user1Lat || 40.7484; // fallback lat
    const lon = session.user1Lon || -73.9857; // fallback lon
    const queryCuisine = commonCuisines[0] || "restaurant";

    // 5. Foursquare Places Search
    const foursquareKey =
      process.env.FOURSQUARE_API_KEY || "YOUR_FOURSQUARE_API_KEY";
    const limit = 20;
    const radius = 2000; // in meters

    const response = await axios.get(
      "https://api.foursquare.com/v3/places/search",
      {
        headers: {
          Authorization: foursquareKey,
        },
        params: {
          ll: `${lat},${lon}`,
          query: queryCuisine,
          radius: radius,
          limit: limit,
          sort: "RELEVANCE",
        },
      }
    );

    let places = response.data.results || [];
    // Optionally filter by price or other preferences

    // 6. Format results for client
    const recommendedRestaurants = places.map((place) => ({
      name: place.name,
      address: place.location?.formatted_address,
      lat: place.geocodes?.main?.latitude,
      lon: place.geocodes?.main?.longitude,
      // etc. — customize as needed
    }));

    return res.json({
      recommendedRestaurants,
      debugInfo: {
        commonCuisines,
        lat,
        lon,
        radius,
      },
    });
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// -----------------------------------------------------
// 7. START SERVER
// -----------------------------------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
