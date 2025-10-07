// Simplified Catalog V2 JavaScript
class CatalogV2 {
    constructor() {
        this.filters = {
            category: 'all',
            priceMin: 0,
            priceMax: 500,
            inStock: false,
            featured: false
        };
        this.products = [];
        this.currentPage = 1;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadProducts();
    }
    
    bindEvents() {
        // Filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.handleCategoryFilter(e.target.dataset.category);
            });
        });
        
        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreProducts();
            });
        }
    }
    
    handleCategoryFilter(category) {
        // Update active filter
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.category === category);
        });
        
        this.filters.category = category;
        this.filterProducts();
    }
    
    filterProducts() {
        const products = document.querySelectorAll('.product-card-v2');
        let visibleCount = 0;
        
        products.forEach(product => {
            const shouldShow = this.shouldShowProduct(product);
            product.style.display = shouldShow ? 'block' : 'none';
            if (shouldShow) visibleCount++;
        });
        
        // Update count
        document.getElementById('productCount').textContent = visibleCount;
    }
    
    shouldShowProduct(product) {
        // Simple category filtering
        if (this.filters.category === 'all') {
            return true;
        }
        
        // Add more filtering logic here based on product data
        return true;
    }
    
    async loadMoreProducts() {
        this.currentPage++;
        // Simulate loading more products
        console.log('Loading more products...');
    }
    
    openQuickView(productId) {
        console.log('Opening quick view for product:', productId);
        // Implement quick view modal
    }
    
    closeQuickView() {
        console.log('Closing quick view');
        // Implement close quick view
    }
    
    clearAllFilters() {
        this.filters = {
            category: 'all',
            priceMin: 0,
            priceMax: 500,
            inStock: false,
            featured: false
        };
        
        document.querySelector('.filter-chip[data-category="all"]').classList.add('active');
        document.querySelectorAll('.filter-chip:not([data-category="all"])').forEach(chip => {
            chip.classList.remove('active');
        });
        
        this.filterProducts();
    }
    
    async loadProducts() {
        // Load products from API or use existing data
        console.log('Products loaded');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.catalogV2 = new CatalogV2();
});
