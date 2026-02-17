# Plano de Arquivamento CSS

## Critérios para Arquivamento

1. **Versões antigas** quando existe versão definitiva em uso (ex.: admin-layout-fix.css vs admin-layout-fix-definitive.css).  
2. **Fixes temporários** após integração em ficheiro permanente (theme/dark-luxe ou admin-core).  
3. **Duplicações confirmadas** (ex.: manter só catalog-enhanced se cobrir catalog.css).  
4. **Não referenciados** em nenhuma view (CSS morto).

---

## Estrutura do Arquivo Morto (criada)

```
_archive/css-deprecated/
├── admin-old-versions/   (vazio por agora)
├── fixes-temporary/       (vazio por agora)
├── catalog-old/           (vazio por agora)
├── navigation-old/        (vazio por agora)
└── README.md
```

---

## Candidatos a Arquivamento (NÃO MOVER NA FASE 1)

### ALTO RISCO (após integração/testes na Fase 2)

| Ficheiro | Destino no archive | Condição |
|----------|--------------------|----------|
| admin-layout-fix.css | fixes-temporary/ | Já substituído por admin-layout-fix-definitive.css |
| admin-layout-fix-definitive.css | — | Manter; integrar depois em admin-core |
| background-override.css | fixes-temporary/ | Após integrar em dark-luxe.css |
| black-background-fix.css | fixes-temporary/ | Após integrar em dark-luxe ou confirmar layout.ejs legado |

### MÉDIO RISCO (verificar uso antes)

| Ficheiro | Destino | Condição |
|----------|---------|----------|
| catalog.css | catalog-old/ | Só se catalog-enhanced.css for suficiente e testes OK |
| admin-v2.css | admin-old-versions/ | Não referenciado |
| admin-theme.css | admin-old-versions/ | Não referenciado |

### BAIXO RISCO (provavelmente morto)

| Ficheiro | Destino |
|----------|---------|
| product-detail-v2.css | (já existe view v2 arquivada) → catalog-old/ ou novo product-detail-old/ |
| navigation-v2.css | navigation-old/ |
| enhanced-navigation.css | navigation-old/ |
| mobile-navigation.css | navigation-old/ ou fixes-temporary/ |
| loading-states.css | fixes-temporary/ ou componente específico |
| admin-dashboard.css | admin-old-versions/ |
| admin-orders.css | admin-old-versions/ |
| admin-product-form.css | admin-old-versions/ |
| dashboard.css | admin-old-versions/ |
| public/css/admin/admin-styles.css | admin-old-versions/ |
| public/css/admin/header-sidebar-fixes.css | admin-old-versions/ |

---

## NÃO ARQUIVAR (manter ativos)

- variables.css  
- main.css  
- theme.css  
- components.css  
- dark-luxe.css  
- homepage.css, catalog.css (ou só catalog-enhanced após decisão)  
- catalog-enhanced.css  
- notifications.css, search.css, frontend-mobile.css  
- admin.css, admin-dark-luxe.css, admin-layout-fix-definitive.css  
- admin-mobile.css, admin-tables-mobile.css  
- collections.css, search-results.css, media-library.css, camera-capture.css, admin-quick-actions.css  

---

## Lista resumida para Fase 2

### Confirmados para arquivar (após testes)

1. admin-layout-fix.css → _archive/css-deprecated/fixes-temporary/  
2. (Após integração) background-override.css, black-background-fix.css → fixes-temporary/  
3. (Se catalog-enhanced for suficiente) catalog.css → catalog-old/  

### Verificar antes de arquivar

- admin-v2.css, admin-theme.css  
- product-detail-v2.css, navigation-v2.css, enhanced-navigation.css, mobile-navigation.css  
- loading-states, admin-dashboard, admin-orders, admin-product-form, dashboard.css  
- public/css/admin/*  

---

## README.md do archive (conteúdo sugerido)

Em _archive/css-deprecated/README.md: explicar que esta pasta recebe CSS obsoleto ou consolidado a partir da Fase 2; listar critérios (versões antigas, fixes integrados, não referenciados); e indicar que nada foi movido na Fase 1.
