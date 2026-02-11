# Modelos e Fluxo de Dados

**Última atualização:** 2025-02-11

## Modelos (models/)

| Modelo | Tabela | Uso Principal |
|--------|--------|---------------|
| **Product** | products | Catálogo, admin produtos, inventário |
| **ProductFamily** | product_families | Categorias, menu, filtros |
| **Product** (images) | product_images | Imagens dos produtos |
| **Inventory** | inventory_transactions | Movimentos de stock |
| **SiteSettings** | site_settings | Configurações do site |
| **User** | users | Login admin |
| **Checkpoint** | checkpoints | Backups |
| **Media** | media_files, media_folders, media_tags | Biblioteca media |
| **Analytics** | analytics_* | Estatísticas |
| **CookieConsent** | cookie_consents | Consentimento cookies |
| **AuditLog** | audit_logs | Auditoria |

## Product – Métodos Principais

| Método | Retorno | Uso |
|--------|---------|-----|
| `getAll(limit, offset, filterOptions)` | rows | Admin lista |
| `getAllWithStock(options)` | { products, totalProducts } | Inventário |
| `getActiveForCatalog(limit, offset)` | rows | Catálogo, API filter |
| `getFeatured()` | rows | Home carrossel |
| `getByFamily(familyId)` | rows | Página colecção |
| `findById(id)` | row (BaseModel) | Lookup simples |
| `findByIdWithDetails(id)` | row + images | Editar produto, detalhe |
| `count()`, `countLowStock()` | number | Dashboard |
| `createProductWithImages()` | productId | Criar produto |
| `updateProductWithImages()` | boolean | Editar produto |

**Nota:** API usa `Product.getById()` que não existe no modelo; deveria ser `findByIdWithDetails` ou `findById`.

## ProductFamily

| Método | Retorno |
|--------|---------|
| `getAll()` | rows |
| `getById(id)` | row |

## SiteSettings

| Método | Retorno |
|--------|---------|
| `getSettings()` | { featured_carousel_enabled, catalog_page_enabled, hide_catalog_prices } |
| `updateSettings(data)` | { success, message } |

## Inventory

| Método | Uso |
|--------|-----|
| `createMovement(data)` | Registrar transação, actualizar stock |
| `getProductHistory(productId)` | **Não existe** – controller chama mas não está implementado |
| `getProductTransactions(productId)` | Existe – alternativa |
| `getMovementHistory(filters)` | Existe |

## Relação Produto ↔ Imagens

- `products` (id, reference, name, family_id, ...)
- `product_images` (product_id, image_filename, is_primary, sort_order)
- Imagens servidas em `/media/products/{filename}`
- Ficheiros em `public/media/products/`

## Campos Product Relevantes

- `is_active` – visível no sistema
- `is_catalog_visible` – visível no catálogo público
- `featured` – aparece no carrossel da home
- `current_stock`, `min_stock`
- `sale_price`, `purchase_price`
