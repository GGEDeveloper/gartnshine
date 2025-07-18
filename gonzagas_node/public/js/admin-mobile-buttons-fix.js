/**
 * Admin Mobile Buttons Fix
 * Gonzaga's Art & Shine
 * Garante que TODOS os botões do header admin funcionem em mobile
 */

(function() {
  'use strict';

  console.log('[ADMIN BUTTONS] Initializing mobile buttons fix...');

  let isAdminSidebarOpen = false;
  let elements = {};

  // ===== MOBILE DETECTION =====
  function isMobile() {
    return window.innerWidth < 992;
  }

  // ===== INITIALIZE ELEMENTS =====
  function initElements() {
    console.log('[ADMIN BUTTONS] Finding elements...');
    
    elements.sidebar = document.querySelector('.sidebar');
    elements.sidebarToggle = document.getElementById('sidebarToggle');
    elements.userDropdown = document.getElementById('userDropdown');
    elements.viewSiteBtn = document.querySelector('a[href="/"]');
    elements.body = document.body;
    
    // Create overlay if doesn't exist
    elements.overlay = document.getElementById('admin-mobile-overlay');
    if (!elements.overlay) {
      elements.overlay = document.createElement('div');
      elements.overlay.id = 'admin-mobile-overlay';
      elements.overlay.style.cssText = `
        position: fixed;
        top: 60px;
        left: 0;
        width: 100%;
        height: calc(100% - 60px);
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        display: none;
        pointer-events: auto;
      `;
      document.body.appendChild(elements.overlay);
    }

    console.log('[ADMIN BUTTONS] Elements found:', {
      sidebar: !!elements.sidebar,
      sidebarToggle: !!elements.sidebarToggle,
      userDropdown: !!elements.userDropdown,
      viewSiteBtn: !!elements.viewSiteBtn
    });

    return elements.sidebar && elements.sidebarToggle;
  }

  // ===== SIDEBAR FUNCTIONS =====
  function toggleSidebar() {
    console.log('[ADMIN BUTTONS] Toggle sidebar, current state:', isAdminSidebarOpen);
    
    if (isAdminSidebarOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  function openSidebar() {
    console.log('[ADMIN BUTTONS] Opening sidebar...');
    
    isAdminSidebarOpen = true;
    
    if (elements.sidebar) {
      elements.sidebar.style.left = '0';
      elements.sidebar.classList.add('open');
    }
    
    if (elements.overlay) {
      elements.overlay.style.display = 'block';
    }
    
    elements.body.classList.add('sidebar-open');
    
    // Update icon
    const icon = elements.sidebarToggle.querySelector('i');
    if (icon) {
      icon.className = 'fas fa-times';
    }
    
    console.log('[ADMIN BUTTONS] Sidebar opened');
  }

  function closeSidebar() {
    console.log('[ADMIN BUTTONS] Closing sidebar...');
    
    isAdminSidebarOpen = false;
    
    if (elements.sidebar) {
      elements.sidebar.style.left = '-100%';
      elements.sidebar.classList.remove('open');
    }
    
    if (elements.overlay) {
      elements.overlay.style.display = 'none';
    }
    
    elements.body.classList.remove('sidebar-open');
    
    // Update icon
    const icon = elements.sidebarToggle.querySelector('i');
    if (icon) {
      icon.className = 'fas fa-bars';
    }
    
    console.log('[ADMIN BUTTONS] Sidebar closed');
  }

  // ===== EVENT LISTENERS =====
  function setupEventListeners() {
    console.log('[ADMIN BUTTONS] Setting up event listeners...');

    // Sidebar toggle button
    if (elements.sidebarToggle) {
      // Remove existing listeners by cloning
      const newToggle = elements.sidebarToggle.cloneNode(true);
      elements.sidebarToggle.parentNode.replaceChild(newToggle, elements.sidebarToggle);
      elements.sidebarToggle = newToggle;
      
      elements.sidebarToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[ADMIN BUTTONS] Sidebar toggle clicked');
        toggleSidebar();
      });
      
      // Ensure button is always clickable
      elements.sidebarToggle.style.cssText += `
        pointer-events: auto !important;
        z-index: 1002 !important;
        position: relative !important;
      `;
    }

    // User dropdown
    if (elements.userDropdown) {
      elements.userDropdown.style.cssText += `
        pointer-events: auto !important;
        z-index: 1002 !important;
        position: relative !important;
      `;
      
      console.log('[ADMIN BUTTONS] User dropdown styling applied');
    }

    // View site button
    if (elements.viewSiteBtn) {
      elements.viewSiteBtn.style.cssText += `
        pointer-events: auto !important;
        z-index: 1002 !important;
        position: relative !important;
      `;
      
      console.log('[ADMIN BUTTONS] View site button styling applied');
    }

    // Overlay click to close
    if (elements.overlay) {
      elements.overlay.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[ADMIN BUTTONS] Overlay clicked');
        closeSidebar();
      });
    }

    // Escape key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isAdminSidebarOpen) {
        console.log('[ADMIN BUTTONS] Escape key pressed');
        closeSidebar();
      }
    });

    // Window resize
    window.addEventListener('resize', function() {
      if (!isMobile() && isAdminSidebarOpen) {
        closeSidebar();
      }
    });

    console.log('[ADMIN BUTTONS] Event listeners set up successfully');
  }

  // ===== FORCE BUTTON VISIBILITY =====
  function forceButtonVisibility() {
    if (!isMobile()) return;
    
    console.log('[ADMIN BUTTONS] Forcing button visibility...');
    
    // Find all header buttons and make them clickable
    const headerButtons = document.querySelectorAll('.header button, .header .btn, .header .dropdown, .header a');
    headerButtons.forEach(button => {
      button.style.cssText += `
        pointer-events: auto !important;
        z-index: 1002 !important;
        position: relative !important;
        background: ${button.tagName === 'BUTTON' ? 'white' : 'transparent'} !important;
      `;
    });
    
    // Ensure header is always on top
    const header = document.querySelector('.header');
    if (header) {
      header.style.cssText += `
        z-index: 1001 !important;
        position: sticky !important;
        pointer-events: auto !important;
      `;
    }
    
    console.log('[ADMIN BUTTONS] Button visibility forced');
  }

  // ===== INITIALIZATION =====
  function init() {
    if (!isMobile()) {
      console.log('[ADMIN BUTTONS] Desktop detected, skipping');
      return;
    }

    if (!document.body.classList.contains('admin-layout-fixed')) {
      console.log('[ADMIN BUTTONS] Not admin area, skipping');
      return;
    }

    console.log('[ADMIN BUTTONS] Initializing...');

    if (!initElements()) {
      console.error('[ADMIN BUTTONS] Failed to initialize elements');
      return;
    }

    setupEventListeners();
    forceButtonVisibility();
    
    // Set initial state
    closeSidebar();
    
    // Force multiple times to ensure it works
    setTimeout(forceButtonVisibility, 100);
    setTimeout(forceButtonVisibility, 500);
    setTimeout(forceButtonVisibility, 1000);

    console.log('[ADMIN BUTTONS] Initialization complete');
  }

  // ===== AUTO-INITIALIZATION =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-initialize on resize
  window.addEventListener('resize', function() {
    if (isMobile()) {
      setTimeout(init, 100);
    }
  });

  // Global debug function
  window.debugAdminButtons = function() {
    console.log('[ADMIN BUTTONS] Debug info:', {
      isMobile: isMobile(),
      isAdminArea: document.body.classList.contains('admin-layout-fixed'),
      elements: elements,
      isAdminSidebarOpen: isAdminSidebarOpen
    });
  };

  console.log('[ADMIN BUTTONS] Script loaded. Use debugAdminButtons() to debug.');

})(); 