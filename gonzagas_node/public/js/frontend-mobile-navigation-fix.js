/**
 * Frontend Mobile Navigation - FINAL FIX
 * Gonzaga's Art & Shine
 * CORREÇÃO DEFINITIVA: Frontend navigation com lógica correta
 */

(function() {
  'use strict';

  console.log('🎨 Frontend Mobile Navigation FINAL FIX: Starting...');

  // ===== VARIABLES =====
  let isFrontendNavOpen = false;
  let elements = {
    nav: null,
    toggle: null,
    close: null,
    overlay: null,
    body: document.body
  };

  // ===== INITIALIZATION =====
  function initFrontendMobileNav() {
    console.log('🎨 Frontend: Initializing mobile navigation...');
    
    // Get elements - try both possible selectors
    elements.nav = document.getElementById('mobile-nav');
    elements.toggle = document.getElementById('mobile-nav-toggle') || document.querySelector('.mobile-nav-toggle');
    elements.close = document.querySelector('.mobile-nav-close');
    
    if (!elements.nav || !elements.toggle) {
      console.warn('🎨 Frontend: Required elements not found', {
        nav: !!elements.nav,
        toggle: !!elements.toggle
      });
      return;
    }

    // Remove any existing event listeners by cloning elements
    const newToggle = elements.toggle.cloneNode(true);
    elements.toggle.parentNode.replaceChild(newToggle, elements.toggle);
    elements.toggle = newToggle;

    // Create overlay if needed
    createOverlay();
    
    // Setup event listeners
    setupEventListeners();
    
    // Set initial state - CRITICAL: ensure we start in closed state
    setInitialState();
    
    console.log('✅ Frontend: Mobile navigation initialized');
  }

  // ===== CREATE OVERLAY =====
  function createOverlay() {
    elements.overlay = document.getElementById('frontend-nav-overlay');
    
    if (!elements.overlay) {
      elements.overlay = document.createElement('div');
      elements.overlay.id = 'frontend-nav-overlay';
      elements.overlay.className = 'frontend-nav-overlay';
      elements.overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1040;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        backdrop-filter: blur(4px);
      `;
      document.body.appendChild(elements.overlay);
    }
  }

  // ===== EVENT LISTENERS =====
  function setupEventListeners() {
    // Toggle button click - FIXED LOGIC
    elements.toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('🎨 Frontend: Toggle clicked, current state:', isFrontendNavOpen);
      
      // CORRECT LOGIC: If closed, open it. If open, close it.
      if (isFrontendNavOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close button click (if exists)
    if (elements.close) {
      elements.close.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🎨 Frontend: Close button clicked');
        closeNav();
      });
    }

    // Overlay click
    if (elements.overlay) {
      elements.overlay.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🎨 Frontend: Overlay clicked');
        closeNav();
      });
    }

    // Click outside nav
    elements.nav.addEventListener('click', function(e) {
      if (e.target === elements.nav) {
        console.log('🎨 Frontend: Clicked outside nav content');
        closeNav();
      }
    });

    // Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isFrontendNavOpen) {
        console.log('🎨 Frontend: Escape pressed');
        closeNav();
      }
    });

    // Window resize
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && isFrontendNavOpen) {
        console.log('🎨 Frontend: Resized to desktop');
        closeNav();
      }
    });

    // Prevent background scroll when nav is open
    document.addEventListener('touchmove', function(e) {
      if (isFrontendNavOpen && !elements.nav.contains(e.target)) {
        e.preventDefault();
      }
    }, { passive: false });

    // Navigation links click
    const navLinks = elements.nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        // Close nav after link click with delay
        setTimeout(() => {
          closeNav();
        }, 100);
      });
    });
  }

  // ===== TOGGLE FUNCTIONS =====
  function openNav() {
    console.log('🎨 Frontend: Opening navigation (was closed)');
    
    isFrontendNavOpen = true;
    
    // Add classes
    elements.body.classList.add('frontend-nav-open');
    elements.nav.classList.add('frontend-nav-active');
    
    // Show overlay
    if (elements.overlay) {
      elements.overlay.style.opacity = '1';
      elements.overlay.style.visibility = 'visible';
    }
    
    // Prevent body scroll
    elements.body.style.overflow = 'hidden';
    
    // Update hamburger icon - SHOW X
    updateHamburgerIcon(true);
    
    console.log('✅ Frontend: Navigation OPENED - showing X icon');
  }

  function closeNav() {
    console.log('🎨 Frontend: Closing navigation (was open)');
    
    isFrontendNavOpen = false;
    
    // Remove classes
    elements.body.classList.remove('frontend-nav-open');
    elements.nav.classList.remove('frontend-nav-active');
    
    // Hide overlay
    if (elements.overlay) {
      elements.overlay.style.opacity = '0';
      elements.overlay.style.visibility = 'hidden';
    }
    
    // Restore body scroll
    elements.body.style.overflow = '';
    
    // Update hamburger icon - SHOW HAMBURGER
    updateHamburgerIcon(false);
    
    console.log('✅ Frontend: Navigation CLOSED - showing hamburger icon');
  }

  // ===== ICON UPDATE - FIXED LOGIC =====
  function updateHamburgerIcon(isOpen) {
    const hamburgerLines = elements.toggle.querySelectorAll('.hamburger-line');
    
    if (hamburgerLines.length >= 3) {
      if (isOpen) {
        // Navigation is OPEN: Transform to X
        hamburgerLines[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        hamburgerLines[1].style.opacity = '0';
        hamburgerLines[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        elements.toggle.setAttribute('aria-label', 'Fechar menu de navegação');
        console.log('🎨 Icon: Set to X (navigation open)');
      } else {
        // Navigation is CLOSED: Transform to hamburger
        hamburgerLines[0].style.transform = '';
        hamburgerLines[1].style.opacity = '';
        hamburgerLines[2].style.transform = '';
        elements.toggle.setAttribute('aria-label', 'Abrir menu de navegação');
        console.log('🎨 Icon: Set to hamburger (navigation closed)');
      }
    } else {
      console.warn('🎨 Frontend: Hamburger lines not found for icon update');
    }
  }

  // ===== INITIAL STATE =====
  function setInitialState() {
    console.log('🎨 Frontend: Setting initial state to CLOSED');
    
    // Force everything to closed state
    isFrontendNavOpen = false;
    
    // Remove any classes that might indicate open state
    elements.body.classList.remove('frontend-nav-open');
    elements.nav.classList.remove('frontend-nav-active');
    elements.nav.classList.remove('active');
    
    // Restore body scroll
    elements.body.style.overflow = '';
    
    // Hide overlay
    if (elements.overlay) {
      elements.overlay.style.opacity = '0';
      elements.overlay.style.visibility = 'hidden';
    }
    
    // Set icon to hamburger (closed state)
    updateHamburgerIcon(false);
    
    console.log('✅ Frontend: Initial state set to CLOSED with hamburger icon');
  }

  // ===== SWIPE GESTURES =====
  let touchStartX = 0;
  let touchEndX = 0;

  function handleSwipeGestures() {
    if (!elements.nav) return;
    
    elements.nav.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    elements.nav.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    const minSwipeDistance = 100;

    // Swipe left to close
    if (swipeDistance < -minSwipeDistance && isFrontendNavOpen) {
      closeNav();
    }
  }

  // ===== CSS INJECTION =====
  function injectFrontendMobileCSS() {
    const style = document.createElement('style');
    style.id = 'frontend-mobile-nav-fix-css';
    style.textContent = `
      /* Frontend Mobile Navigation FINAL FIX CSS */
      @media (max-width: 768px) {
        /* Mobile nav when active - slide in from left */
        .mobile-nav.frontend-nav-active {
          left: 0 !important;
        }
        
        /* Alternative class support */
        .mobile-nav.active {
          left: 0 !important;
        }
        
        /* Body when nav is open */
        body.frontend-nav-open {
          overflow: hidden !important;
        }
      }
    `;
    
    // Remove existing style if present
    const existingStyle = document.getElementById('frontend-mobile-nav-fix-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
    console.log('🎨 Frontend: Mobile CSS injected');
  }

  // ===== MAIN INITIALIZATION =====
  function init() {
    // Only run on mobile
    if (window.innerWidth > 768) {
      console.log('🎨 Frontend: Desktop detected, skipping mobile nav');
      return;
    }

    // Only run in frontend area (not admin)
    if (document.body.classList.contains('admin-layout-fixed')) {
      console.log('🎨 Frontend: Admin area detected, skipping');
      return;
    }

    console.log('🎨 Frontend: Initializing mobile navigation fix...');
    
    injectFrontendMobileCSS();
    initFrontendMobileNav();
    handleSwipeGestures();
    
    // Double-check initial state after a short delay
    setTimeout(() => {
      setInitialState();
    }, 100);
  }

  // ===== AUTO-INIT =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init on resize for mobile
  window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
      setTimeout(init, 100);
    }
  });

  console.log('🎨 Frontend Mobile Navigation FINAL FIX: Loaded');

})(); 