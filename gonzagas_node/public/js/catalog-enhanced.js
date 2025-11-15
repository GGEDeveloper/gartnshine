/**
 * Catalog Enhanced - Main Initialization File
 * Initializes all catalog modules
 */

(function() {
  'use strict';

  console.log('🏪 Catalog Enhanced: Initializing modules...');

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCatalog);
  } else {
    initCatalog();
  }

  function initCatalog() {
    try {
      // Initialize all modules
      window.catalogFilters = new CatalogFilters({
        container: document.getElementById('products-grid'),
        form: document.getElementById('catalog-filters'),
        resultsCount: document.querySelector('.results-count .count-number'),
        apiEndpoint: '/api/catalog/filter'
      });

      window.catalogLazyLoad = new CatalogLazyLoad({
        imageSelector: '.product-image.lazy-load',
        rootMargin: '50px'
      });

      // Initialize sort
      window.catalogSort = new CatalogSort({
        container: document.getElementById('products-grid'),
        sortSelect: document.getElementById('catalog-sort')
      });

      window.catalogGrid = new CatalogGrid({
        container: document.getElementById('products-grid'),
        masonryEnabled: true
      });

      // Initialize quick view early to ensure modal is created
      window.catalogQuickView = new CatalogQuickView({
        modalId: 'quick-view-modal',
        apiEndpoint: '/api/catalog/product'
      });
      
      // Ensure modal is created
      if (!document.getElementById('quick-view-modal')) {
        window.catalogQuickView.createModal();
      }

      window.catalogViewModes = new CatalogViewModes({
        container: document.getElementById('products-grid'),
        gridBtn: document.getElementById('view-grid'),
        listBtn: document.getElementById('view-list')
      });

      window.catalogSearch = new CatalogSearch({
        searchInput: document.getElementById('catalog-search'),
        container: document.getElementById('products-grid')
      });

      // Mobile sidebar toggle (keep existing functionality)
      initMobileSidebar();

      console.log('✅ Catalog Enhanced: All modules initialized successfully');
    } catch (error) {
      console.error('❌ Catalog Enhanced: Error initializing modules', error);
    }
  }

  function initMobileSidebar() {
    const sidebar = document.getElementById('catalog-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const mobileFilterBtn = document.getElementById('mobile-filter-btn');
    const sidebarClose = document.getElementById('sidebar-close');

    function showSidebar() {
      if (sidebar) sidebar.classList.add('active');
      if (overlay) overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function hideSidebar() {
      if (sidebar) sidebar.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (mobileFilterBtn) {
      mobileFilterBtn.addEventListener('click', showSidebar);
    }

    if (sidebarClose) {
      sidebarClose.addEventListener('click', hideSidebar);
    }

    if (overlay) {
      overlay.addEventListener('click', hideSidebar);
    }
  }

})();

