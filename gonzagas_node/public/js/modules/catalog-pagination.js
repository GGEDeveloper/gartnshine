/**
 * Catalog Pagination Module
 * Handles pagination and infinite scroll
 */
class CatalogPagination {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('products-grid');
    this.mode = options.mode || 'infinite'; // 'pagination' or 'infinite'
    this.apiEndpoint = options.apiEndpoint || '/api/catalog';
    this.pageSize = options.pageSize || 20;
    this.currentPage = 1;
    this.totalPages = 1;
    this.isLoading = false;
    this.hasMore = true;
    this.loadMoreBtn = null;
    this.paginationContainer = null;
    
    this.init();
  }

  init() {
    if (!this.container) {
      console.warn('CatalogPagination: Container not found');
      return;
    }

    // Check URL for page param
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    if (pageParam) {
      this.currentPage = parseInt(pageParam) || 1;
    }

    if (this.mode === 'infinite') {
      this.setupInfiniteScroll();
    } else {
      this.setupPagination();
    }
  }

  setupInfiniteScroll() {
    // Create load more button
    this.loadMoreBtn = document.createElement('button');
    this.loadMoreBtn.className = 'btn btn-primary btn-load-more';
    this.loadMoreBtn.innerHTML = '<i class="fas fa-chevron-down me-2"></i>Carregar Mais Produtos';
    this.loadMoreBtn.style.cssText = `
      display: block;
      margin: 30px auto;
      padding: 12px 30px;
      border-radius: 25px;
    `;
    
    this.loadMoreBtn.addEventListener('click', () => {
      this.loadNextPage();
    });

    this.container.parentElement.appendChild(this.loadMoreBtn);

    // Setup intersection observer for auto-load
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && this.hasMore && !this.isLoading) {
          this.loadNextPage();
        }
      });
    }, {
      rootMargin: '200px'
    });

    observer.observe(this.loadMoreBtn);
  }

  setupPagination() {
    this.paginationContainer = document.createElement('div');
    this.paginationContainer.className = 'catalog-pagination';
    this.paginationContainer.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin: 30px 0;
      flex-wrap: wrap;
    `;

    this.container.parentElement.appendChild(this.paginationContainer);
    this.renderPagination();
  }

  async loadNextPage() {
    if (this.isLoading || !this.hasMore) {
      return;
    }

    this.isLoading = true;
    this.showLoading();

    try {
      const nextPage = this.currentPage + 1;
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('page', nextPage);
      
      const response = await fetch(`${this.apiEndpoint}?${urlParams.toString()}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        this.appendProducts(data.products);
        this.currentPage = nextPage;
        this.hasMore = data.hasMore !== false && data.products.length === this.pageSize;
        
        // Update URL
        window.history.pushState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
      } else {
        this.hasMore = false;
        if (this.loadMoreBtn) {
          this.loadMoreBtn.style.display = 'none';
        }
      }

    } catch (error) {
      console.error('Error loading next page:', error);
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  appendProducts(products) {
    const fragment = document.createDocumentFragment();
    
    products.forEach((product, index) => {
      const productHTML = this.generateProductHTML(product, this.container.children.length + index);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = productHTML;
      const productElement = tempDiv.firstElementChild;
      
      productElement.style.opacity = '0';
      productElement.style.transform = 'translateY(20px)';
      productElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      fragment.appendChild(productElement);
    });

    this.container.appendChild(fragment);

    // Animate in
    setTimeout(() => {
      Array.from(fragment.children).forEach((item, index) => {
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, index * 30);
      });
    }, 50);

    // Reinitialize lazy loading
    if (window.catalogLazyLoad) {
      setTimeout(() => {
        window.catalogLazyLoad.refresh();
      }, 100);
    }
  }

  generateProductHTML(product, index) {
    const imageUrl = product.image_url ? `/media/products/${product.image_url}` : '/images/imagem-nao-disponivel.svg';
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
                   onerror="this.onerror=null;this.src='/images/imagem-nao-disponivel.svg'; this.style.cssText+='opacity: 1 !important; visibility: visible !important; position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: 100% !important; min-width: 100% !important; min-height: 100% !important; object-fit: cover !important; object-position: center center !important;';">
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

  renderPagination() {
    if (!this.paginationContainer) return;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Previous button
    if (this.currentPage > 1) {
      pages.push(`<button class="pagination-btn" data-page="${this.currentPage - 1}">
        <i class="fas fa-chevron-left"></i>
      </button>`);
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(`<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
        ${i}
      </button>`);
    }

    // Next button
    if (this.currentPage < this.totalPages) {
      pages.push(`<button class="pagination-btn" data-page="${this.currentPage + 1}">
        <i class="fas fa-chevron-right"></i>
      </button>`);
    }

    this.paginationContainer.innerHTML = pages.join('');

    // Attach event listeners
    this.paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        this.goToPage(page);
      });
    });
  }

  async goToPage(page) {
    if (page === this.currentPage || this.isLoading) return;

    this.currentPage = page;
    this.isLoading = true;
    this.showLoading();

    try {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('page', page);
      
      const response = await fetch(`${this.apiEndpoint}?${urlParams.toString()}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Replace products
      this.container.innerHTML = '';
      this.appendProducts(data.products);
      this.totalPages = data.totalPages || Math.ceil(data.count / this.pageSize);
      
      // Update URL
      window.history.pushState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Re-render pagination
      this.renderPagination();

    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  showLoading() {
    if (this.loadMoreBtn) {
      this.loadMoreBtn.disabled = true;
      this.loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>A carregar...';
    }
  }

  hideLoading() {
    if (this.loadMoreBtn) {
      this.loadMoreBtn.disabled = false;
      this.loadMoreBtn.innerHTML = '<i class="fas fa-chevron-down me-2"></i>Carregar Mais Produtos';
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CatalogPagination;
} else {
  window.CatalogPagination = CatalogPagination;
}

