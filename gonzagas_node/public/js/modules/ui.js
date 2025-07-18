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

    // Create new button
    backToTopButton = document.createElement('button');
    backToTopButton.id = 'backToTopBtn';
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.setAttribute('aria-label', 'Voltar ao topo');
    
    // Apply styles
    Object.assign(backToTopButton.style, {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '50px',
      height: '50px',
      background: 'linear-gradient(135deg, #d4af37, #f4e4a6)',
      color: '#2c1810',
      border: 'none',
      borderRadius: '50%',
      fontSize: '18px',
      cursor: 'pointer',
      opacity: '0',
      visibility: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
      zIndex: '1000',
      boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)'
    });

    document.body.appendChild(backToTopButton);

    // Add hover effects
    backToTopButton.addEventListener('mouseenter', () => {
      backToTopButton.style.transform = 'scale(1.1) translateY(-2px)';
      backToTopButton.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.4)';
    });

    backToTopButton.addEventListener('mouseleave', () => {
      backToTopButton.style.transform = 'scale(1) translateY(0)';
      backToTopButton.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.3)';
    });

    // Click event
    backToTopButton.addEventListener('click', () => {
      GonzagaUtils.smoothScrollTo(document.body);
    });

    // Scroll detection
    const toggleBackToTop = GonzagaUtils.throttle(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > 300) {
        backToTopButton.style.opacity = '1';
        backToTopButton.style.visibility = 'visible';
      } else {
        backToTopButton.style.opacity = '0';
        backToTopButton.style.visibility = 'hidden';
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
      background: type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#2196f3',
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