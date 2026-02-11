# Interligação Admin ↔ Frontend (Cliente)

**Última atualização:** 2025-02-11

## 1. Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BASE DE DADOS (MariaDB)                            │
│  products | product_families | product_images | site_settings | users       │
└─────────────────────────────────────────────────────────────────────────────┘
         │                    │                          │
         │                    │                          │
         ▼                    ▼                          ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐
│     ADMIN       │  │  SiteSettings   │  │      FRONTEND PÚBLICO       │
│  (CRUD produtos, │  │  (configurações)│  │  (catálogo, home, galeria)  │
│   famílias,     │  │                 │  │                             │
│   inventário)   │  │ - catalog_page  │  │  Lê: products, families,    │
│                 │  │ - hide_prices   │  │  siteSettings (via res.locals)│
│  Escreve na BD  │  │ - featured_    │  │  Renderiza EJS com dados     │
│                 │  │   carousel      │  │  do servidor                 │
└─────────────────┘  └─────────────────┘  └─────────────────────────────┘
```

## 2. Dados Partilhados (res.locals)

Carregados em **todas as requisições** (middleware em app.js):

| Variável | Origem | Usado em |
|----------|--------|----------|
| `siteSettings` | SiteSettings.getSettings() | Header (link Catalog), CatalogController, index |
| `families` | ProductFamily.getAll() | Menu navegação, filtros catálogo |
| `user` | req.session.user | Header (link Admin / Admin dropdown) |
| `app` | config | Todas as views |

## 3. SiteSettings → Frontend

| Setting | Admin (onde se altera) | Efeito no Frontend |
|---------|------------------------|--------------------|
| `catalog_page_enabled` | /admin/settings | Mostra/oculta link "Catalog" no menu; mostra página "em construção" se false |
| `hide_catalog_prices` | /admin/settings | Oculta preços no catálogo (mostra "Preço sob consulta") |
| `featured_carousel_enabled` | /admin/settings | Activa/desactiva carrossel de produtos em destaque na home |

## 4. Produtos Admin → Frontend

| Acção Admin | Tabela | Efeito no Frontend |
|-------------|--------|--------------------|
| Criar produto | products, product_images | Aparece no catálogo (se is_active=1, is_catalog_visible=1) |
| Editar produto | products | Dados actualizados no catálogo, home (featured), detalhe |
| Upload imagem | product_images, public/media/products/ | Imagem disponível em /media/products/ |
| Alterar família | products.family_id | Produto move-se de categoria no catálogo |
| is_active=0 | products | Produto deixa de aparecer no catálogo |
| featured=1 | products | Produto pode aparecer no carrossel da home |

## 5. API Usada pelo Frontend (Cliente)

O catálogo usa JavaScript modular que chama:

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/api/catalog/filter` | GET | Filtros AJAX (famílias, preço, search) |
| `/api/catalog/product/:id` | GET | Quick view modal |

**Catalog Enhanced** (public/js/catalog-enhanced.js):
- CatalogFilters → apiEndpoint: `/api/catalog/filter`
- CatalogQuickView → apiEndpoint: `/api/catalog/product`

## 6. Modelos Partilhados

| Modelo | Admin | Frontend |
|--------|-------|----------|
| **Product** | ProductController, InventoryController | CatalogController, routes/index, API |
| **ProductFamily** | ProductFamilyController | Menu, filtros, CatalogController |
| **SiteSettings** | SiteSettingsController | Middleware global → res.locals |
| **User** | AuthController | req.session.user |

## 7. Imagens

- **Upload admin:** Multer → `public/media/products/`
- **URL pública:** `/media/products/{filename}` ou `/uploads/products/{filename}` (compat.)
- **product_images:** guarda `image_filename`; joins nas queries para image_url

## 8. Header Público (Condicional)

```ejs
<% if (siteSettings.catalog_page_enabled) { %>
  <li><a href="/catalog">Catalog</a></li>
<% } %>

<% if (user) { %>
  <li><a href="/admin">Admin</a> + dropdown</li>
<% } else { %>
  <li><a href="/admin/login">Admin</a></li>
<% } %>
```

## 9. Homepage → Featured Products

- **Fonte:** `Product.getFeatured()` (WHERE featured=1, is_active=1)
- **Config:** `siteSettings.featured_carousel_enabled`
- **Render:** index.ejs com Slick Carousel, partial _productCardHomepage
