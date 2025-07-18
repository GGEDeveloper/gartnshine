/**
 * Admin Mobile Complete Solution
 * Gonzaga's Art & Shine
 * SOLUÇÃO DEFINITIVA: Admin mobile funcionando perfeitamente
 */

(function() {
  'use strict';

  console.log('🔧 Admin Mobile COMPLETE SOLUTION: Starting...');

  // ===== VARIABLES =====
  let isAdminSidebarOpen = false;
  let elements = {
    sidebar: null,
    toggle: null,
    overlay: null,
    wrapper: null,
    contentWrapper: null,
    content: null,
    body: document.body
  };

  // ===== DETECT MOBILE =====
  function isMobile() {
    return window.innerWidth < 992;
  }

  // ===== CREATE MOBILE-OPTIMIZED LAYOUT =====
  function createMobileLayout() {
    if (!isMobile()) return;

    console.log('🔧 Creating mobile-optimized admin layout...');

    // Inject essential mobile CSS
    const style = document.createElement('style');
    style.id = 'admin-mobile-complete-solution-css';
    style.textContent = `
      /* ADMIN MOBILE COMPLETE SOLUTION */
      @media (max-width: 991.98px) {
        /* Reset everything */
        * {
          box-sizing: border-box !important;
        }
        
        html, body {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden !important;
        }
        
        /* Wrapper - Simple and clean */
        #wrapper {
          width: 100% !important;
          height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          position: relative !important;
        }
        
        /* Sidebar - Hidden by default, overlay when open */
        .sidebar {
          position: fixed !important;
          top: 0 !important;
          left: -100% !important;
          width: 280px !important;
          height: 100vh !important;
          z-index: 9999 !important;
          background: #343a40 !important;
          transition: left 0.3s ease !important;
          overflow-y: auto !important;
          box-shadow: 2px 0 10px rgba(0,0,0,0.3) !important;
        }
        
        .sidebar.open {
          left: 0 !important;
        }
        
        /* Content wrapper - Always full width - FORCE NO MARGINS */
        #content-wrapper {
          width: 100% !important;
          height: 100vh !important;
          margin: 0 !important;
          margin-left: 0 !important;
          padding: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          position: relative !important;
          left: 0 !important;
        }
        
        /* Header - Fixed at top */
        .header {
          width: 100% !important;
          height: 60px !important;
          background: #fff !important;
          border-bottom: 1px solid #e3e6f0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 0 1rem !important;
          position: sticky !important;
          top: 0 !important;
          z-index: 1000 !important;
          flex-shrink: 0 !important;
          margin: 0 !important;
          margin-left: 0 !important;
          left: 0 !important;
        }
        
        /* Content - Scrollable area - FORCE NO MARGINS */
        #content {
          flex: 1 !important;
          width: 100% !important;
          padding: 1rem !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          background: #f8f9fa !important;
          margin: 0 !important;
          margin-left: 0 !important;
          left: 0 !important;
          position: relative !important;
        }
        
        /* Container fluid - Full width - FORCE NO MARGINS */
        .container-fluid {
          width: 100% !important;
          max-width: 100% !important;
          padding: 0 1rem !important;
          margin: 0 !important;
          margin-left: 0 !important;
          left: 0 !important;
          position: relative !important;
        }
        
        /* FORCE ALL CONTAINERS TO START AT LEFT */
        .container, .container-sm, .container-md, .container-lg, .container-xl, .container-xxl {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          margin-left: 0 !important;
          padding-left: 1rem !important;
          padding-right: 1rem !important;
          left: 0 !important;
          position: relative !important;
        }
        
        /* FORCE ALL ROWS TO START AT LEFT */
        .row {
          width: 100% !important;
          margin: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          left: 0 !important;
          position: relative !important;
        }
        
        /* FORCE ALL COLUMNS TO START AT LEFT */
        .col, [class*="col-"] {
          width: 100% !important;
          margin: 0 !important;
          margin-left: 0 !important;
          padding-left: 0.75rem !important;
          padding-right: 0.75rem !important;
          left: 0 !important;
          position: relative !important;
        }
        
        /* FORCE PAGE CONTENT AREAS */
        .page-content,
        .page-wrapper,
        .content-wrapper,
        .main-content {
          width: 100% !important;
          margin: 0 !important;
          margin-left: 0 !important;
          padding: 0 !important;
          left: 0 !important;
          position: relative !important;
        }
        
        /* FORCE ALL ADMIN SPECIFIC CONTAINERS */
        .admin-content,
        .admin-wrapper,
        .admin-container {
          width: 100% !important;
          margin: 0 !important;
          margin-left: 0 !important;
          left: 0 !important;
          position: relative !important;
        }
        
        /* Cards - Responsive */
        .card {
          margin-bottom: 1rem !important;
          border-radius: 0.5rem !important;
          width: 100% !important;
          margin-left: 0 !important;
          left: 0 !important;
          position: relative !important;
        }
        
        .card-body {
          padding: 1rem !important;
          margin: 0 !important;
          margin-left: 0 !important;
        }
        
        /* Tables - Horizontal scroll */
        .table-responsive {
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
          width: 100% !important;
          margin: 0 !important;
          margin-left: 0 !important;
        }
        
        .table {
          min-width: 600px !important;
          font-size: 0.875rem !important;
          margin: 0 !important;
          margin-left: 0 !important;
        }
        
        .table th,
        .table td {
          padding: 0.5rem !important;
          white-space: nowrap !important;
        }
        
        /* Forms - Mobile friendly */
        .form-control,
        .form-select {
          font-size: 16px !important;
          padding: 0.75rem !important;
          width: 100% !important;
        }
        
        /* Buttons - Larger touch targets */
        .btn {
          padding: 0.75rem 1rem !important;
          font-size: 0.875rem !important;
        }
        
        .btn-sm {
          padding: 0.5rem 0.75rem !important;
          font-size: 0.75rem !important;
        }
        
        /* Toggle button */
        #sidebarToggle {
          width: 44px !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: 1px solid #d1d3e2 !important;
          background: #fff !important;
          color: #5a5c69 !important;
          border-radius: 0.375rem !important;
          font-size: 1.125rem !important;
        }
        
        #sidebarToggle:hover {
          background: #f8f9fa !important;
          border-color: #b7b9cc !important;
        }
        
        /* Overlay */
        .admin-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: rgba(0, 0, 0, 0.5) !important;
          z-index: 9998 !important;
          opacity: 0 !important;
          visibility: hidden !important;
          transition: all 0.3s ease !important;
        }
        
        .admin-overlay.active {
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        /* Body lock when sidebar open */
        body.sidebar-open {
          overflow: hidden !important;
        }
        
        /* Small mobile adjustments */
        @media (max-width: 575.98px) {
          .sidebar {
            width: 100% !important;
          }
          
          #content {
            padding: 0.75rem !important;
          }
          
          .header {
            padding: 0 0.75rem !important;
            height: 56px !important;
          }
          
          .card-body {
            padding: 0.75rem !important;
          }
          
          .container-fluid {
            padding: 0 0.75rem !important;
          }
          
          .container, .container-sm, .container-md, .container-lg, .container-xl, .container-xxl {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
        }
      }
    `;

    // Remove existing styles
    const existingStyle = document.getElementById('admin-mobile-complete-solution-css');
    if (existingStyle) existingStyle.remove();
    
    document.head.appendChild(style);
    console.log('✅ Mobile CSS injected');
  }

  // ===== FORCE CONTENT POSITIONING =====
  function forceContentPositioning() {
    if (!isMobile()) return;
    
    console.log('🔧 Forcing content positioning...');
    
    // Force all main containers to start at left
    const containers = [
      '#wrapper', 
      '#content-wrapper', 
      '#content', 
      '.container-fluid',
      '.container',
      '.row'
    ];
    
    containers.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.style.marginLeft = '0';
        element.style.left = '0';
        element.style.position = 'relative';
        element.style.transform = 'none';
      });
    });
    
    // Force all Bootstrap columns
    const columns = document.querySelectorAll('[class*="col-"]');
    columns.forEach(col => {
      col.style.marginLeft = '0';
      col.style.left = '0';
      col.style.position = 'relative';
      col.style.transform = 'none';
    });
    
    console.log('✅ Content positioning forced');
  }

  // ===== INITIALIZE ELEMENTS =====
  function initElements() {
    elements.sidebar = document.querySelector('.sidebar');
    elements.toggle = document.getElementById('sidebarToggle');
    elements.wrapper = document.getElementById('wrapper');
    elements.contentWrapper = document.getElementById('content-wrapper');
    elements.content = document.getElementById('content');

    if (!elements.sidebar || !elements.toggle) {
      console.warn('🔧 Required elements not found');
      return false;
    }

    // Create overlay
    elements.overlay = document.getElementById('admin-overlay');
    if (!elements.overlay) {
      elements.overlay = document.createElement('div');
      elements.overlay.id = 'admin-overlay';
      elements.overlay.className = 'admin-overlay';
      document.body.appendChild(elements.overlay);
    }

    return true;
  }

  // ===== EVENT HANDLERS =====
  function setupEventListeners() {
    // Clean existing listeners
    const newToggle = elements.toggle.cloneNode(true);
    elements.toggle.parentNode.replaceChild(newToggle, elements.toggle);
    elements.toggle = newToggle;

    // Toggle click
    elements.toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleSidebar();
    });

    // Overlay click
    elements.overlay.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeSidebar();
    });

    // Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isAdminSidebarOpen) {
        closeSidebar();
      }
    });

    // Window resize
    window.addEventListener('resize', function() {
      if (!isMobile() && isAdminSidebarOpen) {
        closeSidebar();
      }
      // Force positioning on resize
      setTimeout(forceContentPositioning, 100);
    });

    console.log('✅ Event listeners set up');
  }

  // ===== SIDEBAR FUNCTIONS =====
  function toggleSidebar() {
    if (isAdminSidebarOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  function openSidebar() {
    console.log('🔧 Opening sidebar...');
    
    isAdminSidebarOpen = true;
    
    // Add classes
    elements.sidebar.classList.add('open');
    elements.overlay.classList.add('active');
    elements.body.classList.add('sidebar-open');
    
    // Update icon
    const icon = elements.toggle.querySelector('i');
    if (icon) icon.className = 'fas fa-times';
    
    console.log('✅ Sidebar opened');
  }

  function closeSidebar() {
    console.log('🔧 Closing sidebar...');
    
    isAdminSidebarOpen = false;
    
    // Remove classes
    elements.sidebar.classList.remove('open');
    elements.overlay.classList.remove('active');
    elements.body.classList.remove('sidebar-open');
    
    // Update icon
    const icon = elements.toggle.querySelector('i');
    if (icon) icon.className = 'fas fa-bars';
    
    // Force content positioning after closing
    setTimeout(forceContentPositioning, 100);
    
    console.log('✅ Sidebar closed');
  }

  // ===== INITIAL STATE =====
  function setInitialState() {
    isAdminSidebarOpen = false;
    elements.sidebar.classList.remove('open');
    elements.overlay.classList.remove('active');
    elements.body.classList.remove('sidebar-open');
    
    const icon = elements.toggle.querySelector('i');
    if (icon) icon.className = 'fas fa-bars';
    
    // Force content positioning
    setTimeout(forceContentPositioning, 100);
    
    console.log('✅ Initial state set');
  }

  // ===== SWIPE GESTURES =====
  function setupSwipeGestures() {
    let touchStartX = 0;
    let touchEndX = 0;

    elements.sidebar.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    elements.sidebar.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;
      
      // Swipe left to close
      if (swipeDistance < -100 && isAdminSidebarOpen) {
        closeSidebar();
      }
    }, { passive: true });
  }

  // ===== MAIN INITIALIZATION =====
  function init() {
    if (!isMobile()) {
      console.log('🔧 Desktop detected, skipping mobile admin');
      return;
    }

    if (!elements.body.classList.contains('admin-layout-fixed')) {
      console.log('🔧 Not admin area, skipping');
      return;
    }

    console.log('🔧 Initializing admin mobile solution...');

    // Step by step initialization
    createMobileLayout();
    
    if (!initElements()) {
      console.error('🔧 Failed to initialize elements');
      return;
    }

    setupEventListeners();
    setupSwipeGestures();
    setInitialState();
    
    // Force positioning multiple times to ensure it works
    setTimeout(forceContentPositioning, 200);
    setTimeout(forceContentPositioning, 500);
    setTimeout(forceContentPositioning, 1000);

    console.log('✅ Admin mobile solution initialized successfully');
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
  
  // Force positioning on page changes
  const observer = new MutationObserver(function() {
    if (isMobile()) {
      setTimeout(forceContentPositioning, 100);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('🔧 Admin Mobile Complete Solution: Loaded');

})(); 