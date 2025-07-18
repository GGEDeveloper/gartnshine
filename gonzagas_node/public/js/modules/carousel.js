/**
 * Carousel Module
 * Gonzaga's Art & Shine
 */

window.GonzagaCarousel = (function() {
  'use strict';

  const MODULE_NAME = 'Carousel';
  let isInitialized = false;
  let carouselInstances = new Map();

  /**
   * Default carousel configuration
   */
  const DEFAULT_CONFIG = {
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    dots: true,
    swipeToSlide: true,
    touchMove: true,
    draggable: true,
    accessibility: true,
    pauseOnHover: true,
    pauseOnFocus: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          centerMode: true,
          centerPadding: '60px'
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          centerMode: true,
          centerPadding: '40px'
        }
      }
    ]
  };

  /**
   * Initialize featured products carousel
   */
  function initFeaturedCarousel() {
    const carouselElement = document.querySelector('.featured-carousel');
    
    if (!carouselElement) {
      GonzagaUtils.log(MODULE_NAME, 'Featured carousel element not found');
      return false;
    }

    if (!GonzagaUtils.jQueryReady() || typeof $.fn.slick === 'undefined') {
      GonzagaUtils.log(MODULE_NAME, 'jQuery or Slick not ready, retrying...');
      setTimeout(initFeaturedCarousel, 200);
      return false;
    }

    try {
      const $carousel = $(carouselElement);
      $carousel.slick(DEFAULT_CONFIG);
      
      carouselInstances.set('featured', $carousel);
      GonzagaUtils.log(MODULE_NAME, 'Featured carousel initialized successfully');
      return true;
    } catch (error) {
      GonzagaUtils.handleError(MODULE_NAME, error, 'Featured carousel initialization failed');
      return false;
    }
  }

  /**
   * Initialize custom carousel with specific config
   * @param {string} selector - Carousel selector
   * @param {Object} config - Custom configuration
   * @param {string} instanceName - Instance name for tracking
   */
  function initCustomCarousel(selector, config = {}, instanceName = null) {
    const carouselElement = document.querySelector(selector);
    
    if (!carouselElement) {
      GonzagaUtils.log(MODULE_NAME, `Carousel element ${selector} not found`);
      return false;
    }

    if (!GonzagaUtils.jQueryReady() || typeof $.fn.slick === 'undefined') {
      GonzagaUtils.log(MODULE_NAME, 'jQuery or Slick not ready for custom carousel');
      return false;
    }

    try {
      const mergedConfig = { ...DEFAULT_CONFIG, ...config };
      const $carousel = $(carouselElement);
      $carousel.slick(mergedConfig);
      
      const name = instanceName || selector.replace(/[^a-zA-Z0-9]/g, '');
      carouselInstances.set(name, $carousel);
      
      GonzagaUtils.log(MODULE_NAME, `Custom carousel ${name} initialized`);
      return true;
    } catch (error) {
      GonzagaUtils.handleError(MODULE_NAME, error, `Custom carousel ${selector} initialization failed`);
      return false;
    }
  }

  /**
   * Destroy carousel instance
   * @param {string} instanceName - Instance name to destroy
   */
  function destroyCarousel(instanceName) {
    const carousel = carouselInstances.get(instanceName);
    if (carousel) {
      try {
        carousel.slick('unslick');
        carouselInstances.delete(instanceName);
        GonzagaUtils.log(MODULE_NAME, `Carousel ${instanceName} destroyed`);
      } catch (error) {
        GonzagaUtils.handleError(MODULE_NAME, error, `Failed to destroy carousel ${instanceName}`);
      }
    }
  }

  /**
   * Refresh carousel (useful after dynamic content changes)
   * @param {string} instanceName - Instance name to refresh
   */
  function refreshCarousel(instanceName) {
    const carousel = carouselInstances.get(instanceName);
    if (carousel) {
      try {
        carousel.slick('refresh');
        GonzagaUtils.log(MODULE_NAME, `Carousel ${instanceName} refreshed`);
      } catch (error) {
        GonzagaUtils.handleError(MODULE_NAME, error, `Failed to refresh carousel ${instanceName}`);
      }
    }
  }

  /**
   * Go to specific slide
   * @param {string} instanceName - Instance name
   * @param {number} slideIndex - Slide index to go to
   */
  function goToSlide(instanceName, slideIndex) {
    const carousel = carouselInstances.get(instanceName);
    if (carousel) {
      try {
        carousel.slick('slickGoTo', slideIndex);
        GonzagaUtils.log(MODULE_NAME, `Carousel ${instanceName} went to slide ${slideIndex}`);
      } catch (error) {
        GonzagaUtils.handleError(MODULE_NAME, error, `Failed to go to slide ${slideIndex}`);
      }
    }
  }

  /**
   * Initialize all carousels
   */
  function init() {
    if (isInitialized) {
      GonzagaUtils.log(MODULE_NAME, 'Already initialized');
      return;
    }

    try {
      // Initialize featured carousel if it exists
      initFeaturedCarousel();
      
      isInitialized = true;
      GonzagaUtils.log(MODULE_NAME, 'Carousel module initialized successfully');
    } catch (error) {
      GonzagaUtils.handleError(MODULE_NAME, error, 'Initialization failed');
    }
  }

  /**
   * Destroy all carousels
   */
  function destroy() {
    carouselInstances.forEach((carousel, name) => {
      destroyCarousel(name);
    });
    
    isInitialized = false;
    GonzagaUtils.log(MODULE_NAME, 'All carousels destroyed');
  }

  /**
   * Get carousel instance
   * @param {string} instanceName - Instance name
   * @returns {Object|null} Carousel instance
   */
  function getInstance(instanceName) {
    return carouselInstances.get(instanceName) || null;
  }

  // Public API
  return {
    init,
    destroy,
    initCustomCarousel,
    destroyCarousel,
    refreshCarousel,
    goToSlide,
    getInstance,
    isInitialized: () => isInitialized
  };
})(); 