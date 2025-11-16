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
    const overlay = document.getElementById('filter-drawer-overlay');
    const filterToggleBtn = document.getElementById('filter-toggle-btn');
    const floatingFilterBtn = document.getElementById('floating-filter-btn');
    const sidebarClose = document.getElementById('sidebar-close');

    function showSidebar() {
      if (sidebar) {
        sidebar.classList.add('active');
        if (filterToggleBtn) filterToggleBtn.classList.add('active');
        if (floatingFilterBtn) floatingFilterBtn.classList.add('active');
      }
      if (overlay) overlay.classList.add('active');
      document.body.classList.add('drawer-open');
    }

    function hideSidebar() {
      if (sidebar) {
        sidebar.classList.remove('active');
        if (filterToggleBtn) filterToggleBtn.classList.remove('active');
        if (floatingFilterBtn) floatingFilterBtn.classList.remove('active');
      }
      if (overlay) overlay.classList.remove('active');
      document.body.classList.remove('drawer-open');
    }

    // Toggle function
    function toggleSidebar() {
      if (sidebar && sidebar.classList.contains('active')) {
        hideSidebar();
      } else {
        showSidebar();
      }
    }

    // Toggle button (works for both mobile and desktop)
    if (filterToggleBtn) {
      filterToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
      });
    }

    // Floating filter button
    if (floatingFilterBtn) {
      floatingFilterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
      });
    }

    // Close button
    if (sidebarClose) {
      sidebarClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        hideSidebar();
      });
    }

    // Overlay click to close
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        hideSidebar();
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
        hideSidebar();
      }
    });

    // Close sidebar when filter is applied (optional - can be removed if you want it to stay open)
    const filterForm = document.getElementById('catalog-filters');
    if (filterForm && window.catalogFilters) {
      const originalApplyFilters = window.catalogFilters.applyFilters.bind(window.catalogFilters);
      window.catalogFilters.applyFilters = async function() {
        await originalApplyFilters();
        // Optionally close drawer after applying filters on mobile
        if (window.innerWidth < 992) {
          setTimeout(() => hideSidebar(), 300);
        }
      };
    }

    // Show/hide floating filter button based on header button visibility
    function toggleFloatingFilterButton() {
      if (!floatingFilterBtn || !filterToggleBtn) return;

      const headerButtonRect = filterToggleBtn.getBoundingClientRect();
      const isHeaderButtonVisible = 
        headerButtonRect.top >= 0 &&
        headerButtonRect.left >= 0 &&
        headerButtonRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        headerButtonRect.right <= (window.innerWidth || document.documentElement.clientWidth);

      // Show floating button only when header button is not visible
      if (!isHeaderButtonVisible && window.scrollY > 100) {
        floatingFilterBtn.classList.add('visible');
      } else {
        floatingFilterBtn.classList.remove('visible');
      }
    }

    // Throttle scroll event
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(toggleFloatingFilterButton, 50);
    }, { passive: true });

    // Initial check
    toggleFloatingFilterButton();

    // Also check on resize
    window.addEventListener('resize', toggleFloatingFilterButton, { passive: true });
  }

})();

