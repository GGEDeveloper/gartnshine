/**
 * Catalog Grid Module
 * Handles grid layout, masonry, and responsive adjustments
 */
class CatalogGrid {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('products-grid');
    this.masonryEnabled = options.masonryEnabled !== false;
    this._resizeTimer = null;

    this.init();
  }

  init() {
    if (!this.container) {
      console.warn('CatalogGrid: Container not found');
      return;
    }

    this.setupGrid();
    window.addEventListener('resize', () => this.handleResize());
  }

  setupGrid() {
    // As colunas são responsabilidade do CSS (`.products-grid.grid-view`, que
    // usa `auto-fill` + `--card-min`). Este módulo escrevia
    // `style="grid-template-columns: repeat(N, 1fr)"` a partir de breakpoints
    // próprios (576/992) e contagens fixas (1/2/4): um estilo inline ganha a
    // qualquer folha de estilo, por isso o catálogo ficava com UMA coluna em
    // telemóvel independentemente do que o CSS dissesse, e havia duas
    // definições de "responsivo" a contradizerem-se.
    //
    // Se algum dia for mesmo preciso saber quantas colunas estão a ser
    // desenhadas, lê-se do layout já calculado — não se impõe.
    this.container.style.removeProperty('grid-template-columns');
    const colunas = getComputedStyle(this.container).gridTemplateColumns;
    this.container.dataset.columns = colunas ? colunas.split(' ').length : '';

    // O masonry continua a ser decisão de JS (depende das proporções reais
    // das imagens), mas só a partir do tier largo.
    if (this.masonryEnabled && window.matchMedia('(min-width: 1024px)').matches) {
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
    
    // Remove any grid-row spans that were applied
    const items = this.container.querySelectorAll('.product-item');
    items.forEach(item => {
      item.style.gridRow = '';
    });
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
      // Remove any grid-row span that might have been set previously
      item.style.gridRow = '';
      
      // Only apply masonry span if masonry is explicitly enabled
      // and we're in masonry mode
      if (this.masonryEnabled && this.container.classList.contains('masonry-grid')) {
        const img = item.querySelector('.product-image');
        if (img && img.complete) {
          const aspectRatio = img.naturalHeight / img.naturalWidth;
          // Only span 2 rows for very tall images in masonry mode
          if (aspectRatio > 1.5) {
            item.style.gridRow = 'span 2';
          }
        }
      }
    });
  }

  handleResize() {
    // `resizeTimer` era uma variável LOCAL: era criada de novo a cada evento,
    // por isso o `clearTimeout` nunca cancelava nada e o debounce não
    // existia — cada pixel de redimensionamento agendava um `setupGrid`.
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => this.setupGrid(), 250);
  }

  refresh() {
    this.setupGrid();
    if (this.masonryEnabled) {
      setTimeout(() => {
        this.adjustMasonryItems();
      }, 100);
    }
  }

  /* `setColumns()` foi removido: a contagem de colunas passou a ser
     determinada pelo CSS (--card-min / --card-min-md / --card-min-lg).
     Para mudar a densidade da grelha, mudam-se esses tokens. */
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CatalogGrid;
} else {
  window.CatalogGrid = CatalogGrid;
}

