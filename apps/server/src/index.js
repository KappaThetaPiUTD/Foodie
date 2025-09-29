/*******************************************************
 * server.js (moved to apps/server/src/index.js)
 *******************************************************/
// Railway provides environment variables automatically, but load dotenv as fallback
require("dotenv").config({ path: ['.env', '../.env', '../../.env'] });

// Debug: Log environment variables (remove in production)
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('MONGO_URI length:', process.env.MONGO_URI ? process.env.MONGO_URI.length : 0);

const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const axios = require("axios");

// Load production config if in production
const prodConfig = process.env.NODE_ENV === 'production' 
  ? require('../config/production') 
  : null;

// -----------------------------------------------------
// 1. EXPRESS & SOCKET.IO SETUP
// -----------------------------------------------------
const app = express();
const server = http.createServer(app);

// Configure CORS based on environment
const corsOptions = prodConfig ? {
  origin: prodConfig.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
} : {
  origin: "*", // Allow all origins in development
};

const io = socketIo(server, {
  cors: prodConfig ? prodConfig.socketSettings.cors : {
    origin: "*", // Allow all origins in development
  },
});

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint for testing
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mongodb: mongoURI ? "configured" : "not configured",
    mongoConnected: mongoose.connection.readyState === 1,
    features: {
      userManagement: "implemented",
      sessionManagement: "pending",
      smartPreferences: "pending"
    }
  });
});

// Test endpoint for API structure (works without MongoDB)
app.post("/test/user/location", (req, res) => {
  const { firebaseUid, lat, lng, address } = req.body;
  
  if (!firebaseUid || !lat || !lng || !address) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  // Simulate successful response
  res.json({
    success: true,
    message: "API structure test successful",
    data: {
      firebaseUid,
      startLocation: { lat, lng, address, updatedAt: new Date() }
    }
  });
});

app.put("/test/user/preferences", (req, res) => {
  const { firebaseUid, cuisines, priceRange, openNow } = req.body;
  
  if (!firebaseUid) {
    return res.status(400).json({ error: "Missing firebaseUid" });
  }
  
  // Simulate successful response
  res.json({
    success: true,
    message: "API structure test successful",
    data: {
      firebaseUid,
      preferences: { cuisines, priceRange, openNow, updatedAt: new Date() }
    }
  });
});

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
// 3. DEFINE USER SCHEMA & MODEL
// -----------------------------------------------------
const UserSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  
  // Persistent start location (new requirement)
  startLocation: {
    lat: Number,
    lng: Number,
    address: String,
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  
  // Default preferences (persistent across sessions)
  defaultPreferences: {
    cuisines: {
      type: [String],
      default: []
    },
    priceRange: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
      default: '$$',
    },
    dietaryRestrictions: {
      type: [String],
      default: []
    },
    openNow: {
      type: Boolean,
      default: true
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  
  // Current session - only one session at a time (new requirement)
  currentSessionCode: {
    type: String,
    default: null,
  },
  
  // Saved locations for quick access
  savedLocations: [{
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  }],
  
  // User statistics
  stats: {
    sessionsJoined: {
      type: Number,
      default: 0
    },
    restaurantsDiscovered: {
      type: Number,
      default: 0
    },
    totalSearches: {
      type: Number,
      default: 0
    }
  },
  
  // Favorite restaurants
  favoriteRestaurants: [{
    placeId: String,
    name: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Account settings
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    publicProfile: {
      type: Boolean,
      default: false
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  }
});

const User = mongoose.model("User", UserSchema);

// -----------------------------------------------------
// 4. DEFINE SESSION SCHEMA & MODEL (Enhanced)
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
  
  // Enhanced user data with Firebase UID reference
  users: [{
    socketId: String,
    firebaseUid: String, // Link to User document
    
    // Session-specific preferences (can override user defaults)
    sessionPreferences: {
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
  
  // Cached restaurant results (new requirement)
  restaurantResults: {
    data: [{
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
      // Additional fields for smart matching
      matchedCuisines: [String], // Which user cuisines this restaurant matches
      userCount: Number, // How many users' preferences this satisfies
    }],
    cachedAt: {
      type: Date,
      default: Date.now,
    },
    // Cache expires after 30 minutes
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    },
  },
  
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
  
  // Auto-expire sessions after 24 hours (new requirement)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
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
SessionSchema.index({ expiresAt: 1 }); // For auto-cleanup
SessionSchema.index({ "users.firebaseUid": 1 }); // For finding user's current session

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

      // If user info provided in the future, try to load their default preferences
      let defaultPreferences = null;
      // Note: This will be enhanced when frontend sends user info
      
      // Send existing session data to the new user
      socket.emit("sessionData", {
        sessionId: session.sessionId,
        users: session.users,
        restaurants: session.restaurants,
        routes: session.routes,
        defaultPreferences, // Will be populated when user info is sent
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

// -----------------------------------------------------
// USER API ROUTES
// -----------------------------------------------------

// Create or update user profile
app.post("/user/profile", async (req, res) => {
  try {
    const { firebaseUid, email, displayName, defaultPreferences, savedLocations } = req.body;
    
    if (!firebaseUid || !email || !displayName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let user = await User.findOne({ firebaseUid });
    
    if (user) {
      // Update existing user
      user.email = email;
      user.displayName = displayName;
      user.lastActive = new Date();
      
      if (defaultPreferences) {
        user.defaultPreferences = { ...user.defaultPreferences, ...defaultPreferences };
      }
      
      if (savedLocations) {
        user.savedLocations = savedLocations;
      }
      
      await user.save();
      console.log(`Updated user profile: ${firebaseUid}`);
    } else {
      // Create new user
      user = await User.create({
        firebaseUid,
        email,
        displayName,
        defaultPreferences: defaultPreferences || {},
        savedLocations: savedLocations || []
      });
      console.log(`Created new user: ${firebaseUid}`);
    }

    res.json({
      success: true,
      user: {
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        defaultPreferences: user.defaultPreferences,
        savedLocations: user.savedLocations,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error("Error managing user profile:", error);
    res.status(500).json({ error: "Failed to manage user profile" });
  }
});

// Get user profile
app.get("/user/profile/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    res.json({
      user: {
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        defaultPreferences: user.defaultPreferences,
        savedLocations: user.savedLocations,
        favoriteRestaurants: user.favoriteRestaurants,
        stats: user.stats,
        settings: user.settings
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Update user preferences
app.put("/user/preferences/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const { defaultPreferences } = req.body;
    
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.defaultPreferences = { ...user.defaultPreferences, ...defaultPreferences };
    user.lastActive = new Date();
    await user.save();

    res.json({
      success: true,
      defaultPreferences: user.defaultPreferences
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

// -----------------------------------------------------
// NEW USER OPERATIONS FOR REQUIREMENTS
// -----------------------------------------------------

// Update user start location
app.put("/user/location/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const { lat, lng, address } = req.body;
    
    if (!lat || !lng || !address) {
      return res.status(400).json({ error: "Missing location data (lat, lng, address)" });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update start location
    user.startLocation = {
      lat,
      lng,
      address,
      updatedAt: new Date()
    };
    user.lastActive = new Date();
    await user.save();

    console.log(`Updated start location for user: ${firebaseUid}`);

    res.json({
      success: true,
      startLocation: user.startLocation
    });
  } catch (error) {
    console.error("Error updating user location:", error);
    res.status(500).json({ error: "Failed to update location" });
  }
});

// Update user preferences (enhanced)
app.put("/user/preferences-enhanced/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const { cuisines, priceRange, openNow } = req.body;
    
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update preferences
    if (cuisines !== undefined) user.defaultPreferences.cuisines = cuisines;
    if (priceRange !== undefined) user.defaultPreferences.priceRange = priceRange;
    if (openNow !== undefined) user.defaultPreferences.openNow = openNow;
    user.defaultPreferences.updatedAt = new Date();
    user.lastActive = new Date();
    
    await user.save();

    console.log(`Updated preferences for user: ${firebaseUid}`);

    res.json({
      success: true,
      preferences: user.defaultPreferences
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

// Get user's current session
app.get("/user/current-session/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.currentSessionCode) {
      return res.json({ currentSession: null });
    }

    // Find the actual session
    const session = await Session.findOne({ sessionId: user.currentSessionCode });
    if (!session) {
      // Clean up stale session reference
      user.currentSessionCode = null;
      await user.save();
      return res.json({ currentSession: null });
    }

    res.json({
      currentSession: {
        sessionId: session.sessionId,
        users: session.users,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
      }
    });
  } catch (error) {
    console.error("Error getting current session:", error);
    res.status(500).json({ error: "Failed to get current session" });
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
// NEW SESSION MANAGEMENT FOR REQUIREMENTS
// -----------------------------------------------------

// Join a session (enforces one session per user)
app.post("/session/join", async (req, res) => {
  try {
    const { firebaseUid, sessionId, startLocation } = req.body;
    
    if (!firebaseUid || !sessionId) {
      return res.status(400).json({ error: "Missing firebaseUid or sessionId" });
    }

    // Find the user
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove user from any existing session (one session per user rule)
    if (user.currentSessionCode) {
      await Session.updateOne(
        { sessionId: user.currentSessionCode },
        { $pull: { users: { firebaseUid } } }
      );
      console.log(`Removed user ${firebaseUid} from previous session: ${user.currentSessionCode}`);
    }

    // Find or create the target session
    let session = await Session.findOne({ sessionId });
    if (!session) {
      session = await Session.create({
        sessionId,
        users: [],
        restaurantResults: { data: [], cachedAt: new Date(), expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
        status: "active",
        lastActivity: new Date(),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
      console.log(`Created new session: ${sessionId}`);
    }

    // Add user to the new session
    const userSessionData = {
      firebaseUid,
      sessionPreferences: {
        cuisines: user.defaultPreferences.cuisines,
        price: user.defaultPreferences.priceRange,
        openNow: user.defaultPreferences.openNow,
      },
      lastActive: new Date()
    };

    // Add start location if provided, or use user's saved location
    if (startLocation) {
      userSessionData.originText = startLocation.address;
      userSessionData.originCoordinates = {
        lat: startLocation.lat,
        lng: startLocation.lng
      };
    } else if (user.startLocation) {
      userSessionData.originText = user.startLocation.address;
      userSessionData.originCoordinates = {
        lat: user.startLocation.lat,
        lng: user.startLocation.lng
      };
    }

    // Remove user if already in session (prevent duplicates)
    session.users = session.users.filter(u => u.firebaseUid !== firebaseUid);
    session.users.push(userSessionData);
    session.lastActivity = new Date();
    await session.save();

    // Update user's current session
    user.currentSessionCode = sessionId;
    user.lastActive = new Date();
    await user.save();

    console.log(`User ${firebaseUid} joined session: ${sessionId}`);

    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        users: session.users,
        userCount: session.users.length,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
      }
    });
  } catch (error) {
    console.error("Error joining session:", error);
    res.status(500).json({ error: "Failed to join session" });
  }
});

// Leave current session
app.post("/session/leave", async (req, res) => {
  try {
    const { firebaseUid } = req.body;
    
    if (!firebaseUid) {
      return res.status(400).json({ error: "Missing firebaseUid" });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user || !user.currentSessionCode) {
      return res.json({ success: true, message: "User not in any session" });
    }

    // Remove user from session
    const session = await Session.findOne({ sessionId: user.currentSessionCode });
    if (session) {
      session.users = session.users.filter(u => u.firebaseUid !== firebaseUid);
      session.lastActivity = new Date();
      await session.save();
      
      // Delete session if no users left
      if (session.users.length === 0) {
        await Session.deleteOne({ sessionId: user.currentSessionCode });
        console.log(`Deleted empty session: ${user.currentSessionCode}`);
      }
    }

    // Clear user's current session
    user.currentSessionCode = null;
    user.lastActive = new Date();
    await user.save();

    console.log(`User ${firebaseUid} left session`);

    res.json({ success: true, message: "Left session successfully" });
  } catch (error) {
    console.error("Error leaving session:", error);
    res.status(500).json({ error: "Failed to leave session" });
  }
});

// Get all users in a session
app.get("/session/:sessionId/users", async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Get detailed user information
    const userDetails = await Promise.all(
      session.users.map(async (sessionUser) => {
        const user = await User.findOne({ firebaseUid: sessionUser.firebaseUid });
        return {
          firebaseUid: sessionUser.firebaseUid,
          displayName: user ? user.displayName : "Unknown User",
          email: user ? user.email : null,
          startLocation: sessionUser.originCoordinates ? {
            lat: sessionUser.originCoordinates.lat,
            lng: sessionUser.originCoordinates.lng,
            address: sessionUser.originText
          } : null,
          preferences: sessionUser.sessionPreferences,
          lastActive: sessionUser.lastActive
        };
      })
    );

    res.json({
      sessionId: session.sessionId,
      users: userDetails,
      userCount: userDetails.length,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity
    });
  } catch (error) {
    console.error("Error getting session users:", error);
    res.status(500).json({ error: "Failed to get session users" });
  }
});

// Cleanup expired sessions
app.delete("/session/cleanup", async (req, res) => {
  try {
    const now = new Date();
    
    // Find expired sessions
    const expiredSessions = await Session.find({ expiresAt: { $lt: now } });
    
    // Clear users' currentSessionCode for expired sessions
    for (const session of expiredSessions) {
      await User.updateMany(
        { currentSessionCode: session.sessionId },
        { $unset: { currentSessionCode: 1 } }
      );
    }
    
    // Delete expired sessions
    const result = await Session.deleteMany({ expiresAt: { $lt: now } });
    
    console.log(`Cleaned up ${result.deletedCount} expired sessions`);
    
    res.json({
      success: true,
      deletedSessions: result.deletedCount,
      cleanupTime: now
    });
  } catch (error) {
    console.error("Error cleaning up sessions:", error);
    res.status(500).json({ error: "Failed to cleanup sessions" });
  }
});

// Test endpoint for session management (works without complex setup)
app.post("/test/session/join", (req, res) => {
  const { firebaseUid, sessionId, startLocation } = req.body;
  
  if (!firebaseUid || !sessionId) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  res.json({
    success: true,
    message: "Session join API structure test successful",
    data: {
      firebaseUid,
      sessionId,
      startLocation,
      joinedAt: new Date(),
      userCount: 1
    }
  });
});

// -----------------------------------------------------
// 7. START SERVER
// -----------------------------------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
