/**
 * Catalog Grid Module
 * Handles grid layout, masonry, and responsive adjustments
 */
class CatalogGrid {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('products-grid');
    this.masonryEnabled = options.masonryEnabled !== false;
    this.columns = {
      mobile: 1,
      tablet: 2,
      desktop: 4
    };
    
    this.init();
  }

  init() {
    if (!this.container) {
      console.warn('CatalogGrid: Container not found');
      return;
    }

    this.setupGrid();
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  setupGrid() {
    const width = window.innerWidth;
    let columns;

    if (width < 576) {
      columns = this.columns.mobile;
    } else if (width < 992) {
      columns = this.columns.tablet;
    } else {
      columns = this.columns.desktop;
    }

    this.container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    this.container.dataset.columns = columns;

    // Apply masonry if enabled
    if (this.masonryEnabled && width >= 992) {
      this.applyMasonry();
    } else {
      this.removeMasonry();
    }
  }

  applyMasonry() {
    if (this.container.classList.contains('masonry-grid')) {
      return;
    }

    this.container.classList.add('masonry-grid');
    
    // Use CSS Grid with auto-rows for masonry effect
    this.container.style.gridAutoRows = 'minmax(100px, auto)';
    this.container.style.gridAutoFlow = 'row dense';

    // Adjust items after images load
    this.adjustMasonryItems();
  }

  removeMasonry() {
    this.container.classList.remove('masonry-grid');
    this.container.style.gridAutoRows = '';
    this.container.style.gridAutoFlow = '';
  }

  adjustMasonryItems() {
    const items = this.container.querySelectorAll('.product-item');
    if (items.length === 0) return;

    // Wait for images to load
    const images = this.container.querySelectorAll('.product-image');
    let loadedCount = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      this.positionItems();
      return;
    }

    images.forEach(img => {
      if (img.complete) {
        loadedCount++;
        if (loadedCount === totalImages) {
          this.positionItems();
        }
      } else {
        img.addEventListener('load', () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            this.positionItems();
          }
        });
      }
    });
  }

  positionItems() {
    // Simple masonry positioning using CSS Grid
    // More advanced positioning can be added if needed
    const items = this.container.querySelectorAll('.product-item');
    items.forEach((item, index) => {
      const img = item.querySelector('.product-image');
      if (img && img.complete) {
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        if (aspectRatio > 1.2) {
          // Tall images span 2 rows
          item.style.gridRow = 'span 2';
        }
      }
    });
  }

  handleResize() {
    let resizeTimer;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      this.setupGrid();
    }, 250);
  }

  refresh() {
    this.setupGrid();
    if (this.masonryEnabled) {
      setTimeout(() => {
        this.adjustMasonryItems();
      }, 100);
    }
  }

  setColumns(mobile, tablet, desktop) {
    this.columns = { mobile, tablet, desktop };
    this.setupGrid();
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CatalogGrid;
} else {
  window.CatalogGrid = CatalogGrid;
}

