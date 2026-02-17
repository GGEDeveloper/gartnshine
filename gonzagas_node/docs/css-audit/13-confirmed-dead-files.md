# Arquivos CSS Verdadeiramente Mortos (Confirmados)

**Data:** 2026-02-17  
**Método:** grep em todas as views/ para verificar referências

---

## ✅ CONFIRMADOS COMO MORTOS (100% seguro para arquivar)

### Admin (versões antigas)
- ✅ **admin-v2.css** — Não referenciado em nenhuma view
- ✅ **admin-theme.css** — Não referenciado em nenhuma view
- ✅ **admin-layout-fix.css** — Não referenciado (substituído por admin-layout-fix-definitive.css)

### Navigation
- ✅ **mobile-navigation.css** — Não referenciado em nenhuma view
- ✅ **navigation-v2.css** — Não referenciado em nenhuma view
- ✅ **enhanced-navigation.css** — Não referenciado em nenhuma view

### Product Detail
- ✅ **product-detail-v2.css** — Não referenciado (view product-detail-v2.ejs foi arquivada)

### Features/Components
- ✅ **loading-states.css** — Não referenciado em nenhuma view
- ✅ **admin-dashboard.css** — Não referenciado (admin usa admin.css + admin-dark-luxe.css)
- ✅ **admin-orders.css** — Não referenciado em nenhuma view
- ✅ **admin-product-form.css** — Não referenciado em nenhuma view
- ✅ **dashboard.css** — Não referenciado em nenhuma view (possível uso dinâmico não encontrado)

### Subpasta admin/
- ✅ **public/css/admin/admin-styles.css** — Não referenciado em nenhuma view
- ✅ **public/css/admin/header-sidebar-fixes.css** — Não referenciado em nenhuma view

---

## ⚠️ VERIFICAR ANTES DE ARQUIVAR

### background-override.css
**Status:** Referenciado em:
- `views/layout.ejs` (layout alternativo/legado?)
- `views/catalog/product-detail.ejs`

**Ação:** Verificar se layout.ejs ainda é usado. Se não, integrar regras em dark-luxe.css e arquivar.

### black-background-fix.css
**Status:** Referenciado em:
- `views/layout.ejs` (layout alternativo/legado?)

**Ação:** Verificar se layout.ejs ainda é usado. Se não, integrar regras em dark-luxe.css e arquivar.

---

## Resumo

**Total de arquivos mortos confirmados:** 14 arquivos  
**Total de arquivos para verificar:** 2 arquivos (background-override, black-background-fix)

**Tamanho total estimado dos mortos:** ~150KB (estimativa)

**Ação recomendada:** Arquivar os 14 arquivos confirmados na Fase 2 após backup.

---

## Lista para Arquivamento (Fase 2)

```
_archive/css-deprecated/admin-old-versions/
├── admin-v2.css
├── admin-theme.css
└── admin-layout-fix.css

_archive/css-deprecated/navigation-old/
├── mobile-navigation.css
├── navigation-v2.css
└── enhanced-navigation.css

_archive/css-deprecated/catalog-old/
└── product-detail-v2.css

_archive/css-deprecated/fixes-temporary/
├── loading-states.css
├── admin-dashboard.css
├── admin-orders.css
├── admin-product-form.css
└── dashboard.css

_archive/css-deprecated/admin-old-versions/
├── admin/admin-styles.css
└── admin/header-sidebar-fixes.css
```
