// Function to load scripts
function loadScript(src) {
  return new Promise(function(resolve, reject) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  'use strict';
  
  try {
    // Show content
    document.body.classList.add('loaded');
    
    // Hide preloader
    var preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      setTimeout(function() {
        preloader.style.display = 'none';
      }, 500);
    }
    
    // First load admin.js
    loadScript('/js/admin.js')
      .then(function() {
        // Then load custom JS if specified
        if (window.customJs) {
          return loadScript('/js/' + window.customJs + '.js');
        }
      })
      .catch(function(error) {
        console.error('Error loading scripts:', error);
      });
      
  } catch (error) {
    console.error('Error initializing admin interface:', error);
  }
});
