/**
 * Catalog Filters Module
 * Handles AJAX filtering without page reload
 */
class CatalogFilters {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('products-grid');
    this.form = options.form || document.getElementById('catalog-filters');
    this.resultsCount = options.resultsCount || document.querySelector('.results-count .count-number');
    this.apiEndpoint = options.apiEndpoint || '/api/catalog/filter';
    this.debounceDelay = options.debounceDelay || 300;
    this.debounceTimer = null;
    this.isLoading = false;
    
    this.init();
  }

  init() {
    if (!this.form || !this.container) {
      console.warn('CatalogFilters: Form or container not found');
      return;
    }

    // Prevent default form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.applyFilters();
    });

    // Auto-apply filters on change (with debounce)
    const filterInputs = this.form.querySelectorAll('input[type="checkbox"], input[type="radio"]');
    filterInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.debouncedApply();
      });
    });

    // Handle "All Families" checkbox
    const allFamiliesCheckbox = document.getElementById('all-families');
    if (allFamiliesCheckbox) {
      allFamiliesCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          const familyCheckboxes = this.form.querySelectorAll('.family-filter');
          familyCheckboxes.forEach(cb => cb.checked = false);
        }
        this.debouncedApply();
      });
    }

    // Handle family checkboxes
    const familyCheckboxes = this.form.querySelectorAll('.family-filter');
    familyCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        if (allFamiliesCheckbox) {
          allFamiliesCheckbox.checked = false;
        }
      });
    });

    // Clear filters button
    const clearBtn = this.form.querySelector('.btn-filter-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.clearFilters();
      });
    }
  }

  debouncedApply() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.applyFilters();
    }, this.debounceDelay);
  }

  getFilterData() {
    const formData = new FormData(this.form);
    const data = {
      families: [],
      price_range: 'all',
      search: ''
    };

    // Get selected families
    const familyInputs = this.form.querySelectorAll('.family-filter:checked');
    familyInputs.forEach(input => {
      data.families.push(parseInt(input.value));
    });

    // Get price range
    const priceRadio = this.form.querySelector('input[name="price_range"]:checked');
    if (priceRadio) {
      data.price_range = priceRadio.value;
    }

    // Get search query if exists
    const searchInput = this.form.querySelector('input[name="search"]');
    if (searchInput) {
      data.search = searchInput.value.trim();
    }

    return data;
  }

  async applyFilters() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoading();

    try {
      const filterData = this.getFilterData();
      const queryParams = new URLSearchParams();
      
      if (filterData.families.length > 0) {
        filterData.families.forEach(id => queryParams.append('families', id));
      }
      if (filterData.price_range !== 'all') {
        queryParams.append('price_range', filterData.price_range);
      }
      if (filterData.search) {
        queryParams.append('search', filterData.search);
      }

      const url = `${this.apiEndpoint}?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update URL without reload
      const newUrl = `/catalog${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      window.history.pushState({}, '', newUrl);

      // Update products grid
      this.updateProductsGrid(data.products);
      
      // Update results count
      this.updateResultsCount(data.count);

      // Update filter counts if provided
      if (data.filterCounts) {
        this.updateFilterCounts(data.filterCounts);
      }

    } catch (error) {
      console.error('Error applying filters:', error);
      this.showError('Erro ao aplicar filtros. Por favor, tente novamente.');
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  clearFilters() {
    // Reset form
    this.form.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    this.form.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
    
    // Check "All Families"
    const allFamiliesCheckbox = document.getElementById('all-families');
    if (allFamiliesCheckbox) {
      allFamiliesCheckbox.checked = true;
    }

    // Check "All Prices"
    const allPricesRadio = document.getElementById('price-all');
    if (allPricesRadio) {
      allPricesRadio.checked = true;
    }

    // Clear search if exists
    const searchInput = this.form.querySelector('input[name="search"]');
    if (searchInput) {
      searchInput.value = '';
    }

    // Apply filters (will load all products)
    this.applyFilters();
  }

  updateProductsGrid(products) {
    if (!products || products.length === 0) {
      this.container.innerHTML = `
        <div class="no-products">
          <div class="no-products-icon">
            <i class="fas fa-search"></i>
          </div>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente ajustar os filtros ou <a href="/catalog">ver todos os produtos</a></p>
        </div>
      `;
      return;
    }

    // Generate HTML for products
    const productsHTML = products.map((product, index) => {
      return this.generateProductHTML(product, index);
    }).join('');

    // Fade out, update, fade in
    this.container.style.opacity = '0';
    setTimeout(() => {
      this.container.innerHTML = productsHTML;
      this.container.style.opacity = '1';
      
      // Reinitialize lazy loading and other modules
      if (window.catalogLazyLoad) {
        window.catalogLazyLoad.init();
      }
      if (window.catalogGrid) {
        window.catalogGrid.refresh();
      }
    }, 300);
  }

  generateProductHTML(product, index) {
    const imageUrl = product.image_url ? `/media/products/${product.image_url}` : '/images/placeholder-image.png';
    const productLink = `/catalog/product/${product.id}`;
    
    return `
      <div class="product-item" data-product-id="${product.id}" data-aos="fade-up" data-aos-delay="${index * 50}">
        <div class="product-card">
          <div class="product-image-container">
            <a href="/catalog/product/${product.id}" class="product-image-link">
              <img src="${imageUrl}" 
                   alt="${this.escapeHtml(product.name)}" 
                   class="product-image lazy-load"
                   loading="lazy"
                   data-src="${imageUrl}"
                   style="opacity: 1 !important; visibility: visible !important; display: block !important; position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: 100% !important; min-width: 100% !important; min-height: 100% !important; object-fit: cover !important; object-position: center center !important; z-index: 2 !important;"
                   onerror="this.src='/images/placeholder-image.png'; this.style.cssText+='opacity: 1 !important; visibility: visible !important; position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: 100% !important; min-width: 100% !important; min-height: 100% !important; object-fit: cover !important; object-position: center center !important;';">
              <div class="product-overlay">
                <a href="/catalog/product/${product.id}" class="btn-quick-view">
                  <i class="fas fa-eye"></i> Ver Detalhes
                </a>
              </div>
            </a>
            ${product.is_new ? '<span class="product-badge badge-new">Novo</span>' : ''}
            ${product.on_sale ? '<span class="product-badge badge-sale">Promoção</span>' : ''}
          </div>
          <div class="product-info">
            <p class="product-reference">Ref: ${this.escapeHtml(product.reference || 'N/A')}</p>
            <p class="product-family"><small class="text-highlight">${this.escapeHtml(product.family_name || '')}</small></p>
            <h3 class="product-title">${this.escapeHtml(product.name || 'Produto')}</h3>
            <p class="product-price">
              ${product.formatted_sale_price || '<span class="text-muted fst-italic">Preço sob consulta</span>'}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  updateResultsCount(count) {
    if (this.resultsCount) {
      this.resultsCount.textContent = count;
      const countText = this.resultsCount.nextElementSibling;
      if (countText) {
        countText.textContent = count !== 1 ? 'produtos' : 'produto';
      }
    }
  }

  updateFilterCounts(counts) {
    // Update family filter counts if provided
    if (counts.families) {
      Object.keys(counts.families).forEach(familyId => {
        const label = document.querySelector(`label[for="family-${familyId}"]`);
        if (label) {
          const countSpan = label.querySelector('.filter-count') || document.createElement('span');
          countSpan.className = 'filter-count';
          countSpan.textContent = ` (${counts.families[familyId]})`;
          if (!label.querySelector('.filter-count')) {
            label.appendChild(countSpan);
          }
        }
      });
    }
  }

  showLoading() {
    if (!this.container) return;
    
    const loadingHTML = `
      <div class="catalog-loading">
        <div class="loading-spinner"></div>
        <p>A aplicar filtros...</p>
      </div>
    `;
    
    const loadingEl = document.createElement('div');
    loadingEl.className = 'catalog-loading-overlay';
    loadingEl.innerHTML = loadingHTML;
    this.container.parentElement.appendChild(loadingEl);
  }

  hideLoading() {
    const loadingEl = document.querySelector('.catalog-loading-overlay');
    if (loadingEl) {
      loadingEl.remove();
    }
  }

  showError(message) {
    const errorHTML = `
      <div class="catalog-error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
      </div>
    `;
    
    const errorEl = document.createElement('div');
    errorEl.className = 'catalog-error-message';
    errorEl.innerHTML = errorHTML;
    this.container.parentElement.insertBefore(errorEl, this.container);
    
    setTimeout(() => {
      errorEl.remove();
    }, 5000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CatalogFilters;
} else {
  window.CatalogFilters = CatalogFilters;
}

