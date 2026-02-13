/**
 * UI Components Module
 * Gonzaga's Art & Shine
 */

window.GonzagaUI = (function() {
  'use strict';

  const MODULE_NAME = 'UI';
  let isInitialized = false;
  let backToTopButton = null;
  let lightboxInstance = null;

  /**
   * Initialize Back to Top button
   */
  function initBackToTop() {
    // Remove existing button if any
    const existingBtn = document.getElementById('backToTopBtn');
    if (existingBtn) {
      existingBtn.remove();
    }

    // Create new button with enhanced SVG icon
    backToTopButton = document.createElement('button');
    backToTopButton.id = 'backToTopBtn';
    backToTopButton.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="5" r="2" fill="currentColor"/>
      </svg>
    `;
    backToTopButton.setAttribute('aria-label', 'Voltar ao topo');
    
    // Apply styles (CSS handles most styling, but ensure base styles)
    backToTopButton.className = 'back-to-top';
    Object.assign(backToTopButton.style, {
      position: 'fixed',
      bottom: window.innerWidth <= 768 ? '20px' : '30px',
      right: window.innerWidth <= 768 ? '20px' : '30px',
      width: window.innerWidth <= 768 ? '42px' : '45px',
      height: window.innerWidth <= 768 ? '42px' : '45px',
      background: 'linear-gradient(135deg, var(--color-highlight, #C0C0C0), var(--color-accent, #A8A8A8))',
      color: 'var(--color-primary, #1e1e1e)',
      border: '2px solid rgba(192, 192, 192, 0.35)',
      borderRadius: '50%',
      padding: '0',
      gap: '0',
      cursor: 'pointer',
      opacity: '0',
      visibility: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
      zIndex: '1020',
      boxShadow: '0 6px 25px rgba(192, 192, 192, 0.3), 0 0 0 0 rgba(192, 192, 192, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: 'translateY(20px) scale(0.8)',
      overflow: 'hidden'
    });

    document.body.appendChild(backToTopButton);

    // Hover effects are handled by CSS, but add smooth transitions
    backToTopButton.addEventListener('mouseenter', () => {
      backToTopButton.style.transform = 'translateY(-5px) scale(1.1)';
      backToTopButton.style.boxShadow = '0 8px 30px rgba(192, 192, 192, 0.35), 0 0 0 8px rgba(192, 192, 192, 0.12)';
      backToTopButton.style.borderColor = 'var(--color-highlight, #C0C0C0)';
    });

    backToTopButton.addEventListener('mouseleave', () => {
      if (backToTopButton.classList.contains('visible')) {
        backToTopButton.style.transform = 'translateY(0) scale(1)';
      } else {
        backToTopButton.style.transform = 'translateY(20px) scale(0.8)';
      }
      backToTopButton.style.boxShadow = '0 4px 20px rgba(192, 192, 192, 0.35), 0 0 0 0 rgba(192, 192, 192, 0.35)';
      backToTopButton.style.borderColor = 'rgba(192, 192, 192, 0.35)';
    });

    // Click event with smooth scroll
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      // Add haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    });

    // Scroll detection
    const toggleBackToTop = GonzagaUtils.throttle(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > 300) {
        backToTopButton.classList.add('visible');
        backToTopButton.style.opacity = '1';
        backToTopButton.style.visibility = 'visible';
        backToTopButton.style.transform = 'translateY(0) scale(1)';
      } else {
        backToTopButton.classList.remove('visible');
        backToTopButton.style.opacity = '0';
        backToTopButton.style.visibility = 'hidden';
        backToTopButton.style.transform = 'translateY(20px) scale(0.8)';
      }
    }, 100);

    window.addEventListener('scroll', toggleBackToTop);
    toggleBackToTop(); // Initial check

    GonzagaUtils.log(MODULE_NAME, 'Back to top button initialized');
  }

  /**
   * Initialize GLightbox
   * @param {Object} config - Custom lightbox configuration
   */
  function initLightbox(config = {}) {
    if (typeof GLightbox === 'undefined') {
      GonzagaUtils.log(MODULE_NAME, 'GLightbox not available');
      return;
    }

    const defaultConfig = {
      selector: '[data-lightbox]',
      touchNavigation: true,
      loop: true,
      autoplayVideos: false,
      zoomable: true,
      draggable: true,
      plyr: {
        css: 'https://cdn.plyr.io/3.6.8/plyr.css',
        js: 'https://cdn.plyr.io/3.6.8/plyr.js'
      }
    };

    try {
      lightboxInstance = GLightbox({ ...defaultConfig, ...config });
      GonzagaUtils.log(MODULE_NAME, 'Lightbox initialized successfully');
    } catch (error) {
      GonzagaUtils.handleError(MODULE_NAME, error, 'Lightbox initialization failed');
    }
  }

  /**
   * Show loading overlay
   * @param {string} message - Loading message
   * @param {number} duration - Auto-hide duration (0 = manual hide)
   */
  function showLoading(message = 'Carregando...', duration = 0) {
    let overlay = document.getElementById('loadingOverlay');
    
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loadingOverlay';
      overlay.innerHTML = `
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <div class="loading-text">${message}</div>
        </div>
      `;
      
      Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(44, 24, 16, 0.95)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '9999',
        backdropFilter: 'blur(5px)'
      });

      document.body.appendChild(overlay);
    } else {
      overlay.querySelector('.loading-text').textContent = message;
      overlay.style.display = 'flex';
    }

    if (duration > 0) {
      setTimeout(() => hideLoading(), duration);
    }

    GonzagaUtils.log(MODULE_NAME, `Loading overlay shown: ${message}`);
  }

  /**
   * Hide loading overlay
   */
  function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = 'none';
      GonzagaUtils.log(MODULE_NAME, 'Loading overlay hidden');
    }
  }

  /**
   * Show notification toast
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, warning, info)
   * @param {number} duration - Auto-hide duration
   */
  function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" aria-label="Fechar">×</button>
      </div>
    `;

    // Styles
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#4f5b66',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: '10000',
      transform: 'translateX(400px)',
      transition: 'transform 0.3s ease'
    });

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      removeNotification(notification);
    });

    // Auto-hide
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(notification);
      }, duration);
    }

    GonzagaUtils.log(MODULE_NAME, `Notification shown: ${type} - ${message}`);
  }

  /**
   * Remove notification
   * @param {Element} notification - Notification element to remove
   */
  function removeNotification(notification) {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * Initialize video backgrounds
   */
  function initVideoBackground() {
    const videoElements = document.querySelectorAll('.video-background');
    
    videoElements.forEach(video => {
      // Set poster based on screen size
      function setPoster() {
        const isMobile = window.innerWidth <= 768;
        const mobilePoster = video.dataset.posterMobile;
        const desktopPoster = video.poster;
        
        if (isMobile && mobilePoster) {
          video.poster = mobilePoster;
        } else if (!isMobile && desktopPoster) {
          video.poster = desktopPoster;
        }
      }

      setPoster();
      window.addEventListener('resize', GonzagaUtils.debounce(setPoster, 250));

      // Lazy loading for video
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              video.play().catch(error => {
                GonzagaUtils.handleError(MODULE_NAME, error, 'Video autoplay failed');
              });
              observer.disconnect();
            }
          });
        });
        observer.observe(video);
      }
    });

    GonzagaUtils.log(MODULE_NAME, `${videoElements.length} video backgrounds initialized`);
  }

  /**
   * Initialize all UI components
   */
  function init() {
    if (isInitialized) {
      GonzagaUtils.log(MODULE_NAME, 'Already initialized');
      return;
    }

    try {
      initBackToTop();
      initLightbox();
      initVideoBackground();
      
      isInitialized = true;
      GonzagaUtils.log(MODULE_NAME, 'UI module initialized successfully');
    } catch (error) {
      GonzagaUtils.handleError(MODULE_NAME, error, 'Initialization failed');
    }
  }

  /**
   * Destroy UI components
   */
  function destroy() {
    // Remove back to top button
    if (backToTopButton && backToTopButton.parentNode) {
      backToTopButton.parentNode.removeChild(backToTopButton);
      backToTopButton = null;
    }

    // Destroy lightbox
    if (lightboxInstance && typeof lightboxInstance.destroy === 'function') {
      lightboxInstance.destroy();
      lightboxInstance = null;
    }

    // Remove loading overlay
    hideLoading();

    // Remove all notifications
    document.querySelectorAll('.notification').forEach(notification => {
      removeNotification(notification);
    });

    isInitialized = false;
    GonzagaUtils.log(MODULE_NAME, 'UI module destroyed');
  }

  // Public API
  return {
    init,
    destroy,
    initLightbox,
    showLoading,
    hideLoading,
    showNotification,
    isInitialized: () => isInitialized
  };
})(); 