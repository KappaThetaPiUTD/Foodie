/*******************************************************
 * server.js (moved to apps/server/src/index.js)
 *******************************************************/
require("dotenv").config({ path: '../../.env' }); // Loads environment variables from root .env

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
if (mongoURI) {
  mongoose.connect(mongoURI);
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected:", mongoURI);
  });
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });
} else {
  console.warn("MONGO_URI not set. Starting server without MongoDB connection.");
}

// -----------------------------------------------------
// 3. DEFINE SESSION SCHEMA & MODEL
// -----------------------------------------------------
const SessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    unique: true,
    required: true,
  },
  roomCode: {
    type: String,
    unique: true,
    sparse: true, // Allows null values while keeping uniqueness
  },
  
  // User data for multiple users
  users: [{
    socketId: String,
    preferences: {
      cuisines: [String],
      price: String,
      openNow: Boolean,
    },
    originText: String,
    originCoordinates: {
      lat: Number,
      lng: Number,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    }
  }],
  
  // Shared session data
  restaurants: [{
    name: String,
    place_id: String,
    vicinity: String,
    geometry: {
      location: {
        lat: Number,
        lng: Number,
      }
    },
    rating: Number,
    price_level: Number,
    types: [String],
  }],
  
  // Routes data
  routes: {
    user1: mongoose.Schema.Types.Mixed,
    user2: mongoose.Schema.Types.Mixed,
  },
  
  status: {
    type: String,
    default: "active",
    enum: ["active", "completed", "expired"]
  },
  
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Legacy fields for compatibility
  user1Address: String,
  user2Address: String,
  preferences1: mongoose.Schema.Types.Mixed,
  preferences2: mongoose.Schema.Types.Mixed,
  user1Lat: Number,
  user1Lon: Number,
  user2Lat: Number,
  user2Lon: Number,
});

// Add indexes for better performance
SessionSchema.index({ sessionId: 1 });
SessionSchema.index({ createdAt: 1 });
SessionSchema.index({ lastActivity: 1 });

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
// 5. SOCKET.IO - WITH MONGODB PERSISTENCE
// -----------------------------------------------------
io.on("connection", (socket) => {
  console.log("New socket.io connection");

  socket.on("joinSession", async (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket joined room: ${sessionId}`);

    try {
      // Find or create session in MongoDB
      let session = await Session.findOne({ sessionId });
      
      if (!session) {
        session = await Session.create({
          sessionId,
          users: [],
          restaurants: [],
          routes: {},
          status: "active",
        });
        console.log(`Created new session: ${sessionId}`);
      } else {
        // Update last activity
        session.lastActivity = new Date();
        await session.save();
        console.log(`Found existing session: ${sessionId}`);
      }

      // Send existing session data to the new user
      socket.emit("sessionData", {
        sessionId: session.sessionId,
        users: session.users,
        restaurants: session.restaurants,
        routes: session.routes,
      });

      // Notify others in the room
      socket.to(sessionId).emit("userJoined", {
        sessionId,
        message: "A new user joined the session",
      });

    } catch (error) {
      console.error("Error joining session:", error);
      socket.emit("error", { message: "Failed to join session" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  // Relay a user's route to other users in the same session
  socket.on("routeUpdate", ({ sessionId, origin, destination }) => {
    if (!sessionId || !origin || !destination) return;
    console.log(
      `routeUpdate from ${socket.id} in session ${sessionId}: ${origin} -> ${destination}`
    );
    socket.to(sessionId).emit("routeUpdate", { origin, destination, from: socket.id });
  });

  // Notify others to clear the peer route
  socket.on("routeClear", ({ sessionId }) => {
    if (!sessionId) return;
    console.log(`routeClear from ${socket.id} in session ${sessionId}`);
    socket.to(sessionId).emit("routeClear", { from: socket.id });
  });

  // Share user preferences with others and save to MongoDB
  socket.on("preferencesUpdate", async ({ sessionId, preferences }) => {
    if (!sessionId || !preferences) return;
    console.log(`preferencesUpdate from ${socket.id} in session ${sessionId}`);
    
    try {
      // Update session in MongoDB
      const session = await Session.findOne({ sessionId });
      if (session) {
        // Find or create user in session
        let user = session.users.find(u => u.socketId === socket.id);
        if (!user) {
          user = { socketId: socket.id, preferences: {}, lastActive: new Date() };
          session.users.push(user);
        }
        
        // Update preferences
        user.preferences = preferences;
        user.lastActive = new Date();
        session.lastActivity = new Date();
        
        await session.save();
        console.log(`Saved preferences for user ${socket.id} in session ${sessionId}`);
      }
      
      // Broadcast to other clients
      socket.to(sessionId).emit("preferencesUpdate", { preferences, from: socket.id });
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  });

  // Share origin location updates and save to MongoDB
  socket.on("originUpdate", async ({ sessionId, originText }) => {
    if (!sessionId || !originText) return;
    console.log(`originUpdate from ${socket.id} in session ${sessionId}: ${originText}`);
    
    try {
      // Update session in MongoDB
      const session = await Session.findOne({ sessionId });
      if (session) {
        // Find or create user in session
        let user = session.users.find(u => u.socketId === socket.id);
        if (!user) {
          user = { socketId: socket.id, preferences: {}, lastActive: new Date() };
          session.users.push(user);
        }
        
        // Update origin text
        user.originText = originText;
        user.lastActive = new Date();
        session.lastActivity = new Date();
        
        await session.save();
        console.log(`Saved origin for user ${socket.id} in session ${sessionId}`);
      }
      
      // Broadcast to other clients
      socket.to(sessionId).emit("originUpdate", { originText, from: socket.id });
    } catch (error) {
      console.error("Error saving origin:", error);
    }
  });

  // Share restaurant updates and save to MongoDB
  socket.on("restaurantsUpdate", async ({ sessionId, restaurants }) => {
    if (!sessionId || !restaurants) return;
    console.log(`restaurantsUpdate from ${socket.id} in session ${sessionId}: ${restaurants.length} restaurants`);
    
    try {
      // Update session in MongoDB
      const session = await Session.findOne({ sessionId });
      if (session) {
        // Save restaurants to session
        session.restaurants = restaurants;
        session.lastActivity = new Date();
        
        await session.save();
        console.log(`Saved ${restaurants.length} restaurants in session ${sessionId}`);
      }
      
      // Broadcast to other clients
      socket.to(sessionId).emit("restaurantsUpdate", { restaurants, from: socket.id });
    } catch (error) {
      console.error("Error saving restaurants:", error);
    }
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

    // Update last activity
    session.lastActivity = new Date();
    await session.save();

    return res.json({
      sessionId: session.sessionId,
      users: session.users,
      restaurants: session.restaurants,
      routes: session.routes,
      status: session.status,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
    });
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

// Add a test endpoint to check MongoDB connection
app.get("/test-db", async (req, res) => {
  try {
    if (!mongoose.connection.readyState) {
      return res.status(500).json({ 
        error: "MongoDB not connected", 
        readyState: mongoose.connection.readyState 
      });
    }
    
    // Try to create a test session
    const testSession = await Session.create({
      sessionId: `test-${Date.now()}`,
      users: [],
      restaurants: [],
      routes: {},
      status: "active",
    });
    
    res.json({ 
      success: true, 
      message: "MongoDB is working!", 
      testSessionId: testSession.sessionId,
      connectionState: mongoose.connection.readyState 
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Database test failed", 
      details: error.message 
    });
  }
});

// -----------------------------------------------------
// 7. START SERVER
// -----------------------------------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
