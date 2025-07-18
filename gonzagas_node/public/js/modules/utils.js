/**
 * Utility Functions Module
 * Gonzaga's Art & Shine
 */

window.GonzagaUtils = (function() {
  'use strict';

  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Execute immediately
   * @returns {Function} Debounced function
   */
  function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  /**
   * Throttle function calls
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
   * Check if element exists in DOM
   * @param {string} selector - CSS selector
   * @returns {boolean} Element exists
   */
  function elementExists(selector) {
    return document.querySelector(selector) !== null;
  }

  /**
   * Wait for element to exist in DOM
   * @param {string} selector - CSS selector
   * @param {number} timeout - Maximum wait time
   * @returns {Promise} Promise that resolves when element is found
   */
  function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Log with module prefix for debugging
   * @param {string} module - Module name
   * @param {string} message - Log message
   * @param {any} data - Optional data to log
   */
  function log(module, message, data = null) {
    if (window.GonzagaConfig?.debug) {
      const prefix = `[Gonzaga ${module}]`;
      if (data) {
        console.log(`${prefix} ${message}`, data);
      } else {
        console.log(`${prefix} ${message}`);
      }
    }
  }

  /**
   * Handle errors consistently
   * @param {string} module - Module name
   * @param {Error} error - Error object
   * @param {string} context - Error context
   */
  function handleError(module, error, context = '') {
    const message = context ? `${context}: ${error.message}` : error.message;
    console.error(`[Gonzaga ${module}] ERROR:`, message);
    
    if (window.GonzagaConfig?.debug) {
      console.error('Stack trace:', error.stack);
    }
  }

  /**
   * Check if jQuery is available
   * @returns {boolean} jQuery is loaded
   */
  function jQueryReady() {
    return typeof $ !== 'undefined' && $.fn && $.fn.jquery;
  }

  /**
   * Animate element entrance with stagger
   * @param {NodeList|Array} elements - Elements to animate
   * @param {number} delay - Delay between animations
   * @param {string} animation - Animation class name
   */
  function staggerAnimation(elements, delay = 100, animation = 'fade-in') {
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add(animation);
      }, index * delay);
    });
  }

  /**
   * Smooth scroll to element
   * @param {string|Element} target - Target element or selector
   * @param {Object} options - Scroll options
   */
  function smoothScrollTo(target, options = {}) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    const defaultOptions = {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    };

    element.scrollIntoView({ ...defaultOptions, ...options });
  }

  // Public API
  return {
    debounce,
    throttle,
    elementExists,
    waitForElement,
    log,
    handleError,
    jQueryReady,
    staggerAnimation,
    smoothScrollTo
  };
})(); 