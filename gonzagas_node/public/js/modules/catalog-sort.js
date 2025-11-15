/**
 * Catalog Sort Module
 * Handles product sorting (price, name, etc.)
 */
class CatalogSort {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('products-grid');
    this.sortSelect = options.sortSelect || document.getElementById('catalog-sort');
    this.currentSort = 'default';
    this.products = [];
    
    this.init();
  }

  init() {
    if (!this.container) {
      console.warn('CatalogSort: Container not found');
      return;
    }

    // Get initial products
    this.extractProducts();

    // Setup sort dropdown
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.sort(e.target.value);
      }, true);
    }

    // Check URL params for sort
    const urlParams = new URLSearchParams(window.location.search);
    const sortParam = urlParams.get('sort');
    if (sortParam && this.sortSelect) {
      this.sortSelect.value = sortParam;
      this.sort(sortParam);
    }
  }

  extractProducts() {
    const productItems = this.container.querySelectorAll('.product-item');
    this.products = Array.from(productItems).map(item => {
      const productCard = item.querySelector('.product-card');
      if (!productCard) return null;

      const reference = productCard.querySelector('.product-reference')?.textContent.replace('Ref: ', '').trim() || '';
      const name = productCard.querySelector('.product-title')?.textContent.trim() || '';
      const priceText = productCard.querySelector('.product-price')?.textContent.trim() || '';
      const price = this.extractPrice(priceText);
      const family = productCard.querySelector('.product-family small')?.textContent.trim() || '';
      const productId = item.dataset.productId || '';

      return {
        element: item,
        id: productId,
        reference: reference,
        name: name,
        price: price,
        family: family,
        originalIndex: Array.from(productItems).indexOf(item)
      };
    }).filter(p => p !== null);
  }

  extractPrice(priceText) {
    // Extract numeric price from formatted string (e.g., "10,00 €" -> 10.00)
    const match = priceText.match(/(\d+)[,.](\d+)/);
    if (match) {
      return parseFloat(match[1] + '.' + match[2]);
    }
    // If no price found, return a high number to sort last
    return 999999;
  }

  sort(sortType) {
    this.currentSort = sortType;
    
    let sortedProducts = [...this.products];

    switch (sortType) {
      case 'price-asc':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      
      case 'price-desc':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      
      case 'name-asc':
        sortedProducts.sort((a, b) => {
          return a.name.localeCompare(b.name, 'pt', { sensitivity: 'base' });
        });
        break;
      
      case 'name-desc':
        sortedProducts.sort((a, b) => {
          return b.name.localeCompare(a.name, 'pt', { sensitivity: 'base' });
        });
        break;
      
      case 'reference-asc':
        sortedProducts.sort((a, b) => {
          return a.reference.localeCompare(b.reference, 'pt', { numeric: true });
        });
        break;
      
      case 'reference-desc':
        sortedProducts.sort((a, b) => {
          return b.reference.localeCompare(a.reference, 'pt', { numeric: true });
        });
        break;
      
      case 'default':
      default:
        // Restore original order
        sortedProducts.sort((a, b) => a.originalIndex - b.originalIndex);
        break;
    }

    this.renderSorted(sortedProducts);
    this.updateURL(sortType);
  }

  renderSorted(sortedProducts) {
    // Clear container
    const fragment = document.createDocumentFragment();
    
    sortedProducts.forEach((product, index) => {
      product.element.style.opacity = '0';
      product.element.style.transform = 'translateY(20px)';
      product.element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      fragment.appendChild(product.element);
    });

    this.container.innerHTML = '';
    this.container.appendChild(fragment);

    // Animate in
    setTimeout(() => {
      sortedProducts.forEach((product, index) => {
        setTimeout(() => {
          product.element.style.opacity = '1';
          product.element.style.transform = 'translateY(0)';
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

  updateURL(sortType) {
    try {
      const url = new URL(window.location.href);
      if (sortType === 'default') {
        url.searchParams.delete('sort');
      } else {
        url.searchParams.set('sort', sortType);
      }
      window.history.pushState({ sort: sortType }, '', url.toString());
    } catch (error) {
      console.warn('Failed to update URL:', error);
    }
  }

  refresh() {
    // Re-extract products after DOM update
    this.extractProducts();
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CatalogSort;
} else {
  window.CatalogSort = CatalogSort;
}

