# Roadmap SEO Avançado — Art & Shine

**Objetivo:** Transformar a fundação técnica (sitemap, meta tags, schema básico) num sistema SEO de topo que posiciona `artnshine.pt` como referência em "joias artesanais prata 925 portugal".

---

## Estado Atual (22 Fev 2026)

✅ **Fundação SEO Técnica completa:**
- Robots.txt configurado
- Sitemap dinâmico (299 URLs indexados no Search Console)
- Meta tags dinâmicas (title, description, canonical, OG, Twitter Card)
- Schema.org básico (Product, BreadcrumbList, OnlineStore)
- Google Analytics 4 integrado e validado (`G-VYM82NFR22`)
- Google Search Console verificado

---

## As 6 Fases de Otimização

### 🔴 FASE A — Performance & Core Web Vitals

**Objetivo:** LCP < 2.5s | INP < 200ms | CLS < 0.1  
**Estado:** 🟡 A implementar  
**Doc técnica:** `08-fase-a-performance.md`

Core Web Vitals são **ranking factors oficiais do Google**. Sites mais rápidos têm vantagem competitiva direta nos resultados de pesquisa.

| Task | Descrição | Prioridade |
|------|-----------|------------|
| A1 | Conversão de imagens para WebP | 🔴 Alta |
| A2 | Lazy loading nativo em imagens | 🔴 Alta |
| A3 | Dimensões explícitas em `<img>` (prevenir CLS) | 🔴 Alta |
| A4 | Imagem OG real 1200×630px (substituir placeholder) | 🔴 Alta |
| A5 | Favicons completos (apple-touch-icon, manifest.json, PWA) | 🟡 Média |

**Impacto esperado:**
- LCP melhora de ~4s para ~1.5s
- CLS reduzido para < 0.1
- +8.4% conversão por cada 0.1s ganho
- Partilhas sociais com imagem profissional

---

### 🔴 FASE B — Schema Markup Avançado

**Objetivo:** Rich results no Google (estrelas, preços, disponibilidade visíveis nos resultados)  
**Estado:** 🔴 Por planear  
**Doc técnica:** `09-fase-b-schema-avancado.md` _(a criar)_

O schema básico existe mas está fragmentado. A diferença entre schema básico e rich results é o `@graph` unificado e propriedades completas.

| Task | Descrição | Prioridade |
|------|-----------|------------|
| B1 | Estrutura `@graph` unificada (Organization → WebSite → WebPage → Product) | 🔴 Alta |
| B2 | `Organization.sameAs` com Instagram + Facebook | 🔴 Alta |
| B3 | `Product` com `offers.availability`, `priceValidUntil`, `brand`, `material` | 🔴 Alta |
| B4 | `ItemList` nas páginas de coleção | 🟡 Média |
| B5 | `LocalBusiness` (se existir presença física) | 🟢 Baixa |
| B6 | `AggregateRating` quando implementares sistema de reviews | 🟢 Futura |

**Impacto esperado:**
- Produtos aparecem com estrelas + preço + disponibilidade no Google
- CTR aumenta 20-35% com rich snippets
- Maior credibilidade nos resultados de pesquisa

---

### 🟡 FASE C — URLs Semânticas & On-Page SEO

**Objetivo:** Cada produto rankeia individualmente para keywords específicas  
**Estado:** 🔴 Por planear  
**Doc técnica:** `10-fase-c-urls-onpage.md` _(a criar)_

| Task | Descrição | Prioridade |
|------|-----------|------------|
| C1 | URLs semânticas: `/catalog/product/anel-prata-925-onix-negro` | 🔴 Alta |
| C2 | Alt text automático gerado a partir do nome do produto | 🔴 Alta |
| C3 | Descriptions únicas por produto na DB | 🔴 Alta |
| C4 | H1 optimizado por página | 🟡 Média |
| C5 | Audit de keywords PT e aplicação nos textos | 🟡 Média |

**Keywords prioritárias PT:**
- `prata 925 portugal`
- `joias artesanais prata`
- `anel ónix prata`
- `colar pedra natural`
- `joalharia artesanal portuguesa`

**Impacto esperado:**
- Cada produto rankeia individualmente para long-tail keywords
- Tráfego orgânico +40-60% em 3-6 meses
- CTR melhora com títulos descritivos

---

### 🟡 FASE D — Google Merchant Center

**Objetivo:** Produtos aparecem no Google Shopping GRÁTIS  
**Estado:** 🔴 Por planear  
**Doc técnica:** `11-fase-d-merchant-center.md` _(a criar)_

| Task | Descrição | Prioridade |
|------|-----------|------------|
| D1 | Criar conta Google Merchant Center | 🔴 Alta |
| D2 | Ligar ao GA4 existente | 🔴 Alta |
| D3 | Criar endpoint `/feed.xml` no Express (feed automático de produtos) | 🔴 Alta |
| D4 | Submeter feed no Merchant Center | 🔴 Alta |
| D5 | Aguardar aprovação e monitorizar (1-3 dias) | 🟡 Média |

**Impacto esperado:**
- Visibilidade massiva em "anel prata 925", "colar pedra natural", etc.
- CTR alto (imagem + preço = confiança)
- Zero custo (listagem orgânica)

---

### 🟢 FASE E — SEO Local

**Objetivo:** Dominar pesquisas locais se houver presença física  
**Estado:** 🔴 Por planear  
**Doc técnica:** `12-fase-e-seo-local.md` _(a criar)_

| Task | Descrição | Prioridade |
|------|-----------|------------|
| E1 | Criar Google Business Profile | 🟡 Média |
| E2 | `LocalBusiness` schema com morada/contacto | 🟡 Média |
| E3 | NAP consistente (Nome, Morada, Tel) em footer, /about, redes sociais | 🟡 Média |

**Impacto esperado:**
- Aparece no Google Maps
- Rankeia para pesquisas locais e "near me"

---

### 🟢 FASE F — Conteúdo / Blog

**Objetivo:** Long-tail keywords + autoridade de domínio  
**Estado:** 🔴 Por planear  
**Doc técnica:** `13-fase-f-conteudo-blog.md` _(a criar)_

| Task | Descrição | Prioridade |
|------|-----------|------------|
| F1 | Criar secção `/blog` no site (rota + template EJS) | 🟡 Média |
| F2 | Primeiro artigo: "Como cuidar de prata 925" | 🟡 Média |
| F3 | Artigo: "Significado das pedras naturais: ónix, turquesa, ametista" | 🟢 Baixa |
| F4 | Artigo: "Diferença entre prata 925 e prata esterlina" | 🟢 Baixa |
| F5 | Schema `Article` em cada post | 🟢 Baixa |

**Impacto esperado:**
- Long-tail keywords (menor competição, maior conversão)
- Domain authority cresce progressivamente
- Backlinks naturais de sites que citam os artigos

---

## Prioridades de Implementação

| Ordem | Fase | Sprint | Esforço | Impacto | ROI |
|-------|------|--------|---------|---------|-----|
| 1 | **A** | WebP + Lazy Load + OG/Favicons | 2-3 dias | 🔴 Alto | ⚡ Imediato |
| 2 | **C** | URLs semânticas + Alt text | 1-2 dias | 🔴 Alto | 📈 3-6 meses |
| 3 | **B** | Schema avançado @graph | 1 dia | 🟡 Médio | 📈 1-3 meses |
| 4 | **C** | Descriptions produtos (content) | 3-5 dias | 🟡 Médio | 📈 3-6 meses |
| 5 | **D** | Google Merchant Center + feed | 1-2 dias | 🟡 Médio | 📈 1-2 meses |
| 6 | **E** | Google Business Profile | 1 dia | 🟢 Baixo | 📈 Local |
| 7 | **F** | Blog (1º artigo) | 2-3 dias | 🟢 Baixo | 📈 6-12 meses |

---

## Métricas de Sucesso (KPIs)

### Core Web Vitals (medir com PageSpeed Insights)

| Métrica | Estado atual (estimado) | Target |
|---------|------------------------|--------|
| **LCP** | ~4s | < 2.5s |
| **INP** | ~250ms | < 200ms |
| **CLS** | ~0.15 | < 0.1 |
| **Performance Score** | ~65 | > 90 |

### Search Console (30 dias após cada fase)

| Métrica | Target |
|---------|--------|
| Impressões | +40% (após Fase C) |
| Cliques orgânicos | +25% (após Fases A+B) |
| CTR | +15% (após Fase B — rich snippets) |
| Posição média | -5 posições (subir 5 lugares, após Fase C) |

### GA4

| Métrica | Target (6 meses) |
|---------|------------------|
| Tráfego orgânico | +60% |
| Bounce rate | -20% (após Fase A — performance) |
| Taxa de conversão | +10-15% (após Fase A — velocidade) |

---

## Notas de Implementação

### Restrições dominios.pt
- Verificar suporte WebP no servidor (Apache/Nginx)
- Rewrite rules necessárias para URLs semânticas (Fase C)
- Sem acesso a cron jobs nativos → usar solução alternativa para regeneração automática de sitemap

### Manutenção Contínua
- **Search Console:** Monitorizar semanalmente (erros de indexação, Core Web Vitals)
- **Sitemap:** Actualizar sempre que criar páginas novas
- **Feed Merchant Center:** Automático quando criar novos produtos (Fase D)
- **Reviews:** Quando implementares sistema de reviews, adicionar `aggregateRating` ao schema Product

---

## Documentação por Fase

| Ficheiro | Fase | Estado |
|----------|------|--------|
| `07-seo-roadmap-avancado.md` | Visão geral | ✅ Criado |
| `08-fase-a-performance.md` | Performance & Core Web Vitals | ✅ Criado |
| `09-fase-b-schema-avancado.md` | Schema @graph + rich results | 🔴 Por criar |
| `10-fase-c-urls-onpage.md` | URLs semânticas + on-page | 🔴 Por criar |
| `11-fase-d-merchant-center.md` | Google Merchant Center | 🔴 Por criar |
| `12-fase-e-seo-local.md` | SEO Local + Google Business | 🔴 Por criar |
| `13-fase-f-conteudo-blog.md` | Blog + content strategy | 🔴 Por criar |
