# Análise de Sobreposição - Catálogo CSS

**Data:** 2026-02-17  
**Arquivos analisados:** catalog.css, catalog-enhanced.css

---

## Situação Atual

- **catalog.css** (17KB, 825 linhas, **318 seletores únicos**) carrega ANTES
- **catalog-enhanced.css** (29KB, 1335 linhas, **481 seletores únicos**) carrega DEPOIS (sobrescreve)

**Ordem no main.ejs:**
```html
<link rel="stylesheet" href="/css/catalog.css?v=<%= Date.now() %>">
<link rel="stylesheet" href="/css/catalog-enhanced.css?v=<%= Date.now() %>">
```

---

## Seletores Únicos

### Só em catalog.css (não no enhanced)
**110 seletores** (35% dos seletores de catalog.css)

Principais seletores únicos:
- `.catalog-main`, `.catalog-wrapper`
- `.product-grid`, `.product-item`
- `.filter-section`, `.filter-group`
- `.sort-controls`, `.view-toggle`
- `.pagination-wrapper`, `.pagination-info`

**Análise:** catalog.css contém seletores de estrutura base que podem não estar em enhanced.

### Só em catalog-enhanced.css (não no catalog)
**273 seletores** (57% dos seletores de enhanced)

Principais seletores únicos:
- `.catalog-container`, `.catalog-grid`, `.catalog-header`
- `.catalog-sidebar`, `.filter-drawer`, `.filter-drawer-overlay`
- `.product-card`, `.product-image-container`, `.product-info`
- `.badge-new`, `.badge-sale`, `.product-badge`
- `.floating-filter-btn`, `.filter-toggle-btn`
- `.list-view`, `.grid-view`
- `.catalog-pagination`, `.results-count`

**Análise:** catalog-enhanced.css tem muitos seletores novos/extras que catalog.css não tem.

### Em AMBOS (sobreposição)
**208 seletores compartilhados** (65% dos seletores de catalog.css, 43% dos seletores de enhanced)

Principais seletores compartilhados:
- `.active`, `.badge`, `.product-*` (vários)
- `.filter-*` (vários)
- `.catalog-*` (vários)
- Valores numéricos comuns (`.05`, `.1`, `.2`, `.3s`, `.5s`, etc.)

**Análise:** Há sobreposição significativa, mas enhanced tem muitas features extras.

---

## Medição Real

- **Seletores só em catalog:** 110 (35%)
- **Seletores só em enhanced:** 273 (57%)
- **Seletores compartilhados:** 208 (65% de catalog, 43% de enhanced)

**Percentagem de sobreposição:** 208 / 318 = **65.4%**

**Interpretação:** catalog.css tem 65% dos seus seletores também presentes em enhanced, mas enhanced tem 57% de seletores únicos adicionais.

---

## Análise de Decisão

### Cenário Identificado: Enhanced é SUPERSET com base compartilhada

**Evidências:**
- ✅ Enhanced tem 273 seletores únicos (57% do total)
- ✅ Catalog tem apenas 110 seletores únicos (35% do total)
- ⚠️ 65% de sobreposição indica que enhanced **estende** catalog, não o substitui completamente

**Pergunta crítica:** Os 110 seletores únicos de catalog.css são **necessários** ou já estão cobertos funcionalmente por enhanced?

### Análise dos Seletores Únicos de catalog.css

Principais categorias dos 110 seletores únicos:
- Estrutura base: `.catalog-main`, `.catalog-wrapper`
- Grid/List: `.product-grid`, `.product-item`
- Filtros: `.filter-section`, `.filter-group`
- Paginação: `.pagination-wrapper`, `.pagination-info`
- Controles: `.sort-controls`, `.view-toggle`

**Risco:** Se remover catalog.css, pode perder estrutura base que enhanced assume que existe.

---

## Decisão Recomendada

### ⚠️ Cenário: MANTER AMBOS (complementares)

**Justificativa:**
1. **65% de sobreposição** não é suficiente para remover catalog.css (não é >80%)
2. **110 seletores únicos** em catalog.css podem ser estrutura base necessária
3. **Enhanced parece estender** catalog, não substituir completamente
4. **Risco alto** de quebrar layout se remover catalog.css sem testes visuais completos

**Ação proposta:**
1. ✅ **MANTER AMBOS** por agora
2. ✅ **Testar visualmente** remover catalog.css em ambiente de desenvolvimento
3. ✅ Se testes passarem, então remover catalog.css e arquivar
4. ✅ Se testes falharem, manter ambos (cascata intencional)

---

### Alternativa: Remover catalog.css (após testes)

**Condições para remover:**
- ✅ Testes visuais completos em `/catalog` passarem
- ✅ Filtros funcionarem corretamente
- ✅ Paginação funcionar
- ✅ Grid/List view toggle funcionar
- ✅ Mobile responsivo OK

**Se todas condições OK:**
- Remover `<link rel="stylesheet" href="/css/catalog.css">` de main.ejs
- Arquivar catalog.css em `_archive/css-deprecated/catalog-old/`
- **Redução:** -17KB, -825 linhas, -1 request HTTP

---

## Decisão Final

**✅ MANTER AMBOS** até testes visuais confirmarem que enhanced é suficiente.

**Próximo passo:** Na Fase 2, fazer testes visuais removendo catalog.css temporariamente e verificar se layout quebra.

**Percentagem de sobreposição:** 65.4% (entre 50-80% = zona de análise caso a caso)

---

## Métricas

- **catalog.css:** 318 seletores, 17KB, 825 linhas
- **catalog-enhanced.css:** 481 seletores, 29KB, 1335 linhas
- **Sobreposição:** 208 seletores (65.4% de catalog)
- **Catalog-only:** 110 seletores (35%)
- **Enhanced-only:** 273 seletores (57%)
