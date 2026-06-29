/**
 * Navigation Module
 * Gonzaga's Art & Shine
 */

window.GonzagaNavigation = (function() {
  'use strict';

  const MODULE_NAME = 'Navigation';
  let isInitialized = false;

  /**
   * Highlight active navigation item (desktop + mobile drawer)
   */
  function highlightActiveNav() {
    const currentPath = window.location.pathname;

    const isHome = currentPath === '/' || currentPath === '/index.html';
    const isCollections = currentPath === '/collections' || currentPath.startsWith('/collection/');
    const isCatalog = currentPath === '/catalog' || currentPath.startsWith('/catalog/');
    const isAbout = currentPath === '/about';
    const isCart = currentPath === '/cart';
    const isAdmin = currentPath.startsWith('/admin');

    const matchers = [
      { test: (href) => href === '/' && isHome, href: '/' },
      { test: (href) => href === '/collections' && isCollections, href: '/collections' },
      { test: (href) => href === '/catalog' && isCatalog, href: '/catalog' },
      { test: (href) => href === '/about' && isAbout, href: '/about' },
      { test: (href) => href === '/cart' && isCart, href: '/cart' },
      { test: (href) => href === '/admin' && isAdmin, href: '/admin' }
    ];

    document.querySelectorAll('.nav-menu a, .mobile-nav-link[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;

      link.classList.remove('active');
      const match = matchers.find(m => m.href === href && m.test(href));
      if (match) link.classList.add('active');
    });

    GonzagaUtils.log(MODULE_NAME, `Active nav highlighted for path: ${currentPath}`);
  }

  /**
   * Initialize scroll effects for navigation
   */
  function initScrollEffects() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
      const scrollY = window.scrollY;

      if (scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      if (scrollY > lastScrollY && scrollY > 200) {
        header.classList.add('hidden');
      } else {
        header.classList.remove('hidden');
      }

      lastScrollY = scrollY;
      ticking = false;
    }

    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }

    window.addEventListener('scroll', requestTick);
    GonzagaUtils.log(MODULE_NAME, 'Scroll effects initialized');
  }

  /**
   * Initialize all navigation functionality
   */
  function init() {
    if (isInitialized) {
      GonzagaUtils.log(MODULE_NAME, 'Already initialized');
      return;
    }

    try {
      highlightActiveNav();
      initScrollEffects();

      isInitialized = true;
      GonzagaUtils.log(MODULE_NAME, 'Navigation module initialized successfully');
    } catch (error) {
      GonzagaUtils.handleError(MODULE_NAME, error, 'Initialization failed');
    }
  }

  /**
   * Destroy navigation (cleanup)
   */
  function destroy() {
    isInitialized = false;
    GonzagaUtils.log(MODULE_NAME, 'Navigation module destroyed');
  }

  return {
    init,
    destroy,
    highlightActiveNav,
    isInitialized: () => isInitialized
  };
})();
