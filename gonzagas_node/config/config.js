require('dotenv').config();
const path = require('path');

const config = {
  // Site configuration
  siteTitle: 'Gonzaga\'s Art & Shine',
  siteDescription: 'Sterling silver jewelry with Bali and Boho tendencies',
  sitePassword: null, // Set to null to disable password protection
  adminUser: 'gonzaga',
  adminPass: 'covil', // Admin login password
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://example.com' // Change to actual domain in production
    : 'http://localhost:3000',
  mediaPath: path.join(__dirname, '../../media'),
  
  // Theme settings
  theme: {
    colorPrimary: '#1e1e1e',     // Dark background
    colorSecondary: '#4a3c2d',   // Forest brown
    colorAccent: '#6a8c69',      // Forest green
    colorText: '#f0f0f0',        // Light text
    colorHighlight: '#b19cd9'    // Psychedelic purple
  },
  
  // Session configuration
  session: {
    secret: 'gonzaga-art-and-shine-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },
  
  // Checkpoint system for data backup
  checkpoint: {
    dir: path.join(__dirname, '../checkpoints'),
    maxCheckpoints: 10 // Maximum number of checkpoints to keep
  },
  
  // Server configuration
  port: process.env.PORT || 3000
};

module.exports = config; 