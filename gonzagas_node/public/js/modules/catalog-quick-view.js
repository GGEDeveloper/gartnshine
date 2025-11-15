/**
 * Catalog Quick View Module
 * Handles quick view modal for products
 */
class CatalogQuickView {
  constructor(options = {}) {
    this.modalId = options.modalId || 'quick-view-modal';
    this.apiEndpoint = options.apiEndpoint || '/api/catalog/product';
    this.modal = null;
    this.isOpen = false;
    
    this.init();
  }

  init() {
    // Create modal immediately
    this.createModal();
    
    // Attach event listeners after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.attachEventListeners();
    }, 100);
  }

  createModal() {
    // Check if modal already exists
    this.modal = document.getElementById(this.modalId);
    if (this.modal) {
      return;
    }

    // Ensure body exists
    if (!document.body) {
      console.warn('CatalogQuickView: document.body not ready, retrying...');
      setTimeout(() => this.createModal(), 100);
      return;
    }

    const modalHTML = `
      <div class="modal fade" id="${this.modalId}" tabindex="-1" aria-labelledby="quickViewModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content quick-view-content">
            <div class="modal-header">
              <h5 class="modal-title" id="quickViewModalLabel">Detalhes do Produto</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="quick-view-body">
              <div class="quick-view-loading">
                <div class="spinner-border text-highlight" role="status">
                  <span class="visually-hidden">A carregar...</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
              <a href="#" class="btn btn-primary" id="quick-view-full-link">Ver Detalhes Completos</a>
            </div>
          </div>
        </div>
      </div>
    `;

    try {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      this.modal = document.getElementById(this.modalId);
      if (!this.modal) {
        console.error('CatalogQuickView: Modal was not created successfully');
      }
    } catch (error) {
      console.error('CatalogQuickView: Error creating modal:', error);
    }
  }

  attachEventListeners() {
    // Use event delegation for quick view buttons
    document.addEventListener('click', (e) => {
      const quickViewBtn = e.target.closest('.btn-quick-view');
      if (quickViewBtn) {
        e.preventDefault();
        const productId = quickViewBtn.dataset.productId;
        if (productId) {
          this.open(productId);
        }
      }
    });

    // Close on backdrop click
    if (this.modal) {
      this.modal.addEventListener('hidden.bs.modal', () => {
        this.isOpen = false;
      });
    }
  }

  async open(productId) {
    if (this.isOpen) return;
    this.isOpen = true;

    const modalBody = document.getElementById('quick-view-body');
    const fullLink = document.getElementById('quick-view-full-link');
    
    if (!modalBody || !fullLink) {
      console.error('Quick view modal elements not found');
      return;
    }

    // Show loading
    modalBody.innerHTML = `
      <div class="quick-view-loading">
        <div class="spinner-border text-highlight" role="status">
          <span class="visually-hidden">A carregar...</span>
        </div>
      </div>
    `;

    // Update full link
    fullLink.href = `/catalog/product/${productId}`;

    // Open modal
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const bsModal = new bootstrap.Modal(this.modal);
      bsModal.show();
    } else {
      // Fallback if Bootstrap JS not loaded
      this.modal.classList.add('show');
      this.modal.style.display = 'block';
      document.body.classList.add('modal-open');
    }

    try {
      // Fetch product data
      const response = await fetch(`${this.apiEndpoint}/${productId}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const product = await response.json();
      this.renderProduct(product, modalBody);

    } catch (error) {
      console.error('Error loading product:', error);
      modalBody.innerHTML = `
        <div class="quick-view-error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Erro ao carregar detalhes do produto.</p>
        </div>
      `;
    }
  }

  renderProduct(product, container) {
    const imageUrl = product.image_url ? `/media/products/${product.image_url}` : '/images/placeholder-image.png';
    const priceDisplay = product.formatted_sale_price || '<span class="text-muted fst-italic">Preço sob consulta</span>';

    container.innerHTML = `
      <div class="quick-view-product">
        <div class="row">
          <div class="col-md-6">
            <div class="quick-view-image">
              <a href="${imageUrl}" class="glightbox" data-glightbox="type: image; title: ${this.escapeHtml(product.name)}">
                <img src="${imageUrl}" alt="${this.escapeHtml(product.name)}" class="img-fluid">
              </a>
            </div>
          </div>
          <div class="col-md-6">
            <div class="quick-view-info">
              <p class="product-reference mb-2">
                <strong>Ref:</strong> ${this.escapeHtml(product.reference || 'N/A')}
              </p>
              ${product.family_name ? `<p class="product-family mb-2"><small class="text-highlight">${this.escapeHtml(product.family_name)}</small></p>` : ''}
              <h3 class="product-title mb-3">${this.escapeHtml(product.name || 'Produto')}</h3>
              ${product.description ? `<p class="product-description mb-3">${this.escapeHtml(product.description)}</p>` : ''}
              <div class="product-price mb-3">
                <h4>${priceDisplay}</h4>
              </div>
              ${product.materials ? `<p class="product-materials mb-2"><strong>Materiais:</strong> ${this.escapeHtml(product.materials)}</p>` : ''}
              ${product.dimensions ? `<p class="product-dimensions mb-2"><strong>Dimensões:</strong> ${this.escapeHtml(product.dimensions)}</p>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize GLightbox if available
    if (typeof GLightbox !== 'undefined') {
      const lightbox = GLightbox({
        selector: '.quick-view-image .glightbox'
      });
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  close() {
    if (this.modal && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const bsModal = bootstrap.Modal.getInstance(this.modal);
      if (bsModal) {
        bsModal.hide();
      }
    } else if (this.modal) {
      this.modal.classList.remove('show');
      this.modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
    this.isOpen = false;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CatalogQuickView;
} else {
  window.CatalogQuickView = CatalogQuickView;
}

