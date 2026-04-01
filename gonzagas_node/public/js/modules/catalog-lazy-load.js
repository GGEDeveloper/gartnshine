/**
 * Catalog Lazy Loading Module
 * Implements lazy loading for product images using Intersection Observer
 */
class CatalogLazyLoad {
  constructor(options = {}) {
    this.imageSelector = options.imageSelector || '.product-image.lazy-load';
    this.skeletonClass = options.skeletonClass || 'image-skeleton';
    this.loadedClass = options.loadedClass || 'lazy-loaded';
    this.rootMargin = options.rootMargin || '50px';
    this.threshold = options.threshold || 0.01;
    this.observer = null;
    this.images = [];
    
    this.init();
  }

  init() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, loading all images');
      this.loadAllImages();
      return;
    }

    this.createObserver();
    this.observeImages();
  }

  createObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.rootMargin,
      threshold: this.threshold
    });
  }

  observeImages() {
    this.images = Array.from(document.querySelectorAll(this.imageSelector));
    
    // CRITICAL FIX: Load ALL images immediately, not just viewport ones
    // This ensures all product images are visible from the start
    console.log('Loading all', this.images.length, 'product images immediately...');
    
    this.images.forEach(img => {
      // Set src immediately if using data-src
      if (img.dataset.src && !img.src) {
        img.src = img.dataset.src;
      }
      
      // Ensure image is visible and properly styled
      img.style.opacity = '1';
      img.style.visibility = 'visible';
      img.style.display = 'block';
      
      // If image already loaded, mark as loaded
      if (img.complete && img.naturalHeight !== 0) {
        img.classList.add(this.loadedClass);
        this.removeSkeleton(img);
        return;
      }
      
      // Load the image (this will handle the loading and styling)
      this.loadImage(img);
      
      // Also observe for when it comes into view (for any additional processing)
      if (this.observer) {
        this.observer.observe(img);
      }
    });
  }

  addSkeleton(img) {
    if (img.classList.contains(this.loadedClass)) {
      return;
    }

    // Create skeleton overlay
    const skeleton = document.createElement('div');
    skeleton.className = this.skeletonClass;
    skeleton.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        rgba(30, 30, 30, 0.3) 0%, 
        rgba(50, 50, 50, 0.5) 50%, 
        rgba(30, 30, 30, 0.3) 100%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s ease-in-out infinite;
      z-index: 1;
    `;

    const container = img.parentElement;
    if (container && container.style.position !== 'relative') {
      container.style.position = 'relative';
    }

    container.appendChild(skeleton);
    img.dataset.skeletonId = skeleton.className + '-' + Date.now();
  }

  loadImage(img) {
    const dataSrc = img.dataset.src || img.getAttribute('data-src');
    const src = img.src || img.getAttribute('src');

    if (!dataSrc && !src) {
      console.warn('No image source found for image:', img);
      this.removeSkeleton(img);
      // Set placeholder
      img.src = '/images/imagem-nao-disponivel.svg';
      img.style.opacity = '1';
      img.style.visibility = 'visible';
      img.style.display = 'block';
      img.style.zIndex = '2';
      return;
    }

    const imageSrc = dataSrc || src;

    // Set src immediately to ensure image loads
    if (dataSrc && !img.src) {
      img.src = imageSrc;
    }

    // Ensure image is visible immediately
    img.style.opacity = '1';
    img.style.visibility = 'visible';
    img.style.display = 'block';

    // If image already loaded, just remove skeleton and mark as loaded
    if (img.complete && img.naturalHeight !== 0) {
      img.classList.add(this.loadedClass);
      this.removeSkeleton(img);
      return;
    }

    // Create new image to preload (for better error handling)
    const newImg = new Image();

    newImg.onload = () => {
      // Ensure src is set
      if (!img.src || img.src !== imageSrc) {
        img.src = imageSrc;
      }
      img.classList.add(this.loadedClass);
      this.removeSkeleton(img);
      
      // Ensure visibility
      img.style.opacity = '1';
      img.style.visibility = 'visible';
      img.style.display = 'block';
    };

    newImg.onerror = () => {
      console.error('Error loading image:', imageSrc);
      img.src = '/images/imagem-nao-disponivel.svg';
      img.classList.add(this.loadedClass);
      this.removeSkeleton(img);
      img.style.opacity = '1';
      img.style.visibility = 'visible';
      img.style.display = 'block';
    };

    newImg.src = imageSrc;
  }

  removeSkeleton(img) {
    const container = img.parentElement;
    if (container) {
      const skeletons = container.querySelectorAll('.' + this.skeletonClass);
      skeletons.forEach(skeleton => {
        skeleton.style.transition = 'opacity 0.3s ease';
        skeleton.style.opacity = '0';
        setTimeout(() => {
          skeleton.remove();
        }, 300);
      });
    }
  }

  loadAllImages() {
    this.images.forEach(img => {
      const dataSrc = img.dataset.src || img.getAttribute('data-src');
      if (dataSrc) {
        img.src = dataSrc;
        img.classList.add(this.loadedClass);
      }
    });
  }

  refresh() {
    // Re-observe images after DOM update
    if (this.observer) {
      this.observer.disconnect();
    }
    this.observeImages();
  }
}

// Add skeleton animation CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes skeleton-loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CatalogLazyLoad;
} else {
  window.CatalogLazyLoad = CatalogLazyLoad;
}

