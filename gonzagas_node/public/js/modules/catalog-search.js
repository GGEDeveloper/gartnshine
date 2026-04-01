/**
 * Catalog Search Module
 * Handles search functionality within catalog
 */
class CatalogSearch {
  constructor(options = {}) {
    this.searchInput = options.searchInput || document.getElementById('catalog-search');
    this.container = options.container || document.getElementById('products-grid');
    this.debounceDelay = options.debounceDelay || 500;
    this.debounceTimer = null;
    this.minLength = options.minLength || 2;
    
    this.init();
  }

  init() {
    if (!this.searchInput) {
      console.warn('CatalogSearch: Search input not found');
      return;
    }

    // URL com search: input já vem preenchido pelo servidor; com filtros AJAX, sincronizar uma vez
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam && window.catalogFilters) {
      this.searchInput.value = searchParam;
    }

    // Setup event listeners
    this.searchInput.addEventListener('input', (e) => {
      this.debouncedSearch(e.target.value);
    });

    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.performSearch(e.target.value);
      }
    });

    // Clear button if exists
    const clearBtn = document.getElementById('search-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearSearch();
      });
    }
  }

  debouncedSearch(query) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.performSearch(query);
    }, this.debounceDelay);
  }

  performSearch(query) {
    const raw = query.trim();
    const searchTerm = raw.toLowerCase();

    if (searchTerm.length > 0 && searchTerm.length < this.minLength) {
      return;
    }

    if (window.catalogFilters) {
      window.catalogFilters.currentPage = 1;
      window.catalogFilters.applyFilters();
      return;
    }

    const url = new URL(window.location);
    if (searchTerm.length >= this.minLength) {
      url.searchParams.set('search', searchTerm);
    } else {
      url.searchParams.delete('search');
    }
    window.history.pushState({}, '', url);

    if (searchTerm.length >= this.minLength) {
      this.filterProducts(searchTerm);
    } else {
      this.showAllProducts();
    }
  }

  filterProducts(searchTerm) {
    const productItems = this.container.querySelectorAll('.product-item');
    let visibleCount = 0;

    productItems.forEach(item => {
      const productCard = item.querySelector('.product-card');
      if (!productCard) return;

      const text = productCard.textContent.toLowerCase();
      const matches = text.includes(searchTerm);

      if (matches) {
        item.style.display = '';
        item.style.opacity = '1';
        visibleCount++;
        
        // Highlight search term
        this.highlightSearchTerm(item, searchTerm);
      } else {
        item.style.opacity = '0';
        setTimeout(() => {
          item.style.display = 'none';
        }, 300);
      }
    });

    // Show no results message if needed
    this.showNoResults(visibleCount === 0);
  }

  highlightSearchTerm(item, searchTerm) {
    const textElements = item.querySelectorAll('.product-title, .product-reference, .product-family');
    textElements.forEach(el => {
      const text = el.textContent;
      const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
      el.innerHTML = text.replace(regex, '<mark class="search-highlight">$1</mark>');
    });
  }

  showAllProducts() {
    const productItems = this.container.querySelectorAll('.product-item');
    productItems.forEach(item => {
      item.style.display = '';
      item.style.opacity = '1';
      
      // Remove highlights
      const marks = item.querySelectorAll('mark.search-highlight');
      marks.forEach(mark => {
        const parent = mark.parentElement;
        parent.textContent = parent.textContent;
      });
    });

    this.showNoResults(false);
  }

  showNoResults(show) {
    let noResultsEl = document.getElementById('search-no-results');
    
    if (show && !noResultsEl) {
      noResultsEl = document.createElement('div');
      noResultsEl.id = 'search-no-results';
      noResultsEl.className = 'no-products';
      noResultsEl.innerHTML = `
        <div class="no-products-icon">
          <i class="fas fa-search"></i>
        </div>
        <h3>Nenhum produto encontrado</h3>
        <p>Tente ajustar os termos de pesquisa ou <a href="/catalog">ver todos os produtos</a></p>
      `;
      this.container.parentElement.insertBefore(noResultsEl, this.container);
    } else if (!show && noResultsEl) {
      noResultsEl.remove();
    }
  }

  clearSearch() {
    this.searchInput.value = '';
    if (window.catalogFilters) {
      window.catalogFilters.currentPage = 1;
    }
    this.performSearch('');
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CatalogSearch;
} else {
  window.CatalogSearch = CatalogSearch;
}

