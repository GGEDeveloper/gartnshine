# Pull Request: SEO Foundation

**Criar PR no GitHub:** https://github.com/GGEDeveloper/gartnshine/compare/feature/planning-fase1-fase2...dev/seo-robots-sitemap

---

## Título
```
feat(seo): SEO Foundation — robots, meta tags, schema, GA4, sitemap
```

## Base branch
`feature/planning-fase1-fase2`

## Head branch
`dev/seo-robots-sitemap`

---

## Corpo do PR (copiar abaixo)

## SEO Foundation — Fases 1 a 5

### O que foi implementado

#### Fase 1 — robots.txt e BASE_URL
- robots.txt corrigido (removido Disallow: /*.xml$ que bloqueava sitemap)
- BASE_URL=https://artnshine.pt adicionado ao .env.example

#### Fase 2 — Meta Tags Dinâmicas
- layout main.ejs com title, description, keywords, canonical, OG e Twitter Card 100% dinâmicos
- Partial seo-head-standalone.ejs para páginas com layout: false
- Todas as routes principais passam metaDescription e canonicalUrl específicos
- URL corrigida: gonzagaartshine.com → artnshine.pt em todo o código
- Copy alinhado com identidade real da marca (Gonzaga's Art & Shine, prata 925)

#### Fase 3 — Schema Markup
- Partial schema-product.ejs (Product JSON-LD com price, availability, sku, brand)
- Partial schema-breadcrumb.ejs (BreadcrumbList)
- Schema OnlineStore na homepage
- Schema de produto e breadcrumb ativos na página de produto

#### Fase 4 — Google Analytics 4
- Bloco GA4 no layout com integração ao sistema de cookie consent existente
- GA4 só carrega se analytics consent = true OU se utilizador ainda não respondeu
- Evento view_item no detalhe de produto
- Evento search nos resultados de pesquisa
- CSP atualizado com domínios Google Analytics

#### Fase 5 — Sitemap melhorado
- Utilitário seo-helpers.js (generateSlug, formatSitemapDate)
- Sitemap com imagens (image:image por produto)
- URLs de coleções corrigidas (/collection/:id)
- Páginas /catalogo, /galeria, /manifesto, /artesaos adicionadas ao sitemap
- robots.txt alargado com Allow para novas rotas

### Como testar
- GET /robots.txt → texto correto sem bloquear sitemap
- GET /sitemap.xml → XML com produtos, imagens e famílias
- Qualquer página com layout → title e description únicos no <head>
- /catalog/product/:id → JSON-LD Product + BreadcrumbList no source

### Pending / Próximos passos
- Criar ID real GA4 e adicionar ao .env de produção
- Submeter sitemap no Google Search Console
- Substituir og-artnshine.jpg placeholder por imagem real 1200×630px
- Criar views standalone em falta (pages/catalogo-dark-nature.ejs, etc.)
