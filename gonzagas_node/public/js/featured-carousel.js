/**
 * Featured Carousel JavaScript
 * Gonzaga's Art & Shine
 */

(function() {
  'use strict';

  function initFeaturedCarousel() {
    console.log('[Featured Carousel] Initializing...');
    
    const carousel = document.querySelector('.featured-carousel');
    
    if (!carousel) {
      console.log('[Featured Carousel] Carousel element not found');
      return;
    }

    // Check if Slick is available
    if (typeof $ === 'undefined' || !$.fn.slick) {
      console.error('[Featured Carousel] jQuery or Slick not available');
      return;
    }

    // Destroy existing carousel if it exists
    if ($(carousel).hasClass('slick-initialized')) {
      $(carousel).slick('unslick');
    }

    // Initialize Slick carousel with responsive settings
    $(carousel).slick({
      // Desktop settings (default)
      slidesToShow: 4,
      slidesToScroll: 1,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 4000,
      speed: 600,
      arrows: true,
      dots: true,
      cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
      
      // Responsive breakpoints
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            infinite: true,
            dots: true,
            arrows: true
          }
        },
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            infinite: true,
            dots: true,
            arrows: false
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            infinite: true,
            dots: true,
            arrows: false,
            autoplay: true,
            autoplaySpeed: 3500,
            centerMode: false,
            variableWidth: false
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            infinite: true,
            dots: true,
            arrows: false,
            autoplay: true,
            autoplaySpeed: 3000,
            centerMode: false,
            variableWidth: false
          }
        }
      ]
    });

    // Custom event handlers
    $(carousel).on('afterChange', function(event, slick, currentSlide) {
      console.log('[Featured Carousel] Slide changed to:', currentSlide);
    });

    $(carousel).on('beforeChange', function(event, slick, currentSlide, nextSlide) {
      // Add smooth transition effects
      const slides = $(carousel).find('.slick-slide');
      slides.removeClass('slick-current-visible');
      
      setTimeout(function() {
        slides.eq(nextSlide).addClass('slick-current-visible');
      }, 100);
    });

    // Handle window resize
    let resizeTimeout;
    $(window).on('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        if ($(carousel).hasClass('slick-initialized')) {
          $(carousel).slick('refresh');
          console.log('[Featured Carousel] Refreshed after resize');
        }
      }, 250);
    });

    // Pause autoplay on hover (desktop only)
    if (window.innerWidth > 768) {
      $(carousel).on('mouseenter', function() {
        $(this).slick('slickPause');
      }).on('mouseleave', function() {
        $(this).slick('slickPlay');
      });
    }

    // Touch/swipe improvements for mobile
    if ('ontouchstart' in window) {
      let startX = 0;
      let startY = 0;
      let startTime = 0;
      
      $(carousel).on('touchstart', function(e) {
        const touch = e.originalEvent.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startTime = Date.now();
      });
      
      $(carousel).on('touchend', function(e) {
        const touch = e.originalEvent.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        const endTime = Date.now();
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const deltaTime = endTime - startTime;
        
        // Minimum swipe distance and maximum time
        if (Math.abs(deltaX) > 50 && deltaTime < 300) {
          // Prevent vertical scrolling during horizontal swipe
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            e.preventDefault();
          }
        }
      });
    }

    console.log('[Featured Carousel] Initialization complete');
  }

  // Public API
  window.FeaturedCarousel = {
    init: initFeaturedCarousel,
    refresh: function() {
      const carousel = document.querySelector('.featured-carousel');
      if (carousel && $(carousel).hasClass('slick-initialized')) {
        $(carousel).slick('refresh');
      }
    },
    destroy: function() {
      const carousel = document.querySelector('.featured-carousel');
      if (carousel && $(carousel).hasClass('slick-initialized')) {
        $(carousel).slick('unslick');
      }
    }
  };

  // Initialize when DOM is ready and Slick is available
  function checkAndInit() {
    if (typeof $ !== 'undefined' && $.fn.slick) {
      initFeaturedCarousel();
    } else {
      console.log('[Featured Carousel] Waiting for dependencies...');
      setTimeout(checkAndInit, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndInit);
  } else {
    checkAndInit();
  }

  console.log('[Featured Carousel] Script loaded');
})(); 