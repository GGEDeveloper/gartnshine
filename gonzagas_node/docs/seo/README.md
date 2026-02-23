# Documentação SEO — Gonzaga's Art & Shine

> **Branch de trabalho:** `dev/seo-robots-sitemap`  
> **Domínio:** `artnshine.pt`  
> **Última atualização:** Fevereiro 2026

---

## Objetivo

Estabelecer e evoluir uma infraestrutura SEO de topo para `artnshine.pt`, posicionando a marca como referência em **"joias artesanais prata 925 portugal"** no Google.

---

## Estado Global

| Fase | Nome | Estado | Doc |
|------|------|--------|-----|
| **Fundação 1** | Robots.txt & BASE_URL | ✅ Concluído | `01-robots-sitemap.md` |
| **Fundação 2** | Meta Tags Dinâmicas | ✅ Concluído | `02-meta-tags.md` |
| **Fundação 3** | Schema Markup Básico | ✅ Concluído | `03-schema-markup.md` |
| **Fundação 4** | GA4 & Cookie Consent | ✅ Concluído | `04-ga4-tracking.md` |
| **Fundação 5** | Sitemap Inteligente | ✅ Concluído (299 URLs) | `05-sitemap-avancado.md` |
| **Fundação 6** | Checklist Deploy | ✅ Concluído | `06-checklist-deploy.md` |
| **Roadmap** | Visão geral Fases A→F | 📋 Plano | `07-seo-roadmap-avancado.md` |
| **Fase A** | Performance & Core Web Vitals | 🔴 A implementar | `08-fase-a-performance.md` |
| **Fase B** | Schema Markup @graph | 🔴 A implementar | `09-fase-b-schema-avancado.md` |
| **Fase C** | URLs Semânticas & On-Page | 🔴 A implementar | `10-fase-c-urls-onpage.md` |
| **Fase D** | Google Merchant Center | 🟡 A planear | `11-fase-d-merchant-center.md` |
| **Fase E** | SEO Local | 🟡 A planear | `12-fase-e-seo-local.md` |
| **Fase F** | Conteúdo & Blog | 🟢 Futura | `13-fase-f-conteudo-blog.md` |
| **Técnico+** | Problemas silenciosos activos | 🔴 **URGENTE** | `14-seo-tecnico-avancado.md` |
| **Off-Page** | Pinterest, backlinks, redes | 🟡 A planear | `15-seo-off-page.md` |
| **Monitorização** | Rotinas semanais/mensais | 📋 Processo | `16-seo-monitorizacao.md` |

---

## ⚠️ Prioridade Imediata

**`14-seo-tecnico-avancado.md` tem 2 problemas activos em produção:**

1. **Páginas `/search` com filtros são indexáveis** — já existem combinações infinitas de URLs que o Google pode estar a rastrear. Adicionar `noindex` e bloquear no `robots.txt`.

2. **URLs de coleções são numéricas** (`/collection/1`) — zero valor SEO. Implementar slugs em conjunto com a Fase C.

---

## Índice Completo

### 📦 Fundação SEO (Implementada)

1. [`01-robots-sitemap.md`](01-robots-sitemap.md) — Robots.txt, BASE_URL, desbloqueio de sitemap
2. [`02-meta-tags.md`](02-meta-tags.md) — Title, Description, Canonical, Open Graph, Twitter Cards
3. [`03-schema-markup.md`](03-schema-markup.md) — Schema Product, BreadcrumbList, OnlineStore
4. [`04-ga4-tracking.md`](04-ga4-tracking.md) — GA4, Cookie Consent RGPD, eventos e-commerce, CSP
5. [`05-sitemap-avancado.md`](05-sitemap-avancado.md) — Sitemap dinâmico com imagens, slugs limpos
6. [`06-checklist-deploy.md`](06-checklist-deploy.md) — Checklist de deploy e validação

### 🚀 Roadmap SEO Avançado

7. [`07-seo-roadmap-avancado.md`](07-seo-roadmap-avancado.md) — Visão geral, prioridades, KPIs, todas as fases

### 🔴 Fase A — Performance & Core Web Vitals
8. [`08-fase-a-performance.md`](08-fase-a-performance.md) — WebP, lazy load, OG image, favicons, CWV

### 🔴 Fase B — Schema Markup Avançado
9. [`09-fase-b-schema-avancado.md`](09-fase-b-schema-avancado.md) — @graph unificado, rich results, sameAs

### 🟡 Fase C — URLs Semânticas & On-Page SEO
10. [`10-fase-c-urls-onpage.md`](10-fase-c-urls-onpage.md) — Slugs semânticos, alt text, descriptions, H1

### 🟡 Fase D — Google Merchant Center
11. [`11-fase-d-merchant-center.md`](11-fase-d-merchant-center.md) — Feed XML, Google Shopping gratuito

### 🟢 Fase E — SEO Local
12. [`12-fase-e-seo-local.md`](12-fase-e-seo-local.md) — Google Business Profile, LocalBusiness schema, NAP

### 🟢 Fase F — Conteúdo & Blog
13. [`13-fase-f-conteudo-blog.md`](13-fase-f-conteudo-blog.md) — Blog, plano editorial, long-tail keywords

### 🔴 SEO Técnico Avançado (Problemas Activos)
14. [`14-seo-tecnico-avancado.md`](14-seo-tecnico-avancado.md) — noindex search, slugs coleções, preconnect, stock, WWW

### 🟡 SEO Off-Page
15. [`15-seo-off-page.md`](15-seo-off-page.md) — Pinterest, backlinks PT, sameAs, Instagram, reviews

### 📋 Monitorização Contínua
16. [`16-seo-monitorizacao.md`](16-seo-monitorizacao.md) — Rotinas 15min/semana, 1h/mês, KPI tracking

---

## Manutenção Contínua

### Ao criar uma nova view EJS
1. Incluir o partial `seo-head-standalone.ejs` ou usar `main.ejs`
2. Adicionar a rota em `routes/seo.js` para entrar no `sitemap.xml`
3. Definir `title`, `metaDescription`, `canonicalUrl` e `ogImage` na rota

### Ao criar um novo produto
1. Preencher o campo `description` na DB (gera meta description única)
2. Usar nome descritivo com keywords: material + pedra + tipo
3. Imagem de qualidade (será convertida para WebP automaticamente após Fase A)

### Monitorização — ver `16-seo-monitorizacao.md`
- **Semanal (15 min):** Search Console + GA4 — todos os Lunés
- **Mensal (1h):** Análise keywords, PageSpeed, KPI tracking
- **Trimestral (2h):** Auditoria completa

---

## Links Úteis

| Ferramenta | URL |
|-----------|-----|
| Google Search Console | https://search.google.com/search-console |
| Google Analytics 4 | https://analytics.google.com |
| PageSpeed Insights | https://pagespeed.web.dev/ |
| Rich Results Test | https://search.google.com/test/rich-results |
| Schema Validator | https://validator.schema.org/ |
| Facebook Sharing Debugger | https://developers.facebook.com/tools/debug/ |
| LinkedIn Post Inspector | https://www.linkedin.com/post-inspector/ |
| Google Merchant Center | https://merchants.google.com |
| Google Business Profile | https://business.google.com |
| Pinterest Business | https://business.pinterest.com |
| Screaming Frog (auditoria) | https://www.screamingfrog.co.uk/seo-spider/ |
