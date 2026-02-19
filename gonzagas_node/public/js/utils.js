/**
 * Utilities Module for Gonzaga's Art & Shine
 * Common utility functions and helpers
 * Updated: 2025-11-15 - Added handleError and log functions
 */

window.GonzagaUtils = (function() {
  'use strict';

  /**
   * Debounce function to limit function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Execute immediately
   * @returns {Function} Debounced function
   */
  function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(this, args);
    };
  }

  /**
   * Throttle function to limit function calls
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Check if element is in viewport
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} True if element is in viewport
   */
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Format price for display
   * @param {number} price - Price value
   * @param {string} currency - Currency symbol
   * @returns {string} Formatted price
   */
  function formatPrice(price, currency = '€') {
    if (typeof price !== 'number') return 'Preço sob consulta';
    return `${currency}${price.toFixed(2)}`;
  }

  /**
   * Safe querySelector with error handling
   * @param {string} selector - CSS selector
   * @param {HTMLElement} context - Context element (default: document)
   * @returns {HTMLElement|null} Found element or null
   */
  function safeQuerySelector(selector, context = document) {
    try {
      return context.querySelector(selector);
    } catch (error) {
      console.warn(`[Utils] Invalid selector: ${selector}`, error);
      return null;
    }
  }

  /**
   * Safe querySelectorAll with error handling
   * @param {string} selector - CSS selector
   * @param {HTMLElement} context - Context element (default: document)
   * @returns {NodeList} Found elements
   */
  function safeQuerySelectorAll(selector, context = document) {
    try {
      return context.querySelectorAll(selector);
    } catch (error) {
      console.warn(`[Utils] Invalid selector: ${selector}`, error);
      return [];
    }
  }

  /**
   * Add event listener with error handling
   * @param {HTMLElement} element - Element to add listener to
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  function safeAddEventListener(element, event, handler, options = {}) {
    if (!element || typeof handler !== 'function') {
      console.warn('[Utils] Invalid element or handler for event listener');
      return;
    }
    
    try {
      element.addEventListener(event, handler, options);
    } catch (error) {
      console.error('[Utils] Error adding event listener:', error);
    }
  }

  /**
   * Get device type based on screen width
   * @returns {string} Device type: 'mobile', 'tablet', or 'desktop'
   */
  function getDeviceType() {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Check if user prefers reduced motion
   * @returns {boolean} True if prefers reduced motion
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Create and show toast notification
   * @param {string} message - Message to show
   * @param {string} type - Type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in milliseconds
   */
  function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `;
    
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#4f5b66'
    };
    
    toast.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });
    
    // Remove after duration
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  /**
   * Handle and log errors with context
   * @param {string} module - Module name
   * @param {Error} error - Error object
   * @param {string} context - Error context
   */
  function handleError(module, error, context = '') {
    const message = context ? `${context}: ${error.message || error}` : (error.message || error);
    console.error(`[Gonzaga ${module}] ERROR:`, message);
    
    if (window.GonzagaConfig?.debug) {
      console.error('Stack trace:', error.stack || 'No stack trace available');
    }
  }

  /**
   * Log message with module prefix
   * @param {string} module - Module name
   * @param {string} message - Message to log
   */
  function log(module, message) {
    if (window.GonzagaConfig?.debug) {
      console.log(`[Gonzaga ${module}]`, message);
    }
  }

  /**
   * Initialize utilities module
   */
  function init() {
    console.log('[Utils] Utilities module initialized');
    
    // Add common CSS utilities
    if (!document.getElementById('gonzaga-utils-css')) {
      const style = document.createElement('style');
      style.id = 'gonzaga-utils-css';
      style.textContent = `
        .gonzaga-fade-in {
          opacity: 0;
          animation: gonzagaFadeIn 0.5s ease forwards;
        }
        
        @keyframes gonzagaFadeIn {
          to { opacity: 1; }
        }
        
        .gonzaga-slide-up {
          transform: translateY(20px);
          opacity: 0;
          animation: gonzagaSlideUp 0.6s ease forwards;
        }
        
        @keyframes gonzagaSlideUp {
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .gonzaga-fade-in,
          .gonzaga-slide-up {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Public API
  return {
    init,
    debounce,
    throttle,
    isInViewport,
    formatPrice,
    safeQuerySelector,
    safeQuerySelectorAll,
    safeAddEventListener,
    getDeviceType,
    prefersReducedMotion,
    showToast,
    handleError,
    log
  };

})(); 