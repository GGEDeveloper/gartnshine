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

- [ ] **P1** Adicionar lógica `shouldNoIndex` na rota `GET /search` em `routes/index.js`
- [ ] **P1** Passar `robotsMeta` e `canonicalUrl` para a view `catalog/search-results.ejs`
- [ ] **P1** Adicionar `<meta name="robots">` e `<link rel="canonical">` no template de resultados
- [ ] **P1** Adicionar `Disallow` dos parâmetros dinâmicos em `public/robots.txt`

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
Validar: abrir /search?q=anel&sort=price_asc → ver source → robots deve ser "noindex, follow"
         abrir /search?q=anel → robots deve ser "index, follow"
         verificar robots.txt em https://artnshine.pt/robots.txt
```

---

### U2 — Confirmar URLs reais das redes sociais (sameAs)

- [ ] **P1** Substituir todos os `CONFIRMAR_USERNAME` nos docs e no código com os URLs reais
- [ ] **P1** Verificar em: `09-fase-b-schema-avancado.md`, `12-fase-e-seo-local.md`, e qualquer JSON-LD já implementado

```
📝 LOG DO AGENTE
Data:
Ficheiros:
URLs confirmados:
  Instagram: https://www.instagram.com/___________/
  Facebook:  https://www.facebook.com/___________/
  Pinterest: https://www.pinterest.com/___________/   (se existir)
  TikTok:    https://www.tiktok.com/@___________/    (se existir)
Feito:
```

---

### U3 — Verificar redirect WWW → non-WWW em dominios.pt

- [ ] **P1** Testar `http://www.artnshine.pt` → deve dar 301 para `https://artnshine.pt`
- [ ] **P1** Testar `http://artnshine.pt` → deve dar 301 para `https://artnshine.pt`
- [ ] Se não existir redirect, configurar no painel dominios.pt ou via `.htaccess`

```
📝 LOG DO AGENTE
Data:
Estado actual:
  http://www.artnshine.pt →
  http://artnshine.pt →
Acção tomada:
Ficheiros:
```

---

## Fase A — Performance & Core Web Vitals

> **Doc de referência:** [`08-fase-a-performance.md`](08-fase-a-performance.md)
> **Objectivo:** LCP < 2.5s, CLS < 0.1, INP < 200ms

---

### A1 — Preconnect para recursos externos

- [ ] **P1** Adicionar `<link rel="preconnect">` para GA4, Google Tag Manager, Google Fonts em `views/layouts/main.ejs`
- [ ] Colocar antes de qualquer `<link rel="stylesheet">` e antes do script GA4

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
Validar: PageSpeed Insights → oportunidades → "Preconnect to required origins" deve desaparecer
```

---

### A2 — Conversão de imagens para WebP

- [ ] **P2** Instalar dependência `sharp` no projeto Node.js
- [ ] **P2** Criar script ou middleware que converte imagens de upload para WebP automaticamente
- [ ] **P2** Actualizar queries que servem imagens de produto para preferir `.webp` se existir
- [ ] Testar com 3 produtos diferentes

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Dependências adicionadas:
Feito:
Validar: ver source de página de produto → imagens devem ter extensão .webp
         Chrome DevTools → Network → filtrar por imagens → verificar tipo MIME "image/webp"
```

---

### A3 — Lazy loading nas imagens do catálogo

- [ ] **P2** Adicionar `loading="lazy"` em todas as imagens de produto nas views do catálogo
- [ ] **P2** Garantir que a primeira imagem visível (hero / produto destaque) tem `loading="eager"` (não lazy)
- [ ] Verificar templates: `views/catalog/`, `views/index.ejs`

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
Validar: Chrome DevTools → Network → scroll pela página → imagens devem carregar conforme aparecem no viewport
```

---

### A4 — OG Image estática de fallback

- [ ] **P2** Criar imagem `public/images/og-artnshine.jpg` (1200×630px) com logo + tagline
- [ ] **P2** Definir como fallback em `main.ejs` quando `ogImage` não está definido

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Dimensões da imagem criada:
Feito:
Validar: Facebook Sharing Debugger → https://developers.facebook.com/tools/debug/
         Testar URL: https://artnshine.pt
```

---

### A5 — Favicons completos

- [ ] **P3** Gerar set completo de favicons (ICO, PNG 16/32/192/512, Apple Touch Icon, manifest.json)
- [ ] **P3** Adicionar tags ao `<head>` do layout principal
- [ ] Usar ferramenta: https://realfavicongenerator.net

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
Validar: abrir artnshine.pt → tab do browser deve mostrar favicon correcto
         mobile Chrome → adicionar ao ecrã → ícone deve aparecer
```

---

### A6 — Compressão gzip/brotli no servidor

- [ ] **P2** Verificar se `compression` middleware está activo em `app.js`/`server.js`
- [ ] Se não, instalar `npm install compression` e adicionar `app.use(compression())`

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
Validar: curl -H "Accept-Encoding: gzip" -I https://artnshine.pt → deve mostrar "Content-Encoding: gzip"
```

---

### A7 — Cache headers para assets estáticos

- [ ] **P3** Adicionar headers de cache para CSS, JS, imagens em `app.js` (ex: `Cache-Control: max-age=31536000`)
- [ ] Garantir que ficheiros com hash no nome têm cache longo; sem hash têm cache curto

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
Validar: Chrome DevTools → Network → CSS/JS → Response Headers → Cache-Control
```

---

## Fase B — Schema Markup Avançado

> **Doc de referência:** [`09-fase-b-schema-avancado.md`](09-fase-b-schema-avancado.md)
> **Objectivo:** Rich Results no Google para produtos, organização e breadcrumbs

---

### B1 — Schema @graph unificado na homepage

- [ ] **P1** Criar bloco JSON-LD com `@graph` contendo: `WebSite`, `Organization`, `OnlineStore` na homepage
- [ ] **P1** Incluir `sameAs` com URLs reais das redes sociais (depois do U2 estar feito)
- [ ] Adicionar via partial EJS ou directamente em `views/index.ejs`

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
Validar: https://search.google.com/test/rich-results → testar https://artnshine.pt
         Deve mostrar: Organization, WebSite sem erros
```

---

### B2 — Schema Product dinâmico nas páginas de produto

- [ ] **P1** Adicionar JSON-LD `Product` em `views/catalog/product-detail.ejs`
- [ ] **P1** Campos obrigatórios: `name`, `image`, `description`, `sku` (reference), `offers` com `price`, `priceCurrency`, `availability`
- [ ] **P1** `availability` deve ser dinâmico: `current_stock > 0 ? 'InStock' : 'OutOfStock'`
- [ ] **P1** `price` deve usar `sale_price` (campo já existe na DB)

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
Validar: https://search.google.com/test/rich-results → testar URL de produto real
         Deve mostrar: Product com preço e disponibilidade sem erros
```

---

### B3 — Schema BreadcrumbList

- [ ] **P2** Adicionar JSON-LD `BreadcrumbList` nas páginas de produto e coleção
- [ ] Exemplo: Home > Coleção > Produto

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
Validar: Rich Results Test → Breadcrumb deve aparecer sem erros
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

- [ ] **P1** Adicionar coluna `slug VARCHAR(255) UNIQUE` à tabela `products`
- [ ] **P1** Gerar slugs para todos os produtos existentes (script SQL ou Node.js)
- [ ] **P1** Actualizar rota `GET /catalog/product/:id` para aceitar slug (com redirect 301 do ID antigo)

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Migration SQL:
Feito:
Validar: https://artnshine.pt/catalog/product/ID → deve redirecionar 301 para /catalog/product/SLUG
         https://artnshine.pt/catalog/product/anel-prata-925-onix-negro → deve abrir produto
```

---

### C2 — Coluna `slug` nas coleções (product_families)

- [ ] **P1** Adicionar coluna `slug VARCHAR(255) UNIQUE` à tabela `product_families`
- [ ] **P1** Gerar slugs para todas as famílias existentes
- [ ] **P1** Actualizar rota `GET /collection/:familyId` → `GET /collection/:slug` com redirect 301

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Slugs gerados:
Feito:
Validar: https://artnshine.pt/collection/1 → deve redirecionar 301 para /collection/SLUG
```

---

### C3 — Alt text em todas as imagens de produto

- [ ] **P2** Garantir que todas as `<img>` de produto têm `alt` descritivo (não vazio, não genérico)
- [ ] **P2** Formato: `alt="<%= product.name %> — joia artesanal prata 925"`
- [ ] Verificar templates: `catalog/product-detail.ejs`, `catalog/` listagens, `index.ejs`

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
Validar: ver source de qualquer página de produto → todas as <img> devem ter alt não vazio
```

---

### C4 — Meta descriptions únicas por produto

- [ ] **P2** Garantir que cada produto tem `description` preenchida na DB
- [ ] **P2** Lógica no template: se `product.description` existe → usar os primeiros 155 chars; senão → template genérico com nome + material
- [ ] Já existe lógica parcial em `routes/index.js` — verificar e completar

```
📝 LOG DO AGENTE
Data:
Ficheiros:
N.º produtos sem description na DB:
Feito:
```

---

### C5 — H1 único e semântico em cada página

- [ ] **P3** Auditar todas as views principais — cada página deve ter exactamente 1 `<h1>`
- [ ] `<h1>` deve incluir a keyword principal da página
- [ ] Homepage: "Joias Artesanais em Prata 925 — Art & Shine" (não apenas o nome da marca)

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Páginas auditadas:
Feito:
```

---

### C6 — Sitemap actualizado com novos slugs

- [ ] **P2** Após C1 e C2, actualizar `routes/seo.js` para usar URLs com slugs em vez de IDs numéricos
- [ ] Regenerar e submeter novo sitemap no Search Console

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
Validar: https://artnshine.pt/sitemap.xml → URLs devem ter slugs, não IDs
         Search Console → Sitemaps → Submeter de novo
```

---

## SEO Técnico Avançado

> **Doc de referência:** [`14-seo-tecnico-avancado.md`](14-seo-tecnico-avancado.md)

---

### T1 — noindex /search filtrado *(ver também U1)*

> _(Migrado para Urgente U1 — marcar aqui após U1 concluído)_

- [ ] Concluído via U1

```
📝 LOG DO AGENTE
Data:
Remete para: U1
```

---

### T2 — Schema Offer com sale_price e current_stock dinâmicos

- [ ] **P1** Schema `Offer` na página de produto deve usar `<%= product.sale_price %>` para price
- [ ] **P1** Campo `availability` deve ser dinâmico baseado em `current_stock > 0`
- [ ] Depende de: **B2** (schema Product criado)

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
Validar: produto com stock → availability InStock
         produto sem stock → availability OutOfStock (testar manualmente ou com produto de teste)
```

---

### T3 — Política de produtos sem stock

- [ ] **P2** Decidir e implementar política: manter indexado com OutOfStock + mensagem "Avisar quando disponível"
- [ ] Adicionar link/botão para peças semelhantes da mesma família quando produto esgotado
- [ ] NÃO fazer 404 nem noindex em joias únicas

```
📝 LOG DO AGENTE
Data:
Decisão tomada:
Ficheiros:
Feito:
```

---

### T4 — Preconnect para recursos externos *(ver também A1)*

> _(Migrado para Fase A — A1 — marcar aqui após A1 concluído)_

- [ ] Concluído via A1

```
📝 LOG DO AGENTE
Data:
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

- [ ] **P3** Verificar se CSP (Content-Security-Policy) não bloqueia GA4, schema inline ou outros scripts SEO
- [ ] Ver `04-ga4-tracking.md` para configuração CSP compatível com GA4

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
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

- [ ] **P2** Criar endpoint `GET /feed/products.xml` em `routes/seo.js`
- [ ] Feed deve incluir: `id`, `title`, `description`, `link`, `image_link`, `price`, `availability`, `brand`, `gtin`/`mpn`

```
📝 LOG DO AGENTE
Data:
Ficheiros:
Feito:
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
Última actualização: ___________

🚨 Urgente:     [_] / 3
Fase A:         [_] / 7
Fase B:         [_] / 5
Fase C:         [_] / 6
Técnico:        [_] / 6
Fase D:         [_] / 4
Fase E:         [_] / 4
Fase F:         [_] / 3
Off-Page:       [_] / 5
Monitorização:  [_] / 3
─────────────────────────
TOTAL:          [_] / 46
```

---

## 📅 Registo de Sprints

> Usar esta secção para registar o que foi feito em cada sessão de trabalho com o agente

### Sprint 1 — Fev 2026
```
Data: 23/02/2026
Tarefas concluídas:
  -
  -
Ficheiros modificados:
  -
Notas:
```

### Sprint 2
```
Data:
Tarefas concluídas:
  -
  -
Ficheiros modificados:
  -
Notas:
```

### Sprint 3
```
Data:
Tarefas concluídas:
  -
Ficheiros modificados:
  -
Notas:
```

### Sprint 4
```
Data:
Tarefas concluídas:
  -
Ficheiros modificados:
  -
Notas:
```

### Sprint 5
```
Data:
Tarefas concluídas:
  -
Ficheiros modificados:
  -
Notas:
```

---

*Checklist gerada automaticamente — artnshine.pt SEO Master Plan — Fev 2026*
