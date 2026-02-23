# SEO — Monitorização Contínua

**Objetivo:** Processo simples e sustentável para manter e melhorar o SEO ao longo do tempo  
**Esforço:** ~15 min/semana + 1h/mês

---

## Filosofia

SEO não é uma tarefa que se faz uma vez. É um sistema vivo que precisa de monitorização regular. Mas para uma marca artesanal pequena, o processo tem de ser **simples e rápido** — senão não é sustentável.

Este doc define um processo mínimo eficaz.

---

## Rotina Semanal — 15 minutos

### Todos os Lunés de manhã

**1. Google Search Console (10 min)**

Aceder a https://search.google.com/search-console → propriedade `artnshine.pt`

```
Verificar:
☐ Overview → há algum aviso vermelho?
☐ Index → Coverage → novos erros? (páginas com erro 404, soft 404)
☐ Experience → Core Web Vitals → % de URLs "Good" subiu ou desceu?
☐ Enhancements → erros de Schema/Rich Results novos?
```

**Se encontrar erros:**
- 404 novo → produto apagado sem redirect? Adicionar redirect 301
- Soft 404 → página vazia ou sem conteúdo → verificar página
- Schema error → valida com https://search.google.com/test/rich-results

**2. GA4 (5 min)**

Aceder a https://analytics.google.com → propriedade Art & Shine

```
Verificar (Relatórios → Aquisição → Visão Geral):
☐ Sessões orgânicas esta semana vs semana anterior
☐ Alguma queda ou subida brusca (>30%)? → investigar causa
☐ Confirmar que GA4 está a receber dados (linha não está a zero)
```

---

## Rotina Mensal — 1 hora

### Primeiro Domingo de cada mês

#### 1. Search Console — Análise de Keywords (20 min)

**Desempenho → Resultados de pesquisa → Últimos 28 dias**

```
Ordenar por:
1. Impressões DESC → quais as keywords com mais visibilidade?
2. Cliques DESC → quais estão a gerar tráfego real?
3. Posição ASC (melhores posições) → quais estão no top 10?
```

**Acções a tomar:**

| Cenário | Acção |
|---------|-------|
| Keyword com posição 8-15 e boas impressões | Optimizar a página (melhorar title, H1, conteúdo) → push para top 5 |
| Keyword na posição 1-3 mas CTR baixo (<3%) | Melhorar meta description ou adicionar rich snippet |
| Keyword nova que não esperavas | Criar conteúdo específico para ela (ou landing page) |
| Keyword importante com queda de posição | Verificar se a página mudou, se há competitor novo |

#### 2. PageSpeed Insights (10 min)

Testar as 3 páginas mais importantes:

```
https://pagespeed.web.dev/

Testar:
1. https://artnshine.pt (homepage)
2. https://artnshine.pt/catalog (catálogo)
3. https://artnshine.pt/catalog/product/[PRODUTO_MAIS_VISITADO]
```

Registar na tabela de KPIs (em baixo).

#### 3. GA4 — Análise mensal (20 min)

```
Relatórios → Ciclo de vida → Aquisição:
☐ Sessões orgânicas este mês vs mês anterior (% crescimento)
☐ Sessões orgânicas este mês vs mesmo mês ano passado (comparativo real)
☐ Bounce rate canal orgânico
☐ D uração média sessão orgânica

Relatórios → Eventos:
☐ Evento `view_item` → quais os produtos mais vistos?
☐ Evento `search` → quais os termos mais pesquisados no site?

Páginas mais vistas (Relatórios → Envolvimento → Páginas):
☐ Top 10 páginas orgânicas → confirmar que são as esperadas
☐ Alguma página inesperada no top? → pode ser oportunidade
```

#### 4. Verificar Erros e Avisos (10 min)

```
Search Console → Index → Coverage:
☐ Número de páginas indexadas (deve crescer ou manter-se)
☐ Páginas excluídas por noindex → confirmar que são as correctas (/search, /admin, /api)
☐ Páginas com erros → corrigir prioritariamente
☐ Páginas "Descobertas mas não indexadas" → porquê?
```

---

## Tabela de KPIs — Preencher Mensalmente

```
Data | Indexadas | LCP HP | LCP Produto | Score HP | Org. Sessões | Pos. Média | CTR
-----|-----------|--------|-------------|----------|--------------|------------|----
Fev 2026 | 299 | ___ | ___ | ___ | ___ | ___ | ___
Mar 2026 | ___ | ___ | ___ | ___ | ___ | ___ | ___
Abr 2026 | ___ | ___ | ___ | ___ | ___ | ___ | ___
Mai 2026 | ___ | ___ | ___ | ___ | ___ | ___ | ___
Jun 2026 | ___ | ___ | ___ | ___ | ___ | ___ | ___
```

---

## Alertas a Configurar no GA4

Configurar alertas automáticos em GA4 → Relatórios → Insights:

1. **Queda brusca de tráfego orgânico** → alerta se orgânico descer >30% em 7 dias
2. **Evento `view_item` parou** → alerta se evento GA4 ficar a zero (indica problema no tracking)

Ou usar Google Search Console → Definições → Preferências de email para notificações automáticas de erros críticos.

---

## Sinais de Alerta — Agir Imediatamente

| Sinal | Possível Causa | Acção |
|-------|---------------|-------|
| Páginas indexadas caem >10% | Google deindexou páginas | Verificar robots.txt, noindex acidental |
| Tráfego orgânico -50% em 1 semana | Penalização manual ou algoritmo | Search Console → Security & Manual Actions |
| Erros de schema em massa | Actualização de código quebrou JSON-LD | Validar com Rich Results Test |
| LCP > 4s de repente | Deploy novo introduziu imagens pesadas | Reverter deploy, investigar |
| CTR cai mas posições mantidas | Meta descriptions genéricas ou partilhas sociais com imagem errada | Rever meta descriptions e OG image |

---

## Rotina Trimestral — 2 horas

A cada 3 meses, fazer uma auditoria mais profunda:

```
☐ Comparar KPIs com trimestre anterior
☐ Rever top 20 keywords — novas oportunidades?
☐ Verificar backlinks novos (Search Console → Links)
☐ Testar todas as páginas do sitemap (sem 404, sem erros)
☐ Rever schema de 5 produtos aleatórios com Rich Results Test
☐ Actualizar `priceValidUntil` nos schemas se necessário
☐ Verificar se novas páginas foram adicionadas ao sitemap
☐ Rever e actualizar meta descriptions de páginas principais
☐ Verificar se o Google Merchant Center não tem erros (após Fase D)
```

---

## Ferramentas de Monitorização

| Ferramenta | Uso | Acesso | Custo |
|-----------|-----|--------|-------|
| Google Search Console | Indexação, keywords, erros | search.google.com/search-console | Gratuito |
| Google Analytics 4 | Tráfego, comportamento, eventos | analytics.google.com | Gratuito |
| PageSpeed Insights | Core Web Vitals | pagespeed.web.dev | Gratuito |
| Rich Results Test | Validação schema | search.google.com/test/rich-results | Gratuito |
| Google Merchant Center | Feed de produtos | merchants.google.com | Gratuito |
| Screaming Frog (free) | Auditoria técnica profunda (até 500 URLs) | screamingfrog.co.uk | Gratuito até 500 URLs |

> ⚠️ Todas as ferramentas principais são gratuitas. Não é necessário pagar ferramentas de SEO (Ahrefs, SEMrush, etc.) para este projeto — o volume de URLs não justifica o custo.

---

**Doc anterior:** `15-seo-off-page.md`  
**Roadmap completo:** `07-seo-roadmap-avancado.md`
