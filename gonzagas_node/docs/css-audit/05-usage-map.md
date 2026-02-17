# Mapa de Uso Real de CSS

**Fonte:** grep em `views/` (04-all-css-references.txt)

---

## Layout principal (views/layouts/main.ejs) — FRONTEND ATIVO

Ordem de carregamento:

1. variables.css ✅  
2. main.css ✅  
3. homepage.css ✅  
4. theme.css ✅  
5. components.css ✅  
6. catalog.css ✅  
7. catalog-enhanced.css ✅ **(ambos carregados — possível redundância)**  
8. notifications.css ✅  
9. search.css ✅  
10. frontend-mobile.css ✅  
11. dark-luxe.css ✅ (final)  
+ CDN: glightbox, slick-carousel  

---

## Layout Admin (views/admin/layouts/main.ejs)

Ordem:

1. Bootstrap 5.3  
2. variables.css  
3. admin.css  
4. admin-layout-fix-definitive.css  
5. admin-dark-luxe.css  
6. admin-tables-mobile.css  
7. admin-mobile.css  
8. notifications.css  
9. GLightbox (quando usado)  
+ `<%- style %>` (páginas injetam media-library.css, etc.)

**Admin auth.ejs / simple-layout.ejs:** admin.css, admin-mobile.css, (+ admin-tables em simple), notifications.

---

## Páginas específicas (CSS adicional)

| View | CSS extra |
|------|-----------|
| collections.ejs | collections.css |
| catalog/product-detail.ejs | background-override.css, admin-quick-actions.css |
| catalog/search-results.ejs | layout próprio: variables, main, catalog, search-results, dark-luxe (não usa main.ejs?) |
| admin/media/library.ejs | media-library.css (via locals.style) |
| admin/quick-product/form.ejs | camera-capture.css |
| admin/products/product-form.ejs | camera-capture.css |
| admin/partials/camera-module-import.ejs | camera-capture.css |

---

## Layout alternativo (views/layout.ejs)

Carrega: variables, main, background-override, black-background-fix, cookie-banner, css/mobile/* (mobile-base, mobile-header, mobile-cards, mobile-catalog, mobile-admin), + customCss dinâmico.

**Nota:** layout.ejs pode ser legado; frontend ativo usa main.ejs. Verificar onde layout.ejs é usado.

---

## main-layout.ejs (admin alternativo?)

Carrega: admin.css + customCss dinâmico (media print/onload). Verificar uso.

---

## ❌ NÃO REFERENCIADOS em nenhuma view

- admin-v2.css  
- admin-theme.css  
- admin-layout-fix.css (usa-se admin-layout-fix-definitive.css)  
- mobile-navigation.css  
- navigation-v2.css  
- enhanced-navigation.css  
- product-detail-v2.css  
- loading-states.css  
- admin-dashboard.css  
- admin-orders.css  
- admin-product-form.css  
- dashboard.css  
- public/css/admin/admin-styles.css  
- public/css/admin/header-sidebar-fixes.css  
