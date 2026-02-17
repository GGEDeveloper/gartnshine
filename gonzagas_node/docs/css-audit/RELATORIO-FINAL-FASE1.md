# Relatório Final – Auditoria CSS Fase 1

**Data:** 2026-02-17  
**Branch:** style-consolidation-fase1 (criado a partir de main)  
**Total de ficheiros CSS (raiz public/css):** 36  
**Subpasta public/css/admin/:** 2 ficheiros  
**Total de linhas (raiz):** 18 164  
**Tamanho total (aprox.):** ~350 KB (ver 01-files-inventory.txt)

---

## Estatísticas

### Distribuição por categoria (aprox.)

| Categoria | Ficheiros | Notas |
|-----------|-----------|--------|
| Core/Base | 4 | variables, main, theme, dark-luxe |
| Frontend (home, catalog, etc.) | 8 | homepage, catalog, catalog-enhanced, components, notifications, search, frontend-mobile, collections |
| Admin | 12+ | admin, admin-dark-luxe, admin-layout-fix*, admin-mobile, admin-tables-mobile, admin-dashboard, admin-orders, admin-product-form, admin-quick-actions, admin-v2, admin-theme + admin/* |
| Fixes / overrides | 4 | background-override, black-background-fix, admin-layout-fix, admin-layout-fix-definitive |
| Mobile / navigation | 4 | frontend-mobile, admin-mobile, admin-tables-mobile, mobile-navigation |
| Páginas/features | 8+ | search-results, media-library, camera-capture, loading-states, dashboard, navigation-v2, enhanced-navigation, product-detail-v2 |

### Maiores ficheiros (linhas)

1. dashboard.css — 1992  
2. main.css — 1796  
3. catalog-enhanced.css — 1335  
4. media-library.css — 1003  
5. product-detail-v2.css — 955  
6. admin.css — 952  
7. navigation-v2.css — 945  
8. catalog.css — 825  

---

## Problemas identificados

### 1. Duplicações confirmadas

#### A. Admin (várias versões)

- **admin.css** (19K) — em uso em admin/layouts/main.ejs, auth.ejs, simple-layout.ejs  
- **admin-dark-luxe.css** (17K) — em uso em admin/layouts/main.ejs  
- **admin-v2.css** (14K) — não referenciado  
- **admin-theme.css** (8.7K) — não referenciado  

**Recomendação:** Manter admin.css + admin-dark-luxe.css + admin-layout-fix-definitive. Arquivar admin-v2.css e admin-theme.css na Fase 2.

#### B. Catálogo (dois ficheiros no main layout)

- **catalog.css** (17K) e **catalog-enhanced.css** (29K) carregados em main.ejs.  
**Recomendação:** Avaliar se catalog-enhanced cobre catalog; se sim, remover catalog.css do layout e arquivar.

#### C. Admin layout fix (dois ficheiros)

- **admin-layout-fix.css** — não referenciado.  
- **admin-layout-fix-definitive.css** — em uso.  
**Recomendação:** Arquivar admin-layout-fix.css (já substituído).

### 2. Ficheiros “fix” temporários

- **admin-layout-fix.css** — substituído por definitive → arquivar.  
- **admin-layout-fix-definitive.css** — em uso → manter; na Fase 2 considerar integrar em admin-core.  
- **background-override.css** — usado em layout.ejs e product-detail.ejs → integrar em dark-luxe e depois arquivar.  
- **black-background-fix.css** — usado só em layout.ejs → integrar ou arquivar consoante uso de layout.ejs.

### 3. Possível CSS morto (não referenciado em views)

- admin-v2.css, admin-theme.css  
- admin-layout-fix.css  
- mobile-navigation.css, navigation-v2.css, enhanced-navigation.css  
- product-detail-v2.css (view v2 arquivada)  
- loading-states.css  
- admin-dashboard.css, admin-orders.css, admin-product-form.css  
- dashboard.css  
- public/css/admin/admin-styles.css  
- public/css/admin/header-sidebar-fixes.css  

---

## Recomendações Fase 2

### Prioridade alta

1. **Consolidar admin CSS**  
   - Manter admin.css + admin-dark-luxe.css + admin-layout-fix-definitive.css.  
   - Arquivar admin-v2.css e admin-theme.css.  
   - Opcional: criar admin-core.css único (merge) e testar todas as páginas admin.

2. **Resolver duplicação catálogo**  
   - Testar remoção de catalog.css do main.ejs (manter só catalog-enhanced.css).  
   - Se OK, arquivar catalog.css.

3. **Eliminar fixes temporários**  
   - Arquivar admin-layout-fix.css.  
   - Integrar background-override e black-background-fix em dark-luxe (ou theme) e remover referências; depois arquivar.

### Prioridade média

4. **Limpar mobile/navigation**  
   - Verificar se mobile-navigation, navigation-v2, enhanced-navigation são carregados por JS ou outra view.  
   - Se mortos, arquivar em navigation-old.

5. **Expandir variables.css**  
   - Centralizar cores e espaçamentos já usados noutros ficheiros.

### Prioridade baixa

6. **Arquivar CSS morto restante**  
   - loading-states, admin-dashboard, admin-orders, admin-product-form, dashboard.css, product-detail-v2.css.  
   - public/css/admin/* (admin-styles, header-sidebar-fixes) se confirmado não uso.

7. **Otimizar main.css**  
   - Revisar seletores não usados (com apoio de 07-all-selectors e 08-top-classes).

---

## Plano de arquivo morto (resumo)

### Candidatos a mover na Fase 2 (após testes)

| Ficheiro | Destino |
|----------|---------|
| admin-layout-fix.css | _archive/css-deprecated/fixes-temporary/ |
| background-override.css | fixes-temporary/ (após integração) |
| black-background-fix.css | fixes-temporary/ (após integração) |
| catalog.css | catalog-old/ (se catalog-enhanced for suficiente) |
| admin-v2.css, admin-theme.css | admin-old-versions/ |
| product-detail-v2.css, navigation-v2, enhanced-navigation, mobile-navigation | catalog-old/ ou navigation-old/ |
| loading-states, admin-dashboard, admin-orders, admin-product-form, dashboard.css | admin-old-versions/ ou fixes-temporary/ |
| public/css/admin/*.css | admin-old-versions/ |

### Estrutura criada (vazia)

```
_archive/css-deprecated/
├── admin-old-versions/
├── fixes-temporary/
├── catalog-old/
├── navigation-old/
└── README.md
```

---

## Próximos passos

### Antes de iniciar Fase 2

- [ ] Revisar este relatório com o decisor  
- [ ] Confirmar versão admin a manter (admin.css + admin-dark-luxe + definitive)  
- [ ] Confirmar se layout.ejs ainda é usado (impacta background-override e black-background-fix)  
- [ ] Backup adicional se necessário  

### Setup Fase 2

- [ ] Criar branch style-consolidation-fase2  
- [ ] Começar por arquivar admin-layout-fix.css e por consolidar admin (admin-v2, admin-theme)  
- [ ] Testes visuais em todas as páginas admin e no catálogo  
- [ ] Screenshots antes/depois quando fizer sentido  

### Estimativas Fase 2

- Consolidação admin e arquivo de versões antigas: 2–3 h  
- Catálogo (remover catalog.css + testes): ~1 h  
- Integração de fixes (background/black) em dark-luxe: 1–2 h  
- Arquivar restante CSS morto: ~1 h  
- **Total estimado:** 5–7 h  

---

## Notas técnicas

### Ordem de carregamento atual (main.ejs)

1. variables.css  
2. main.css  
3. homepage.css  
4. theme.css  
5. components.css  
6. catalog.css  
7. catalog-enhanced.css  
8. notifications.css  
9. search.css  
10. frontend-mobile.css  
11. dark-luxe.css  

Esta ordem deve ser respeitada na consolidação.

### Variáveis CSS (variables.css)

Paleta dark-luxe: `--color-primary`, `--color-secondary`, `--color-tertiary`, `--color-highlight`, `--color-accent`, `--color-accent-alt`, prata/bronze, texto, estados, bordas, sombras, glows, superfícies. Expandir conforme necessário na Fase 2.

---

## Checklist Fase 1

- [x] docs/css-audit/01-files-inventory.txt  
- [x] docs/css-audit/02-lines-count.txt  
- [x] docs/css-audit/03-files-categorization.md  
- [x] docs/css-audit/04-all-css-references.txt  
- [x] docs/css-audit/05-usage-map.md  
- [x] docs/css-audit/06-admin-subfolder-files.txt  
- [x] docs/css-audit/07-all-selectors.txt  
- [x] docs/css-audit/08-top-classes-in-views.txt  
- [x] docs/css-audit/09-fix-files-analysis.md  
- [x] docs/css-audit/10-archive-plan.md  
- [x] docs/css-audit/RELATORIO-FINAL-FASE1.md  
- [x] docs/css-audit/backup-original-20260217/  
- [x] _archive/css-deprecated/ (estrutura + README)  
- [x] Nenhum ficheiro CSS movido nem layout alterado  

**Fim do Relatório Fase 1**
