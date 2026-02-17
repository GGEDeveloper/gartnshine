# Archive: Limpeza V2 e estilo pedras/natureza (2026-02-17)

Home ativa confirmada: **/** (index.ejs). Variante com estilo pedras/natureza e demais V2 removidas do fluxo ativo.

## Conteúdo arquivado

### Views
- `views/index-v2.ejs` — Homepage alternativa (estilo pedras/natureza; não é a home atual)
- `views/partials/header-v2.ejs` — Header usado apenas por index-v2
- `views/catalog/product-detail-v2.ejs` — Detalhe produto V2 (unificado em product-detail)
- `views/admin/dashboard-v2.ejs` — Admin dashboard V2 (não linkado)
- `views/admin/products-v2.ejs` — Admin produtos V2 (não linkado)

### Assets
- `public/css/homepage-v2.css`
- `public/css/catalog-v2.css`
- `public/css/admin-products-v2.css`
- `public/js/homepage-v2.js`
- `public/js/catalog-v2.js`

### Rotas (código removido de routes/index.js e routes/admin.js)
- GET `/index-v2`
- GET `/catalog/product-v2/:id`
- GET `/admin/dashboard-v2`
- GET `/admin/products-v2`

### API não montada
- `routes/v2.js` e `routes/v2/` — Nunca foram montados em app.js

## Alterações feitas no projeto ativo

1. **search-results.ejs:** links de `/catalog/product-v2/:id` passaram para `/catalog/product/:id`.
2. Rotas e renders das versões V2 acima foram removidos.
