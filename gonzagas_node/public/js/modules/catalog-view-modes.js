/**
 * Catalog View Modes Module
 * Handles switching between grid and list view
 */
class CatalogViewModes {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('products-grid');
    this.gridBtn = options.gridBtn || document.getElementById('view-grid');
    this.listBtn = options.listBtn || document.getElementById('view-list');
    this.currentMode = 'grid'; // 'grid' or 'list'
    this.storageKey = 'catalog-view-mode';
    
    this.init();
  }

  init() {
    if (!this.container) {
      console.warn('CatalogViewModes: Container not found');
      return;
    }

    // Load saved preference
    const savedMode = localStorage.getItem(this.storageKey);
    if (savedMode && (savedMode === 'grid' || savedMode === 'list')) {
      this.currentMode = savedMode;
    }

    // Setup buttons
    if (this.gridBtn) {
      this.gridBtn.addEventListener('click', () => this.setMode('grid'));
    }

    if (this.listBtn) {
      this.listBtn.addEventListener('click', () => this.setMode('list'));
    }

    // Apply initial mode
    this.setMode(this.currentMode, false);
  }

  setMode(mode, animate = true) {
    if (mode !== 'grid' && mode !== 'list') {
      return;
    }

    this.currentMode = mode;
    localStorage.setItem(this.storageKey, mode);

    // Update container class
    if (animate) {
      this.container.style.opacity = '0';
      setTimeout(() => {
        this.applyMode();
        this.container.style.opacity = '1';
      }, 200);
    } else {
      this.applyMode();
    }

    // Update button states
    this.updateButtons();
  }

  applyMode() {
    // Remove all view classes first
    this.container.classList.remove('list-view', 'grid-view');
    
    if (this.currentMode === 'list') {
      this.container.classList.add('list-view');
    } else {
      this.container.classList.add('grid-view');
    }

    // Refresh grid layout
    if (window.catalogGrid) {
      setTimeout(() => {
        window.catalogGrid.refresh();
      }, 100);
    }
  }

  updateButtons() {
    if (this.gridBtn) {
      if (this.currentMode === 'grid') {
        this.gridBtn.classList.add('active');
      } else {
        this.gridBtn.classList.remove('active');
      }
    }

    if (this.listBtn) {
      if (this.currentMode === 'list') {
        this.listBtn.classList.add('active');
      } else {
        this.listBtn.classList.remove('active');
      }
    }
  }

  getCurrentMode() {
    return this.currentMode;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CatalogViewModes;
} else {
  window.CatalogViewModes = CatalogViewModes;
}

