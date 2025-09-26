/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable external directory compilation (for monorepo)
  experimental: {
    externalDir: true,
  },
  
  // Environment variables configuration
  env: {
    // These will be available at build time
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compress: true,
    poweredByHeader: false,
    generateEtags: false,
  }),
}

module.exports = nextConfig