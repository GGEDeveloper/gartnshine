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
    
    if (this.images.length === 0) {
      return;
    }

    this.images.forEach(img => {
      // Add skeleton placeholder
      this.addSkeleton(img);
      
      // Start observing
      this.observer.observe(img);
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
      console.warn('No image source found');
      return;
    }

    const imageSrc = dataSrc || src;

    // Create new image to preload
    const newImg = new Image();
    
    newImg.onload = () => {
      // Update src
      img.src = imageSrc;
      img.classList.add(this.loadedClass);
      
      // Remove skeleton
      this.removeSkeleton(img);
      
      // Fade in
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        img.style.opacity = '1';
      }, 10);
    };

    newImg.onerror = () => {
      console.error('Error loading image:', imageSrc);
      img.src = '/images/placeholder-image.png';
      img.classList.add(this.loadedClass);
      this.removeSkeleton(img);
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

