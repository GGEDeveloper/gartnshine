# SEO Técnico Avançado — Problemas Silenciosos

**Objetivo:** Resolver problemas técnicos que destroem rankings sem avisar  
**Branch:** `dev/seo-tecnico-fixes` _(a criar)_  
**Prioridade:** 🔴 Alta — alguns já estão activos em produção

---

## Avaliação do Código Real

Após análise de `routes/index.js`, foram identificados **3 problemas críticos activos** que o Google já está a encontrar nos 299 URLs indexados:

---

## 🚨 Problema 1 — Páginas de Pesquisa Indexáveis (CRÍTICO)

### O que está a acontecer

A rota `/search` aceita os parâmetros: `q`, `page`, `sort`, `categories`, `inStock`, `priceMin`, `priceMax`.

Isto gera **milhares de URLs únicos** com conteúdo duplicado ou quase-duplicado:

```
https://artnshine.pt/search?q=anel&sort=price_asc
https://artnshine.pt/search?q=anel&sort=price_desc
https://artnshine.pt/search?q=anel&sort=name_asc
https://artnshine.pt/search?q=anel&page=2&sort=price_asc&categories=3
https://artnshine.pt/search?q=anel&inStock=true
...(infinitas combinações)
```

Se o Google indexar estas páginas:
- **Duplicate content** em massa → penalização de domain authority
- **Crawl budget desperdiçado** → o Google para de indexar as páginas importantes
- **Diluição de sinal** → autoridade dividida entre variantes da mesma página

### Solução — noindex na rota de pesquisa

**Ficheiro a modificar:** `routes/index.js` (rota `/search`)

Adicionar `noindex` nas páginas de resultados de pesquisa filtrados:

```javascript
router.get('/search', async (req, res) => {
  const { q, page, sort, categories, inStock, priceMin, priceMax } = req.query;
  
  // Determinar se a página deve ser indexada
  // Só indexar pesquisa base sem filtros e na primeira página
  const hasFilters = sort || categories || inStock || priceMin || priceMax;
  const isNotFirstPage = page && parseInt(page) > 1;
  const shouldNoIndex = hasFilters || isNotFirstPage;
  
  res.render('catalog/search-results', {
    // ... outros dados ...
    robotsMeta: shouldNoIndex ? 'noindex, follow' : 'index, follow',
    canonicalUrl: q ? `https://artnshine.pt/search?q=${encodeURIComponent(q)}` : 'https://artnshine.pt/search'
  });
});
```

**Template `search-results.ejs` — usar a variável:**

```html
<meta name="robots" content="<%= robotsMeta || 'noindex, follow' %>">
<link rel="canonical" href="<%= canonicalUrl %>">
```

> ⚠️ Regra: Páginas de resultados de pesquisa com filtros são **sempre noindex**. Só a página base `/search?q=TERMO` (sem filtros adicionais) pode ser indexada se tiver volume de pesquisa.

### Robots.txt — bloquear crawl das URLs filtradas

Adicionar em `public/robots.txt`:

```txt
# Bloquear parâmetros dinâmicos de pesquisa
Disallow: /search?*sort=
Disallow: /search?*categories=
Disallow: /search?*inStock=
Disallow: /search?*priceMin=
Disallow: /search?*priceMax=
Disallow: /search?*page=
```

---

## 🚨 Problema 2 — URLs de Coleção Numéricas

### O que está a acontecer

```javascript
// routes/index.js linha ~95
router.get('/collection/:familyId', ...)
canonicUrl: 'https://artnshine.pt/collection/' + familyId
```

As coleções usam IDs numéricos: `/collection/1`, `/collection/2`, etc.

Exactamente o mesmo problema que os produtos — zero valor SEO. Uma URL como `/collection/pedras-naturais` rankeia para "coleção pedras naturais".

### Solução — slug nas col.famílias (em conjunto com Fase C)

Adicionar coluna `slug` na tabela `product_families`:

```sql
ALTER TABLE product_families ADD COLUMN slug VARCHAR(255) UNIQUE;
UPDATE product_families SET slug = LOWER(
  REPLACE(REPLACE(REPLACE(name, ' ', '-'), 'ã', 'a'), 'ç', 'c')
);
```

Rota atualizada:

```javascript
// /collection/pedras-naturais em vez de /collection/2
router.get('/collection/:slug', async (req, res) => {
  const family = await ProductFamily.getBySlug(req.params.slug)
    || await ProductFamily.getById(req.params.slug); // fallback numerico 301
  
  if (!family) return res.status(404).render('404');
  
  // Se acessado por ID numérico, redirecionar para slug
  if (/^\d+$/.test(req.params.slug)) {
    return res.redirect(301, `/collection/${family.slug}`);
  }
  
  // canonicalUrl com slug
  canonicalUrl: `https://artnshine.pt/collection/${family.slug}`
});
```

---

## 🟡 Problema 3 — Preços com sale_price sem Schema PriceSpecification

### O que está a acontecer

O código tem `sale_price` e `purchase_price` (preço de custo) nos produtos. O schema actual apenas envia um preço genérico. Se o produto estiver em promoção, o Google não vê o preço original nem o desconto.

### Solução — schema de preço com promoção

```json
"offers": {
  "@type": "Offer",
  "priceCurrency": "EUR",
  "price": "<%= product.sale_price %>",
  "availability": "<%= product.current_stock > 0 ? 'InStock' : 'OutOfStock' %>",
  "priceValidUntil": "<%= nextYear %>"
}
```

Se o produto tiver preço original diferente do sale_price:

```json
"offers": {
  "@type": "AggregateOffer",
  "lowPrice": "<%= product.sale_price %>",
  "highPrice": "<%= product.purchase_price_display || product.sale_price %>",
  "priceCurrency": "EUR",
  "offerCount": 1
}
```

---

## 🟡 Problema 4 — Preconnect para recursos externos

### O que está a acontecer

GA4 e Google Fonts carregam sem `preconnect` → o browser só descobre estes domínios quando já está a fazer render → atraso de 100-300ms no LCP.

### Solução — adicionar ao `<head>` do `main.ejs`

```html
<!-- Preconnect para recursos externos críticos -->
<!-- GA4 / Google Tag Manager -->
<link rel="preconnect" href="https://www.googletagmanager.com">
<link rel="preconnect" href="https://www.google-analytics.com">
<link rel="dns-prefetch" href="https://stats.g.doubleclick.net">

<!-- Google Fonts (se forem usadas) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

> Colocar **antes** de qualquer `<link rel="stylesheet">` e **antes** do script do GA4.

**Impacto:** Redução de 100-300ms no LCP — especialmente em mobile onde as ligações são mais lentas.

---

## 🟢 Problema 5 — Política de Produtos Sem Stock

### O que está a acontecer

Produtos com `current_stock = 0` continuam indexados e visíveis no Google. Quando alguém clica → fraca experiência + bounce rate alto.

### Opções (decidir qual usar)

| Opção | Quando usar | Implementação |
|--------|------------|----------------|
| **Manter indexada** (recomendado para joias únicas) | Preça única, pode voltar | `availability: OutOfStock` no schema, sem noindex |
| **noindex temporário** | Produto fora temporariamente | `<meta name="robots" content="noindex">` na página |
| **Redirecionar para coleção** | Produto descontinuado | `res.redirect(301, '/collection/'+product.family_id)` |

**Recomendação para artnshine.pt:**

Como as joias são peças artesanais únicas, manter a página indexada com o schema correto (`OutOfStock`) e um botão de "Avisar quando disponível" ou link para peças semelhantes. Isto preserva o SEO acumulado na página.

---

## 🟢 Problema 6 — WWW vs non-WWW

### Verificar em produção

Aceder a:
- `http://www.artnshine.pt` → deve redirecionar 301 para `https://artnshine.pt`
- `http://artnshine.pt` → deve redirecionar 301 para `https://artnshine.pt`

Se não houver redirect configurado → o Google vê 2 sites distintos → duplicate content no domínio raiz.

**Configuração no dominios.pt:** Verificar no painel se existe regra de redirect WWW → non-WWW (ou vice-versa) e HTTPS.

---

## Checklist de Implementação

- [ ] **P1 — URGENTE:** `noindex` adicionado a `/search` com filtros
- [ ] **P1 — URGENTE:** `Disallow` dos parâmetros dinâmicos no `robots.txt`
- [ ] **P2:** Coluna `slug` adicionada à tabela `product_families`
- [ ] **P2:** Rotas `/collection/:slug` implementadas com redirect 301
- [ ] **P3:** Schema `Offer` com `sale_price` e `current_stock` dinâmicos
- [ ] **P4:** Tags `preconnect` e `dns-prefetch` adicionadas ao `<head>`
- [ ] **P5:** Política de produtos sem stock decidida e implementada
- [ ] **P6:** WWW redirect verificado no painel dominios.pt

---

**Doc anterior:** `13-fase-f-conteudo-blog.md`  
**Doc seguinte:** `15-seo-off-page.md`
