class AdvancedSearch {
    constructor() {
        this.input = document.querySelector('.search-input, input[type="search"], input[name="search"]');
        this.container = null;
        this.resultsContainer = null;
        this.cache = new Map();
        this.currentRequest = null;
        
        if (this.input) {
            this.init();
        }
    }
    
    init() {
        this.createContainer();
        this.bindEvents();
    }
    
    createContainer() {
        // Create search container wrapper
        this.container = document.createElement('div');
        this.container.className = 'search-container';
        this.container.style.position = 'relative';
        
        // Wrap the input
        this.input.parentNode.insertBefore(this.container, this.input);
        this.container.appendChild(this.input);
        
        // Create results container
        this.resultsContainer = document.createElement('div');
        this.resultsContainer.className = 'search-results';
        this.container.appendChild(this.resultsContainer);
    }
    
    bindEvents() {
        let timeout;
        this.input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.handleSearch(e.target.value.trim());
            }, 300);
        });
        
        // Hide on outside click
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.hideResults();
            }
        });
        
        // Show results on focus
        this.input.addEventListener('focus', () => {
            if (this.input.value.trim().length >= 2 && this.resultsContainer.innerHTML) {
                this.showResults();
            }
        });
    }
    
    async handleSearch(query) {
        if (query.length < 2) {
            this.hideResults();
            return;
        }
        
        if (this.currentRequest) {
            this.currentRequest.abort();
        }
        
        if (this.cache.has(query)) {
            this.displayResults(this.cache.get(query), query);
            return;
        }
        
        try {
            this.showLoading();
            this.currentRequest = new AbortController();
            
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
                signal: this.currentRequest.signal
            });
            
            if (response.ok) {
                const results = await response.json();
                this.cache.set(query, results);
                this.displayResults(results, query);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Search error:', error);
            }
        }
    }
    
    displayResults(results, query) {
        if (results.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="search-no-results">Nenhum resultado para "${query}"</div>
            `;
        } else {
            const html = results.map(product => `
                <a href="${product.url}" class="search-result-item">
                    <img src="${product.image_url}" alt="${product.name}" loading="lazy">
                    <div class="search-result-info">
                        <h4>${this.highlightMatch(product.name, query)}</h4>
                        <p>${product.reference}</p>
                        <span class="price">${product.price_formatted}</span>
                    </div>
                </a>
            `).join('');
            
            this.resultsContainer.innerHTML = html;
        }
        this.showResults();
    }
    
    showLoading() {
        this.resultsContainer.innerHTML = '<div class="search-loading">Pesquisando...</div>';
        this.showResults();
    }
    
    showResults() {
        this.resultsContainer.style.display = 'block';
    }
    
    hideResults() {
        this.resultsContainer.style.display = 'none';
    }
    
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    window.advancedSearch = new AdvancedSearch();
});

