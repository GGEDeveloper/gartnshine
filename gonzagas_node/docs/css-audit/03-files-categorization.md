# Categorização de Arquivos CSS (Main Branch)

**Data:** 2026-02-17 | **Total ficheiros (raiz):** 36 | **Subpasta admin:** 2 | **Total linhas:** 18 164

---

## ✅ ATIVOS CONFIRMADOS (em uso no main.ejs)

| Ficheiro | Tamanho | Notas |
|----------|---------|-------|
| variables.css | 1.8K | Paleta dark-luxe centralizada |
| main.css | 35K | Estilo principal global |
| homepage.css | 4.8K | Homepage específico |
| theme.css | 5.7K | Sistema de temas |
| components.css | 11K | Componentes reutilizáveis |
| catalog.css | 17K | Catálogo base |
| catalog-enhanced.css | 29K | Catálogo melhorado **(duplicação?)** |
| notifications.css | 5.8K | Sistema notificações |
| search.css | 1.7K | Busca |
| frontend-mobile.css | 7.5K | Mobile frontend |
| dark-luxe.css | 5.7K | Tema dark-luxe (carregado no final) |

---

## ⚠️ DUPLICAÇÕES IDENTIFICADAS

### Admin (múltiplas versões)

| Ficheiro | Tamanho | Em uso? |
|----------|---------|--------|
| admin.css | 19K | ✅ admin/layouts/main.ejs, auth.ejs, simple-layout.ejs |
| admin-v2.css | 14K | ❌ Não referenciado |
| admin-dark-luxe.css | 17K | ✅ admin/layouts/main.ejs |
| admin-theme.css | 8.7K | ❌ Não referenciado |

**Layout admin atual (main.ejs):** variables.css, admin.css, admin-layout-fix-definitive.css, admin-dark-luxe.css, admin-tables-mobile.css, admin-mobile.css, notifications.css

**AÇÃO:** Manter admin.css + admin-dark-luxe.css + fixes. Arquivar admin-v2.css e admin-theme.css após confirmação.

### Catálogo (2 versões no main layout)

| Ficheiro | Tamanho | Uso |
|----------|---------|-----|
| catalog.css | 17K | main.ejs + search-results.ejs |
| catalog-enhanced.css | 29K | main.ejs |

**AÇÃO:** Verificar se catalog-enhanced.css pode substituir catalog.css; consolidar ou arquivar um.

---

## 📁 Layout Fixes (temporários?)

| Ficheiro | Tamanho | Em uso |
|----------|---------|--------|
| admin-layout-fix.css | 5.9K | ❌ Não referenciado (usa-se definitive) |
| admin-layout-fix-definitive.css | 8.6K | ✅ admin/layouts/main.ejs |
| background-override.css | 6.9K | ✅ layout.ejs, catalog/product-detail.ejs |
| black-background-fix.css | 7.1K | ✅ layout.ejs (layout.ejs pode ser legado) |

**AÇÃO:** Integrar fixes em theme/dark-luxe ou admin; depois arquivar. admin-layout-fix.css já substituído por definitive.

---

## 📱 MOBILE ESPECÍFICO

| Ficheiro | Tamanho | Em uso |
|----------|---------|--------|
| admin-mobile.css | 8.4K | ✅ Admin layouts |
| frontend-mobile.css | 7.5K | ✅ main.ejs |
| mobile-navigation.css | 7.0K | ❌ Não referenciado em views |
| admin-tables-mobile.css | 7.5K | ✅ admin/layouts/main.ejs |

**AÇÃO:** Verificar se mobile-navigation.css está em uso (incluído por JS ou outro mecanismo).

---

## 🎨 COMPONENTES E FEATURES

| Ficheiro | Tamanho | Em uso |
|----------|---------|--------|
| collections.css | 3.0K | ✅ collections.ejs |
| camera-capture.css | 4.2K | ✅ admin quick-product, product-form, camera-module |
| loading-states.css | 4.4K | ❌ Não referenciado |
| media-library.css | 20K | ✅ admin/media/library.ejs (via locals.style) |
| navigation-v2.css | 18K | ❌ Não referenciado |
| enhanced-navigation.css | 4.1K | ❌ Não referenciado |
| product-detail-v2.css | 19K | ❌ View product-detail-v2 arquivada |
| search-results.css | 11K | ✅ search-results.ejs |
| admin-dashboard.css | 4.2K | ❌ Não referenciado (admin usa admin.css + admin-dark-luxe) |
| admin-orders.css | 1.9K | ❌ Não referenciado |
| admin-product-form.css | 3.8K | ❌ Não referenciado |
| admin-quick-actions.css | 8.1K | ✅ catalog/product-detail.ejs |
| dashboard.css | 40K | ❌ Não referenciado em layouts (possível uso dinâmico?) |

---

## 📁 DIRETÓRIO public/css/admin/

| Ficheiro | Referenciado? |
|----------|----------------|
| admin-styles.css | ❌ Não |
| header-sidebar-fixes.css | ❌ Não |

**AÇÃO:** Candidatos a CSS morto; arquivar ou eliminar após confirmação.

---

## ❌ NÃO REFERENCIADOS (candidatos a morto)

- admin-v2.css  
- admin-theme.css  
- admin-layout-fix.css (substituído por definitive)  
- mobile-navigation.css  
- navigation-v2.css  
- enhanced-navigation.css  
- product-detail-v2.css (view arquivada)  
- loading-states.css  
- admin-dashboard.css  
- admin-orders.css  
- admin-product-form.css  
- dashboard.css  
- public/css/admin/admin-styles.css  
- public/css/admin/header-sidebar-fixes.css  
