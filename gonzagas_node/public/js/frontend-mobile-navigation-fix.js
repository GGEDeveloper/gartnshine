/**
 * Frontend Mobile Navigation
 * Gonzaga's Art & Shine
 */

(function() {
  'use strict';

  let isFrontendNavOpen = false;
  let elements = {
    nav: null,
    toggle: null,
    close: null,
    overlay: null,
    body: document.body
  };

  function initFrontendMobileNav() {
    elements.nav = document.getElementById('mobile-nav');
    elements.toggle = document.getElementById('mobile-nav-toggle') || document.querySelector('.mobile-nav-toggle');
    elements.close = document.querySelector('.mobile-nav-close');

    if (!elements.nav || !elements.toggle) return;

    const newToggle = elements.toggle.cloneNode(true);
    elements.toggle.parentNode.replaceChild(newToggle, elements.toggle);
    elements.toggle = newToggle;

    createOverlay();
    setupEventListeners();
    setInitialState();
  }

  function createOverlay() {
    elements.overlay = document.getElementById('frontend-nav-overlay');

    if (!elements.overlay) {
      elements.overlay = document.createElement('div');
      elements.overlay.id = 'frontend-nav-overlay';
      elements.overlay.className = 'frontend-nav-overlay';
      elements.overlay.style.cssText = [
        'position:fixed',
        'top:0',
        'left:0',
        'width:100%',
        'height:100%',
        'background:rgba(0,0,0,0.7)',
        'z-index:1040',
        'opacity:0',
        'visibility:hidden',
        'transition:opacity 0.3s ease, visibility 0.3s ease',
        'backdrop-filter:blur(4px)'
      ].join(';');
      document.body.appendChild(elements.overlay);
    }
  }

  function setupEventListeners() {
    elements.toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (isFrontendNavOpen) closeNav();
      else openNav();
    });

    if (elements.close) {
      elements.close.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeNav();
      });
    }

    if (elements.overlay) {
      elements.overlay.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeNav();
      });
    }

    elements.nav.addEventListener('click', function(e) {
      if (e.target === elements.nav) closeNav();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isFrontendNavOpen) closeNav();
    });

    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && isFrontendNavOpen) closeNav();
    });

    document.addEventListener('touchmove', function(e) {
      if (isFrontendNavOpen && !elements.nav.contains(e.target)) {
        e.preventDefault();
      }
    }, { passive: false });

    elements.nav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        setTimeout(closeNav, 100);
      });
    });
  }

  function openNav() {
    isFrontendNavOpen = true;
    elements.body.classList.add('frontend-nav-open');
    elements.nav.classList.add('frontend-nav-active');
    elements.nav.setAttribute('aria-hidden', 'false');
    elements.toggle.setAttribute('aria-expanded', 'true');

    if (elements.overlay) {
      elements.overlay.style.opacity = '1';
      elements.overlay.style.visibility = 'visible';
    }

    elements.body.style.overflow = 'hidden';
    updateHamburgerIcon(true);
  }

  function closeNav() {
    isFrontendNavOpen = false;
    elements.body.classList.remove('frontend-nav-open');
    elements.nav.classList.remove('frontend-nav-active');
    elements.nav.setAttribute('aria-hidden', 'true');
    elements.toggle.setAttribute('aria-expanded', 'false');

    if (elements.overlay) {
      elements.overlay.style.opacity = '0';
      elements.overlay.style.visibility = 'hidden';
    }

    elements.body.style.overflow = '';
    updateHamburgerIcon(false);
  }

  function updateHamburgerIcon(isOpen) {
    const hamburgerLines = elements.toggle.querySelectorAll('.hamburger-line');

    if (hamburgerLines.length >= 3) {
      if (isOpen) {
        hamburgerLines[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        hamburgerLines[1].style.opacity = '0';
        hamburgerLines[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        elements.toggle.setAttribute('aria-label', 'Fechar menu de navegação');
      } else {
        hamburgerLines[0].style.transform = '';
        hamburgerLines[1].style.opacity = '';
        hamburgerLines[2].style.transform = '';
        elements.toggle.setAttribute('aria-label', 'Abrir menu de navegação');
      }
    }
  }

  function setInitialState() {
    isFrontendNavOpen = false;
    elements.body.classList.remove('frontend-nav-open');
    elements.nav.classList.remove('frontend-nav-active');
    elements.nav.classList.remove('active');
    elements.nav.setAttribute('aria-hidden', 'true');
    elements.toggle.setAttribute('aria-expanded', 'false');
    elements.body.style.overflow = '';

    if (elements.overlay) {
      elements.overlay.style.opacity = '0';
      elements.overlay.style.visibility = 'hidden';
    }

    updateHamburgerIcon(false);
  }

  function handleSwipeGestures() {
    if (!elements.nav) return;

    let touchStartX = 0;
    let touchEndX = 0;

    elements.nav.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    elements.nav.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX - touchStartX < -100 && isFrontendNavOpen) closeNav();
    }, { passive: true });
  }

  function init() {
    if (window.innerWidth > 768) return;
    if (document.body.classList.contains('admin-layout-fixed')) return;

    initFrontendMobileNav();
    handleSwipeGestures();

    setTimeout(setInitialState, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) setTimeout(init, 100);
  });
})();
