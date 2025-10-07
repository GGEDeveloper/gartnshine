# Plano de Melhoria Completo - Gonzaga's Art & Shine
**Versão Final com Mobile Camera + Media Management**

***

## VISÃO GERAL DO PLANO COMPLETO

### **SPRINT 1: Otimização Core (1-2 semanas) ⭐⭐⭐⭐⭐**
- Database optimization + Rate limiting + Backup automático
- Image lazy loading + Caching + SEO básico

### **SPRINT 2: Search + WhatsApp (1 semana) ⭐⭐⭐⭐**
- Sistema de pesquisa avançado
- WhatsApp integration (substituir carrinho)

### **SPRINT 3: Mobile Camera Admin (2 semanas) ⭐⭐⭐⭐⭐**
- Camera capture mobile para admin
- Real-time compression + Multi-camera
- Quick product creation workflow

### **SPRINT 4: Media Management (2 semanas) ⭐⭐⭐⭐**
- Drag & drop gallery interface
- Automatic image variants + WebP conversion
- Media library modal + Bulk operations

### **SPRINT 5: UX Enhancements (1 semana) ⭐⭐⭐**
- Progressive image loading + Smart grid
- Infinite scroll + Analytics básico

### **SPRINT 6: Business Intelligence (Opcional) ⭐⭐**
- Dashboard analytics + Storage monitoring

---

# FASE 1: OTIMIZAÇÃO CORE - IMPLEMENTAÇÃO DETALHADA
**Duração: 1-2 semanas | Prioridade: CRÍTICA**

## 1.1 Database Optimization

### **A. Modificar: `config/database.js`**
```javascript
const mysql = require('mysql2/promise');

// SUBSTITUIR configuração existente
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 3, // CRÍTICO: Reduzido para shared hosting
  acquireTimeout: 30000, // 30 segundos timeout
  timeout: 30000,
  reconnect: true,
  charset: 'utf8mb4',
  timezone: 'local',
  // ADICIONAR: Connection quality settings
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
});

// ADICIONAR: Health check automático
const healthCheck = setInterval(async () => {
  try {
    const connection = await pool.getConnection();
    await connection.execute('SELECT 1 as health_check');
    connection.release();
    console.log('DB Health Check: OK');
  } catch (error) {
    console.error('DB Health Check Failed:', error.message);
    // Enviar notificação se necessário
  }
}, 300000); // 5 minutos

// ADICIONAR: Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connections...');
  clearInterval(healthCheck);
  await pool.end();
  process.exit(0);
});

// ADICIONAR: Error handling melhorado
pool.on('connection', (connection) => {
  console.log('New DB connection established:', connection.threadId);
});

pool.on('error', (error) => {
  console.error('Database pool error:', error);
  if (error.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Reconnecting to database...');
  }
});

module.exports = { pool };
```

### **B. Criar: `sql/critical_indexes.sql`**
```sql
-- EXECUTAR estas queries na base de dados atual

-- 1. Índices para performance de produtos
ALTER TABLE products 
ADD INDEX IF NOT EXISTS idx_active_featured (is_active, featured),
ADD INDEX IF NOT EXISTS idx_family_active (family_id, is_active),
ADD INDEX IF NOT EXISTS idx_search_name (name(50)),
ADD INDEX IF NOT EXISTS idx_search_reference (reference),
ADD INDEX IF NOT EXISTS idx_stock_status (current_stock, is_active),
ADD INDEX IF NOT EXISTS idx_created_date (created_at);

-- 2. Índices para product_images
ALTER TABLE product_images 
ADD INDEX IF NOT EXISTS idx_product_primary (product_id, is_primary),
ADD INDEX IF NOT EXISTS idx_product_sort (product_id, sort_order);

-- 3. Índices para product_families
ALTER TABLE product_families 
ADD INDEX IF NOT EXISTS idx_name (name);

-- 4. Índices para inventory_transactions
ALTER TABLE inventory_transactions 
ADD INDEX IF NOT EXISTS idx_product_date (product_id, created_at),
ADD INDEX IF NOT EXISTS idx_transaction_type (transaction_type, created_at);

-- 5. View otimizada para catalog (SUBSTITUIR se já existir)
DROP VIEW IF EXISTS catalog_products_optimized;
CREATE VIEW catalog_products_optimized AS
SELECT 
    p.id,
    p.reference,
    p.name,
    p.description,
    p.sale_price,
    p.style,
    p.material,
    p.featured,
    p.current_stock,
    p.created_at,
    pf.name as family_name,
    pf.id as family_id,
    (SELECT pi.image_filename 
     FROM product_images pi 
     WHERE pi.product_id = p.id AND pi.is_primary = 1 
     LIMIT 1) as main_image,
    (SELECT COUNT(*) 
     FROM product_images pi2 
     WHERE pi2.product_id = p.id) as image_count
FROM products p
LEFT JOIN product_families pf ON p.family_id = pf.id
WHERE p.is_active = 1
ORDER BY p.featured DESC, p.created_at DESC;

-- 6. Stored procedure para queries frequentes
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetProductsPage(
    IN page_offset INT,
    IN page_limit INT,
    IN family_filter INT,
    IN search_term VARCHAR(255)
)
BEGIN
    DECLARE search_pattern VARCHAR(255);
    SET search_pattern = CONCAT('%', IFNULL(search_term, ''), '%');
    
    SELECT * FROM catalog_products_optimized
    WHERE (family_filter IS NULL OR family_id = family_filter)
    AND (search_term IS NULL OR name LIKE search_pattern OR reference LIKE search_pattern)
    LIMIT page_offset, page_limit;
END //
DELIMITER ;
```

### **C. Modificar: `models/Product.js` - Otimizar Queries**
```javascript
// ADICIONAR no início do arquivo
const { pool } = require('../config/database');

class Product {
    // SUBSTITUIR método existente findAllWithPagination
    static async findAllWithPagination(page = 1, limit = 20, filters = {}) {
        const offset = (page - 1) * limit;
        
        // USAR view otimizada em vez de JOIN complexo
        let baseQuery = 'SELECT * FROM catalog_products_optimized WHERE 1=1';
        const params = [];
        
        // APLICAR filtros de forma otimizada
        if (filters.family_id) {
            baseQuery += ' AND family_id = ?';
            params.push(parseInt(filters.family_id));
        }
        
        if (filters.search) {
            baseQuery += ' AND (name LIKE ? OR reference LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }
        
        if (filters.featured) {
            baseQuery += ' AND featured = 1';
        }
        
        if (filters.in_stock) {
            baseQuery += ' AND current_stock > 0';
        }
        
        // ORDENAÇÃO otimizada
        baseQuery += ' ORDER BY featured DESC, created_at DESC';
        baseQuery += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        try {
            // EXECUTAR query principal
            const [products] = await pool.execute(baseQuery, params);
            
            // COUNT otimizado usando mesma view
            let countQuery = 'SELECT COUNT(*) as total FROM catalog_products_optimized WHERE 1=1';
            const countParams = params.slice(0, -2); // Remover LIMIT e OFFSET
            
            if (filters.family_id) {
                countQuery += ' AND family_id = ?';
            }
            if (filters.search) {
                countQuery += ' AND (name LIKE ? OR reference LIKE ?)';
            }
            if (filters.featured) {
                countQuery += ' AND featured = 1';
            }
            if (filters.in_stock) {
                countQuery += ' AND current_stock > 0';
            }
            
            const [countResult] = await pool.execute(countQuery, countParams);
            
            return {
                products: products,
                total: countResult[0].total,
                currentPage: page,
                totalPages: Math.ceil(countResult[0].total / limit),
                hasNext: page < Math.ceil(countResult[0].total / limit),
                hasPrevious: page > 1
            };
            
        } catch (error) {
            console.error('Error in findAllWithPagination:', error);
            throw error;
        }
    }
    
    // ADICIONAR: Método otimizado para featured products
    static async getFeaturedOptimized(limit = 6) {
        const query = `
            SELECT * FROM catalog_products_optimized 
            WHERE featured = 1 
            ORDER BY created_at DESC 
            LIMIT ?
        `;
        
        try {
            const [products] = await pool.execute(query, [limit]);
            return products;
        } catch (error) {
            console.error('Error getting featured products:', error);
            throw error;
        }
    }
    
    // ADICIONAR: Search otimizado
    static async searchOptimized(searchTerm, limit = 10) {
        if (!searchTerm || searchTerm.length < 2) {
            return [];
        }
        
        const query = `
            SELECT id, reference, name, sale_price, main_image, family_name
            FROM catalog_products_optimized
            WHERE name LIKE ? OR reference LIKE ?
            ORDER BY 
                CASE 
                    WHEN name LIKE ? THEN 1
                    WHEN reference LIKE ? THEN 2
                    ELSE 3
                END,
                featured DESC,
                created_at DESC
            LIMIT ?
        `;
        
        const searchPattern = `%${searchTerm}%`;
        const exactPattern = `${searchTerm}%`;
        
        try {
            const [results] = await pool.execute(query, [
                searchPattern, searchPattern, 
                exactPattern, exactPattern,
                limit
            ]);
            return results;
        } catch (error) {
            console.error('Error in search:', error);
            throw error;
        }
    }
    
    // MANTER métodos existentes mas otimizar se necessário
    // ...resto dos métodos existentes
}

module.exports = Product;
```

## 1.2 Rate Limiting e Segurança

### **A. Instalar Dependência**
```bash
npm install express-rate-limit helmet compression
```

### **B. Modificar: `app.js` - Adicionar Middleware de Segurança**
```javascript
// ADICIONAR no topo após outras importações
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

// ADICIONAR após const app = express();

// 1. Compression middleware (PRIMEIRO)
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6, // Balanço entre CPU e compressão
    threshold: 1024, // Só comprimir files > 1KB
    // Comprimir tipos específicos
    filter: (req, res) => {
        if (res.getHeader('Content-Type')) {
            const contentType = res.getHeader('Content-Type');
            return /text|javascript|json|css|xml|svg/.test(contentType);
        }
        return compression.filter(req, res);
    }
}));

// 2. Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://www.google-analytics.com"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false // Para compatibilidade
}));

// 3. Rate limiting global
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: (req) => {
        // Diferentes limits baseado no tipo de request
        if (req.path.startsWith('/admin')) {
            return 200; // Admin precisa mais requests
        }
        if (req.path.startsWith('/api')) {
            return 100; // API mais restritivo
        }
        return 300; // Público mais generoso
    },
    message: {
        error: 'Demasiados pedidos, tente novamente em 15 minutos',
        retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    // SKIP certas rotas essenciais
    skip: (req) => {
        return req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/);
    }
});

// 4. Rate limiting específico para uploads
const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 10, // Máximo 10 uploads por 10 min
    message: {
        error: 'Demasiados uploads, tente novamente em 10 minutos'
    },
    skipSuccessfulRequests: true // Não contar uploads bem-sucedidos
});

// 5. Rate limiting para API
const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 50, // 50 requests por 5 min
    message: { 
        error: 'API rate limit excedido',
        retryAfter: 5 * 60
    }
});

// APLICAR rate limiting
app.use(globalLimiter);
app.use('/api/', apiLimiter);
app.use('/admin/products/upload', uploadLimiter);

// 6. Static files com caching otimizado
app.use('/public', express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : '1h',
    etag: true,
    lastModified: true,
    setHeaders: (res, path, stat) => {
        // Caching específico por tipo de arquivo
        if (path.match(/\.(css|js)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=604800, immutable'); // 1 semana
        } else if (path.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 dias
        } else if (path.match(/\.(woff|woff2|eot|ttf)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 ano
        }
        
        // Adicionar headers de compressão para tipos específicos
        const contentType = res.getHeader('content-type');
        if (contentType && /text|javascript|json|css|xml|svg/.test(contentType)) {
            res.setHeader('Vary', 'Accept-Encoding');
        }
    }
}));

// 7. Uploads path com proteção
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
    maxAge: '30d',
    etag: true,
    // ADICIONAR: Proteção contra hotlinking
    setHeaders: (res, path, stat) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'public, max-age=2592000');
    }
}));

// CONTINUAR com resto da configuração existente...
```

### **C. Criar: `middleware/security.js`**
```javascript
// Middleware personalizado de segurança
const rateLimit = require('express-rate-limit');

// Rate limiter para operações sensíveis
const sensitiveOperationsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // Máximo 5 operações sensíveis por hora
    skipSuccessfulRequests: false,
    message: {
        error: 'Demasiadas operações sensíveis. Tente novamente em 1 hora.'
    }
});

// Middleware para validar origem dos uploads
const validateUploadOrigin = (req, res, next) => {
    // VERIFICAR se request vem de admin autenticado
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            error: 'Unauthorized upload attempt'
        });
    }
    
    // VERIFICAR content-type para uploads
    const contentType = req.get('content-type') || '';
    if (req.path.includes('upload') && !contentType.includes('multipart/form-data')) {
        return res.status(400).json({
            error: 'Invalid content type for upload'
        });
    }
    
    next();
};

// Middleware para log de ações suspeitas
const logSuspiciousActivity = (req, res, next) => {
    const suspiciousPatterns = [
        /\.\.\//, // Path traversal
        /<script/i, // XSS attempts
        /union\s+select/i, // SQL injection
        /eval\(/i, // Code injection
        /javascript:/i // JavaScript protocol
    ];
    
    const checkString = JSON.stringify(req.body) + req.url + JSON.stringify(req.query);
    
    if (suspiciousPatterns.some(pattern => pattern.test(checkString))) {
        console.warn(`Suspicious activity from ${req.ip}:`, {
            url: req.url,
            body: req.body,
            query: req.query,
            userAgent: req.get('user-agent'),
            timestamp: new Date().toISOString()
        });
        
        // Opcional: Bloquear o request
        // return res.status(400).json({ error: 'Invalid request' });
    }
    
    next();
};

module.exports = {
    sensitiveOperationsLimiter,
    validateUploadOrigin,
    logSuspiciousActivity
};
```

## 1.3 Image Optimization e Lazy Loading

### **A. Criar: `public/js/image-optimization.js`**
```javascript
/**
 * Sistema de otimização de imagens para Gonzaga's Art & Shine
 * Compatível com shared hosting - sem dependências server-side
 */

class ImageOptimizer {
    constructor(options = {}) {
        this.options = {
            // Configurações padrão
            lazyOffset: 50, // Pixels antes de carregar
            placeholderColor: '#f0f0f0',
            fadeInDuration: 300,
            retryAttempts: 3,
            quality: {
                thumbnail: 0.7,
                medium: 0.8,
                large: 0.9
            },
            sizes: {
                thumbnail: { width: 200, height: 200 },
                medium: { width: 600, height: 600 },
                large: { width: 1200, height: 1200 }
            },
            ...options
        };
        
        this.observer = null;
        this.webpSupported = null;
        this.init();
    }
    
    async init() {
        // 1. Detectar suporte WebP
        this.webpSupported = await this.detectWebPSupport();
        document.documentElement.classList.add(
            this.webpSupported ? 'webp-supported' : 'webp-not-supported'
        );
        
        // 2. Inicializar lazy loading
        this.initLazyLoading();
        
        // 3. Adicionar progressive loading para imagens existentes
        this.enhanceExistingImages();
        
        // 4. Bind eventos
        this.bindEvents();
    }
    
    // DETECÇÃO WebP
    async detectWebPSupport() {
        return new Promise((resolve) => {
            const webp = new Image();
            webp.onload = webp.onerror = () => {
                resolve(webp.height === 2);
            };
            webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }
    
    // LAZY LOADING IMPLEMENTATION
    initLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            // Fallback para browsers antigos
            this.loadAllImages();
            return;
        }
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: `${this.options.lazyOffset}px`,
            threshold: 0.01
        });
        
        // Observar todas as imagens lazy
        document.querySelectorAll('img[data-src], img[data-lazy]').forEach(img => {
            this.observer.observe(img);
        });
    }
    
    // CARREGAR IMAGEM COM RETRY
    async loadImage(img) {
        const originalSrc = img.dataset.src || img.dataset.lazy;
        if (!originalSrc) return;
        
        // Mostrar loading state
        img.classList.add('image-loading');
        
        try {
            // Escolher formato otimizado
            const optimizedSrc = this.getOptimizedSrc(originalSrc, img);
            
            // Carregar imagem
            await this.loadWithRetry(img, optimizedSrc);
            
            // Fade in effect
            img.style.opacity = '0';
            img.src = optimizedSrc;
            img.classList.remove('lazy', 'image-loading');
            img.classList.add('image-loaded');
            
            // Fade in
            img.style.transition = `opacity ${this.options.fadeInDuration}ms ease`;
            img.style.opacity = '1';
            
        } catch (error) {
            console.error('Failed to load image:', originalSrc, error);
            // Fallback para imagem original
            img.src = originalSrc;
            img.classList.remove('lazy', 'image-loading');
            img.classList.add('image-error');
        }
    }
    
    // OTIMIZAÇÃO DE SRC BASEADA EM CONTEXTO
    getOptimizedSrc(src, img) {
        // Se WebP não suportado, retornar original
        if (!this.webpSupported) {
            return src;
        }
        
        // Determinar tamanho necessário baseado no contexto
        const imgRect = img.getBoundingClientRect();
        const imgWidth = Math.max(imgRect.width, img.width || 0);
        
        let targetSize = 'medium';
        if (imgWidth <= 250) {
            targetSize = 'thumbnail';
        } else if (imgWidth <= 800) {
            targetSize = 'medium';
        } else {
            targetSize = 'large';
        }
        
        // Verificar se imagem já está no formato otimizado
        if (src.includes('.webp')) {
            return src;
        }
        
        // TENTAR versão WebP (assumindo que existe ou será criada)
        const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        
        // Verificar classes do elemento para determinar tamanho
        if (img.classList.contains('thumbnail') || img.closest('.thumbnail')) {
            targetSize = 'thumbnail';
        } else if (img.classList.contains('gallery-image')) {
            targetSize = 'large';
        }
        
        return webpSrc;
    }
    
    // CARREGAR COM RETRY
    loadWithRetry(img, src, attempts = 0) {
        return new Promise((resolve, reject) => {
            const tempImg = new Image();
            
            tempImg.onload = () => {
                resolve(tempImg);
            };
            
            tempImg.onerror = () => {
                if (attempts < this.options.retryAttempts) {
                    // Retry após delay
                    setTimeout(() => {
                        this.loadWithRetry(img, src, attempts + 1)
                            .then(resolve)
                            .catch(reject);
                    }, 1000 * (attempts + 1)); // Delay progressivo
                } else {
                    reject(new Error('Failed to load after retries'));
                }
            };
            
            tempImg.src = src;
        });
    }
    
    // MELHORAR IMAGENS EXISTENTES
    enhanceExistingImages() {
        document.querySelectorAll('img:not([data-src]):not([data-lazy])').forEach(img => {
            // Adicionar fade-in para imagens que já carregaram
            if (img.complete) {
                img.style.transition = 'opacity 0.3s ease';
                img.classList.add('image-loaded');
            } else {
                img.addEventListener('load', () => {
                    img.style.transition = 'opacity 0.3s ease';
                    img.classList.add('image-loaded');
                });
            }
        });
    }
    
    // FALLBACK PARA BROWSERS ANTIGOS
    loadAllImages() {
        document.querySelectorAll('img[data-src], img[data-lazy]').forEach(img => {
            const src = img.dataset.src || img.dataset.lazy;
            if (src) {
                img.src = src;
                img.classList.remove('lazy');
                img.classList.add('image-loaded');
            }
        });
    }
    
    // BIND EVENTOS
    bindEvents() {
        // Reobservar imagens adicionadas dinamicamente
        document.addEventListener('DOMNodeInserted', (e) => {
            if (e.target.nodeName === 'IMG' && e.target.dataset.src) {
                this.observer?.observe(e.target);
            }
        });
        
        // Handle resize para recarregar imagens com tamanho diferente
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 500);
        });
    }
    
    // HANDLE RESIZE
    handleResize() {
        // Recarregar imagens que podem precisar de tamanho diferente
        document.querySelectorAll('img.image-loaded').forEach(img => {
            const currentSrc = img.src;
            const originalSrc = img.dataset.originalSrc || currentSrc;
            const newOptimizedSrc = this.getOptimizedSrc(originalSrc, img);
            
            if (newOptimizedSrc !== currentSrc) {
                // Carregar novo tamanho se necessário
                this.loadImage(img);
            }
        });
    }
    
    // API PÚBLICA
    
    // Observar nova imagem
    observeImage(img) {
        if (this.observer && img.dataset.src) {
            this.observer.observe(img);
        }
    }
    
    // Forçar carregamento de uma imagem
    forceLoad(img) {
        if (img.dataset.src) {
            this.loadImage(img);
        }
    }
    
    // Cleanup
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
}

// CSS INJECTION para estados de loading
const imageOptimizerCSS = `
<style>
/* Image loading states */
img.lazy {
    opacity: 0.3;
    background-color: #f0f0f0;
    background-image: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
}

img.image-loading {
    opacity: 0.5;
    filter: blur(2px);
}

img.image-loaded {
    opacity: 1;
    filter: none;
}

img.image-error {
    opacity: 0.7;
    background-color: #f8f9fa;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="%23adb5bd" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>') no-repeat center;
    background-size: 24px 24px;
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

/* Progressive image enhancement */
.image-container {
    position: relative;
    overflow: hidden;
}

.image-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%), 
                linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%);
    background-size: 8px 8px;
    background-position: 0 0, 4px 4px;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.image-container img.lazy::before {
    opacity: 1;
}

/* Responsive image utilities */
.img-responsive {
    max-width: 100%;
    height: auto;
}

.img-cover {
    object-fit: cover;
}

.img-contain {
    object-fit: contain;
}
</style>
`;

// Inject CSS
if (typeof document !== 'undefined') {
    document.head.insertAdjacentHTML('beforeend', imageOptimizerCSS);
}

// AUTO-INITIALIZE
let imageOptimizer;
document.addEventListener('DOMContentLoaded', () => {
    imageOptimizer = new ImageOptimizer({
        // Configurações específicas para Gonzaga's
        lazyOffset: 100, // Carregar 100px antes
        fadeInDuration: 400,
        retryAttempts: 2
    });
    
    // Disponibilizar globalmente para outros scripts
    window.ImageOptimizer = imageOptimizer;
});

// EXPORT para usar em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageOptimizer;
}
```

### **B. Modificar Templates para Lazy Loading**

#### **Modificar: `views/collections.ejs`**
```html
<!-- SUBSTITUIR as imagens existentes por versões lazy -->

<div class="media-gallery">
    <% if (mediaFiles && mediaFiles.length > 0) { %>
        <div class="media-grid">
            <% mediaFiles.forEach((file, index) => { %>
                <div class="media-item image-container">
                    <!-- USAR data-src em vez de src -->
                    <img 
                        data-src="/media/<%= file %>" 
                        alt="Gonzaga's Art & Shine - <%= file %>"
                        class="lazy img-responsive img-cover"
                        width="300" 
                        height="300"
                        loading="lazy"
                        <!-- ADICIONAR: Placeholder baixa qualidade -->
                        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3C/svg%3E"
                    >
                    <div class="media-overlay">
                        <button class="media-view-btn" data-bs-toggle="modal" data-bs-target="#mediaModal" data-media="/media/<%= file %>">
                            <i class="fas fa-search-plus"></i>
                        </button>
                    </div>
                </div>
            <% }); %>
        </div>
    <% } else { %>
        <div class="no-media">
            <p>Nenhuma imagem disponível na galeria.</p>
        </div>
    <% } %>
</div>
```

#### **Modificar: `views/admin/products/index.ejs` (Tabela de Produtos)**
```html
<!-- Na tabela de produtos, otimizar thumbnails -->
<tbody>
    <% products.forEach(product => { %>
        <tr>
            <td>
                <% if (product.main_image) { %>
                    <img 
                        data-src="/uploads/products/<%= product.main_image %>" 
                        alt="<%= product.name %>"
                        class="lazy product-thumbnail img-cover"
                        width="50" 
                        height="50"
                        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='100%25' height='100%25' fill='%23e0e0e0'/%3E%3C/svg%3E"
                    >
                <% } else { %>
                    <div class="no-image-placeholder">
                        <i class="fas fa-image"></i>
                    </div>
                <% } %>
            </td>
            <!-- resto da tabela... -->
        </tr>
    <% }); %>
</tbody>
```

## 1.4 Backup Automático

### **A. Criar: `scripts/backup-system.js`**
```javascript
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);

class BackupSystem {
    constructor() {
        this.backupDir = path.join(__dirname, '../backups');
        this.maxBackups = 7; // Manter 7 backups
        this.compressionLevel = 6;
        
        this.ensureBackupDir();
    }
    
    async ensureBackupDir() {
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
            console.log('Backup directory ready:', this.backupDir);
        } catch (error) {
            console.error('Failed to create backup directory:', error);
        }
    }
    
    // BACKUP PRINCIPAL
    async createFullBackup() {
        const timestamp = new Date().toISOString()
            .replace(/[:.]/g, '-')
            .slice(0, 19);
        
        const backupName = `backup_${timestamp}`;
        
        try {
            console.log('Starting full backup:', backupName);
            
            // 1. Database backup
            const dbBackupPath = await this.backupDatabase(backupName);
            
            // 2. Files backup (uploads, media)
            const filesBackupPath = await this.backupFiles(backupName);
            
            // 3. Create manifest
            await this.createBackupManifest(backupName, {
                database: dbBackupPath,
                files: filesBackupPath,
                timestamp: new Date().toISOString()
            });
            
            // 4. Cleanup old backups
            await this.cleanupOldBackups();
            
            console.log('Full backup completed:', backupName);
            return backupName;
            
        } catch (error) {
            console.error('Backup failed:', error);
            throw error;
        }
    }
    
    // DATABASE BACKUP
    async backupDatabase(backupName) {
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        };
        
        const sqlFilePath = path.join(this.backupDir, `${backupName}_database.sql`);
        
        // COMANDO mysqldump otimizado para shared hosting
        const mysqldumpCmd = [
            'mysqldump',
            `--host=${dbConfig.host}`,
            `--port=${dbConfig.port}`,
            `--user=${dbConfig.user}`,
            `--password=${dbConfig.password}`,
            '--single-transaction', // Para InnoDB
            '--routines', // Include stored procedures
            '--triggers', // Include triggers
            '--add-drop-table',
            '--complete-insert',
            '--extended-insert=false', // Melhor para debug
            '--default-character-set=utf8mb4',
            '--set-gtid-purged=OFF', // Compatibilidade
            dbConfig.database
        ].join(' ');
        
        try {
            console.log('Creating database backup...');
            
            // Execute mysqldump
            const { stdout, stderr } = await execAsync(`${mysqldumpCmd} > "${sqlFilePath}"`);
            
            if (stderr) {
                console.warn('mysqldump warnings:', stderr);
            }
            
            // Verify backup file exists and has content
            const stats = await fs.stat(sqlFilePath);
            if (stats.size === 0) {
                throw new Error('Database backup file is empty');
            }
            
            console.log(`Database backup created: ${stats.size} bytes`);
            return sqlFilePath;
            
        } catch (error) {
            console.error('Database backup failed:', error);
            throw error;
        }
    }
    
    // FILES BACKUP
    async backupFiles(backupName) {
        const sourceDirectories = [
            'public/uploads',
            'public/media',
            'public/images'
        ];
        
        const tarFilePath = path.join(this.backupDir, `${backupName}_files.tar.gz`);
        
        try {
            console.log('Creating files backup...');
            
            // Create tar with existing directories only
            const existingDirs = [];
            for (const dir of sourceDirectories) {
                try {
                    await fs.access(dir);
                    existingDirs.push(dir);
                } catch {
                    console.log(`Directory not found, skipping: ${dir}`);
                }
            }
            
            if (existingDirs.length === 0) {
                console.log('No media directories found, skipping files backup');
                return null;
            }
            
            const tarCmd = `tar -czf "${tarFilePath}" ${existingDirs.join(' ')}`;
            await execAsync(tarCmd);
            
            const stats = await fs.stat(tarFilePath);
            console.log(`Files backup created: ${stats.size} bytes`);
            
            return tarFilePath;
            
        } catch (error) {
            console.error('Files backup failed:', error);
            // Files backup é opcional - não falhar o backup inteiro
            return null;
        }
    }
    
    // BACKUP MANIFEST
    async createBackupManifest(backupName, details) {
        const manifestPath = path.join(this.backupDir, `${backupName}_manifest.json`);
        
        const manifest = {
            name: backupName,
            created: details.timestamp,
            version: require('../package.json').version,
            environment: process.env.NODE_ENV || 'development',
            database: {
                file: details.database ? path.basename(details.database) : null,
                size: details.database ? (await fs.stat(details.database)).size : 0
            },
            files: {
                file: details.files ? path.basename(details.files) : null,
                size: details.files ? (await fs.stat(details.files)).size : 0
            },
            system: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch
            }
        };
        
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
        console.log('Backup manifest created');
    }
    
    // CLEANUP OLD BACKUPS
    async cleanupOldBackups() {
        try {
            const files = await fs.readdir(this.backupDir);
            
            // Group by backup name
            const backups = {};
            files.forEach(file => {
                const match = file.match(/^backup_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
                if (match) {
                    const backupName = match[1];
                    if (!backups[backupName]) {
                        backups[backupName] = [];
                    }
                    backups[backupName].push(file);
                }
            });
            
            const backupNames = Object.keys(backups).sort().reverse();
            
            // Keep only the most recent backups
            if (backupNames.length > this.maxBackups) {
                const toDelete = backupNames.slice(this.maxBackups);
                
                for (const backupName of toDelete) {
                    for (const file of backups[backupName]) {
                        const filePath = path.join(this.backupDir, file);
                        await fs.unlink(filePath);
                        console.log(`Deleted old backup file: ${file}`);
                    }
                }
            }
            
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }
    
    // RESTORE BACKUP
    async restoreBackup(backupName) {
        try {
            console.log('Starting restore:', backupName);
            
            // Read manifest
            const manifestPath = path.join(this.backupDir, `${backupName}_manifest.json`);
            const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
            
            // Restore database
            if (manifest.database.file) {
                await this.restoreDatabase(backupName, manifest.database.file);
            }
            
            // Restore files
            if (manifest.files.file) {
                await this.restoreFiles(backupName, manifest.files.file);
            }
            
            console.log('Restore completed');
            return true;
            
        } catch (error) {
            console.error('Restore failed:', error);
            throw error;
        }
    }
    
    // RESTORE DATABASE
    async restoreDatabase(backupName, sqlFile) {
        const sqlFilePath = path.join(this.backupDir, sqlFile);
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        };
        
        const restoreCmd = [
            'mysql',
            `--host=${dbConfig.host}`,
            `--port=${dbConfig.port}`,
            `--user=${dbConfig.user}`,
            `--password=${dbConfig.password}`,
            dbConfig.database,
            `< "${sqlFilePath}"`
        ].join(' ');
        
        await execAsync(restoreCmd);
        console.log('Database restored');
    }
    
    // LIST AVAILABLE BACKUPS
    async listBackups() {
        try {
            const files = await fs.readdir(this.backupDir);
            const manifests = files.filter(f => f.endsWith('_manifest.json'));
            
            const backups = [];
            for (const manifestFile of manifests) {
                const manifestPath = path.join(this.backupDir, manifestFile);
                const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
                backups.push(manifest);
            }
            
            return backups.sort((a, b) => new Date(b.created) - new Date(a.created));
            
        } catch (error) {
            console.error('Failed to list backups:', error);
            return [];
        }
    }
}

// CLI INTERFACE
if (require.main === module) {
    const action = process.argv[2] || 'backup';
    const backupSystem = new BackupSystem();
    
    switch (action) {
        case 'backup':
            backupSystem.createFullBackup()
                .then(name => {
                    console.log('Backup completed:', name);
                    process.exit(0);
                })
                .catch(error => {
                    console.error('Backup failed:', error);
                    process.exit(1);
                });
            break;
            
        case 'list':
            backupSystem.listBackups()
                .then(backups => {
                    console.log('Available backups:');
                    backups.forEach(b => {
                        console.log(`- ${b.name} (${b.created})`);
                    });
                    process.exit(0);
                });
            break;
            
        case 'restore':
            const backupName = process.argv[3];
            if (!backupName) {
                console.error('Usage: node backup-system.js restore BACKUP_NAME');
                process.exit(1);
            }
            
            backupSystem.restoreBackup(backupName)
                .then(() => {
                    console.log('Restore completed');
                    process.exit(0);
                })
                .catch(error => {
                    console.error('Restore failed:', error);
                    process.exit(1);
                });
            break;
            
        default:
            console.error('Usage: node backup-system.js [backup|list|restore]');
            process.exit(1);
    }
}

module.exports = BackupSystem;
```

### **B. Modificar: `package.json` - Adicionar Scripts**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "backup": "node scripts/backup-system.js backup",
    "backup:list": "node scripts/backup-system.js list",
    "backup:restore": "node scripts/backup-system.js restore",
    "db:optimize": "node scripts/optimize-database.js",
    "setup": "node scripts/setup.js"
  }
}
```

## 1.5 SEO Básico

### **A. Criar: `routes/seo.js`**
```javascript
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const Product = require('../models/Product');

// SITEMAP.XML DINÂMICO
router.get('/sitemap.xml', async (req, res) => {
    try {
        res.set({
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600' // Cache por 1 hora
        });
        
        const baseUrl = process.env.BASE_URL || 'https://artnshine.pt';
        
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
        
        // Build sitemap XML
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

        // Homepage
        sitemap += `
    <url>
        <loc>${baseUrl}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
        <lastmod>${new Date().toISOString()}</lastmod>
    </url>`;

        // Static pages
        const staticPages = [
            { path: '/catalog', priority: '0.9', changefreq: 'daily' },
            { path: '/about', priority: '0.5', changefreq: 'monthly' },
            { path: '/collections', priority: '0.7', changefreq: 'weekly' },
            { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
            { path: '/terms-of-service', priority: '0.3', changefreq: 'yearly' }
        ];

        staticPages.forEach(page => {
            sitemap += `
    <url>
        <loc>${baseUrl}${page.path}</loc>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
        });

        // Product pages
        for (const product of products) {
            const lastmod = new Date(product.updated_at).toISOString();
            sitemap += `
    <url>
        <loc>${baseUrl}/catalog/product/${product.id}</loc>
        <lastmod>${lastmod}</lastmod>
        hangegefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
        }

        // Family pages
        for (const family of families) {
            const lastmod = new Date(family.updated_at).toISOString();
            sitemap += `
    <url>
        <loc>${baseUrl}/catalog/family/${family.id}</loc>
        <lastmod>${lastmod}</lastmod>
        hangefrereq>weekly</changefreq>
        <priority>0.6</priority>
    </url>`;
        }

        sitemap += '\n</urlset>';
        
        res.send(sitemap);
        
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }
});

// ROBOTS.TXT
router.get('/robots.txt', (req, res) => {
    res.set({
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400' // Cache por 24 horas
    });
    
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

# Disallow admin and sensitive areas
Disallow: /admin/
Disallow: /api/
Disallow: /uploads/temp/
Disallow: /*.json$
Disallow: /*.xml$
Disallow: /scripts/
Disallow: /config/

# Allow specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Crawl delay for politeness
Crawl-delay: 1

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml`;

    res.send(robots);
});

module.exports = router;
```

### **B. Modificar: `app.js` - Adicionar rota SEO**
```javascript
// ADICIONAR após outras rotas
const seoRoutes = require('./routes/seo');
app.use('/', seoRoutes);
```

***

## CHECKLIST DE IMPLEMENTAÇÃO FASE 1

### **✅ TAREFAS OBRIGATÓRIAS**

**Database Optimization:**
- [ ] Modificar `config/database.js` com pool otimizado
- [ ] Executar `sql/critical_indexes.sql` na base de dados
- [ ] Modificar `models/Product.js` com queries otimizadas
- [ ] Testar queries com `EXPLAIN` para verificar performance

**Security & Performance:**
- [ ] Instalar: `npm install express-rate-limit helmet compression`
- [ ] Modificar `app.js` com middleware de segurança
- [ ] Criar `middleware/security.js`
- [ ] Testar rate limiting em diferentes endpoints

**Image Optimization:**
- [ ] Criar `public/js/image-optimization.js`
- [ ] Modificar `views/collections.ejs` para lazy loading
- [ ] Modificar `views/admin/products/index.ejs` para thumbnails lazy
- [ ] Testar lazy loading em mobile e desktop

**Backup System:**
- [ ] Criar `scripts/backup-system.js`
- [ ] Modificar `package.json` com novos scripts
- [ ] Testar backup: `npm run backup`
- [ ] Verificar se backup funciona: `npm run backup:list`

**SEO Básico:**
- [ ] Criar `routes/seo.js`
- [ ] Modificar `app.js` para incluir rotas SEO
- [ ] Testar: `/sitemap.xml` e `/robots.txt`
- [ ] Verificar meta tags em páginas principais

### **🧪 TESTES ESSENCIAIS**

```bash
# 1. Testar database performance
npm run db:test

# 2. Testar backup system
npm run backup
npm run backup:list

# 3. Verificar rate limiting
curl -I http://localhost:3000/api/products
# (fazer múltiplas requests rápidas)

# 4. Testar lazy loading
# Abrir DevTools → Network → Throttling "Slow 3G"
# Navegar para /collections

# 5. Verificar SEO
curl http://localhost:3000/sitemap.xml
curl http://localhost:3000/robots.txt
```

### **🎯 MÉTRICAS DE SUCESSO**

**Performance:**
- Database queries < 200ms (90% dos casos)
- Página inicial carrega < 3s
- Imagens lazy loading funciona em mobile

**Segurança:**
- Rate limiting bloqueia abusos
- Headers de segurança aplicados
- Logs de atividade suspeita funcionam

**SEO:**
- Sitemap.xml acessível e válido
- Robots.txt permite bots corretos
- Meta tags presentes em páginas principais

***

**Esta Fase 1 é a fundação crítica. Sem ela, as fases seguintes podem ter problemas de performance e segurança em shared hosting.**

**Próximo: Assim que Fase 1 estiver 100% funcional, implementamos Fase 2 (Search + WhatsApp) que tem dependência na otimização de database.**