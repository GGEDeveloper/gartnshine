Perfeito. Tenho o estado completo do projecto. Deixa-me compilar tudo numa visão integral.

***

# 🎯 PLANO MASTER — Gonzaga's Art & Shine
### Estado: 05/03/2026

***

## ✅ O que está FEITO (24/46 tarefas)

### 🔴 Urgente (3/3)
- **U1** — noindex em `/search` com filtros + Disallow no robots.txt ✅
- **U2** — sameAs redes sociais (Instagram + Facebook) no schema ✅
- **U3** — Redirect WWW→non-WWW no app.js ✅ *(HTTP→HTTPS via servidor: pendente)*

### ⚡ Performance & Core Web Vitals (7/7) — **COMPLETO**
- **A1** — Preconnect GA4 + Google Fonts ✅
- **A2** — Conversão WebP + `<picture>` tags em todos os cards ✅
- **A3** — Lazy loading + eager nas imagens hero ✅
- **A4** — OG Image branded 1200×630px ✅
- **A5** — Favicons completos (16/32/180/192/512 + manifest) ✅
- **A6** — Compressão gzip activa ✅
- **A7** — Cache headers por tipo de ficheiro ✅

### 🔖 Schema Markup (3/5)
- **B1** — Schema @graph (WebSite + Organization + OnlineStore + SearchAction) ✅
- **B2** — Schema Product dinâmico com price/availability real ✅
- **B3** — BreadcrumbList em produto e coleção ✅

### 🔗 URLs & On-Page (5/6)
- **C1** — Coluna `slug` produtos + redirect 301 ID→slug ✅
- **C2** — Coluna `slug` famílias + redirect 301 ID→slug ✅
- **C3** — Alt text descritivo em todos os product cards ✅
- **C4** — Meta descriptions com fallback inteligente ✅ *(DB precisa preenchimento)*
- **C5** — H1 único e semântico em cada página ✅
- **C6** — Sitemap com slugs ✅ *(re-submissão pós-deploy: pendente)*

### 🛠️ Técnico Avançado (5/6)
- **T1** — noindex /search filtrado ✅
- **T2** — Schema Offer com sale_price e stock dinâmicos ✅
- **T3** — Política out-of-stock (badge + WhatsApp + peças semelhantes) ✅
- **T4** — Preconnect recursos externos ✅
- **T6** — Headers segurança + CSP compatível com GA4 ✅

### 🛒 Merchant Center (1/4)
- **D2** — Feed XML `/feed/products.xml` completo ✅

### 🔐 SEO Foundation (hoje)
- **DNS TXT** — Propriedade de Domínio Search Console verificada ✅
- **Sitemap** — 299 páginas submetidas ✅
- **Indexação** — Solicitada www + non-www ✅

***

## ❌ O que FALTA (22 tarefas) — **Top of the Fucking Shit**

### 🔥 PRIORIDADE 1 — Fazer já (impacto imediato)

#### **HTTP→HTTPS redirect no servidor**
- Configurar no painel dominios.pt para `http://artnshine.pt` → `https://artnshine.pt`
- Sem isto qualquer link HTTP vai para versão insegura

#### **D1 — Google Merchant Center (conta)**
- Criar conta em [merchants.google.com](https://merchants.google.com)
- Verificar domínio `artnshine.pt`
- Feed já está pronto em `/feed/products.xml` — só falta ligar

#### **D3 — Submeter feed no Merchant Center**
- Submeter URL: `https://artnshine.pt/feed/products.xml`
- Validar produtos sem erros críticos

#### **D4 — Activar Google Shopping gratuito**
- Merchant Center → Growth → Free listings → Activar
- Produtos aparecem em Google Shopping **sem pagar**

#### **M2 — Baseline de KPIs (agora)**
- Registar estado actual: páginas indexadas, LCP, sessões orgânicas, posição média
- Sem baseline não sabemos se estamos a melhorar

***

### 🟡 PRIORIDADE 2 — Esta semana

#### **B4 + E1 + E2 + E3 — Google Business Profile + LocalBusiness Schema**
- Criar/reclamar perfil em [business.google.com](https://business.google.com)
- Categoria: **Joalharia / Jeweler**
- Preencher: nome, morada, telefone, horário, fotos
- Adicionar schema `LocalBusiness` / `JewelryStore` ao site
- **Impacto:** Apareces no Google Maps + painel de conhecimento + SEO local

#### **OP1 — Pinterest Business + Rich Pins**
- Criar conta Pinterest Business
- Verificar `artnshine.pt`
- Rich Pins activos automaticamente (schema Product já existe)
- **3 boards iniciais:** Prata 925, Pedras Naturais, Coleções
- **Impacto:** Backlinks de alta qualidade + tráfego visual gratuito

#### **OP2 — Optimizar Instagram**
- Nome: "Art & Shine | Joias Prata 925 Portugal"
- Bio com keywords naturais
- Link na bio → `https://artnshine.pt`

#### **C4 — Preencher descriptions na DB**
- Correr `node scripts/audit-meta-descriptions.js`
- Preencher descrições em falta produto a produto no admin
- **Impacto directo** no CTR nos resultados de pesquisa

#### **C6 — Re-submeter sitemap**
- Após deploy com slugs activos
- Search Console → Sitemaps → `sitemap.xml` → Submeter

***

### 🟢 PRIORIDADE 3 — Próximas 2 semanas

#### **OP3 — Directórios portugueses**
- artesanatoportugal.com.pt
- compras.pt
- **Backlinks locais** que o Google PT valoriza muito

#### **OP4 — Etsy com link para o site**
- Loja Etsy Portugal
- Bio + produtos com link para `artnshine.pt`
- **Backlink de domínio de alta autoridade (DA 92)**

#### **M1 — Alertas GA4**
- Alerta de queda de tráfego orgânico >30%
- Notificações email no Search Console

#### **M3 — Rotina semanal**
- Dia fixo (sugestão: Segundas, 15 min)
- Ver Search Console + GA4 + novos erros

#### **T5 — Schema PriceSpecification**
- Quando sistema de promoções for implementado

#### **B5 — AggregateRating**
- Quando existirem reviews reais de clientes

***

### 🔵 PRIORIDADE 4 — Fase Blog (1-2 meses)

#### **F1 — Estrutura técnica do blog**
- Rota `/blog` + `/blog/:slug`
- Tabela `blog_posts` na DB

#### **F2 — Primeiro artigo SEO**
- "Como identificar prata 925 genuína — guia completo"
- 800+ palavras, H2/H3, imagens, links internos para produtos

#### **F3 — Plano editorial 3 meses**
- 12 artigos com keywords de cauda longa
- Ex: "cuidados com joias prata", "significado pedra onix", "presente artesanal Portugal"

#### **OP5 — 1ª menção em blog/site PT**
- 3 bloggers lifestyle/artesanato PT
- Press release + proposta de colaboração

#### **E4 — Reviews Google**
- Template WhatsApp após primeiras vendas

***

## 📊 Score actual vs target

| Área | Agora | Target |
|------|-------|--------|
| **Foundation técnica** | 95% ✅ | 100% |
| **Schema / Rich Results** | 75% | 100% |
| **Performance** | 90% | 95% |
| **Merchant Center** | 25% | 100% |
| **SEO Local** | 0% | 100% |
| **Off-Page / Backlinks** | 0% | 60% |
| **Conteúdo / Blog** | 0% | 40% |
| **Monitorização** | 20% | 100% |
| **GLOBAL** | **52%** | **85%+** |

***

## 🚀 Próximas 48h — Acção imediata

```
1. Merchant Center → criar conta + submeter feed (30 min)
2. Google Business Profile → criar/reclamar (20 min)
3. Pinterest Business → criar + verificar domínio (15 min)
4. Instagram → actualizar bio + nome (5 min)
5. Baseline KPIs → preencher M2 no checklist (10 min)
```

Queres atacar algum ponto específico agora?