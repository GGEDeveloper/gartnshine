/**
 * Main JavaScript for Gonzaga's Art & Shine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initNavigation();
  initProductAnimations();
  initGalleryItems();
  initVideoBackground();
  initCatalogFilters();
  initCatalogView();
  initProductDetails();
});

/**
 * Navigation
 */
function initNavigation() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  // Mobile menu toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      
      // Transform hamburger to X
      const spans = menuToggle.querySelectorAll('span');
      if (spans.length >= 3) {
        spans[0].classList.toggle('rotate-45');
        spans[0].classList.toggle('translate-y-2.5');
        spans[1].classList.toggle('opacity-0');
        spans[2].classList.toggle('-rotate-45');
        spans[2].classList.toggle('-translate-y-2.5');
      }
    });
  }

  // Dropdown menus
  if (dropdownToggles) {
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const parent = toggle.parentElement;
        
        // Se o link tiver um href e não for apenas '#', permite a navegação
        if (toggle.getAttribute('href') && toggle.getAttribute('href') !== '#') {
          return; // Permite o comportamento padrão do link
        }
        
        e.preventDefault();
        
        // Fecha todos os outros dropdowns
        document.querySelectorAll('.dropdown').forEach(item => {
          if (item !== parent) item.classList.remove('open');
        });
        
        // Toggle this dropdown
        parent.classList.toggle('open');
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown').forEach(item => {
          item.classList.remove('open');
        });
      }
    });
  }

  // Highlight active nav item based on current page
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.includes(href) && href !== '/') {
      link.classList.add('active');
    } else if (href === '/' && (currentPath === '/' || currentPath === '/index.html')) {
      link.classList.add('active');
    }
  });
}

/**
 * Product Animations 
 */
function initProductAnimations() {
  // Set up intersection observer for product cards
  const productCards = document.querySelectorAll('.product-card, .collection-card');
  
  if (productCards.length > 0) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, Math.random() * 300); // Staggered animation
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    productCards.forEach(card => {
      observer.observe(card);
    });
  }
}

/**
 * Gallery Items
 */
function initGalleryItems() {
  // Set up intersection observer for gallery items
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (galleryItems.length > 0) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, Math.random() * 400); // Staggered animation
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    galleryItems.forEach(item => {
      observer.observe(item);
    });
  }
}

/**
 * Video Background
 */
function initVideoBackground() {
  const videos = document.querySelectorAll('.hero-video, .brand-video');
  
  videos.forEach(video => {
    if (video) {
      // Mute the video
      video.muted = true;
      
      // Play when loaded
      video.addEventListener('loadeddata', () => {
        video.play().catch(error => {
          console.warn('Auto-play was prevented:', error);
          
          // Create a play button as fallback
          const playBtn = document.createElement('button');
          playBtn.className = 'video-play-btn';
          playBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>';
          video.parentNode.appendChild(playBtn);
          
          playBtn.addEventListener('click', () => {
            video.play();
            playBtn.style.display = 'none';
          });
        });
      });
      
      // Loop the video
      video.loop = true;
    }
  });
}

/**
 * Catalog Filters
 */
function initCatalogFilters() {
  const filtersToggle = document.querySelector('.filters-mobile-toggle');
  const filtersContainer = document.querySelector('.catalog-filters');
  const clearFiltersBtn = document.querySelector('.filters-clear');
  
  // Mobile filters toggle
  if (filtersToggle && filtersContainer) {
    filtersToggle.addEventListener('click', () => {
      filtersContainer.classList.toggle('active');
    });
  }
  
  // Clear filters
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      document.querySelectorAll('.filter-select').forEach(select => {
        select.selectedIndex = 0;
      });
      
      document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      document.querySelectorAll('.price-input, .price-slider').forEach(input => {
        input.value = input.defaultValue;
      });
      
      // Trigger change event to update products
      const event = new Event('change');
      document.querySelector('.filter-select')?.dispatchEvent(event);
    });
  }
  
  // Handle filter changes
  const filterInputs = document.querySelectorAll('.filter-select, .filter-checkbox, .price-input, .price-slider');
  
  filterInputs.forEach(input => {
    input.addEventListener('change', () => {
      // Here you would normally fetch filtered products from the server
      // For a static demo, we'll just add a loading state and then remove it
      const productsContainer = document.querySelector('.catalog-grid');
      
      if (productsContainer) {
        productsContainer.classList.add('loading');
        
        setTimeout(() => {
          productsContainer.classList.remove('loading');
        }, 800);
      }
    });
  });
}

/**
 * Catalog View Switcher
 */
function initCatalogView() {
  const gridViewBtn = document.querySelector('.view-option[data-view="grid"]');
  const listViewBtn = document.querySelector('.view-option[data-view="list"]');
  const catalogGrid = document.querySelector('.catalog-grid');
  
  if (gridViewBtn && listViewBtn && catalogGrid) {
    // Grid view
    gridViewBtn.addEventListener('click', () => {
      listViewBtn.classList.remove('active');
      gridViewBtn.classList.add('active');
      catalogGrid.classList.remove('list-view');
      
      // Save preference
      localStorage.setItem('catalog-view', 'grid');
    });
    
    // List view
    listViewBtn.addEventListener('click', () => {
      gridViewBtn.classList.remove('active');
      listViewBtn.classList.add('active');
      catalogGrid.classList.add('list-view');
      
      // Save preference
      localStorage.setItem('catalog-view', 'list');
    });
    
    // Load saved preference
    const savedView = localStorage.getItem('catalog-view');
    if (savedView === 'list') {
      listViewBtn.click();
    }
  }
}

/**
 * Product Details Page
 */
function initProductDetails() {
  const mainImage = document.querySelector('.main-image img');
  const thumbnails = document.querySelectorAll('.thumbnail');
  
  if (mainImage && thumbnails.length > 0) {
    // Thumbnail click
    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', () => {
        // Update main image
        const newSrc = thumb.querySelector('img').getAttribute('src');
        mainImage.setAttribute('src', newSrc);
        
        // Update active thumbnail
        thumbnails.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }
  
  // Favorite button
  const favoriteBtn = document.querySelector('.product-favorite');
  
  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', () => {
      favoriteBtn.classList.toggle('active');
      
      // Animation
      if (favoriteBtn.classList.contains('active')) {
        favoriteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
      } else {
        favoriteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
      }
    });
  }
}

/**
 * Helper Functions
 */

// Scroll to element smoothly
function scrollToElement(element, offset = 0) {
  const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
  window.scrollTo({top: y, behavior: 'smooth'});
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

// Debounce function for performance
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Load more products (for infinite scrolling)
function loadMoreProducts() {
  const productsContainer = document.querySelector('.catalog-grid');
  const loadingIndicator = document.querySelector('.loading-placeholder');
  
  if (productsContainer && loadingIndicator) {
    loadingIndicator.style.display = 'flex';
    
    // Simulate loading delay
    setTimeout(() => {
      // In a real app, you'd fetch products from the server here
      loadingIndicator.style.display = 'none';
      
      // Initialize animations for new products
      initProductAnimations();
    }, 1000);
  }
}