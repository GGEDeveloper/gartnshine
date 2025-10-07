# Plano de Melhoria Técnica - Gonzaga's Art & Shine
**Implementação Específica no Código Existente**

***

## FASE 1: Otimização Core e Performance

### **1.1 Database Query Optimization**

#### **Modificar: `config/database.js`**
```javascript
// ANTES
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// DEPOIS
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 3, // Reduzido para shared hosting
  acquireTimeout: 30000,
  timeout: 30000,
  reconnect: true,
  charset: 'utf8mb4',
  timezone: 'local'
});

// ADICIONAR: Connection health check
const healthCheck = setInterval(async () => {
  try {
    await pool.execute('SELECT 1');
  } catch (error) {
    console.error('Database health check failed:', error);
  }
}, 300000); // 5 minutos
```

#### **Modificar: `models/Product.js`**
```javascript
// ADICIONAR: Queries otimizadas com paginação
static async findAllWithPagination(page = 1, limit = 20, filters = {}) {
  const offset = (page - 1) * limit;
  let whereClause = 'WHERE p.is_active = 1';
  const params = [];
  
  if (filters.family_id) {
    whereClause += ' AND p.family_id = ?';
    params.push(filters.family_id);
  }
  
  if (filters.search) {
    whereClause += ' AND (p.name LIKE ? OR p.reference LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  
  const query = `
    SELECT p.*, pf.name as family_name, 
           GROUP_CONCAT(pi.image_filename) as images,
           (SELECT pi2.image_filename FROM product_images pi2 
            WHERE pi2.product_id = p.id AND pi2.is_primary = 1 LIMIT 1) as main_image
    FROM products p 
    LEFT JOIN product_families pf ON p.family_id = pf.id 
    LEFT JOIN product_images pi ON p.id = pi.product_id 
    ${whereClause}
    GROUP BY p.id 
    ORDER BY p.created_at DESC 
    LIMIT ? OFFSET ?
  `;
  
  params.push(limit, offset);
  const [rows] = await pool.execute(query, params);
  
  // Count total para pagination
  const [countResult] = await pool.execute(
    `SELECT COUNT(DISTINCT p.id) as total FROM products p ${whereClause}`,
    params.slice(0, -2)
  );
  
  return {
    products: rows,
    total: countResult[0].total,
    currentPage: page,
    totalPages: Math.ceil(countResult[0].total / limit)
  };
}
```

#### **Adicionar: `sql/indexes_optimization.sql`**
```sql
-- Novos índices para performance
ALTER TABLE products ADD INDEX idx_active_featured (is_active, featured);
ALTER TABLE products ADD INDEX idx_family_active (family_id, is_active);
ALTER TABLE products ADD INDEX idx_search (name, reference);
ALTER TABLE product_images ADD INDEX idx_product_primary (product_id, is_primary);
ALTER TABLE inventory_transactions ADD INDEX idx_product_date (product_id, created_at);

-- View otimizada para catalog
CREATE OR REPLACE VIEW catalog_products AS
SELECT 
    p.id, p.reference, p.name, p.description, p.sale_price, 
    p.style, p.material, p.featured, p.current_stock,
    pf.name as family_name,
    pi.image_filename as main_image
FROM products p
LEFT JOIN product_families pf ON p.family_id = pf.id
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
WHERE p.is_active = 1;
```

### **1.2 Frontend Performance**

#### **Criar: `public/js/performance.js`**
```javascript
// Performance optimization utilities
const Performance = {
  // Critical resource loading
  loadCriticalCSS() {
    const criticalCSS = document.getElementById('critical-css');
    if (!criticalCSS) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/css/critical.css';
      link.id = 'critical-css';
      document.head.appendChild(link);
    }
  },

  // Lazy load images with WebP support
  initLazyImages() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const webpSrc = img.dataset.webp;
          const fallbackSrc = img.dataset.src;
          
          // Check WebP support
          if (this.supportsWebP() && webpSrc) {
            img.src = webpSrc;
          } else {
            img.src = fallbackSrc;
          }
          
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  },

  // WebP support detection
  supportsWebP() {
    return new Promise(resolve => {
      const webP = new Image();
      webP.onload = webP.onerror = () => resolve(webP.height === 2);
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  },

  // Preload critical resources
  preloadCritical() {
    const criticalResources = [
      '/css/main.css',
      '/js/main.js',
      '/images/logo.png'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      } else {
        link.as = 'image';
      }
      
      link.href = resource;
      document.head.appendChild(link);
    });
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Performance.loadCriticalCSS();
  Performance.initLazyImages();
  Performance.preloadCritical();
});
```

#### **Modificar: `views/layouts/main.ejs`**
```html
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- ADICIONAR: Performance hints -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- MODIFICAR: Critical CSS inline -->
    <style>
        /* Critical above-the-fold CSS */
        body { margin: 0; font-family: 'Inter', sans-serif; }
        .loading { opacity: 0.5; pointer-events: none; }
        .lazy { opacity: 0; transition: opacity 0.3s; }
    </style>
    
    <!-- MODIFICAR: Async CSS loading -->
    <link rel="preload" href="/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/css/main.css"></noscript>
    
    <title><%= title || 'Gonzaga\'s Art & Shine' %></title>
    
    <!-- ADICIONAR: SEO meta tags -->
    <meta name="description" content="<%= description || 'Joalharia artesanal em prata 925 com inspiração Bali e tendências boho' %>">
    <meta name="keywords" content="joalharia, prata 925, bali, boho, artesanal">
    
    <!-- ADICIONAR: Open Graph -->
    <meta property="og:title" content="<%= title || 'Gonzaga\'s Art & Shine' %>">
    <meta property="og:description" content="<%= description || 'Joalharia artesanal em prata 925' %>">
    <meta property="og:type" content="website">
    <meta property="og:url" content="<%= process.env.BASE_URL || 'https://artnshine.pt' %><%= req.originalUrl %>">
    
    <!-- ADICIONAR: Schema.org markup -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "JewelryStore",
        "name": "Gonzaga's Art & Shine",
        "description": "Joalharia artesanal em prata 925 com inspiração Bali e tendências boho",
        "url": "<%= process.env.BASE_URL || 'https://artnshine.pt' %>",
        "sameAs": [
            "https://www.instagram.com/gonzagaartnshine/",
            "https://www.facebook.com/profile.php?id=61573519807731"
        ]
    }
    </script>
</head>
```

### **1.3 Caching Strategy**

#### **Modificar: `app.js`**
```javascript
// ADICIONAR: Compression middleware
const compression = require('compression');
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024
}));

// ADICIONAR: Static file caching
app.use('/public', express.static('public', {
    maxAge: process.env.NODE_ENV === 'production' ? '30d' : '1h',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
        if (path.match(/\.(css|js)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
        }
        if (path.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
        }
    }
}));

// ADICIONAR: Response caching para API endpoints
const cache = new Map();
const cacheMiddleware = (duration = 300) => { // 5 minutes default
    return (req, res, next) => {
        if (req.method !== 'GET') return next();
        
        const key = req.originalUrl;
        const cached = cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < duration * 1000) {
            return res.json(cached.data);
        }
        
        res.sendResponse = res.json;
        res.json = (body) => {
            cache.set(key, { data: body, timestamp: Date.now() });
            res.sendResponse(body);
        };
        
        next();
    };
};

// Aplicar cache nos endpoints de API
app.use('/api/products', cacheMiddleware(600)); // 10 minutes
app.use('/api/families', cacheMiddleware(1800)); // 30 minutes
```

***

## FASE 2: Funcionalidades Avançadas

### **2.1 Search Enhancement**

#### **Criar: `public/js/search.js`**
```javascript
class AdvancedSearch {
    constructor(options = {}) {
        this.container = options.container || '#search-container';
        this.resultsContainer = options.resultsContainer || '#search-results';
        this.minLength = options.minLength || 2;
        this.debounceTime = options.debounceTime || 300;
        this.cache = new Map();
        
        this.init();
    }
    
    init() {
        const input = document.querySelector(`${this.container} input`);
        if (!input) return;
        
        input.addEventListener('input', Utils.debounce(this.handleSearch.bind(this), this.debounceTime));
        input.addEventListener('focus', this.showRecent.bind(this));
        
        // Keyboard navigation
        input.addEventListener('keydown', this.handleKeydown.bind(this));
    }
    
    async handleSearch(event) {
        const query = event.target.value.trim();
        
        if (query.length < this.minLength) {
            this.hideResults();
            return;
        }
        
        try {
            const results = await this.search(query);
            this.displayResults(results, query);
            this.saveToHistory(query);
        } catch (error) {
            console.error('Search error:', error);
        }
    }
    
    async search(query) {
        // Check cache first
        if (this.cache.has(query)) {
            return this.cache.get(query);
        }
        
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        
        // Cache results
        this.cache.set(query, results);
        return results;
    }
    
    displayResults(results, query) {
        const container = document.querySelector(this.resultsContainer);
        if (!container) return;
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="search-no-results">
                    <p>Nenhum resultado encontrado para "${query}"</p>
                </div>
            `;
            return;
        }
        
        const html = results.map(product => `
            <div class="search-result-item" data-id="${product.id}">
                <img src="${product.main_image || '/images/placeholder.jpg'}" 
                     alt="${product.name}" class="search-result-image lazy">
                <div class="search-result-content">
                    <h4>${this.highlightMatch(product.name, query)}</h4>
                    <p class="search-result-ref">${product.reference}</p>
                    <p class="search-result-price">${this.formatPrice(product.sale_price)}</p>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
        container.classList.add('visible');
        
        // Reinitialize lazy loading for new images
        Performance.initLazyImages();
    }
    
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    }
    
    saveToHistory(query) {
        let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        history = history.filter(item => item !== query);
        history.unshift(query);
        history = history.slice(0, 5); // Keep only last 5
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }
    
    showRecent() {
        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        if (history.length === 0) return;
        
        const container = document.querySelector(this.resultsContainer);
        const html = `
            <div class="search-recent">
                <h4>Pesquisas recentes</h4>
                ${history.map(query => 
                    `<button class="search-recent-item" data-query="${query}">${query}</button>`
                ).join('')}
            </div>
        `;
        
        container.innerHTML = html;
        container.classList.add('visible');
        
        // Add click handlers
        container.querySelectorAll('.search-recent-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const input = document.querySelector(`${this.container} input`);
                input.value = e.target.dataset.query;
                this.handleSearch({ target: input });
            });
        });
    }
}
```

#### **Adicionar: Nova rota API - `routes/api.js`**
```javascript
// ADICIONAR: Search endpoint
router.get('/search', async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        
        if (!q || q.length < 2) {
            return res.json([]);
        }
        
        const searchQuery = `
            SELECT p.id, p.reference, p.name, p.sale_price,
                   pi.image_filename as main_image,
                   pf.name as family_name
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
            LEFT JOIN product_families pf ON p.family_id = pf.id
            WHERE p.is_active = 1 
            AND (p.name LIKE ? OR p.reference LIKE ? OR p.description LIKE ?)
            ORDER BY 
                CASE 
                    WHEN p.name LIKE ? THEN 1
                    WHEN p.reference LIKE ? THEN 2
                    ELSE 3
                END,
                p.featured DESC,
                p.created_at DESC
            LIMIT ?
        `;
        
        const searchTerm = `%${q}%`;
        const exactTerm = `${q}%`;
        
        const [results] = await pool.execute(searchQuery, [
            searchTerm, searchTerm, searchTerm,
            exactTerm, exactTerm,
            parseInt(limit)
        ]);
        
        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});
```

### **2.2 Shopping Cart System**

#### **Criar: `public/js/cart.js`**
```javascript
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart') || '[]');
        this.init();
    }
    
    init() {
        this.updateCartUI();
        this.bindEvents();
        
        // Sync with server periodically
        setInterval(() => this.syncWithServer(), 30000);
    }
    
    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-add-to-cart]')) {
                const productId = e.target.dataset.productId;
                const quantity = parseInt(e.target.dataset.quantity || '1');
                this.addItem(productId, quantity);
            }
            
            if (e.target.matches('[data-remove-from-cart]')) {
                const productId = e.target.dataset.productId;
                this.removeItem(productId);
            }
            
            if (e.target.matches('[data-cart-toggle]')) {
                this.toggleCart();
            }
        });
        
        // Quantity changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('[data-cart-quantity]')) {
                const productId = e.target.dataset.productId;
                const quantity = parseInt(e.target.value);
                this.updateQuantity(productId, quantity);
            }
        });
    }
    
    async addItem(productId, quantity = 1) {
        try {
            // Get product details
            const response = await fetch(`/api/products/${productId}`);
            const product = await response.json();
            
            if (!product) throw new Error('Product not found');
            
            const existingItem = this.items.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                this.items.push({
                    id: productId,
                    name: product.name,
                    reference: product.reference,
                    price: product.sale_price,
                    image: product.main_image,
                    quantity: quantity,
                    addedAt: new Date().toISOString()
                });
            }
            
            this.saveCart();
            this.updateCartUI();
            
            notifications.success(`${product.name} adicionado ao carrinho`);
            
        } catch (error) {
            console.error('Add to cart error:', error);
            notifications.error('Erro ao adicionar produto ao carrinho');
        }
    }
    
    removeItem(productId) {
        const itemIndex = this.items.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const item = this.items[itemIndex];
            this.items.splice(itemIndex, 1);
            this.saveCart();
            this.updateCartUI();
            
            notifications.info(`${item.name} removido do carrinho`);
        }
    }
    
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartUI();
            }
        }
    }
    
    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
    
    updateCartUI() {
        const cartCount = document.querySelector('.cart-count');
        const cartItems = document.querySelector('.cart-items');
        const cartTotal = document.querySelector('.cart-total');
        
        if (cartCount) {
            cartCount.textContent = this.getItemCount();
            cartCount.style.display = this.items.length > 0 ? 'block' : 'none';
        }
        
        if (cartItems) {
            if (this.items.length === 0) {
                cartItems.innerHTML = '<p class="cart-empty">Carrinho vazio</p>';
            } else {
                cartItems.innerHTML = this.items.map(item => `
                    <div class="cart-item" data-product-id="${item.id}">
                        <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name}">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p class="cart-item-ref">${item.reference}</p>
                            <div class="cart-item-controls">
                                <input type="number" min="1" value="${item.quantity}" 
                                       data-cart-quantity data-product-id="${item.id}">
                                <span class="cart-item-price">€${(item.price * item.quantity).toFixed(2)}</span>
                                <button class="btn-remove" data-remove-from-cart data-product-id="${item.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        if (cartTotal) {
            cartTotal.textContent = `€${this.getTotal().toFixed(2)}`;
        }
    }
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }
    
    toggleCart() {
        const cartSidebar = document.querySelector('.cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.toggle('active');
        }
    }
    
    async syncWithServer() {
        // Sync cart with server session for logged users
        try {
            await fetch('/api/cart/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: this.items })
            });
        } catch (error) {
            // Silent fail - cart continues to work locally
        }
    }
    
    clear() {
        this.items = [];
        this.saveCart();
        this.updateCartUI();
    }
}

// Initialize cart
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
});
```

### **2.3 Enhanced Admin Dashboard**

#### **Modificar: `controllers/admin.js`**
```javascript
// ADICIONAR: Dashboard analytics
exports.dashboard = async (req, res) => {
    try {
        // Existing stats
        const [products] = await pool.execute('SELECT COUNT(*) as total FROM products WHERE is_active = 1');
        const [lowStock] = await pool.execute('SELECT COUNT(*) as total FROM products WHERE current_stock < 5 AND is_active = 1');
        const [featured] = await pool.execute('SELECT COUNT(*) as total FROM products WHERE featured = 1 AND is_active = 1');
        
        // ADICIONAR: Advanced analytics
        const [recentActivity] = await pool.execute(`
            SELECT 'product_created' as type, p.name as item, p.created_at as date 
            FROM products p WHERE p.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
            UNION ALL
            SELECT 'inventory_transaction' as type, 
                   CONCAT(p.name, ' (', it.transaction_type, ')') as item, 
                   it.created_at as date
            FROM inventory_transactions it 
            JOIN products p ON it.product_id = p.id 
            WHERE it.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY date DESC LIMIT 10
        `);
        
        // ADICIONAR: Sales summary (if e-commerce is active)
        const [monthlySales] = await pool.execute(`
            SELECT 
                MONTH(created_at) as month,
                YEAR(created_at) as year,
                COUNT(*) as transactions,
                SUM(CASE WHEN transaction_type = 'sale' THEN total_amount ELSE 0 END) as revenue
            FROM inventory_transactions 
            WHERE created_at > DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY YEAR(created_at), MONTH(created_at)
            ORDER BY year DESC, month DESC
        `);
        
        // ADICIONAR: Top selling products
        const [topProducts] = await pool.execute(`
            SELECT p.name, p.reference, 
                   SUM(it.quantity) as total_sold,
                   SUM(it.total_amount) as revenue
            FROM products p
            JOIN inventory_transactions it ON p.id = it.product_id
            WHERE it.transaction_type = 'sale' 
            AND it.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY p.id
            ORDER BY total_sold DESC
            LIMIT 5
        `);
        
        // ADICIONAR: Stock alerts
        const [stockAlerts] = await pool.execute(`
            SELECT p.name, p.reference, p.current_stock,
                   CASE 
                       WHEN p.current_stock = 0 THEN 'danger'
                       WHEN p.current_stock < 3 THEN 'warning'
                       WHEN p.current_stock < 5 THEN 'info'
                   END as alert_level
            FROM products p 
            WHERE p.current_stock < 5 AND p.is_active = 1
            ORDER BY p.current_stock ASC
        `);
        
        res.render('admin/dashboard', {
            stats: {
                products: products[0].total,
                lowStock: lowStock[0].total,
                featured: featured[0].total
            },
            recentActivity: recentActivity,
            monthlySales: monthlySales,
            topProducts: topProducts,
            stockAlerts: stockAlerts,
            user: req.session.user
        });
        
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error', 'Erro ao carregar dashboard');
        res.redirect('/admin/login');
    }
};
```

#### **Criar: `views/admin/partials/analytics-charts.ejs`**
```html
<div class="analytics-section">
    <div class="row">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">
                    <h5>Vendas por Mês</h5>
                </div>
                <div class="card-body">
                    nvas id="saleslesChart" width="400" height="200"></canvas>
                </div>
            </div>
        </div>
        
        <div class="col-md-4">
            <div class="card">
                <div class="card-header">
                    <h5>Top Produtos</h5>
                </div>
                <div class="card-body">
                    <% if (topProducts.length === 0) { %>
                        <p class="text-muted">Sem dados de vendas</p>
                    <% } else { %>
                        <div class="top-products-list">
                            <% topProducts.forEach((product, index) => { %>
                                <div class="top-product-item">
                                    <span class="rank">#<%= index + 1 %></span>
                                    <div class="product-info">
                                        <strong><%= product.name %></strong>
                                        <small class="text-muted"><%= product.reference %></small>
                                    </div>
                                    <div class="product-stats">
                                        <div class="sold"><%= product.total_sold %> vendas</div>
                                        <div class="revenue">€<%= parseFloat(product.revenue).toFixed(2) %></div>
                                    </div>
                                </div>
                            <% }); %>
                        </div>
                    <% } %>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
// Sales chart
const ctx = document.getElementById('salesChart').getContext('2d');
const salesData = <%- JSON.stringify(monthlySales) %>;

new Chart(ctx, {
    type: 'line',
    data: {
        labels: salesData.map(item => `${item.month}/${item.year}`),
        datasets: [{
            label: 'Receita (€)',
            data: salesData.map(item => item.revenue),
            borderColor: '#c0a080',
            backgroundColor: 'rgba(192, 160, 128, 0.1)',
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return '€' + value.toFixed(2);
                    }
                }
            }
        }
    }
});
</script>
```

***

## FASE 3: PWA e Offline Capabilities

### **3.1 Service Worker Implementation**

#### **Criar: `public/sw.js`**
```javascript
const CACHE_NAME = 'gonzagas-v1.0';
const STATIC_CACHE = 'gonzagas-static-v1.0';
const DYNAMIC_CACHE = 'gonzagas-dynamic-v1.0';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/catalog',
    '/css/main.css',
    '/css/components.css',
    '/js/main.js',
    '/js/modules/utils.js',
    '/js/performance.js',
    '/images/logo.png',
    '/images/placeholder.jpg',
    '/offline.html'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(STATIC_FILES))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Handle different types of requests
    if (request.destination === 'image') {
        event.respondWith(handleImageRequest(request));
    } else if (request.url.includes('/api/')) {
        event.respondWith(handleApiRequest(request));
    } else if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(handlePageRequest(request));
    } else {
        event.respondWith(handleStaticRequest(request));
    }
});

// Image requests - cache first, network fallback
async function handleImageRequest(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Return placeholder image for failed image requests
        return caches.match('/images/placeholder.jpg');
    }
}

// API requests - network first, cache fallback
async function handleApiRequest(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('{"error":"Offline"}', {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Page requests - cache first for static, network first for dynamic
async function handlePageRequest(request) {
    try {
        // Try network first for dynamic content
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;
        
        // Ultimate fallback to offline page
        return caches.match('/offline.html');
    }
}

// Static files - cache first
async function handleStaticRequest(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        throw error;
    }
}

// Background sync for cart updates
self.addEventListener('sync', (event) => {
    if (event.tag === 'cart-sync') {
        event.waitUntil(syncCart());
    }
});

async function syncCart() {
    try {
        // Get cart data from IndexedDB or localStorage
        const cart = await getCartData();
        await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cart)
        });
    } catch (error) {
        console.error('Cart sync failed:', error);
    }
}
```

#### **Criar: `public/manifest.json`**
```json
{
    "name": "Gonzaga's Art & Shine",
    "short_name": "Gonzagas",
    "description": "Joalharia artesanal em prata 925 com inspiração Bali e tendências boho",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#1a1a1a",
    "theme_color": "#c0a080",
    "orientation": "portrait",
    "categories": ["shopping", "lifestyle"],
    "lang": "pt-PT",
    "icons": [
        {
            "src": "/images/icons/icon-72x72.png",
            "sizes": "72x72",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/images/icons/icon-96x96.png",
            "sizes": "96x96",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/images/icons/icon-128x128.png",
            "sizes": "128x128",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/images/icons/icon-144x144.png",
            "sizes": "144x144",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/images/icons/icon-152x152.png",
            "sizes": "152x152",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/images/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/images/icons/icon-384x384.png",
            "sizes": "384x384",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/images/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
        }
    ]
}
```

#### **Criar: `views/offline.ejs`**
```html
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - Gonzaga's Art & Shine</title>
    <link rel="stylesheet" href="/css/main.css">
    <style>
        .offline-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
            padding: 2rem;
        }
        
        .offline-icon {
            font-size: 4rem;
            color: #c0a080;
            margin-bottom: 1rem;
        }
        
        .offline-title {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: #333;
        }
        
        .offline-message {
            color: #666;
            margin-bottom: 2rem;
        }
        
        .retry-button {
            background: #c0a080;
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
        }
        
        .retry-button:hover {
            background: #a08960;
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">
            <i class="fas fa-wifi-slash"></i>
        </div>
        <h1 class="offline-title">Sem Conexão</h1>
        <p class="offline-message">
            Não é possível conectar à internet. Algumas funcionalidades podem estar limitadas.
        </p>
        <button class="retry-button" onclick="window.location.reload()">
            Tentar Novamente
        </button>
        
        <div class="offline-actions" style="margin-top: 2rem;">
            <a href="/" class="btn btn-outline">Voltar ao Início</a>
            <a href="/catalog" class="btn btn-outline">Ver Catálogo</a>
        </div>
    </div>
    
    <script>
        // Check connection status
        window.addEventListener('online', () => {
            location.reload();
        });
        
        // Retry button
        document.querySelector('.retry-button').addEventListener('click', () => {
            if (navigator.onLine) {
                location.reload();
            } else {
                alert('Ainda sem conexão. Verifique sua rede e tente novamente.');
            }
        });
    </script>
</body>
</html>
```

### **3.2 PWA Installation Prompt**

#### **Criar: `public/js/pwa.js`**
```javascript
class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }
    
    init() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        
        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed');
            this.hideInstallButton();
            notifications.success('App instalado com sucesso!');
        });
        
        // Register service worker
        this.registerServiceWorker();
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });
                
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }
    
    showInstallButton() {
        const installButton = document.getElementById('pwa-install-btn');
        if (installButton) {
            installButton.style.display = 'block';
            installButton.addEventListener('click', this.installPWA.bind(this));
        } else {
            // Create floating install prompt
            this.createFloatingPrompt();
        }
    }
    
    hideInstallButton() {
        const installButton = document.getElementById('pwa-install-btn');
        if (installButton) {
            installButton.style.display = 'none';
        }
        
        const floatingPrompt = document.getElementById('pwa-floating-prompt');
        if (floatingPrompt) {
            floatingPrompt.remove();
        }
    }
    
    createFloatingPrompt() {
        const prompt = document.createElement('div');
        prompt.id = 'pwa-floating-prompt';
        prompt.className = 'pwa-install-prompt';
        prompt.innerHTML = `
            <div class="pwa-prompt-content">
                <div class="pwa-prompt-icon">📱</div>
                <div class="pwa-prompt-text">
                    <strong>Instalar App</strong>
                    <p>Adicione à tela inicial para acesso rápido</p>
                </div>
                <div class="pwa-prompt-actions">
                    <button id="pwa-install-yes" class="btn btn-primary btn-sm">Instalar</button>
                    <button id="pwa-install-no" class="btn btn-ghost btn-sm">Depois</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(prompt);
        
        // Add event listeners
        document.getElementById('pwa-install-yes').addEventListener('click', this.installPWA.bind(this));
        document.getElementById('pwa-install-no').addEventListener('click', () => {
            prompt.remove();
        });
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (document.getElementById('pwa-floating-prompt')) {
                prompt.remove();
            }
        }, 10000);
    }
    
    async installPWA() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('User accepted PWA install');
            } else {
                console.log('User dismissed PWA install');
            }
            
            this.deferredPrompt = null;
            this.hideInstallButton();
        }
    }
    
    showUpdateAvailable() {
        const updateBanner = document.createElement('div');
        updateBanner.className = 'update-banner';
        updateBanner.innerHTML = `
            <div class="update-content">
                <span>Nova versão disponível</span>
                <button id="update-btn" class="btn btn-sm btn-primary">Atualizar</button>
                <button id="update-dismiss" class="btn btn-sm btn-ghost">×</button>
            </div>
        `;
        
        document.body.insertBefore(updateBanner, document.body.firstChild);
        
        document.getElementById('update-btn').addEventListener('click', () => {
            location.reload();
        });
        
        document.getElementById('update-dismiss').addEventListener('click', () => {
            updateBanner.remove();
        });
    }
}

// Initialize PWA installer
document.addEventListener('DOMContentLoaded', () => {
    new PWAInstaller();
});
```

***

## FASE 4: SEO e Marketing Enhancements

### **4.1 SEO Optimization**

#### **Modificar: `controllers/catalog.js`**
```javascript
// ADICIONAR: SEO metadata para produtos
exports.showProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [productResults] = await pool.execute(`
            SELECT p.*, pf.name as family_name,
                   GROUP_CONCAT(pi.image_filename) as images
            FROM products p
            LEFT JOIN product_families pf ON p.family_id = pf.id
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.id = ? AND p.is_active = 1
            GROUP BY p.id
        `, [id]);
        
        if (productResults.length === 0) {
            return res.status(404).render('error', { 
                message: 'Produto não encontrado' 
            });
        }
        
        const product = productResults[0];
        product.images = product.images ? product.images.split(',') : [];
        
        // ADICIONAR: SEO metadata
        const seoData = {
            title: `${product.name} - Gonzaga's Art & Shine`,
            description: product.description || `${product.name} - Joalharia artesanal em prata 925 com inspiração Bali e tendências boho`,
            keywords: `${product.name}, ${product.reference}, joalharia, prata 925, ${product.family_name}, bali, boho`,
            ogImage: product.images[0] ? `/uploads/products/${product.images[0]}` : '/images/logo.png',
            canonical: `${process.env.BASE_URL}/catalog/product/${id}`,
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
                "image": product.images.map(img => `${process.env.BASE_URL}/uploads/products/${img}`)
            }
        };
        
        res.render('catalog/product', { 
            product, 
            seoData,
            user: req.session.user 
        });
        
    } catch (error) {
        console.error('Product view error:', error);
        res.status(500).render('error', { 
            message: 'Erro interno do servidor' 
        });
    }
};
```

#### **Criar: `routes/sitemap.js`**
```javascript
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// XML Sitemap
router.get('/sitemap.xml', async (req, res) => {
    try {
        res.set('Content-Type', 'text/xml');
        
        // Get all active products
        const [products] = await pool.execute(`
            SELECT id, reference, updated_at 
            FROM products 
            WHERE is_active = 1
            ORDER BY updated_at DESC
        `);
        
        // Get product families
        const [families] = await pool.execute(`
            SELECT id, updated_at 
            FROM product_families 
            ORDER BY updated_at DESC
        `);
        
        const baseUrl = process.env.BASE_URL || 'https://artnshine.pt';
        
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        hangegefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/catalog</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>${baseUrl}/about</loc>
        hangefrereq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
    <url>
        <loc>${baseUrl}/collections</loc>
        hangefrereq>weekly</changefreq>
        <priority>0.7</priority>
    </url>`;
        
        // Add product pages
        products.forEach(product => {
            const lastmod = new Date(product.updated_at).toISOString();
            sitemap += `
    <url>
        <loc>${baseUrl}/catalog/product/${product.id}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
        });
        
        // Add family pages
        families.forEach(family => {
            const lastmod = new Date(family.updated_at).toISOString();
            sitemap += `
    <url>
        <loc>${baseUrl}/catalog/family/${family.id}</loc>
        <lastmod>${lastmod}</lastmod>
        hangefrereq>weekly</changefreq>
        <priority>0.6</priority>
    </url>`;
        });
        
        sitemap += '\n</urlset>';
        
        res.send(sitemap);
        
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// Robots.txt
router.get('/robots.txt', (req, res) => {
    res.set('Content-Type', 'text/plain');
    
    const baseUrl = process.env.BASE_URL || 'https://artnshine.pt';
    
    const robots = `User-agent: *
Allow: /
Allow: /catalog
Allow: /about
Allow: /collections
Allow: /css/
Allow: /js/
Allow: /images/
Allow: /uploads/products/

Disallow: /admin/
Disallow: /api/
Disallow: /uploads/temp/
Disallow: /*.json$
Disallow: /*.xml$

Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 1`;
    
    res.send(robots);
});

module.exports = router;
```

### **4.2 Analytics Integration**

#### **Criar: `public/js/analytics.js`**
```javascript
class Analytics {
    constructor(config = {}) {
        this.gaId = config.gaId;
        this.fbPixelId = config.fbPixelId;
        this.debug = config.debug || false;
        
        this.init();
    }
    
    init() {
        this.initGoogleAnalytics();
        this.initFacebookPixel();
        this.bindEvents();
    }
    
    initGoogleAnalytics() {
        if (!this.gaId) return;
        
        // Load GA4
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
        script.async = true;
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', this.gaId, {
            send_page_view: true,
            cookie_flags: 'max-age=7200;secure;samesite=none'
        });
        
        window.gtag = gtag;
    }
    
    initFacebookPixel() {
        if (!this.fbPixelId) return;
        
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        fbq('init', this.fbPixelId);
        fbq('track', 'PageView');
    }
    
    bindEvents() {
        // Product views
        document.addEventListener('product:view', (e) => {
            this.trackProductView(e.detail);
        });
        
        // Add to cart
        document.addEventListener('cart:add', (e) => {
            this.trackAddToCart(e.detail);
        });
        
        // Search
        document.addEventListener('search:perform', (e) => {
            this.trackSearch(e.detail);
        });
        
        // Outbound links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="http"]') && !e.target.href.includes(location.hostname)) {
                this.trackOutboundLink(e.target.href);
            }
        });
        
        // File downloads
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href$=".pdf"], a[href$=".zip"], a[href$=".doc"]')) {
                this.trackDownload(e.target.href);
            }
        });
    }
    
    trackProductView(product) {
        if (window.gtag) {
            gtag('event', 'view_item', {
                currency: 'EUR',
                value: product.price,
                items: [{
                    item_id: product.reference,
                    item_name: product.name,
                    item_category: product.family_name,
                    price: product.price,
                    quantity: 1
                }]
            });
        }
        
        if (window.fbq) {
            fbq('track', 'ViewContent', {
                content_type: 'product',
                content_ids: [product.reference],
                content_name: product.name,
                content_category: product.family_name,
                value: product.price,
                currency: 'EUR'
            });
        }
        
        this.log('Product view tracked:', product);
    }
    
    trackAddToCart(item) {
        if (window.gtag) {
            gtag('event', 'add_to_cart', {
                currency: 'EUR',
                value: item.price * item.quantity,
                items: [{
                    item_id: item.reference,
                    item_name: item.name,
                    price: item.price,
                    quantity: item.quantity
                }]
            });
        }
        
        if (window.fbq) {
            fbq('track', 'AddToCart', {
                content_type: 'product',
                content_ids: [item.reference],
                content_name: item.name,
                value: item.price * item.quantity,
                currency: 'EUR'
            });
        }
        
        this.log('Add to cart tracked:', item);
    }
    
    trackSearch(searchData) {
        if (window.gtag) {
            gtag('event', 'search', {
                search_term: searchData.query,
                results_count: searchData.results
            });
        }
        
        if (window.fbq) {
            fbq('track', 'Search', {
                search_string: searchData.query
            });
        }
        
        this.log('Search tracked:', searchData);
    }
    
    trackOutboundLink(url) {
        if (window.gtag) {
            gtag('event', 'click', {
                event_category: 'outbound',
                event_label: url,
                transport_type: 'beacon'
            });
        }
        
        this.log('Outbound link tracked:', url);
    }
    
    trackDownload(url) {
        if (window.gtag) {
            gtag('event', 'file_download', {
                file_name: url.split('/').pop(),
                link_url: url
            });
        }
        
        this.log('Download tracked:', url);
    }
    
    log(...args) {
        if (this.debug) {
            console.log('[Analytics]', ...args);
        }
    }
}

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new Analytics({
        gaId: 'G-XXXXXXXXXX', // Replace with actual GA4 ID
        fbPixelId: 'XXXXXXXXXX', // Replace with actual FB Pixel ID
        debug: location.hostname === 'localhost'
    });
});
```

***

## FASE 5: E-commerce Complete Implementation

### **5.1 Order Management System**

#### **Criar: `sql/ecommerce_tables.sql`**
```sql
-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    
    -- Address
    billing_address_line1 VARCHAR(255) NOT NULL,
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100) NOT NULL,
    billing_postal_code VARCHAR(20) NOT NULL,
    billing_country VARCHAR(100) DEFAULT 'Portugal',
    
    shipping_address_line1 VARCHAR(255),
    shipping_address_line2 VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100),
    
    -- Order details
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Status
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    
    -- Notes
    notes TEXT,
    admin_notes TEXT,
    
    INDEX idx_order_number (order_number),
    INDEX idx_customer_email (customer_email),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_reference VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
);

-- Order status history
CREATE TABLE IF NOT EXISTS order_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    notes TEXT,
    changed_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
);

-- Shipping methods
CREATE TABLE IF NOT EXISTS shipping_methods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    estimated_days INT DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default shipping methods
INSERT IGNORE INTO shipping_methods (name, description, price, estimated_days) VALUES
('Correios Standard', 'Entrega em 3-5 dias úteis', 4.50, 4),
('Correios Expresso', 'Entrega em 1-2 dias úteis', 8.50, 1),
('Levantamento na Loja', 'Levantamento gratuito na nossa loja', 0.00, 0);
```

#### **Criar: `models/Order.js`**
```javascript
const { pool } = require('../config/database');
const crypto = require('crypto');

class Order {
    static generateOrderNumber() {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `GAS-${timestamp}-${random}`;
    }
    
    static async create(orderData) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Generate order number
            const orderNumber = this.generateOrderNumber();
            
            // Insert order
            const [orderResult] = await connection.execute(`
                INSERT INTO orders (
                    order_number, customer_email, customer_name, customer_phone,
                    billing_address_line1, billing_address_line2, billing_city, 
                    billing_postal_code, billing_country,
                    shipping_address_line1, shipping_address_line2, shipping_city,
                    shipping_postal_code, shipping_country,
                    subtotal, shipping_cost, tax_amount, total_amount,
                    payment_method, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                orderNumber,
                orderData.customer.email,
                orderData.customer.name,
                orderData.customer.phone || null,
                orderData.billing.addressLine1,
                orderData.billing.addressLine2 || null,
                orderData.billing.city,
                orderData.billing.postalCode,
                orderData.billing.country || 'Portugal',
                orderData.shipping?.addressLine1 || orderData.billing.addressLine1,
                orderData.shipping?.addressLine2 || orderData.billing.addressLine2,
                orderData.shipping?.city || orderData.billing.city,
                orderData.shipping?.postalCode || orderData.billing.postalCode,
                orderData.shipping?.country || orderData.billing.country || 'Portugal',
                orderData.subtotal,
                orderData.shippingCost || 0,
                orderData.taxAmount || 0,
                orderData.total,
                orderData.paymentMethod,
                orderData.notes || null
            ]);
            
            const orderId = orderResult.insertId;
            
            // Insert order items
            for (const item of orderData.items) {
                await connection.execute(`
                    INSERT INTO order_items (
                        order_id, product_id, product_reference, product_name,
                        quantity, unit_price, total_price
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    orderId,
                    item.productId,
                    item.reference,
                    item.name,
                    item.quantity,
                    item.price,
                    item.price * item.quantity
                ]);
                
                // Update product stock
                await connection.execute(`
                    UPDATE products 
                    SET current_stock = current_stock - ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? AND current_stock >= ?
                `, [item.quantity, item.productId, item.quantity]);
                
                // Log inventory transaction
                await connection.execute(`
                    INSERT INTO inventory_transactions (
                        product_id, transaction_type, quantity, unit_price,
                        total_amount, notes, created_by
                    ) VALUES (?, 'sale', ?, ?, ?, ?, ?)
                `, [
                    item.productId,
                    -item.quantity,
                    item.price,
                    -(item.price * item.quantity),
                    `Venda - Encomenda ${orderNumber}`,
                    'system'
                ]);
            }
            
            // Log status history
            await connection.execute(`
                INSERT INTO order_status_history (order_id, new_status, changed_by)
                VALUES (?, 'pending', 'system')
            `, [orderId]);
            
            await connection.commit();
            
            return { orderId, orderNumber };
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    static async findById(id) {
        const [orders] = await pool.execute(`
            SELECT o.*, 
                   GROUP_CONCAT(
                       CONCAT(oi.product_name, ' (', oi.quantity, 'x)')
                       SEPARATOR ', '
                   ) as items_summary
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = ?
            GROUP BY o.id
        `, [id]);
        
        if (orders.length === 0) return null;
        
        const order = orders[0];
        
        // Get order items
        const [items] = await pool.execute(`
            SELECT oi.*, p.main_image
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
            ORDER BY oi.id
        `, [id]);
        
        order.items = items;
        
        return order;
    }
    
    static async updateStatus(orderId, newStatus, notes = null, changedBy = 'admin') {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Get current status
            const [currentOrder] = await connection.execute(
                'SELECT status FROM orders WHERE id = ?',
                [orderId]
            );
            
            if (currentOrder.length === 0) {
                throw new Error('Order not found');
            }
            
            const oldStatus = currentOrder[0].status;
            
            // Update order status
            const updateFields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
            const updateValues = [newStatus];
            
            if (newStatus === 'shipped') {
                updateFields.push('shipped_at = CURRENT_TIMESTAMP');
            } else if (newStatus === 'delivered') {
                updateFields.push('delivered_at = CURRENT_TIMESTAMP');
            }
            
            if (notes) {
                updateFields.push('admin_notes = CONCAT(COALESCE(admin_notes, ""), ?)');
                updateValues.push(`\n[${new Date().toISOString()}] ${notes}`);
            }
            
            updateValues.push(orderId);
            
            await connection.execute(
                `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
                updateValues
            );
            
            // Log status change
            await connection.execute(`
                INSERT INTO order_status_history (order_id, old_status, new_status, notes, changed_by)
                VALUES (?, ?, ?, ?, ?)
            `, [orderId, oldStatus, newStatus, notes, changedBy]);
            
            await connection.commit();
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    static async findWithPagination(page = 1, limit = 20, filters = {}) {
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE 1=1';
        const params = [];
        
        if (filters.status) {
            whereClause += ' AND o.status = ?';
            params.push(filters.status);
        }
        
        if (filters.paymentStatus) {
            whereClause += ' AND o.payment_status = ?';
            params.push(filters.paymentStatus);
        }
        
        if (filters.search) {
            whereClause += ' AND (o.order_number LIKE ? OR o.customer_email LIKE ? OR o.customer_name LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (filters.dateFrom) {
            whereClause += ' AND o.created_at >= ?';
            params.push(filters.dateFrom);
        }
        
        if (filters.dateTo) {
            whereClause += ' AND o.created_at <= ?';
            params.push(filters.dateTo + ' 23:59:59');
        }
        
        const query = `
            SELECT o.*, COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            ${whereClause}
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        params.push(limit, offset);
        
        const [orders] = await pool.execute(query, params);
        
        // Get total count
        const [countResult] = await pool.execute(
            `SELECT COUNT(DISTINCT o.id) as total FROM orders o ${whereClause}`,
            params.slice(0, -2)
        );
        
        return {
            orders,
            total: countResult[0].total,
            currentPage: page,
            totalPages: Math.ceil(countResult[0].total / limit)
        };
    }
}

module.exports = Order;
```

***

## Ficheiros a Remover

### **Remover arquivos desnecessários:**
```
- gonzagas_node/test-*.js (todos os ficheiros de teste)
- aa-temporary/ (pasta temporária)
- gonzagas_node_upload.tar.gz
- *.ods files (manter apenas .sql)
- cookies.txt
- local-env_node.txt
```

### **Consolidar:**
```
- Todos os dumps SQL antigos → manter apenas o mais recente
- Logs antigos → implementar rotação automática
- Ficheiros de backup duplicados
```

***

## Estrutura Final de Ficheiros

```
gonzagas_node/
├── config/ (modificado)
├── controllers/ (expandido)
├── models/ (expandido)
├── routes/ (adicionado sitemap.js)
├── middleware/ (mantido)
├── views/ (melhorado SEO)
├── public/
│   ├── js/
│   │   ├── performance.js (novo)
│   │   ├── search.js (novo)
│   │   ├── cart.js (novo)
│   │   ├── pwa.js (novo)
│   │   └── analytics.js (novo)
│   ├── manifest.json (novo)
│   └── sw.js (novo)
├── sql/
│   ├── indexes_optimization.sql (novo)
│   └── ecommerce_tables.sql (novo)
├── scripts/ (mantido)
└── views/
    └── offline.ejs (novo)
```

***

## Checklist de Implementação

### **Fase 1 - Performance:**
- [ ] Otimizar queries de database
- [ ] Implementar lazy loading
- [ ] Adicionar compression
- [ ] Configurar caching
- [ ] Melhorar SEO básico

### **Fase 2 - Funcionalidades:**
- [ ] Sistema de pesquisa avançado
- [ ] Shopping cart funcional
- [ ] Dashboard analytics
- [ ] Notificações melhoradas

### **Fase 3 - PWA:**
- [ ] Service Worker
- [ ] App manifest
- [ ] Offline capability
- [ ] Install prompts

### **Fase 4 - SEO/Marketing:**
- [ ] Sitemap dinâmico
- [ ] Meta tags otimizadas
- [ ] Analytics integration
- [ ] Social media integration

### **Fase 5 - E-commerce:**
- [ ] Sistema de encomendas
- [ ] Payment integration
- [ ] Inventory automation
- [ ] Order management

**Este plano mantém a arquitetura robusta existente enquanto adiciona funcionalidades modernas e otimizações de performance específicas para o ambiente de shared hosting da Dominios.pt.**