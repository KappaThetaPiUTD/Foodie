// Production configuration for backend server
module.exports = {
  // MongoDB connection
  mongoUri: process.env.MONGO_URI,
  
  // Server settings
  port: process.env.PORT || 5000,
  nodeEnv: 'production',
  
  // CORS settings for production
  corsOrigins: [
    // Add your production frontend URLs here
    'https://your-vercel-app.vercel.app',
    'https://www.your-custom-domain.com', // if you add a custom domain later
    // Add localhost for development/testing
    'http://localhost:3001',
    'http://localhost:3002',
  ],
  
  // Socket.IO settings
  socketSettings: {
    cors: {
      origin: [
        'https://your-vercel-app.vercel.app',
        'https://www.your-custom-domain.com', // if you add a custom domain later
        'http://localhost:3001',
        'http://localhost:3002',
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  },
  
  // Security settings
  security: {
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100, // limit each IP to 100 requests per windowMs
    sessionTimeoutMs: 24 * 60 * 60 * 1000, // 24 hours
  }
};
