# Status Atual vs Plano Original - Gonzaga's Art & Shine

## ✅ FASE 1: OTIMIZAÇÃO CORE - STATUS ATUAL

### **O QUE JÁ FOI FEITO:**
- ✅ **Database Schema** - COMPLETO (migrations executadas)
  - ✅ Tabelas `media_files` e `media_usage` criadas
  - ✅ Coluna `media_id` adicionada a `product_images`
  - ✅ Backup seguro realizado

### **O QUE AINDA FALTA NA FASE 1:**

#### **1.1 Database Query Optimization - FALTA**
```javascript
❌ Modificar config/database.js (connection limit: 3)
❌ Modificar models/Product.js (queries otimizadas)
❌ Criar sql/critical_indexes.sql (índices performance)
❌ Testar queries com EXPLAIN
```

#### **1.2 Rate Limiting e Segurança - FALTA**
```bash
❌ npm install express-rate-limit helmet compression
❌ Modificar app.js (middleware segurança)
❌ Criar middleware/security.js
❌ Testar rate limiting
```

#### **1.3 Image Optimization - FALTA**
```javascript
❌ Criar public/js/image-optimization.js
❌ Modificar views/collections.ejs (lazy loading)
❌ Modificar views/admin/products/index.ejs (thumbnails)
❌ Testar lazy loading mobile/desktop
```

#### **1.4 Backup System - FALTA**
```javascript
❌ Criar scripts/backup-system.js
❌ Modificar package.json (novos scripts)
❌ Testar: npm run backup
❌ Verificar: npm run backup:list
```

#### **1.5 SEO Básico - FALTA**
```javascript
❌ Criar routes/seo.js
❌ Modificar app.js (incluir rotas SEO)
❌ Testar: /sitemap.xml e /robots.txt
❌ Verificar meta tags
```

***

# FASE 2: SEARCH + WHATSAPP - PLANO COMPLETO
**Duração: 1 semana | Prioridade: ALTA ⭐⭐⭐⭐**

## 2.1 Sistema de Pesquisa Avançado

### **A. API Search Endpoint**

#### **Criar: `routes/api.js` (se não existir) ou adicionar**
```javascript
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Search endpoint otimizado para shared hosting
router.get('/search', async (req, res) => {
    try {
        const { q, limit = 10, family_id } = req.query;
        
        // Validação básica
        if (!q || q.length < 2) {
            return res.json([]);
        }
        
        if (q.length > 50) {
            return res.status(400).json({ error: 'Search term too long' });
        }
        
        let baseQuery = `
            SELECT p.id, p.reference, p.name, p.sale_price,
                   pi.image_filename as main_image,
                   pf.name as family_name,
                   p.current_stock
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
            LEFT JOIN product_families pf ON p.family_id = pf.id
            WHERE p.is_active = 1 
        `;
        
        const params = [];
        
        // Search logic otimizado
        baseQuery += ` AND (p.name LIKE ? OR p.reference LIKE ? OR p.description LIKE ?)`;
        const searchTerm = `%${q}%`;
        params.push(searchTerm, searchTerm, searchTerm);
        
        // Filter by family se especificado
        if (family_id && !isNaN(family_id)) {
            baseQuery += ` AND p.family_id = ?`;
            params.push(parseInt(family_id));
        }
        
        // Ordenação inteligente
        baseQuery += `
            ORDER BY 
                CASE 
                    WHEN p.name LIKE ? THEN 1
                    WHEN p.reference LIKE ? THEN 2
                    WHEN p.description LIKE ? THEN 3
                    ELSE 4
                END,
                p.featured DESC,
                p.created_at DESC
            LIMIT ?
        `;
        
        const exactTerm = `${q}%`;
        params.push(exactTerm, exactTerm, exactTerm, parseInt(limit));
        
        const [results] = await pool.execute(baseQuery, params);
        
        // Enhanced results com metadata
        const enhancedResults = results.map(product => ({
            ...product,
            image_url: product.main_image ? `/uploads/products/${product.main_image}` : '/images/placeholder.jpg',
            price_formatted: new Intl.NumberFormat('pt-PT', {
                style: 'currency',
                currency: 'EUR'
            }).format(product.sale_price),
            in_stock: product.current_stock > 0,
            url: `/catalog/product/${product.id}`
        }));
        
        res.json(enhancedResults);
        
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Search suggestions endpoint
router.get('/search/suggestions', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.length < 2) {
            return res.json([]);
        }
        
        const query = `
            SELECT DISTINCT 
                CASE 
                    WHEN name LIKE ? THEN name
                    WHEN reference LIKE ? THEN reference
                END as suggestion
            FROM products 
            WHERE is_active = 1 
            AND (name LIKE ? OR reference LIKE ?)
            ORDER BY suggestion
            LIMIT 5
        `;
        
        const searchTerm = `${q}%`;
        const [suggestions] = await pool.execute(query, [
            searchTerm, searchTerm, searchTerm, searchTerm
        ]);
        
        res.json(suggestions.map(s => s.suggestion).filter(Boolean));
        
    } catch (error) {
        console.error('Suggestions error:', error);
        res.json([]);
    }
});

module.exports = router;
```

### **B. Frontend Search Component**

#### **Criar: `public/js/advanced-search.js`**
```javascript
class AdvancedSearch {
    constructor(options = {}) {
        this.container = options.container || '#search-container';
        this.resultsContainer = options.resultsContainer || '#search-results';
        this.suggestionsContainer = options.suggestionsContainer || '#search-suggestions';
        this.minLength = options.minLength || 2;
        this.debounceTime = options.debounceTime || 300;
        this.maxResults = options.maxResults || 8;
        
        // Cache e performance
        this.cache = new Map();
        this.suggestionCache = new Map();
        this.abortController = null;
        
        this.init();
    }
    
    init() {
        const searchInput = document.querySelector(`${this.container} input`);
        const searchForm = document.querySelector(`${this.container} form`);
        
        if (!searchInput) {
            console.warn('Search input not found');
            return;
        }
        
        this.searchInput = searchInput;
        this.createResultsContainer();
        this.bindEvents();
    }
    
    createResultsContainer() {
        // Create results container if doesn't exist
        if (!document.querySelector(this.resultsContainer)) {
            const resultsDiv = document.createElement('div');
            resultsDiv.id = this.resultsContainer.replace('#', '');
            resultsDiv.className = 'search-results-container';
            this.searchInput.parentNode.appendChild(resultsDiv);
        }
        
        // Create suggestions container
        if (!document.querySelector(this.suggestionsContainer)) {
            const suggestionsDiv = document.createElement('div');
            suggestionsDiv.id = this.suggestionsContainer.replace('#', '');
            suggestionsDiv.className = 'search-suggestions-container';
            this.searchInput.parentNode.appendChild(suggestionsDiv);
        }
    }
    
    bindEvents() {
        // Main search input
        this.searchInput.addEventListener('input', this.debounce((e) => {
            this.handleSearch(e.target.value.trim());
        }, this.debounceTime));
        
        // Focus/blur events
        this.searchInput.addEventListener('focus', () => {
            this.showRecent();
        });
        
        this.searchInput.addEventListener('blur', (e) => {
            // Delay hiding to allow clicks
            setTimeout(() => {
                this.hideResults();
            }, 200);
        });
        
        // Keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
        
        // Form submission
        const form = this.searchInput.closest('form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performFullSearch();
            });
        }
        
        // Click outside to hide
        document.addEventListener('click', (e) => {
            if (!e.target.closest(this.container)) {
                this.hideResults();
            }
        });
    }
    
    async handleSearch(query) {
        if (query.length < this.minLength) {
            this.hideResults();
            return;
        }
        
        // Abort previous request
        if (this.abortController) {
            this.abortController.abort();
        }
        this.abortController = new AbortController();
        
        try {
            // Show loading
            this.showLoading();
            
            // Get results
            const [results, suggestions] = await Promise.all([
                this.search(query),
                this.getSuggestions(query)
            ]);
            
            if (!this.abortController.signal.aborted) {
                this.displayResults(results, query);
                this.displaySuggestions(suggestions, query);
                this.saveToHistory(query);
            }
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Search error:', error);
                this.showError('Erro na pesquisa. Tente novamente.');
            }
        }
    }
    
    async search(query) {
        // Check cache first
        const cacheKey = query.toLowerCase();
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const url = new URL('/api/search', window.location.origin);
        url.searchParams.set('q', query);
        url.searchParams.set('limit', this.maxResults);
        
        const response = await fetch(url, {
            signal: this.abortController.signal,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Search request failed');
        }
        
        const results = await response.json();
        
        // Cache results
        this.cache.set(cacheKey, results);
        
        // Limit cache size
        if (this.cache.size > 50) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        return results;
    }
    
    async getSuggestions(query) {
        if (query.length < 2) return [];
        
        const cacheKey = query.toLowerCase();
        if (this.suggestionCache.has(cacheKey)) {
            return this.suggestionCache.get(cacheKey);
        }
        
        try {
            const url = new URL('/api/search/suggestions', window.location.origin);
            url.searchParams.set('q', query);
            
            const response = await fetch(url, {
                signal: this.abortController.signal
            });
            
            const suggestions = response.ok ? await response.json() : [];
            this.suggestionCache.set(cacheKey, suggestions);
            
            return suggestions;
        } catch (error) {
            return [];
        }
    }
    
    displayResults(results, query) {
        const container = document.querySelector(this.resultsContainer);
        if (!container) return;
        
        container.innerHTML = '';
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <p>Nenhum resultado encontrado para "${query}"</p>
                    <small>Tente termos diferentes ou mais genéricos</small>
                </div>
            `;
        } else {
            const html = results.map(product => `
                <a href="${product.url}" class="search-result-item">
                    <div class="search-result-image">
                        <img src="${product.image_url}" 
                             alt="${product.name}" 
                             loading="lazy"
                             onerror="this.src='/images/placeholder.jpg'">
                    </div>
                    <div class="search-result-content">
                        <h4 class="search-result-name">${this.highlightMatch(product.name, query)}</h4>
                        <p class="search-result-ref">${product.reference}</p>
                        <p class="search-result-family">${product.family_name || ''}</p>
                        <div class="search-result-footer">
                            <span class="search-result-price">${product.price_formatted}</span>
                            <span class="search-result-stock ${product.in_stock ? 'in-stock' : 'out-stock'}">
                                ${product.in_stock ? 'Em stock' : 'Esgotado'}
                            </span>
                        </div>
                    </div>
                </a>
            `).join('');
            
            container.innerHTML = html;
            
            if (results.length === this.maxResults) {
                container.innerHTML += `
                    <div class="search-show-more">
                        <button onclick="window.location.href='/catalog?search=${encodeURIComponent(query)}'">
                            Ver todos os resultados
                        </button>
                    </div>
                `;
            }
        }
        
        container.classList.add('visible');
    }
    
    displaySuggestions(suggestions, query) {
        const container = document.querySelector(this.suggestionsContainer);
        if (!container || suggestions.length === 0) return;
        
        const html = suggestions.map(suggestion => `
            <button class="search-suggestion-item" 
                    onclick="document.querySelector('${this.container} input').value='${suggestion}'; this.parentNode.parentNode.querySelector('.advanced-search').handleSearch('${suggestion}')">
                <i class="fas fa-search"></i>
                ${this.highlightMatch(suggestion, query)}
            </button>
        `).join('');
        
        container.innerHTML = `
            <div class="search-suggestions-header">Sugestões:</div>
            ${html}
        `;
        
        container.classList.add('visible');
    }
    
    showLoading() {
        const container = document.querySelector(this.resultsContainer);
        if (container) {
            container.innerHTML = `
                <div class="search-loading">
                    <div class="search-loading-spinner"></div>
                    <p>Pesquisando...</p>
                </div>
            `;
            container.classList.add('visible');
        }
    }
    
    showError(message) {
        const container = document.querySelector(this.resultsContainer);
        if (container) {
            container.innerHTML = `
                <div class="search-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                </div>
            `;
            container.classList.add('visible');
        }
    }
    
    hideResults() {
        const containers = [this.resultsContainer, this.suggestionsContainer];
        containers.forEach(selector => {
            const container = document.querySelector(selector);
            if (container) {
                container.classList.remove('visible');
            }
        });
    }
    
    highlightMatch(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // Search history management
    saveToHistory(query) {
        try {
            let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
            history.unshift(query);
            history = history.slice(0, 5);
            localStorage.setItem('searchHistory', JSON.stringify(history));
        } catch (error) {
            console.warn('Could not save search history:', error);
        }
    }
    
    showRecent() {
        if (this.searchInput.value.trim()) return;
        
        try {
            const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            if (history.length === 0) return;
            
            const container = document.querySelector(this.resultsContainer);
            if (container) {
                const html = `
                    <div class="search-recent">
                        <div class="search-recent-header">
                            <span>Pesquisas recentes</span>
                            <button onclick="localStorage.removeItem('searchHistory'); this.parentNode.parentNode.remove()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        ${history.map(query => `
                            <button class="search-recent-item" 
                                    onclick="document.querySelector('${this.container} input').value='${query}'; window.advancedSearch.handleSearch('${query}')">
                                <i class="fas fa-history"></i>
                                ${query}
                            </button>
                        `).join('')}
                    </div>
                `;
                
                container.innerHTML = html;
                container.classList.add('visible');
            }
        } catch (error) {
            console.warn('Could not show recent searches:', error);
        }
    }
    
    performFullSearch() {
        const query = this.searchInput.value.trim();
        if (query) {
            window.location.href = `/catalog?search=${encodeURIComponent(query)}`;
        }
    }
    
    handleKeydown(e) {
        const container = document.querySelector(this.resultsContainer);
        if (!container || !container.classList.contains('visible')) return;
        
        const items = container.querySelectorAll('.search-result-item, .search-recent-item, .search-suggestion-item');
        const activeItem = container.querySelector('.search-item-active');
        let activeIndex = activeItem ? Array.from(items).indexOf(activeItem) : -1;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                activeIndex = Math.min(activeIndex + 1, items.length - 1);
                this.setActiveItem(items, activeIndex);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                activeIndex = Math.max(activeIndex - 1, -1);
                this.setActiveItem(items, activeIndex);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (activeItem) {
                    activeItem.click();
                } else {
                    this.performFullSearch();
                }
                break;
                
            case 'Escape':
                this.hideResults();
                this.searchInput.blur();
                break;
        }
    }
    
    setActiveItem(items, index) {
        // Remove previous active
        items.forEach(item => item.classList.remove('search-item-active'));
        
        // Set new active
        if (index >= 0 && index < items.length) {
            items[index].classList.add('search-item-active');
            items[index].scrollIntoView({ block: 'nearest' });
        }
    }
    
    // Utility: debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Public API
    search(query) {
        return this.handleSearch(query);
    }
    
    clear() {
        this.searchInput.value = '';
        this.hideResults();
    }
    
    destroy() {
        if (this.abortController) {
            this.abortController.abort();
        }
        this.cache.clear();
        this.suggestionCache.clear();
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const searchContainer = document.querySelector('#search-container, .search-form, [data-search]');
    if (searchContainer) {
        window.advancedSearch = new AdvancedSearch({
            container: `#${searchContainer.id}` || '.search-form'
        });
    }
});
```

### **C. CSS para Search Interface**

#### **Criar: `public/css/search.css`**
```css
/* Advanced Search Styles */
.search-container {
    position: relative;
    width: 100%;
    max-width: 500px;
}

.search-input {
    width: 100%;
    padding: 12px 48px 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 25px;
    font-size: 16px;
    background: white;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: #c0a080;
    box-shadow: 0 0 0 3px rgba(192, 160, 128, 0.1);
}

.search-button {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    background: #c0a080;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    color: white;
    transition: background 0.3s ease;
}

.search-button:hover {
    background: #a08960;
}

/* Results Container */
.search-results-container,
.search-suggestions-container {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e0e0e0;
    border-top: none;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    display: none;
    animation: slideDown 0.2s ease;
}

.search-results-container.visible,
.search-suggestions-container.visible {
    display: block;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Search Result Items */
.search-result-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    text-decoration: none;
    color: inherit;
    transition: background 0.2s ease;
    gap: 12px;
}

.search-result-item:hover,
.search-result-item.search-item-active {
    background: #f8f9fa;
    text-decoration: none;
}

.search-result-image {
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    background: #f0f0f0;
}

.search-result-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.search-result-content {
    flex: 1;
    min-width: 0;
}

.search-result-name {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.search-result-name mark {
    background: #fff3cd;
    color: #856404;
    padding: 1px 2px;
    border-radius: 2px;
}

.search-result-ref {
    font-size: 12px;
    color: #666;
    margin: 0 0 2px 0;
}

.search-result-family {
    font-size: 11px;
    color: #999;
    margin: 0 0 6px 0;
}

.search-result-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search-result-price {
    font-size: 13px;
    font-weight: 600;
    color: #c0a080;
}

.search-result-stock {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 10px;
    text-transform: uppercase;
    font-weight: 500;
}

.search-result-stock.in-stock {
    background: #d4edda;
    color: #155724;
}

.search-result-stock.out-stock {
    background: #f8d7da;
    color: #721c24;
}

/* No Results */
.search-no-results {
    padding: 32px 16px;
    text-align: center;
    color: #666;
}

.search-no-results i {
    font-size: 32px;
    color: #ddd;
    margin-bottom: 12px;
}

.search-no-results p {
    margin: 0 0 4px 0;
    font-weight: 500;
}

.search-no-results small {
    color: #999;
}

/* Loading State */
.search-loading {
    padding: 24px 16px;
    text-align: center;
    color: #666;
}

.search-loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #c0a080;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 12px auto;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Error State */
.search-error {
    padding: 24px 16px;
    text-align: center;
    color: #dc3545;
}

.search-error i {
    font-size: 24px;
    margin-bottom: 8px;
}

/* Recent Searches */
.search-recent {
    padding: 8px 0;
}

.search-recent-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    font-size: 12px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
}

.search-recent-header button {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 0;
    font-size: 14px;
}

.search-recent-item,
.search-suggestion-item {
    width: 100%;
    padding: 10px 16px;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    color: #666;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s ease;
}

.search-recent-item:hover,
.search-suggestion-item:hover,
.search-recent-item.search-item-active,
.search-suggestion-item.search-item-active {
    background: #f8f9fa;
}

.search-recent-item i,
.search-suggestion-item i {
    color: #999;
    font-size: 12px;
}

/* Suggestions */
.search-suggestions-header {
    padding: 8px 16px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    font-size: 12px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
}

.search-suggestion-item mark {
    background: #fff3cd;
    color: #856404;
}

/* Show More */
.search-show-more {
    padding: 12px 16px;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
}

.search-show-more button {
    width: 100%;
    padding: 8px 16px;
    background: #c0a080;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: background 0.2s ease;
}

.search-show-more button:hover {
    background: #a08960;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .search-container {
        max-width: 100%;
    }
    
    .search-results-container,
    .search-suggestions-container {
        left: -16px;
        right: -16px;
        border-radius: 0 0 8px 8px;
    }
    
    .search-result-item {
        padding: 16px;
    }
    
    .search-result-image {
        width: 50px;
        height: 50px;
    }
    
    .search-result-name {
        font-size: 16px;
    }
    
    .search-result-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
    .search-results-container,
    .search-suggestions-container {
        animation: none;
    }
    
    .search-loading-spinner {
        animation: none;
        border: 2px solid #c0a080;
    }
}

/* High contrast mode */
@media (prefers-contrast: high) {
    .search-input {
        border-color: #000;
    }
    
    .search-button {
        background: #000;
    }
    
    .search-result-item:hover {
        background: #000;
        color: #fff;
    }
}
```

## 2.2 WhatsApp Integration

### **A. Modificar Controller para WhatsApp**

#### **Modificar: `controllers/CatalogController.js`**
```javascript
// ADICIONAR método para product detail com WhatsApp
exports.showProductDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [productResults] = await pool.execute(`
            SELECT p.*, pf.name as family_name,
                   GROUP_CONCAT(pi.image_filename ORDER BY pi.is_primary DESC) as images
            FROM products p
            LEFT JOIN product_families pf ON p.family_id = pf.id
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.id = ? AND p.is_active = 1
            GROUP BY p.id
        `, [id]);
        
        if (productResults.length === 0) {
            return res.status(404).render('error', { 
                message: 'Produto não encontrado',
                title: 'Produto não encontrado'
            });
        }
        
        const product = productResults[0];
        product.images = product.images ? product.images.split(',') : [];
        
        // WhatsApp integration data
        const whatsappData = {
            number: process.env.WHATSAPP_NUMBER || '351XXXXXXXXX', // Configurar no .env
            message: `Olá! Gostaria de informações sobre:

*${product.name}*
Referência: ${product.reference}
${product.sale_price ? `Preço: €${parseFloat(product.sale_price).toFixed(2)}` : 'Preço sob consulta'}

Link: ${req.protocol}://${req.get('host')}/catalog/product/${id}`,
            
            encodedMessage: null // será preenchido no template
        };
        
        whatsappData.encodedMessage = encodeURIComponent(whatsappData.message);
        
        // SEO metadata
        const seoData = {
            title: `${product.name} - Gonzaga's Art & Shine`,
            description: product.description || `${product.name} - Joalharia artesanal em prata 925`,
            keywords: `${product.name}, ${product.reference}, joalharia, prata 925, ${product.family_name}`,
            ogImage: product.images[0] ? `/uploads/products/${product.images[0]}` : '/images/logo.png',
            canonical: `${req.protocol}://${req.get('host')}/catalog/product/${id}`,
            jsonLd: {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": product.name,
                "description": product.description,
                "sku": product.reference,
                "category": product.family_name,
                "brand": {
                    "@type": "Brand",
                    "name": "Gonzaga's Art & Shine"
                },
                "offers": {
                    "@type": "Offer",
                    "price": product.sale_price,
                    "priceCurrency": "EUR",
                    "availability": product.current_stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                },
                "image": product.images.map(img => `${req.protocol}://${req.get('host')}/uploads/products/${img}`)
            }
        };
        
        res.render('catalog/product-detail', { 
            product, 
            whatsappData,
            seoData,
            title: seoData.title,
            description: seoData.description
        });
        
    } catch (error) {
        console.error('Product detail error:', error);
        res.status(500).render('error', { 
            message: 'Erro interno do servidor' 
        });
    }
};
```

### **B. Template de Produto com WhatsApp**

#### **Criar/Modificar: `views/catalog/product-detail.ejs`**
```html
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <title><%= seoData.title %></title>
    <meta name="description" content="<%= seoData.description %>">
    <meta name="keywords" content="<%= seoData.keywords %>">
    <link rel="canonical" href="<%= seoData.canonical %>">
    
    <!-- Open Graph -->
    <meta property="og:title" content="<%= seoData.title %>">
    <meta property="og:description" content="<%= seoData.description %>">
    <meta property="og:image" content="<%= seoData.ogImage %>">
    <meta property="og:type" content="product">
    
    <!-- JSON-LD -->
    <script type="application/ld+json"><%- JSON.stringify(seoData.jsonLd) %></script>
    
    <!-- CSS -->
    <link rel="stylesheet" href="/css/main.css">
    <link rel="stylesheet" href="/css/product-detail.css">
    <link rel="stylesheet" href="/css/whatsapp.css">
    
    <!-- FontAwesome for WhatsApp icon -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="product-detail-container">
        <!-- Breadcrumbs -->
        <nav class="breadcrumbs">
            <a href="/">Início</a>
            <span>/</span>
            <a href="/catalog">Catálogo</a>
            <span>/</span>
            <span class="current"><%= product.name %></span>
        </nav>
        
        <div class="product-detail">
            <!-- Product Images -->
            <div class="product-images">
                <% if (product.images && product.images.length > 0) { %>
                    <div class="main-image">
                        <img id="mainProductImage" 
                             src="/uploads/products/<%= product.images[0] %>" 
                             alt="<%= product.name %>"
                             class="img-responsive">
                    </div>
                    
                    <% if (product.images.length > 1) { %>
                        <div class="thumbnail-images">
                            <% product.images.forEach((image, index) => { %>
                                <img src="/uploads/products/<%= image %>" 
                                     alt="<%= product.name %> - Imagem <%= index + 1 %>"
                                     class="thumbnail <%= index === 0 ? 'active' : '' %>"
                                     onclick="changeMainImage(this.src, this)">
                            <% }); %>
                        </div>
                    <% } %>
                <% } else { %>
                    <div class="no-image">
                        <i class="fas fa-image"></i>
                        <p>Imagem não disponível</p>
                    </div>
                <% } %>
            </div>
            
            <!-- Product Info -->
            <div class="product-info">
                <h1 class="product-title"><%= product.name %></h1>
                
                <div class="product-reference">
                    <strong>Referência:</strong> <%= product.reference %>
                </div>
                
                <% if (product.family_name) { %>
                    <div class="product-family">
                        <strong>Categoria:</strong> <%= product.family_name %>
                    </div>
                <% } %>
                
                <!-- Price -->
                <div class="product-price">
                    <% if (product.sale_price) { %>
                        <span class="price">€<%= parseFloat(product.sale_price).toFixed(2) %></span>
                    <% } else { %>
                        <span class="price-consultation">Preço sob consulta</span>
                    <% } %>
                </div>
                
                <!-- Stock Status -->
                <div class="product-stock">
                    <% if (product.current_stock > 0) { %>
                        <span class="in-stock">
                            <i class="fas fa-check-circle"></i>
                            Em stock (<%= product.current_stock %> disponível<%= product.current_stock > 1 ? 's' : '' %>)
                        </span>
                    <% } else { %>
                        <span class="out-of-stock">
                            <i class="fas fa-times-circle"></i>
                            Temporariamente esgotado
                        </span>
                    <% } %>
                </div>
                
                <!-- Description -->
                <% if (product.description) { %>
                    <div class="product-description">
                        <h3>Descrição</h3>
                        <p><%= product.description %></p>
                    </div>
                <% } %>
                
                <!-- Product Details -->
                <div class="product-details">
                    <h3>Detalhes</h3>
                    <ul>
                        <% if (product.material) { %>
                            <li><strong>Material:</strong> <%= product.material %></li>
                        <% } %>
                        <% if (product.weight) { %>
                            <li><strong>Peso:</strong> <%= product.weight %>g</li>
                        <% } %>
                        <% if (product.dimensions) { %>
                            <li><strong>Dimensões:</strong> <%= product.dimensions %></li>
                        <% } %>
                        <% if (product.style) { %>
                            <li><strong>Estilo:</strong> <%= product.style %></li>
                        <% } %>
                    </ul>
                </div>
                
                <!-- Action Buttons -->
                <div class="product-actions">
                    <!-- WhatsApp Button (Primary) -->
                    <a href="https://wa.me/<%= whatsappData.number %>?text=<%= whatsappData.encodedMessage %>" 
                       class="btn btn-whatsapp" 
                       target="_blank"
                       onclick="trackWhatsAppClick()">
                        <i class="fab fa-whatsapp"></i>
                        Pedir Informações via WhatsApp
                    </a>
                    
                    <!-- Secondary Actions -->
                    <div class="secondary-actions">
                        <button class="btn btn-secondary" onclick="copyProductInfo()">
                            <i class="fas fa-copy"></i>
                            Copiar Informações
                        </button>
                        
                        <button class="btn btn-secondary" onclick="shareProduct()">
                            <i class="fas fa-share-alt"></i>
                            Partilhar
                        </button>
                    </div>
                </div>
                
                <!-- Contact Info -->
                <div class="contact-info">
                    <h4>Outras formas de contacto:</h4>
                    <ul>
                        <li><i class="fas fa-phone"></i> <a href="tel:+351XXXXXXXXX">+351 XXX XXX XXX</a></li>
                        <li><i class="fas fa-envelope"></i> <a href="mailto:info@artnshine.pt">info@artnshine.pt</a></li>
                        <li><i class="fab fa-instagram"></i> <a href="https://www.instagram.com/gonzagaartnshine/" target="_blank">@gonzagaartnshine</a></li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Related Products -->
        <div class="related-products">
            <h2>Produtos Relacionados</h2>
            <!-- Implementar related products aqui -->
        </div>
    </div>
    
    <!-- JavaScript -->
    <script>
        // Change main image
        function changeMainImage(src, thumbnail) {
            document.getElementById('mainProductImage').src = src;
            
            // Update active thumbnail
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        }
        
        // Copy product info
        function copyProductInfo() {
            const info = `${product.name}\nReferência: ${product.reference}\n${product.sale_price ? 'Preço: €' + parseFloat(product.sale_price).toFixed(2) : 'Preço sob consulta'}\nLink: ${window.location.href}`;
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(info).then(() => {
                    showNotification('Informações copiadas!', 'success');
                });
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = info;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('Informações copiadas!', 'success');
            }
        }
        
        // Share product
        function shareProduct() {
            if (navigator.share) {
                navigator.share({
                    title: '<%= product.name %>',
                    text: 'Confira este produto na Gonzaga\'s Art & Shine',
                    url: window.location.href
                });
            } else {
                copyProductInfo();
            }
        }
        
        // Track WhatsApp click (Analytics)
        function trackWhatsAppClick() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'whatsapp_click', {
                    event_category: 'engagement',
                    event_label: 'product_inquiry',
                    product_id: '<%= product.id %>',
                    product_name: '<%= product.name %>'
                });
            }
        }
        
        // Simple notification system
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }
    </script>
</body>
</html>
```

### **C. CSS para WhatsApp e Product Detail**

#### **Criar: `public/css/whatsapp.css`**
```css
/* WhatsApp Integration Styles */
.btn-whatsapp {
    background: linear-gradient(135deg, #25D366 0%, #20BA5A 100%);
    color: white;
    border: none;
    padding: 16px 24px;
    border-radius: 12px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
    width: 100%;
    justify-content: center;
    margin-bottom: 16px;
}

.btn-whatsapp:hover {
    background: linear-gradient(135deg, #20BA5A 0%, #1da851 100%);
    color: white;
    text-decoration: none;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(37, 211, 102, 0.4);
}

.btn-whatsapp:active {
    transform: translateY(0);
}

.btn-whatsapp i {
    font-size: 1.4em;
}

/* Secondary Actions */
.secondary-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.btn-secondary {
    background: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
}

.btn-secondary:hover {
    background: #e9ecef;
    color: #495057;
    border-color: #c6d0d5;
}

/* Contact Info */
.contact-info {
    margin-top: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #c0a080;
}

.contact-info h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #495057;
}

.contact-info ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.contact-info li {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 14px;
}

.contact-info a {
    color: #6c757d;
    text-decoration: none;
}

.contact-info a:hover {
    color: #c0a080;
    text-decoration: underline;
}

.contact-info i {
    width: 16px;
    color: #c0a080;
}

/* Notification System */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 16px 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 10000;
    transform: translateX(400px);
    opacity: 0;
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: 500;
    min-width: 250px;
}

.notification.show {
    transform: translateX(0);
    opacity: 1;
}

.notification-success {
    border-left-color: #28a745;
    color: #155724;
}

.notification-error {
    border-left-color: #dc3545;
    color: #721c24;
}

.notification-info {
    border-left-color: #17a2b8;
    color: #0c5460;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .btn-whatsapp {
        font-size: 18px;
        padding: 18px 24px;
    }
    
    .secondary-actions {
        flex-direction: column;
    }
    
    .btn-secondary {
        justify-content: center;
    }
    
    .notification {
        right: 16px;
        left: 16px;
        min-width: auto;
    }
}

/* WhatsApp animation */
@keyframes whatsappPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.btn-whatsapp:focus {
    animation: whatsappPulse 0.6s ease-in-out;
}

/* Floating WhatsApp Button (Optional) */
.whatsapp-float {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #25D366;
    color: white;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    text-decoration: none;
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
    z-index: 1000;
    transition: all 0.3s ease;
}

.whatsapp-float:hover {
    background: #20BA5A;
    color: white;
    transform: scale(1.1);
    text-decoration: none;
}

/* Hide float button on product pages (since we have inline button) */
.product-detail-container .whatsapp-float {
    display: none;
}
```

***

## **RESUMO FASE 2: CHECKLIST COMPLETO**

### **2.1 Search System:**
- [ ] Criar/modificar `routes/api.js` com endpoints search
- [ ] Criar `public/js/advanced-search.js` 
- [ ] Criar `public/css/search.css`
- [ ] Adicionar search box ao layout principal
- [ ] Modificar `controllers/CatalogController.js` para suportar search
- [ ] Testar search API: `/api/search?q=test`
- [ ] Testar suggestions: `/api/search/suggestions?q=test`

### **2.2 WhatsApp Integration:**
- [ ] Configurar `WHATSAPP_NUMBER` no `.env`
- [ ] Modificar `controllers/CatalogController.js` (método showProductDetail)
- [ ] Criar `views/catalog/product-detail.ejs`
- [ ] Criar `public/css/whatsapp.css`
- [ ] Criar rota para product detail: `/catalog/product/:id`
- [ ] Testar botão WhatsApp em produtos
- [ ] Testar share e copy functions

### **2.3 Integration Tests:**
- [ ] Search funciona em todas as páginas
- [ ] WhatsApp messages são formatadas corretamente
- [ ] Mobile experience é fluída
- [ ] Analytics tracking funciona
- [ ] SEO meta tags estão corretas

---

## **MÉTRICAS DE SUCESSO FASE 2:**
- ✅ Search responde < 500ms
- ✅ WhatsApp messages bem formatadas
- ✅ Mobile-first experience
- ✅ Zero breaking changes
- ✅ Backwards compatible

**Está pronto para implementar a Fase 2? Qual parte quer começar primeiro - Search ou WhatsApp?**