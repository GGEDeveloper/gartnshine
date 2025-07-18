/**
 * Navigation Module
 * Gonzaga's Art & Shine
 */

window.GonzagaNavigation = (function() {
  'use strict';

  const MODULE_NAME = 'Navigation';
  let isInitialized = false;

  /**
   * Initialize mobile menu functionality
   */
  function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (!menuToggle || !navMenu) {
      GonzagaUtils.log(MODULE_NAME, 'Mobile menu elements not found');
      return;
    }

    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      
      // Transform hamburger to X
      const spans = menuToggle.querySelectorAll('span');
      if (spans.length >= 3) {
        spans[0].classList.toggle('rotate-45');
        spans[0].classList.toggle('translate-y-2.5');
        spans[1].classList.toggle('opacity-0');
        spans[2].classList.toggle('-rotate-45');
        spans[2].classList.toggle('-translate-y-2.5');
      }

      GonzagaUtils.log(MODULE_NAME, 'Mobile menu toggled');
    });
  }

  /**
   * Initialize dropdown menus
   */
  function initDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    if (!dropdownToggles.length) {
      GonzagaUtils.log(MODULE_NAME, 'No dropdown toggles found');
      return;
    }

    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const parent = toggle.parentElement;
        
        // Se o link tiver um href e não for apenas '#', permite a navegação
        if (toggle.getAttribute('href') && toggle.getAttribute('href') !== '#') {
          return; // Permite o comportamento padrão do link
        }
        
        e.preventDefault();
        
        // Fecha todos os outros dropdowns
        document.querySelectorAll('.dropdown').forEach(item => {
          if (item !== parent) item.classList.remove('open');
        });
        
        // Toggle this dropdown
        parent.classList.toggle('open');
        
        GonzagaUtils.log(MODULE_NAME, 'Dropdown toggled');
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown').forEach(item => {
          item.classList.remove('open');
        });
      }
    });
  }

  /**
   * Highlight active navigation item
   */
  function highlightActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.remove('active');
      
      if (href && currentPath.includes(href) && href !== '/') {
        link.classList.add('active');
      } else if (href === '/' && (currentPath === '/' || currentPath === '/index.html')) {
        link.classList.add('active');
      }
    });

    GonzagaUtils.log(MODULE_NAME, `Active nav highlighted for path: ${currentPath}`);
  }

  /**
   * Initialize scroll effects for navigation
   */
  function initScrollEffects() {
    const header = document.querySelector('header, .navbar');
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

      // Hide/show on scroll
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
      initMobileMenu();
      initDropdowns();
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
    // Remove event listeners and cleanup
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
      menuToggle.replaceWith(menuToggle.cloneNode(true));
    }

    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
      toggle.replaceWith(toggle.cloneNode(true));
    });

    isInitialized = false;
    GonzagaUtils.log(MODULE_NAME, 'Navigation module destroyed');
  }

  // Public API
  return {
    init,
    destroy,
    highlightActiveNav,
    isInitialized: () => isInitialized
  };
})(); 