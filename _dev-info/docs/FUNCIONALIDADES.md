# Funcionalidades - Lista Completa

**Última atualização:** 2025-02-11

---

## FRONTEND PÚBLICO (Cliente)

### Homepage (`/`)
- Hero com vídeo de fundo
- Secção "Featured Pieces" – carrossel Slick com produtos em destaque (Product.getFeatured)
- Controlada por `siteSettings.featured_carousel_enabled`
- Media gallery (imagens/vídeos da pasta media)

### Catálogo (`/catalog`)
- Lista de produtos activos e visíveis no catálogo
- Controlada por `siteSettings.catalog_page_enabled` (se false → página "em construção")
- Filtros AJAX: famílias, intervalo de preço, pesquisa
- Ordenação, view modes (grid/list), lazy loading de imagens
- Quick view modal (detalhe rápido via API)
- Preços: `hide_catalog_prices` → "Preço sob consulta"
- Links WhatsApp para contacto

### Galeria (`/collections`)
- Galeria de imagens da pasta media

### Colecção (`/collection/:familyId`)
- Produtos filtrados por família

### Detalhe de Produto
- `/catalog/product/:id` – página com link WhatsApp
- `/catalog/product-v2/:id` – versão alternativa

### Pesquisa (`/search`)
- Filtros: query, categorias, stock, preço
- Ordenação: relevância, preço, nome, mais recentes

### Outras Páginas
- About, Privacy Policy, Terms of Service
- User Rights (GDPR)
- Privacy Settings (cookies)

### Navegação
- Menu: Home, Gallery, Catalog (condicional), About
- Link Admin (login ou dropdown se autenticado)
- Pesquisa no header

---

## ÁREA ADMINISTRATIVA

### Autenticação
- Login por email + password (tabela users, bcrypt)
- Sessão: req.session.user
- Logout

### Dashboard
- Estatísticas: total produtos, famílias, stock baixo
- Placeholders: orders, users, revenue
- Dashboard V2 com actividades recentes (dados mock)

### Gestão de Produtos
- Listar com filtros (referência, categoria, status, stock)
- Adicionar produto (formulário + upload imagens)
- Editar produto (incluindo imagens)
- Apagar produto
- Remover imagem individual de produto
- Upload: Multer, max 5MB, jpeg/png/gif/webp

### Gestão de Famílias
- CRUD de product_families (categorias)

### Inventário
- Lista produtos com stock
- Filtros: referência, categoria, status produto, status stock
- Histórico por produto (rota existe; view history.ejs não existe)
- Ajuste de stock (POST /admin/inventory/adjust)

### Configurações do Site
- featured_carousel_enabled
- catalog_page_enabled
- hide_catalog_prices

### Checkpoints
- Listar backups
- Criar backup (mysqldump)
- Restaurar backup
- Apagar backup

### Media Library
- Biblioteca de ficheiros (requer tabelas media_files, etc.)
- Upload, metadata, pastas, tags

### Analytics
- Dashboard com estatísticas
- Performance por produto
- Tracking de eventos
- Export CSV

### Cookie Consent
- Stats e lista de consentimentos (admin)

---

## API (Consumida pelo Frontend)

| Endpoint | Uso |
|----------|-----|
| GET /api/catalog/filter | Filtros do catálogo (famílias, preço, search) |
| GET /api/catalog/product/:id | Quick view |
| GET /api/products/featured | Produtos em destaque |
| GET /api/products/family/:id | Produtos por família |
| GET /api/families | Famílias |
| GET /api/search | Pesquisa |
| POST /api/cookie-consent | Guardar consentimento |

---

## Módulos JavaScript (Frontend)

### Catálogo (catalog-enhanced.js)
- CatalogFilters
- CatalogLazyLoad
- CatalogSort
- CatalogGrid
- CatalogQuickView
- CatalogViewModes
- CatalogSearch
- CatalogPagination

### Utilitários
- GonzagaUtils (utils.js)
- Navigation, UI, Carousel

---

## Dependências Externas (CDN)

- Bootstrap 5
- jQuery
- Slick Carousel
- GLightbox
- Chart.js (admin)
- Font Awesome 6
