# 🛠️ Development Guide - Mobile Media Enhancements
**Para desenvolvedores trabalhando no branch `feature/mobile-media-enhancements`**

---

## 🚀 Quick Start

### 1. Preparar Ambiente
```bash
# Certificar que estás no branch correto
git checkout feature/mobile-media-enhancements

# Instalar dependências (se necessário)
cd gonzagas_node
npm install

# Copiar .env.example para .env e configurar
cp .env.example .env
```

### 2. Estrutura de Trabalho
```
/home/ggedeveloper/gartnshine/
├── gonzagas_node/          # Aplicação principal
├── docs/                   # Documentação do projeto
│   ├── DEVELOPMENT_GUIDE.md    # Este ficheiro
│   ├── API_REFERENCE.md        # Referência da API
│   └── TESTING_GUIDE.md        # Guia de testes
├── FEATURE_ROADMAP.md      # Roadmap de features
└── aa-temporary/           # Rascunhos e testes
```

---

## 📁 Estrutura de Código - Novas Features

### Frontend (Client-side)

#### **JavaScript Modules**
```
gonzagas_node/public/js/
├── mobile-camera.js        # Captura de câmara mobile
├── image-compression.js    # Compressão de imagens
├── media-manager.js        # Gestão de media
├── drag-drop.js           # Drag & drop functionality
├── progressive-loader.js   # Loading progressivo
└── masonry-grid.js        # Grid layout avançado
```

**Convenção:**
- Um ficheiro por funcionalidade major
- Export como módulo ou classe
- Documentação JSDoc obrigatória
- Testes inline quando apropriado

**Exemplo:**
```javascript
/**
 * Mobile Camera Module
 * Handles camera access and photo capture on mobile devices
 * @module MobileCamera
 */

class MobileCamera {
    /**
     * @param {Object} options - Configuration options
     * @param {string} options.targetElement - ID do elemento target
     * @param {boolean} options.autoCompress - Auto-comprimir após captura
     */
    constructor(options = {}) {
        this.options = {
            targetElement: '#camera-preview',
            autoCompress: true,
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.85,
            ...options
        };
        
        this.stream = null;
        this.videoElement = null;
        
        this.init();
    }
    
    /**
     * Initialize camera module
     * @private
     */
    async init() {
        // Implementation
    }
    
    /**
     * Request camera access
     * @returns {Promise<MediaStream>}
     * @throws {Error} If camera access denied
     */
    async requestCamera() {
        // Implementation
    }
}

// Export
window.MobileCamera = MobileCamera;
```

#### **CSS Modules**
```
gonzagas_node/public/css/
├── mobile-camera.css       # Estilos da câmara
├── media-manager.css       # Estilos do media manager
├── progressive-loading.css # Loading states
└── masonry-grid.css       # Grid styles
```

**Convenção:**
- CSS modular (BEM notation)
- Variáveis CSS para temas
- Mobile-first approach
- Dark mode compatibility

**Exemplo:**
```css
/* mobile-camera.css */
:root {
    --camera-bg: #1a1a1a;
    --camera-accent: #c0a080;
    --camera-text: #ffffff;
}

.mobile-camera {
    /* Container principal */
}

.mobile-camera__preview {
    /* Preview da câmara */
}

.mobile-camera__controls {
    /* Controlos (botões) */
}

.mobile-camera__button--capture {
    /* Botão de captura */
}

.mobile-camera__button--switch {
    /* Botão de trocar câmara */
}

/* Mobile specific */
@media (max-width: 768px) {
    .mobile-camera {
        /* Ajustes mobile */
    }
}

/* Dark mode (already default, but for reference) */
@media (prefers-color-scheme: dark) {
    .mobile-camera {
        /* Dark mode adjustments if needed */
    }
}
```

---

### Backend (Server-side)

#### **Controllers**
```
gonzagas_node/controllers/
├── MediaController.js      # CRUD de media files
└── MobileCameraController.js  # Endpoints de câmara
```

**Convenção:**
```javascript
// MediaController.js
const { pool } = require('../config/database');
const Media = require('../models/Media');

class MediaController {
    /**
     * Get all media files with pagination
     * @route GET /admin/media
     */
    static async index(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            
            const result = await Media.findAllWithPagination(page, limit);
            
            res.render('admin/media/index', {
                title: 'Media Manager',
                media: result.media,
                pagination: {
                    current: page,
                    total: result.totalPages
                }
            });
        } catch (error) {
            console.error('Media index error:', error);
            req.flash('error', 'Erro ao carregar media');
            res.redirect('/admin');
        }
    }
    
    /**
     * Upload new media file
     * @route POST /admin/media/upload
     */
    static async upload(req, res) {
        // Implementation
    }
    
    /**
     * Delete media file
     * @route DELETE /admin/media/:id
     */
    static async delete(req, res) {
        // Implementation
    }
}

module.exports = MediaController;
```

#### **Models**
```
gonzagas_node/models/
└── Media.js                # Model para media files
```

**Convenção:**
```javascript
// Media.js
const { pool } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

class Media {
    /**
     * Find all media with pagination
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Paginated results
     */
    static async findAllWithPagination(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        
        const query = `
            SELECT * FROM media_files 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;
        
        const [media] = await pool.execute(query, [limit, offset]);
        
        const [countResult] = await pool.execute(
            'SELECT COUNT(*) as total FROM media_files'
        );
        
        return {
            media,
            total: countResult[0].total,
            currentPage: page,
            totalPages: Math.ceil(countResult[0].total / limit)
        };
    }
    
    /**
     * Create new media entry
     * @param {Object} data - Media data
     * @returns {Promise<number>} Inserted ID
     */
    static async create(data) {
        const query = `
            INSERT INTO media_files (
                filename, original_filename, file_path, 
                file_size, mime_type, width, height
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.execute(query, [
            data.filename,
            data.originalFilename,
            data.filePath,
            data.fileSize,
            data.mimeType,
            data.width,
            data.height
        ]);
        
        return result.insertId;
    }
    
    /**
     * Delete media file
     * @param {number} id - Media ID
     * @returns {Promise<boolean>} Success status
     */
    static async delete(id) {
        // Get file paths first
        const [media] = await pool.execute(
            'SELECT file_path FROM media_files WHERE id = ?',
            [id]
        );
        
        if (media.length === 0) return false;
        
        // Delete from database
        await pool.execute('DELETE FROM media_files WHERE id = ?', [id]);
        
        // Delete physical files
        try {
            await fs.unlink(media[0].file_path);
            // Also delete variants (thumbnail, webp, etc)
            // ...
        } catch (error) {
            console.error('Error deleting file:', error);
        }
        
        return true;
    }
}

module.exports = Media;
```

#### **Routes**
```
gonzagas_node/routes/admin/
├── media.js                # Rotas de media management
└── mobile-camera.js        # Rotas de câmara mobile
```

**Convenção:**
```javascript
// routes/admin/media.js
const express = require('express');
const router = express.Router();
const MediaController = require('../../controllers/MediaController');
const { adminAuth } = require('../../middleware/adminAuth');
const upload = require('../../middleware/upload');

// All routes require admin authentication
router.use(adminAuth);

// GET /admin/media
router.get('/', MediaController.index);

// POST /admin/media/upload
router.post('/upload', upload.array('images', 10), MediaController.upload);

// DELETE /admin/media/:id
router.delete('/:id', MediaController.delete);

// GET /admin/media/:id/download
router.get('/:id/download', MediaController.download);

module.exports = router;
```

---

## 🧪 Testing Guidelines

### Manual Testing Checklist

#### Mobile Camera:
- [ ] Abre câmara em Android Chrome
- [ ] Abre câmara em iOS Safari
- [ ] Troca entre câmaras (front/back)
- [ ] Captura foto com qualidade
- [ ] Compressão funciona (tamanho reduzido)
- [ ] Upload bem-sucedido
- [ ] Preview correto antes de salvar

#### Media Manager:
- [ ] Drag & drop múltiplas imagens
- [ ] Thumbnails carregam rapidamente
- [ ] Lightbox funciona
- [ ] Bulk delete funciona
- [ ] Search filtra corretamente
- [ ] Pagination funciona

#### Performance:
- [ ] Lighthouse score > 90
- [ ] Image load < 500ms
- [ ] No memory leaks (long sessions)
- [ ] Works em 3G connection

### Automated Tests (Future)
```javascript
// tests/mobile-camera.test.js
describe('MobileCamera', () => {
    it('should request camera access', async () => {
        // Test implementation
    });
    
    it('should compress image before upload', async () => {
        // Test implementation
    });
});
```

---

## 🐛 Debugging Tips

### Frontend Debugging
```javascript
// Enable debug mode
localStorage.setItem('DEBUG', 'true');

// Console log helpers
const debug = (...args) => {
    if (localStorage.getItem('DEBUG') === 'true') {
        console.log('[DEBUG]', ...args);
    }
};

// Usage
debug('Camera stream:', stream);
```

### Backend Debugging
```javascript
// Use Winston logger
const logger = require('../utils/logger');

logger.info('Media uploaded', { filename, size });
logger.error('Upload failed', { error: error.message });
```

### Common Issues

**Issue:** Camera não abre no iOS
**Solution:** Verificar HTTPS (required) e permissions

**Issue:** Upload falha com ficheiros grandes
**Solution:** Verificar `maxFileSize` no multer config

**Issue:** Imagens não aparecem após upload
**Solution:** Verificar paths e static file serving

---

## 📦 Dependencies Management

### Novas Dependências (se necessário)

```bash
# Image processing (opcional - considerar cuidadosamente)
npm install sharp --save

# Apenas se REALMENTE necessário
# Preferir Canvas API client-side quando possível
```

### Verificar Compatibilidade
- Node.js version: ≥ 14.x
- Browser support: Chrome 90+, Firefox 88+, Safari 14+
- Mobile: Android 10+, iOS 14+

---

## 🔄 Git Workflow

### Commits
```bash
# Feature nova
git commit -m "feat: add mobile camera capture functionality"

# Bug fix
git commit -m "fix: resolve image compression memory leak"

# Performance
git commit -m "perf: optimize thumbnail generation"
```

### Pull Requests
```markdown
## Description
Breve descrição da feature

## Changes
- Lista de alterações principais
- Ficheiros modificados/criados

## Testing
- Como foi testado
- Devices testados

## Screenshots
[Adicionar screenshots se relevante]

## Checklist
- [ ] Code reviewed
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No console.log()
```

---

## 📚 Resources

### APIs Used
- **MediaDevices.getUserMedia()** - Camera access
- **Canvas API** - Image manipulation
- **Drag & Drop API** - File uploads
- **Intersection Observer** - Lazy loading
- **FileReader API** - File preview

### Libraries (Considerar)
- ⚠️ **Sharp** - Server-side image processing (heavy, use carefully)
- ✅ **Canvas API** - Client-side processing (preferred)

### Tools
- **Lighthouse** - Performance testing
- **Chrome DevTools** - Mobile simulation
- **BrowserStack** - Cross-browser testing (se disponível)

---

## ✅ Code Review Checklist

Antes de submeter PR:

### Code Quality
- [ ] Código limpo e bem documentado
- [ ] Sem console.log() ou debug code
- [ ] Error handling adequado
- [ ] Naming conventions seguidas

### Performance
- [ ] Images otimizadas
- [ ] No memory leaks
- [ ] Lazy loading implementado
- [ ] Queries eficientes

### Security
- [ ] Input validation
- [ ] File type verification
- [ ] Max file size enforced
- [ ] XSS prevention

### UX
- [ ] Loading states
- [ ] Error messages claras
- [ ] Mobile responsive
- [ ] Accessibility (ARIA labels)

---

**Questões?** Contactar: GGE Developer Team  
**Última Atualização:** 2025-01-07

