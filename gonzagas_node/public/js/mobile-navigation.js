/**
 * Mobile Navigation JavaScript
 * Gonzaga's Art & Shine
 */

(function() {
  'use strict';

  let mobileNav = null;
  let mobileNavToggle = null;
  let mobileNavClose = null;
  let isNavOpen = false;
  let body = null;

  // Initialize mobile navigation
  function initMobileNavigation() {
    console.log('[Mobile Nav] Initializing...');
    
    // Get DOM elements
    mobileNav = document.getElementById('mobile-nav');
    mobileNavToggle = document.getElementById('mobile-nav-toggle');
    mobileNavClose = document.querySelector('.mobile-nav-close');
    body = document.body;

    if (!mobileNav || !mobileNavToggle) {
      console.warn('[Mobile Nav] Required elements not found');
      return;
    }

    console.log('[Mobile Nav] Elements found, setting up event listeners');

    // Set up event listeners
    setupEventListeners();
    
    // Initialize dropdown functionality
    initDropdowns();
    
    // Set initial state
    setInitialState();
    
    console.log('[Mobile Nav] Initialization complete');
  }

  function setupEventListeners() {
    // Hamburger button click
    mobileNavToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[Mobile Nav] Toggle clicked, current state:', isNavOpen);
      
      if (isNavOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    // Close button click (if exists)
    if (mobileNavClose) {
      mobileNavClose.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[Mobile Nav] Close button clicked');
        closeMobileNav();
      });
    }

    // Close on overlay click
    mobileNav.addEventListener('click', function(e) {
      if (e.target === mobileNav) {
        console.log('[Mobile Nav] Overlay clicked');
        closeMobileNav();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isNavOpen) {
        console.log('[Mobile Nav] Escape key pressed');
        closeMobileNav();
      }
    });

    // Handle resize
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && isNavOpen) {
        console.log('[Mobile Nav] Window resized to desktop, closing nav');
        closeMobileNav();
      }
    });

    // Prevent body scroll when nav is open
    document.addEventListener('touchmove', function(e) {
      if (isNavOpen && !mobileNav.contains(e.target)) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  function openMobileNav() {
    console.log('[Mobile Nav] Opening navigation');
    
    isNavOpen = true;
    mobileNav.classList.add('active');
    body.classList.add('mobile-nav-open');
    
    // Update hamburger to X
    updateHamburgerIcon(true);
    
    // Prevent body scroll
    body.style.overflow = 'hidden';
    
    // Focus trap
    trapFocus();
    
    console.log('[Mobile Nav] Navigation opened');
  }

  function closeMobileNav() {
    console.log('[Mobile Nav] Closing navigation');
    
    isNavOpen = false;
    mobileNav.classList.remove('active');
    body.classList.remove('mobile-nav-open');
    
    // Update X to hamburger
    updateHamburgerIcon(false);
    
    // Restore body scroll
    body.style.overflow = '';
    
    // Return focus to toggle button
    if (mobileNavToggle) {
      mobileNavToggle.focus();
    }
    
    console.log('[Mobile Nav] Navigation closed');
  }

  function updateHamburgerIcon(isOpen) {
    const hamburgerLines = mobileNavToggle.querySelectorAll('.hamburger-line');
    
    if (isOpen) {
      // Transform to X
      hamburgerLines[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
      hamburgerLines[1].style.opacity = '0';
      hamburgerLines[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
      mobileNavToggle.setAttribute('aria-label', 'Fechar menu de navegação');
    } else {
      // Transform to hamburger
      hamburgerLines[0].style.transform = '';
      hamburgerLines[1].style.opacity = '';
      hamburgerLines[2].style.transform = '';
      mobileNavToggle.setAttribute('aria-label', 'Abrir menu de navegação');
    }
  }

  function setInitialState() {
    isNavOpen = false;
    mobileNav.classList.remove('active');
    body.classList.remove('mobile-nav-open');
    body.style.overflow = '';
    updateHamburgerIcon(false);
  }

  function initDropdowns() {
    const dropdownToggles = document.querySelectorAll('.mobile-nav-dropdown-toggle');
    
    dropdownToggles.forEach(function(toggle) {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropdown = toggle.closest('.mobile-nav-dropdown');
        const content = dropdown.querySelector('.mobile-nav-dropdown-content');
        const arrow = toggle.querySelector('.mobile-nav-dropdown-arrow');
        
        // Close other dropdowns
        dropdownToggles.forEach(function(otherToggle) {
          if (otherToggle !== toggle) {
            const otherDropdown = otherToggle.closest('.mobile-nav-dropdown');
            const otherContent = otherDropdown.querySelector('.mobile-nav-dropdown-content');
            const otherArrow = otherToggle.querySelector('.mobile-nav-dropdown-arrow');
            
            otherToggle.classList.remove('active');
            otherContent.classList.remove('active');
            if (otherArrow) {
              otherArrow.style.transform = '';
            }
          }
        });
        
        // Toggle current dropdown
        const isActive = toggle.classList.contains('active');
        
        if (isActive) {
          toggle.classList.remove('active');
          content.classList.remove('active');
          if (arrow) {
            arrow.style.transform = '';
          }
        } else {
          toggle.classList.add('active');
          content.classList.add('active');
          if (arrow) {
            arrow.style.transform = 'rotate(180deg)';
          }
        }
      });
    });
  }

  function trapFocus() {
    const focusableElements = mobileNav.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    // Focus first element
    firstFocusableElement.focus();
    
    mobileNav.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  // Public API
  window.MobileNavigation = {
    open: openMobileNav,
    close: closeMobileNav,
    toggle: function() {
      if (isNavOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    },
    isOpen: function() {
      return isNavOpen;
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNavigation);
  } else {
    initMobileNavigation();
  }

  console.log('[Mobile Nav] Script loaded');
})(); 