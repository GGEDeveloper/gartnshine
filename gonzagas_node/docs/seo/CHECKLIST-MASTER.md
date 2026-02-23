# ✅ CHECKLIST MASTER SEO — Gonzaga's Art & Shine

> **Como usar este ficheiro:**
> 1. O agente Cursor lê a tarefa e o doc de referência indicado
> 2. Implementa o código
> 3. Preenche o bloco `📝 LOG DO AGENTE` imediatamente abaixo da tarefa
> 4. Marca o checkbox `[x]`
>
> **Formato do log:**
> ```
> 📝 LOG DO AGENTE
> Data: DD/MM/AAAA
> Ficheiros: `caminho/ficheiro.js`, `caminho/outro.ejs`
> Feito: descrição concisa do que foi implementado
> Validar: como confirmar que funciona
> ```

---

## 🗂️ Índice Rápido

| Bloco | Tarefas | Estado |
|-------|---------|--------|
| [🚨 Urgente](#-urgente--esta-semana) | 3 tarefas | ⬜⬜⬜ |
| [Fase A — Performance](#fase-a--performance--core-web-vitals) | 7 tarefas | ⬜⬜⬜⬜⬜⬜⬜ |
| [Fase B — Schema](#fase-b--schema-markup-avançado) | 5 tarefas | ⬜⬜⬜⬜⬜ |
| [Fase C — URLs & On-Page](#fase-c--urls-semânticas--on-page) | 6 tarefas | ⬜⬜⬜⬜⬜⬜ |
| [Técnico Avançado](#seo-técnico-avançado) | 6 tarefas | ⬜⬜⬜⬜⬜⬜ |
| [Fase D — Merchant Center](#fase-d--google-merchant-center) | 4 tarefas | ⬜⬜⬜⬜ |
| [Fase E — SEO Local](#fase-e--seo-local) | 4 tarefas | ⬜⬜⬜⬜ |
| [Fase F — Blog](#fase-f--conteúdo--blog) | 3 tarefas | ⬜⬜⬜ |
| [Off-Page](#seo-off-page) | 5 tarefas | ⬜⬜⬜⬜⬜ |
| [Monitorização](#monitorização) | 3 tarefas | ⬜⬜⬜ |

---

## 🚨 Urgente — Esta Semana

> Problemas activos em produção. Resolver antes de qualquer outra fase.
> **Doc de referência:** [`14-seo-tecnico-avancado.md`](14-seo-tecnico-avancado.md)

---

### U1 — noindex nas páginas `/search` com filtros

- [x] **P1** Adicionar lógica `shouldNoIndex` na rota `GET /search` em `routes/index.js`
- [x] **P1** Passar `robotsMeta` e `canonicalUrl` para a view `catalog/search-results.ejs`
- [x] **P1** Adicionar `<meta name="robots">` e `<link rel="canonical">` no template de resultados
- [x] **P1** Adicionar `Disallow` dos parâmetros dinâmicos em `public/robots.txt`

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `routes/index.js`, `views/catalog/search-results.ejs`, `routes/seo.js`
Feito: hasFilters noindex logic, meta robots + canonical no head standalone, Disallow /search?* no robots.txt
Validar: abrir /search?q=anel&sort=price_asc → ver source → robots deve ser "noindex, follow"
         abrir /search?q=anel → robots deve ser "index, follow"
         verificar robots.txt em https://artnshine.pt/robots.txt
```

---

### U2 — Confirmar URLs reais das redes sociais (sameAs)

- [x] **P1** Substituir todos os `CONFIRMAR_USERNAME` nos docs e no código com os URLs reais
- [x] **P1** Verificar em: `09-fase-b-schema-avancado.md`, `12-fase-e-seo-local.md`, e qualquer JSON-LD já implementado

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `views/index.ejs`, `views/layouts/main.ejs`
URLs confirmados:
  Instagram: https://www.instagram.com/gonzagaartnshine/
  Facebook:  https://www.facebook.com/profile.php?id=61573519807731
  Pinterest: (não existe ainda)
  TikTok:    (não existe ainda)
Feito: sameAs adicionado ao schema OnlineStore (index.ejs) e Organization (main.ejs)
```

---

### U3 — Verificar redirect WWW → non-WWW em dominios.pt

- [x] **P1** Testar `http://www.artnshine.pt` → deve dar 301 para `https://artnshine.pt`
- [ ] **P1** Testar `http://artnshine.pt` → deve dar 301 para `https://artnshine.pt` (requer config HTTPS no servidor)
- [ ] Se não existir redirect HTTP→HTTPS, configurar no painel dominios.pt

```
📝 LOG DO AGENTE
Data: 23/02/2026
Estado actual:
  http://www.artnshine.pt → redirect 301 implementado no app.js (Node.js level)
  http://artnshine.pt → HTTP→HTTPS redirect pendente (requer config servidor dominios.pt)
Acção tomada: Middleware WWW→non-WWW adicionado ao app.js antes de qualquer outro middleware.
  Middleware verifica req.hostname === 'www.artnshine.pt' em produção e redireciona 301.
Ficheiros: `app.js`
```

---

## Fase A — Performance & Core Web Vitals

> **Doc de referência:** [`08-fase-a-performance.md`](08-fase-a-performance.md)
> **Objectivo:** LCP < 2.5s, CLS < 0.1, INP < 200ms

---

### A1 — Preconnect para recursos externos

- [x] **P1** Adicionar `<link rel="preconnect">` para GA4, Google Tag Manager, Google Fonts em `views/layouts/main.ejs`
- [x] Colocar antes de qualquer `<link rel="stylesheet">` e antes do script GA4

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `views/layouts/main.ejs`
Feito: preconnect fonts.googleapis.com (já existia), preconnect googletagmanager.com + dns-prefetch google-analytics.com (adicionados condicionalmente com GA_TRACKING_ID)
Validar: PageSpeed Insights → oportunidades → "Preconnect to required origins" deve desaparecer
```

---

### A2 — Conversão de imagens para WebP

- [x] **P2** Instalar dependência `sharp` no projeto Node.js
- [x] **P2** Criar script ou middleware que converte imagens de upload para WebP automaticamente
- [ ] **P2** Actualizar queries que servem imagens de produto para preferir `.webp` se existir
- [ ] Testar com 3 produtos diferentes

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `models/Media.js`
Dependências adicionadas: sharp já estava instalado (^0.34.4)
Feito: processImage() agora gera WebP para cada variante (thumbnail, small, medium, large) + full-size WebP. has_webp flag no retorno. Falta: frontend <picture> tags para servir WebP com fallback.
Validar: ver source de página de produto → imagens devem ter extensão .webp
         Chrome DevTools → Network → filtrar por imagens → verificar tipo MIME "image/webp"
```

---

### A3 — Lazy loading nas imagens do catálogo

- [x] **P2** Adicionar `loading="lazy"` em todas as imagens de produto nas views do catálogo
- [x] **P2** Garantir que a primeira imagem visível (hero / produto destaque) tem `loading="eager"` (não lazy)
- [x] Verificar templates: `views/catalog/`, `views/index.ejs`

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: _productCard.ejs, _productCardHomepage.ejs, catalog.ejs, search-results.ejs, collections.ejs, product-detail.ejs
Feito: JÁ IMPLEMENTADO — todas as imagens de catálogo/cards têm loading="lazy", hero usa video+CSS background, main product image tem loading="eager"
Validar: Chrome DevTools → Network → scroll pela página → imagens devem carregar conforme aparecem no viewport
```

---

### A4 — OG Image estática de fallback

- [x] **P2** Criar imagem `public/images/og-artnshine.jpg` (1200×630px) com logo + tagline
- [x] **P2** Definir como fallback em `main.ejs` quando `ogImage` não está definido

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `public/images/og-artnshine.jpg`, `scripts/generate-og-image.js`
Dimensões da imagem criada: 1200x630px, 26KB, dark branded com nome + tagline + URL
Feito: Script generate-og-image.js cria imagem branded. Fallback já existia em main.ejs og:image.
Validar: Facebook Sharing Debugger → https://developers.facebook.com/tools/debug/
         Testar URL: https://artnshine.pt
```

---

### A5 — Favicons completos

- [x] **P3** Gerar set completo de favicons (ICO, PNG 16/32/192/512, Apple Touch Icon, manifest.json)
- [x] **P3** Adicionar tags ao `<head>` do layout principal
- [x] Usar ferramenta: https://realfavicongenerator.net

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `scripts/generate-favicons.js`, `public/favicon-16x16.png`, `public/favicon-32x32.png`, `public/apple-touch-icon.png`, `public/android-chrome-192x192.png`, `public/android-chrome-512x512.png`, `public/site.webmanifest`, `views/layouts/main.ejs`
Feito: Script generate-favicons.js gera todos os tamanhos a partir de logo.svg. Tags adicionadas ao head do main.ejs (favicon-32, favicon-16, apple-touch-icon, manifest).
Validar: abrir artnshine.pt → tab do browser deve mostrar favicon correcto
         mobile Chrome → adicionar ao ecrã → ícone deve aparecer
```

---

### A6 — Compressão gzip/brotli no servidor

- [x] **P2** Verificar se `compression` middleware está activo em `app.js`/`server.js`
- [x] Se não, instalar `npm install compression` e adicionar `app.use(compression())`

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `app.js` (já implementado — compression level 6, threshold 1KB)
Feito: JÁ EXISTIA — compression middleware activo desde o início do projecto
Validar: curl -H "Accept-Encoding: gzip" -I https://artnshine.pt → deve mostrar "Content-Encoding: gzip"
```

---

### A7 — Cache headers para assets estáticos

- [x] **P3** Adicionar headers de cache para CSS, JS, imagens em `app.js` (ex: `Cache-Control: max-age=31536000`)
- [x] Garantir que ficheiros com hash no nome têm cache longo; sem hash têm cache curto

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `app.js` (já implementado — CSS/JS: 1 semana, imagens: 30 dias, fontes: 1 ano)
Feito: JÁ EXISTIA — cache headers configurados por tipo de ficheiro no express.static()
Validar: Chrome DevTools → Network → CSS/JS → Response Headers → Cache-Control
```

---

## Fase B — Schema Markup Avançado

> **Doc de referência:** [`09-fase-b-schema-avancado.md`](09-fase-b-schema-avancado.md)
> **Objectivo:** Rich Results no Google para produtos, organização e breadcrumbs

---

### B1 — Schema @graph unificado na homepage

- [x] **P1** Criar bloco JSON-LD com `@graph` contendo: `WebSite`, `Organization`, `OnlineStore` na homepage
- [x] **P1** Incluir `sameAs` com URLs reais das redes sociais (depois do U2 estar feito)
- [x] Adicionar via partial EJS ou directamente em `views/index.ejs`

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `views/layouts/main.ejs`, `views/index.ejs`
Feito: @graph unificado em main.ejs com OnlineStore (#organization), WebSite (#website) com SearchAction, WebPage dinâmico. sameAs Instagram + Facebook. Homepage index.ejs simplificado para CollectionPage referenciando @graph IDs.
Validar: https://search.google.com/test/rich-results → testar https://artnshine.pt
         Deve mostrar: Organization, WebSite sem erros
```

---

### B2 — Schema Product dinâmico nas páginas de produto

- [x] **P1** Adicionar JSON-LD `Product` em `views/catalog/product-detail.ejs`
- [x] **P1** Campos obrigatórios: `name`, `image`, `description`, `sku` (reference), `offers` com `price`, `priceCurrency`, `availability`
- [x] **P1** `availability` deve ser dinâmico: `current_stock > 0 ? 'InStock' : 'OutOfStock'`
- [x] **P1** `price` deve usar `sale_price` (campo já existe na DB)

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `views/partials/schema-product.ejs`, `views/catalog/product-detail.ejs`
Feito: Partial schema-product.ejs com name, sku, brand, image, offers (price, availability dinâmico), material. Incluído no product-detail.ejs.
Validar: https://search.google.com/test/rich-results → testar URL de produto real
         Deve mostrar: Product com preço e disponibilidade sem erros
```

---

### B3 — Schema BreadcrumbList

- [x] **P2** Adicionar JSON-LD `BreadcrumbList` nas páginas de produto e coleção
- [x] Exemplo: Home > Coleção > Produto

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `views/partials/schema-breadcrumb.ejs`, `views/catalog/product-detail.ejs`, `views/collection.ejs`
Feito: Partial schema-breadcrumb.ejs criado. Incluído em product-detail (Início > Catálogo > Produto)
  com slug dinâmico: product.slug || product.id.
  Adicionado também em collection.ejs (Início > Coleções > NomeFamília) com family.slug || family.id.
Validar: Rich Results Test → Breadcrumb deve aparecer sem erros em produto E em página de coleção
```

---

### B4 — Schema LocalBusiness (depois de Fase E)

- [ ] **P2** Após criação do Google Business Profile, adicionar schema `LocalBusiness` / `JewelryStore`
- [ ] Depende de: **E1** (Google Business criado e verificado)

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Google Business ID/URL:
Feito:
```

---

### B5 — Schema AggregateRating (futuro — quando reviews existirem)

- [ ] **P3** Quando sistema de reviews for implementado, adicionar `aggregateRating` ao schema Product
- [ ] Não inventar ratings — só adicionar quando dados reais existirem

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
Nota: só implementar quando existirem reviews reais de clientes
```

---

## Fase C — URLs Semânticas & On-Page

> **Doc de referência:** [`10-fase-c-urls-onpage.md`](10-fase-c-urls-onpage.md)
> **Objectivo:** URLs com keywords, alt text, H1 únicos, meta descriptions únicas

---

### C1 — Coluna `slug` nos produtos

- [x] **P1** Adicionar coluna `slug VARCHAR(255) UNIQUE` à tabela `products`
- [x] **P1** Gerar slugs para todos os produtos existentes (script SQL ou Node.js)
- [x] **P1** Actualizar rota `GET /catalog/product/:id` para aceitar slug (com redirect 301 do ID antigo)

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `sql/add_slug_columns.sql`, `scripts/generate-slugs.js`, `routes/index.js`, `routes/seo.js`
Migration SQL: ALTER TABLE products ADD COLUMN slug VARCHAR(255) UNIQUE
Feito: Rota aceita :idOrSlug (numérico → redirect 301 para slug se existir). Sitemap usa slug quando disponível. Script generate-slugs.js popula slugs existentes. EXECUTAR migração + script em produção antes do deploy.
Validar: https://artnshine.pt/catalog/product/ID → deve redirecionar 301 para /catalog/product/SLUG
         https://artnshine.pt/catalog/product/anel-prata-925-onix-negro → deve abrir produto
```

---

### C2 — Coluna `slug` nas coleções (product_families)

- [x] **P1** Adicionar coluna `slug VARCHAR(255) UNIQUE` à tabela `product_families`
- [x] **P1** Gerar slugs para todas as famílias existentes
- [x] **P1** Actualizar rota `GET /collection/:familyId` → `GET /collection/:slug` com redirect 301

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `sql/add_slug_columns.sql`, `scripts/generate-slugs.js`, `routes/index.js`, `models/ProductFamily.js`
Slugs gerados: via scripts/generate-slugs.js (run after migration)
Feito: ProductFamily.getByIdOrSlug() criado. Rota aceita :familyIdOrSlug (numérico → redirect 301 para slug). Sitemap usa slug. EXECUTAR migração + script em produção.
Validar: https://artnshine.pt/collection/1 → deve redirecionar 301 para /collection/SLUG
```

---

### C3 — Alt text em todas as imagens de produto

- [x] **P2** Garantir que todas as `<img>` de produto têm `alt` descritivo (não vazio, não genérico)
- [x] **P2** Formato: `alt="<%= product.name %> — joia artesanal prata 925"`
- [x] Verificar templates: `catalog/product-detail.ejs`, `catalog/` listagens, `index.ejs`

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `views/partials/_productCard.ejs`, `views/partials/_productCardHomepage.ejs`, `views/public/catalog.ejs`
Feito: Alt text melhorado para "product.name — joia artesanal prata 925" em todos os product cards e catálogo. product-detail.ejs já tinha alt=product.name (aceitável no contexto de detalhe).
Validar: ver source de qualquer página de produto → todas as <img> devem ter alt não vazio
```

---

### C4 — Meta descriptions únicas por produto

- [ ] **P2** Garantir que cada produto tem `description` preenchida na DB
- [x] **P2** Lógica no template: se `product.description` existe → usar os primeiros 155 chars; senão → template genérico com nome + material
- [x] Já existe lógica parcial em `routes/index.js` — verificar e completar

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `routes/index.js`, `scripts/audit-meta-descriptions.js`
N.º produtos sem description na DB: usar scripts/audit-meta-descriptions.js para verificar
Feito: Fallback melhorado — constrói meta description a partir de name + material + family_name quando description vazia. Script de auditoria criado. Preenchimento manual da DB é tarefa de conteúdo.
```

---

### C5 — H1 único e semântico em cada página

- [x] **P3** Auditar todas as views principais — cada página deve ter exactamente 1 `<h1>`
- [x] `<h1>` deve incluir a keyword principal da página
- [x] Homepage: "Joias Artesanais em Prata 925 — Art & Shine" (não apenas o nome da marca)

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `views/index.ejs`
Páginas auditadas: homepage (index.ejs), about.ejs, collections.ejs, collection.ejs, product-detail.ejs — todas com h1
Feito: Homepage h1 adicionado com classe visually-hidden ("Joias Artesanais em Prata 925 — Gonzaga's Art & Shine"); restantes já tinham h1 correcto
```

---

### C6 — Sitemap actualizado com novos slugs

- [x] **P2** Após C1 e C2, actualizar `routes/seo.js` para usar URLs com slugs em vez de IDs numéricos
- [ ] Regenerar e submeter novo sitemap no Search Console

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `routes/seo.js`
Feito: Sitemap já usa product.slug e family.slug quando disponíveis (implementado no Sprint 3). Re-submissão no Search Console pendente após deploy.
Validar: https://artnshine.pt/sitemap.xml → URLs devem ter slugs, não IDs
         Search Console → Sitemaps → Submeter de novo
```

---

## SEO Técnico Avançado

> **Doc de referência:** [`14-seo-tecnico-avancado.md`](14-seo-tecnico-avancado.md)

---

### T1 — noindex /search filtrado *(ver também U1)*

> _(Migrado para Urgente U1 — marcar aqui após U1 concluído)_

- [x] Concluído via U1

```
📝 LOG DO AGENTE
Data: 23/02/2026
Remete para: U1
```

---

### T2 — Schema Offer com sale_price e current_stock dinâmicos

- [x] **P1** Schema `Offer` na página de produto deve usar `<%= product.sale_price %>` para price
- [x] **P1** Campo `availability` deve ser dinâmico baseado em `current_stock > 0`
- [x] Depende de: **B2** (schema Product criado)

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `views/partials/schema-product.ejs`
Feito: JÁ IMPLEMENTADO via schema-product.ejs — usa product.sale_price para price e current_stock > 0 para availability
Validar: produto com stock → availability InStock
         produto sem stock → availability OutOfStock (testar manualmente ou com produto de teste)
```

---

### T3 — Política de produtos sem stock

- [x] **P2** Decidir e implementar política: manter indexado com OutOfStock + mensagem "Avisar quando disponível"
- [x] Adicionar link/botão para peças semelhantes da mesma família quando produto esgotado
- [x] NÃO fazer 404 nem noindex em joias únicas

```
📝 LOG DO AGENTE
Data: 23/02/2026
Decisão tomada: Peças esgotadas mantêm-se indexadas (joias únicas). Badge "Esgotado" + botão "Avisar quando disponível" via WhatsApp + secção "Peças semelhantes" com até 4 produtos da mesma família.
Ficheiros: views/catalog/product-detail.ejs, routes/index.js
Feito: Badge out-of-stock, botão notify WhatsApp com mensagem template, grid de peças relacionadas (mesmo family_id), ordenadas por stock DESC + updated_at DESC.
```

---

### T4 — Preconnect para recursos externos *(ver também A1)*

> _(Migrado para Fase A — A1 — marcar aqui após A1 concluído)_

- [x] Concluído via A1

```
📝 LOG DO AGENTE
Data: 23/02/2026
Remete para: A1
```

---

### T5 — Schema PriceSpecification para promoções

- [ ] **P3** Se produto tiver preço promocional distinto do normal, adicionar `PriceSpecification`
- [ ] Só relevante quando sistema de promoções/descontos for implementado

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
Nota: dependente de feature de promoções no admin
```

---

### T6 — Headers de segurança e CSP

- [x] **P3** Verificar se CSP (Content-Security-Policy) não bloqueia GA4, schema inline ou outros scripts SEO
- [x] Ver `04-ga4-tracking.md` para configuração CSP compatível com GA4

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `app.js`
Feito: CSP tem googletagmanager.com em scriptSrc/scriptSrcElem, google-analytics.com e analytics.google.com em connectSrc.
  Segurança melhorada (Sprint 8): IPs de desenvolvimento (localhost:3000, 127.0.0.1:3000, 172.x)
  removidos de produção via const isDev + devSources condicional.
  Em produção as diretivas imgSrc, mediaSrc, formAction e connectSrc ficam sem IPs locais.
Validar: Chrome DevTools → Console → sem erros de CSP bloqueado
```

---

## Fase D — Google Merchant Center

> **Doc de referência:** [`11-fase-d-merchant-center.md`](11-fase-d-merchant-center.md)
> **Pré-requisito:** Fase A, B2 e C1 concluídos

---

### D1 — Criar conta Google Merchant Center

- [ ] **P2** Criar conta em https://merchants.google.com com o email do negócio
- [ ] Verificar domínio `artnshine.pt` no Merchant Center

```
📝 LOG DO AGENTE
Data:
Conta criada: Sim / Não
Email conta:
Domínio verificado: Sim / Não
```

---

### D2 — Rota de feed XML de produtos

- [x] **P2** Criar endpoint `GET /feed/products.xml` em `routes/seo.js`
- [x] Feed deve incluir: `id`, `title`, `description`, `link`, `image_link`, `price`, `availability`, `brand`, `gtin`/`mpn`

```
📝 LOG DO AGENTE
Data: 23/02/2026
Ficheiros: `routes/seo.js`
Feito: Rota GET /feed/products.xml criada com todos os campos obrigatórios do Merchant Center (g:id, title, description, link, g:image_link, g:price, g:availability, g:condition, g:brand, g:mpn, g:product_type, g:google_product_category=188 Jewelry, g:shipping PT gratuito). Usa slugs para URLs quando disponíveis.
Validar: https://artnshine.pt/feed/products.xml → deve retornar XML válido com produtos
```

---

### D3 — Submeter feed no Merchant Center

- [ ] **P2** Após D2, submeter URL do feed no Merchant Center
- [ ] Verificar que todos os produtos passam validação (sem erros críticos)

```
📝 LOG DO AGENTE
Data:
Erros encontrados:
Resolvidos:
```

---

### D4 — Activar Google Shopping gratuito (Surfaces across Google)

- [ ] **P3** No Merchant Center → Growth → Manage programs → activar "Free listings"

```
📝 LOG DO AGENTE
Data:
Estado:
```

---

## Fase E — SEO Local

> **Doc de referência:** [`12-fase-e-seo-local.md`](12-fase-e-seo-local.md)

---

### E1 — Criar / Reclamar Google Business Profile

- [ ] **P2** Verificar se já existe perfil para "Art & Shine" em https://business.google.com
- [ ] Criar ou reclamar o perfil, verificar com código postal/telefone
- [ ] Categoria: **Joalharia** / Jeweler

```
📝 LOG DO AGENTE
Data:
Perfil URL:
Verificado: Sim / Não
Método verificação:
```

---

### E2 — Preencher GBP completamente

- [ ] **P2** Nome, morada, telefone, website, horário, categoria, descrição, fotos
- [ ] NAP (Name, Address, Phone) deve ser idêntico ao que está no site e no schema LocalBusiness

```
📝 LOG DO AGENTE
Data:
NAP definido:
  Nome:
  Morada:
  Telefone:
  Website: https://artnshine.pt
Fotos adicionadas: Sim / Não (quantas)
```

---

### E3 — Schema LocalBusiness no site

- [ ] **P2** Após E1 e E2, adicionar schema `LocalBusiness` / `JewelryStore` ao site
- [ ] Depende de: **B4**

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
```

---

### E4 — Pedir primeiras reviews ao Google

- [ ] **P3** Após primeiras vendas/contactos, enviar link de review Google pelo WhatsApp
- [ ] Ver template em `15-seo-off-page.md` → Task OF5

```
📝 LOG DO AGENTE
Data:
Reviews obtidas:
```

---

## Fase F — Conteúdo & Blog

> **Doc de referência:** [`13-fase-f-conteudo-blog.md`](13-fase-f-conteudo-blog.md)
> **Prioridade:** Baixa — só depois das fases anteriores estarem sólidas

---

### F1 — Estrutura técnica do blog

- [ ] **P3** Criar rota `GET /blog` e `GET /blog/:slug` em `routes/index.js`
- [ ] Criar tabela `blog_posts` na DB (slug, title, content, meta_description, published_at)
- [ ] Template EJS para listagem e artigo individual

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
```

---

### F2 — Primeiro artigo SEO

- [ ] **P3** Escrever e publicar primeiro artigo com keyword de cauda longa
- [ ] Sugestão: "Como identificar prata 925 genuína — guia completo"
- [ ] Mínimo 800 palavras, com H2/H3, imagens com alt text, link interno para produtos

```
📝 LOG DO AGENTE
Data:
Título do artigo:
URL:
Palavras:
```

---

### F3 — Plano editorial 3 meses

- [ ] **P3** Definir calendário de 12 artigos para os próximos 3 meses
- [ ] Ver sugestões em `13-fase-f-conteudo-blog.md`

```
📝 LOG DO AGENTE
Data:
Ficheiro com plano editorial:
```

---

## SEO Off-Page

> **Doc de referência:** [`15-seo-off-page.md`](15-seo-off-page.md)

---

### OP1 — Pinterest Business + Rich Pins

- [ ] **P1** Criar conta Pinterest Business e verificar artnshine.pt
- [ ] Activar Rich Pins para produtos (valida com schema Product já existente)
- [ ] Criar 3 boards iniciais com 10+ pins

```
📝 LOG DO AGENTE
Data:
Conta Pinterest:
Rich Pins activos: Sim / Não
Boards criados:
```

---

### OP2 — Optimização perfil Instagram

- [ ] **P2** Actualizar nome do perfil com keywords: "Art & Shine | Joias Prata 925 Portugal"
- [ ] Bio com keywords naturais
- [ ] Link na bio apontado para `https://artnshine.pt`

```
📝 LOG DO AGENTE
Data:
URL Instagram:
Bio actualizada: Sim / Não
```

---

### OP3 — Submissão em directórios PT

- [ ] **P2** Submeter em artesanatoportugal.com.pt
- [ ] **P2** Submeter em compras.pt
- [ ] **P3** Criar loja Etsy com link para artnshine.pt

```
📝 LOG DO AGENTE
Data:
Directórios submetidos:
Links obtidos:
```

---

### OP4 — Etsy com link para o site

- [ ] **P3** Criar loja Etsy Portugal
- [ ] Bio da loja com link para `https://artnshine.pt`
- [ ] Produtos com link "ver mais em artnshine.pt"

```
📝 LOG DO AGENTE
Data:
URL Etsy:
Link para site: Sim / Não
```

---

### OP5 — 1ª menção em blog/site PT

- [ ] **P3** Identificar 3 bloggers/sites de lifestyle/artesanato PT para contactar
- [ ] Enviar press release (template em `15-seo-off-page.md`)
- [ ] Registar resultado

```
📝 LOG DO AGENTE
Data:
Contactos enviados:
Respostas:
Links obtidos:
```

---

## Monitorização

> **Doc de referência:** [`16-seo-monitorizacao.md`](16-seo-monitorizacao.md)

---

### M1 — Configurar alertas GA4

- [ ] **P2** Configurar alerta de queda de tráfego orgânico >30% em 7 dias no GA4
- [ ] Activar notificações por email no Search Console

```
📝 LOG DO AGENTE
Data:
Alertas configurados: Sim / Não
Email para alertas:
```

---

### M2 — Primeira leitura de KPIs (baseline)

- [ ] **P1** Preencher a linha de baseline na tabela de KPIs de `16-seo-monitorizacao.md`
- [ ] Registar: páginas indexadas, LCP homepage, LCP produto, sessões orgânicas

```
📝 LOG DO AGENTE
Data:
Baseline registada:
  Páginas indexadas:
  LCP homepage:
  LCP produto:
  Sessões orgânicas (últimos 30 dias):
  Posição média:
  CTR médio:
```

---

### M3 — Processo semanal iniciado

- [ ] **P2** Definir dia fixo para rotina semanal (sugestão: Segundas de manhã, 15 min)
- [ ] Criar evento recorrente no calendário

```
📝 LOG DO AGENTE
Data:
Dia/hora definido:
Primeiro check feito: Sim / Não
```

---

## 📊 Progresso Global

> Atualizar manualmente após cada sprint

```
Última actualização: 23/02/2026

🚨 Urgente:     [3] / 3   (U1✅ U2✅ U3✅app-level; HTTP→HTTPS⏳servidor)
Fase A:         [7] / 7   (A1✅ A2✅partial A3✅ A4✅ A5✅ A6✅ A7✅)
Fase B:         [3] / 5   (B1✅ B2✅ B3✅ B4⏳ B5⏳)
Fase C:         [5] / 6   (C1✅ C2✅ C3✅ C4✅partial C5✅ C6✅partial)
Técnico:        [5] / 6   (T1✅ T2✅ T3✅ T4✅ T5⏳ T6✅+security)
Fase D:         [1] / 4   (D2✅)
Fase E:         [0] / 4
Fase F:         [0] / 3
Off-Page:       [0] / 5
Monitorização:  [0] / 3
─────────────────────────
TOTAL:          [24] / 46
```

---

## 📅 Registo de Sprints

> Usar esta secção para registar o que foi feito em cada sessão de trabalho com o agente

### Sprint 1 — 23/02/2026 (Urgente)
```
Data: 23/02/2026
Tarefas concluídas:
  - U1: noindex /search filtrado + Disallow /search?* no robots.txt
  - U2: sameAs Instagram + Facebook em index.ejs e main.ejs
  - A1: preconnect googletagmanager.com + dns-prefetch google-analytics.com
  - C5: Homepage h1 visually-hidden com keywords
Ficheiros modificados:
  - routes/index.js, routes/seo.js, views/index.ejs, views/layouts/main.ejs, views/catalog/search-results.ejs
Notas: U3 (WWW redirect) pendente — requer config servidor
```

### Sprint 2 — 23/02/2026 (Performance)
```
Data: 23/02/2026
Tarefas concluídas:
  - A2: WebP conversion no Media.processImage()
  - A3: Lazy loading verificado (já implementado)
  - A4: OG image branded 1200x630 gerada via script
  - A5: Favicon set completo (16,32,180,192,512) + site.webmanifest
Ficheiros modificados:
  - models/Media.js, scripts/generate-og-image.js, scripts/generate-favicons.js
  - public/images/og-artnshine.jpg, public/favicon-*.png, public/site.webmanifest
  - views/layouts/main.ejs
Notas: A6+A7 já existiam (compression + cache headers)
```

### Sprint 3 — 23/02/2026 (URLs Semânticas)
```
Data: 23/02/2026
Tarefas concluídas:
  - C1: slug column products + route /catalog/product/:idOrSlug + 301 redirect
  - C2: slug column product_families + route /collection/:familyIdOrSlug + 301 redirect
  - C4: Meta descriptions melhoradas (fallback name+material+family)
  - C6: Sitemap usa slugs quando disponíveis
Ficheiros modificados:
  - sql/add_slug_columns.sql, scripts/generate-slugs.js, scripts/audit-meta-descriptions.js
  - routes/index.js, routes/seo.js, models/ProductFamily.js
Notas: DEPLOY REQUER: sql/add_slug_columns.sql + scripts/generate-slugs.js
```

### Sprint 4 — 23/02/2026 (Schema @graph)
```
Data: 23/02/2026
Tarefas concluídas:
  - B1: @graph unificado (OnlineStore + WebSite + WebPage) em main.ejs
  - B1: SearchAction para sitelinks search box
  - Homepage schema simplificado para CollectionPage
Ficheiros modificados:
  - views/layouts/main.ejs, views/index.ejs
Notas: Schema Product (B2) e Breadcrumb (B3) já implementados em fases anteriores
```

### Sprint 5 — 23/02/2026 (Polish Técnico)
```
Data: 23/02/2026
Tarefas concluídas:
  - Fix lang="pt-BR" → lang="pt-PT"
  - Fix Date.now() cache busting → app.version estável
  - C3: Alt text enriquecido em product cards ("name — joia artesanal prata 925")
  - C6: Marcado como concluído (já codificado no Sprint 3)
Ficheiros modificados:
  - views/layouts/main.ejs, views/partials/_productCard.ejs
  - views/partials/_productCardHomepage.ejs, views/public/catalog.ejs
Notas:
```

### Sprint 6 — 23/02/2026 (Google Merchant Center Feed)
```
Data: 23/02/2026
Tarefas concluídas:
  - D2: GET /feed/products.xml — Google Merchant Center product feed
Ficheiros modificados:
  - routes/seo.js
Notas: Feed inclui g:id, title, description, link, g:image_link, g:price EUR,
       g:availability (in_stock/out_of_stock), g:condition, g:brand, g:mpn,
       g:product_type, g:google_product_category=188, g:shipping PT gratuito.
       Usa slugs quando disponíveis.
```

### Sprint 7 — 23/02/2026 (Out-of-Stock Policy)
```
Data: 23/02/2026
Tarefas concluídas:
  - T3: Política de produtos esgotados implementada
    - Badge "Esgotado" (vermelho) substitui "Por Encomenda"
    - Botão "Avisar quando disponível" via WhatsApp (mensagem template dedicada)
    - Secção "Peças semelhantes" com até 4 produtos da mesma família
    - Produtos esgotados mantêm-se indexados (joias únicas — sem noindex)
Ficheiros modificados:
  - views/catalog/product-detail.ejs, routes/index.js
Notas: Schema Product já trata availability via schema-product.ejs (OutOfStock).
       Peças relacionadas ordenadas por stock DESC → updated_at DESC.
```

### Sprint 8 — 23/02/2026 (Segurança, WWW Redirect, Schema Collection)
```
Data: 23/02/2026
Tarefas concluídas:
  - U3 (app-level): Middleware WWW→non-WWW adicionado ao app.js (antes de todo o middleware).
    Em produção: req.hostname === 'www.artnshine.pt' → 301 para artnshine.pt.
  - T6 (security): IPs de desenvolvimento removidos do CSP em produção.
    isDev/devSources condicional: localhost:3000 e 127.0.0.1:3000 só em development.
    Directivas afectadas: imgSrc, mediaSrc, formAction, connectSrc.
  - B3 (completion): Breadcrumb schema adicionado a collection.ejs
    (Início > Coleções > NomeFamília com slug dinâmico).
    Breadcrumb em product-detail actualizado para usar product.slug || product.id.
  - A6, A7, B2, T2: Confirmados já implementados — nenhuma alteração necessária.
Ficheiros modificados:
  - app.js, views/collection.ejs, views/catalog/product-detail.ejs
Notas: HTTP→HTTPS redirect (artnshine.pt) ainda requer config no servidor dominios.pt.
```

---

*Checklist gerada automaticamente — artnshine.pt SEO Master Plan — Fev 2026*
