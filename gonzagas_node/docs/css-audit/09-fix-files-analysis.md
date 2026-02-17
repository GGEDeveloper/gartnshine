# Análise de Arquivos "Fix" Temporários

---

## background-override.css

**Tamanho:** 6.9K (301 linhas)  
**Primeiras linhas:** Comentário "BACKGROUND OVERRIDE - PRETO SÓLIDO GLOBAL", força `html, body { background: #000 !important; }`, remove gradientes em main/container/section/article.  
**Referenciado em:** layout.ejs, catalog/product-detail.ejs  
**Pode ser integrado em:** theme.css ou dark-luxe.css (overrides de fundo preto).  
**Ação recomendada:** Integrar regras essenciais em dark-luxe.css; depois mover para _archive/css-deprecated/fixes-temporary/.

---

## black-background-fix.css

**Tamanho:** 7.1K (314 linhas)  
**Primeiras linhas:** "BLACK BACKGROUND FIX - REMOVAL DE GRADIENTES", força #000000 em .featured-products-v2, .categories-showcase, .trust-section, .cta-section, etc.  
**Referenciado em:** layout.ejs apenas.  
**Pode ser integrado em:** theme.css / dark-luxe.css.  
**Ação recomendada:** Se layout.ejs for legado, arquivar. Caso contrário, integrar em dark-luxe e remover referência.

---

## admin-layout-fix.css

**Tamanho:** 5.9K (264 linhas)  
**Primeiras linhas:** "Admin Layout Fix CSS", reset overflow, #wrapper flex, .sidebar.  
**Referenciado em:** Nenhuma view (não está em admin/layouts/main.ejs).  
**Sobrescrito por:** admin-layout-fix-definitive.css (que sim está no layout admin).  
**Ação recomendada:** Arquivar; já substituído por admin-layout-fix-definitive.css.

---

## admin-layout-fix-definitive.css

**Tamanho:** 8.6K (294 linhas)  
**Primeiras linhas:** "Admin Layout Fix - DEFINITIVO", resolve margem à esquerda no admin mobile, media (min-width: 992px) para desktop.  
**Em uso:** admin/layouts/main.ejs.  
**Ação recomendada:** MANTER. Na Fase 2, considerar integrar conteúdo num único admin-core.css (admin + fixes + dark-luxe) para reduzir requests.
