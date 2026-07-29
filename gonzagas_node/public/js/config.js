/**
 * Global Configuration
 * Gonzaga's Art & Shine
 */

window.GonzagaConfig = {
  // Debug mode - enable detailed logging
  debug: false, // Set to true for development
  
  // Application version
  version: '1.0.0',
  
  // Environment
  environment: 'production', // 'development' | 'production'
  
  // Module loading order
  moduleLoadOrder: [
    'utils',
    'navigation',
    'ui',
    'carousel',
    'motion'
  ],
  
  // Default timeouts
  timeouts: {
    debounce: 300,
    throttle: 100,
    carousel: 200,
    notification: 5000,
    loading: 1200
  },
  
  // Feature flags
  features: {
    carousel: true,
    backToTop: true,
    lightbox: true,
    notifications: true,
    videoBackground: true,
    debugPanel: false
  },
  
  // API endpoints (if needed)
  api: {
    baseUrl: '/api',
    timeout: 10000
  },
  
  // UI Configuration
  ui: {
    breakpoints: {
      mobile: 768,
      tablet: 992,
      desktop: 1200
    },
    animations: {
      duration: 300,
      easing: 'cubic-bezier(0.23, 1, 0.32, 1)'
    }
  },
  
  // Carousel defaults
  carousel: {
    autoplaySpeed: 3000,
    responsive: true,
    accessibility: true
  },
  
  // Initialize configuration based on environment
  init: function() {
    // Detect environment from URL or other indicators
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      this.environment = 'development';
      this.debug = true;
    }
    
    // Enable debug panel in development
    if (this.environment === 'development') {
      this.features.debugPanel = true;
    }
    
    // Log configuration if debug is enabled
    if (this.debug) {
      console.log('[Gonzaga Config] Configuration loaded:', this);
    }
  }
};

// Auto-initialize configuration
document.addEventListener('DOMContentLoaded', () => {
  window.GonzagaConfig.init();
}); 