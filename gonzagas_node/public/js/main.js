/**
 * Main JavaScript for Gonzaga's Art & Shine
 * Modular Architecture Entry Point
 */

// Global application namespace
window.Gonzaga = window.Gonzaga || {};

// Module manager
window.Gonzaga.ModuleManager = (function() {
  'use strict';

  const loadedModules = new Set();
  const failedModules = new Set();

  /**
   * Initialize a module safely
   * @param {string} moduleName - Name of the module
   * @param {Object} moduleObject - Module object to initialize
   */
  function initModule(moduleName, moduleObject) {
    if (loadedModules.has(moduleName)) {
      console.log(`[Module Manager] ${moduleName} already loaded`);
      return;
    }

    if (!moduleObject || typeof moduleObject.init !== 'function') {
      console.error(`[Module Manager] ${moduleName} is not a valid module`);
      failedModules.add(moduleName);
      return;
    }

    try {
      moduleObject.init();
      loadedModules.add(moduleName);
      console.log(`[Module Manager] ${moduleName} initialized successfully`);
    } catch (error) {
      console.error(`[Module Manager] Failed to initialize ${moduleName}:`, error);
      failedModules.add(moduleName);
    }
  }

  /**
   * Initialize all modules in correct order
   */
  function initAllModules() {
    const moduleOrder = window.GonzagaConfig?.moduleLoadOrder || ['utils', 'navigation', 'ui', 'carousel', 'motion'];

    moduleOrder.forEach(moduleName => {
      const moduleMap = {
        'utils': window.GonzagaUtils,
        'navigation': window.GonzagaNavigation,
        'ui': window.GonzagaUI,
        'carousel': window.GonzagaCarousel,
        'motion': window.GonzagaMotion
      };

      const moduleObject = moduleMap[moduleName];
      if (moduleObject) {
        initModule(moduleName, moduleObject);
      } else {
        console.warn(`[Module Manager] Module ${moduleName} not found`);
      }
    });

    // Initialize legacy components that haven't been modularized yet
    initLegacyComponents();

    console.log(`[Module Manager] Initialization complete. Loaded: ${loadedModules.size}, Failed: ${failedModules.size}`);
  }

  /**
   * Initialize legacy components (temporary)
   */
  function initLegacyComponents() {
    try {
      if (typeof initProductAnimations === 'function') initProductAnimations();
      if (typeof initGalleryItems === 'function') initGalleryItems();
      if (typeof initCatalogFilters === 'function') initCatalogFilters();
      if (typeof initCatalogView === 'function') initCatalogView();
      if (typeof initProductDetails === 'function') initProductDetails();
    } catch (error) {
      console.error('[Module Manager] Error initializing legacy components:', error);
    }
  }

  /**
   * Get module status
   */
  function getStatus() {
    return {
      loaded: Array.from(loadedModules),
      failed: Array.from(failedModules),
      total: loadedModules.size + failedModules.size
    };
  }

  return {
    init: initAllModules,
    getStatus: getStatus
  };
})();

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Gonzaga] Starting application initialization...');
  
  // Check for required dependencies
  checkJQuery();
  
  // Initialize all modules
  window.Gonzaga.ModuleManager.init();
  
  console.log('[Gonzaga] Application initialization complete');
});

/**
 * Check jQuery availability (legacy function kept for compatibility)
 */
function checkJQuery() {
  if (typeof $ !== 'undefined') {
    console.log('[Gonzaga] jQuery detected:', $.fn.jquery);
  } else {
    console.warn('[Gonzaga] jQuery not detected');
  }
}

// Legacy functions that need to be modularized (keeping for compatibility)

/**
 * Product animations (to be modularized)
 */
function initProductAnimations() {
  const productCards = document.querySelectorAll('.product-card');
  
  if (productCards.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  productCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
  });
}

/**
 * Gallery items initialization (to be modularized)
 */
function initGalleryItems() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (galleryItems.length === 0) return;

  galleryItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`;
  });
}

/**
 * Catalog filters (to be modularized) 
 */
function initCatalogFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productGrid = document.querySelector('.products-grid');
  
  if (!filterButtons.length || !productGrid) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      
      // Update active state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Filter products
      const products = productGrid.querySelectorAll('.product-card');
      products.forEach(product => {
        if (filter === 'all' || product.classList.contains(filter)) {
          product.style.display = 'block';
          product.style.opacity = '1';
        } else {
          product.style.opacity = '0';
          setTimeout(() => {
            product.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/**
 * Catalog view switching (to be modularized)
 */
function initCatalogView() {
  const viewButtons = document.querySelectorAll('.view-btn');
  const productGrid = document.querySelector('.products-grid');
  
  if (!viewButtons.length || !productGrid) return;

  viewButtons.forEach(button => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      
      // Update active state
      viewButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update grid class
      productGrid.className = `products-grid ${view}-view`;
    });
  });
}

/**
 * Product details functionality (to be modularized)
 */
function initProductDetails() {
  const productImages = document.querySelectorAll('.product-image');
  
  productImages.forEach(img => {
    img.addEventListener('click', () => {
      // Add zoom functionality or modal
      console.log('Product image clicked:', img.src);
    });
  });
}

// Export functions for compatibility (temporary)
window.initProductAnimations = initProductAnimations;
window.initGalleryItems = initGalleryItems;
window.initCatalogFilters = initCatalogFilters;
window.initCatalogView = initCatalogView;
window.initProductDetails = initProductDetails;
window.checkJQuery = checkJQuery;