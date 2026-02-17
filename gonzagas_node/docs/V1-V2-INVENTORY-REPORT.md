# Relatório de Inventário: Versões V1 vs V2 - Gonzaga's Art & Shine

**Data:** 2026-02-17  
**Objetivo:** Mapear todas as versões alternativas de páginas para decisão de limpeza  
**Estado:** ✅ Limpeza executada (2026-02-17)

---

## 1. RESUMO EXECUTIVO

**Homepage ativa confirmada:** `/` (index.ejs). A variante com estilo pedras/natureza (index-v2) **não é para manter** — foi arquivada.

| Categoria | ATIVO (em uso) | ARQUIVADO |
|-----------|----------------|-----------|
| **Homepage** | `index.ejs` (rota `/`) | `index-v2.ejs` + `header-v2.ejs` + assets (estilo pedras/natureza) |
| **Catálogo** | `public/catalog.ejs` (rota `/catalog`) | — |
| **Product Detail** | `catalog/product-detail.ejs` (rota `/catalog/product/:id`) | `product-detail-v2.ejs`; search-results unificado para `/catalog/product/:id` |
| **Admin Dashboard** | `admin/dashboard.ejs` | `admin/dashboard-v2.ejs` |
| **Admin Products** | `admin/products/index.ejs` | `admin/products-v2.ejs` |
| **API** | `routes/api.js` | `routes/v2.js` + `routes/v2/` (nunca montados) |

---

## 2. MAPA DETALHADO: URL → TEMPLATE → STATUS

### 2.1 FRONTEND PÚBLICO

| URL | Template | Layout | Status | Notas |
|-----|----------|--------|--------|-------|
| `/` | `index.ejs` | `layouts/main` | ✅ **ATIVO** | Homepage principal (confirmada). Usa `header.ejs`, hero com vídeo, featured products |
| `/catalog` | `public/catalog.ejs` | `layouts/main` | ✅ **ATIVO** | Catálogo via CatalogController. Links para `/catalog/product/:id` |
| `/catalog/product/:id` | `catalog/product-detail.ejs` | `layouts/main` | ✅ **ATIVO** | Detalhe produto único (search-results corrigido para usar este) |
| `/search` | `catalog/search-results.ejs` | `layouts/main` | ✅ **ATIVO** | Resultados pesquisa → linka para `/catalog/product/:id` |
| `/collections` | `collections.ejs` | `layouts/main` | ✅ **ATIVO** | Galeria de imagens |
| `/collection/:familyId` | `collection.ejs` | — | ✅ **ATIVO** | Produtos por família |
| `/about` | `about.ejs` | — | ✅ **ATIVO** | |
| `/privacy-policy` | `privacy-policy.ejs` | — | ✅ **ATIVO** | |
| `/terms-of-service` | `terms-of-service.ejs` | — | ✅ **ATIVO** | |

### 2.2 ROTAS LEGACY / UNDER CONSTRUCTION

| URL | Template | Status | Notas |
|-----|----------|--------|-------|
| `/product/:id` | `product-detail-uc.ejs` (UC) | ⚠️ **UC** | "Under Construction" — redireciona para ProductController |
| `/product/:id/details-uc` | idem | ⚠️ **UC** | Mesma lógica |

### 2.3 ADMIN

| URL | Template | Status | Linkado no menu? |
|-----|----------|--------|-------------------|
| `/admin` | `admin/dashboard.ejs` | ✅ **ATIVO** | Sim (Dashboard) |
| `/admin/dashboard` | `admin/dashboard.ejs` | ✅ **ATIVO** | Sim |
| `/admin/products` | `admin/products/index.ejs` (via ProductController) | ✅ **ATIVO** | Sim (Products) |

---

## 3. FICHEIROS ARQUIVADOS (2026-02-17)

Tudo abaixo foi movido para `_archive/2026-02-17_v2-and-nature-style-cleanup/`.

### 3.1 Views
- `views/index-v2.ejs` — Home com estilo pedras/natureza (não mantida)
- `views/partials/header-v2.ejs`
- `views/catalog/product-detail-v2.ejs`
- `views/admin/dashboard-v2.ejs`
- `views/admin/products-v2.ejs`

### 3.2 Assets
- `public/css/homepage-v2.css`, `catalog-v2.css`, `admin-products-v2.css`
- `public/js/homepage-v2.js`, `catalog-v2.js`

### 3.3 Rotas
- `routes/v2.js` e `routes/v2/` (API nunca montada)

---

## 4. INCONSISTÊNCIAS CORRIGIDAS

- **Product detail:** `search-results.ejs` passou a linkar para `/catalog/product/:id` (antes product-v2). Rota e view product-v2 arquivados.
- **Não existe** `/catalogo` nem `/produto/:slug` no código; o sistema usa `/catalog` e `/catalog/product/:id`.

---

## 5. LIMPEZA EXECUTADA (2026-02-17)

- Home ativa: **/** (index.ejs). Home com estilo pedras/natureza = index-v2 → **arquivada**.
- Rotas removidas: `/index-v2`, `/catalog/product-v2/:id`, `/admin/dashboard-v2`, `/admin/products-v2`.
- Views e assets V2 movidos para `_archive/2026-02-17_v2-and-nature-style-cleanup/` (ver README no archive).
- API `routes/v2` (nunca montada) também arquivada.
