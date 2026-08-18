---
slug: seo-pendentes-2026-08
tipo: estado
dominio: seo
titulo: SEO — 22 tarefas por fazer, e a maioria não é código
resumo: O plano-mestre tem 30 itens feitos e 22 por fazer; quase todos são contas externas e operação, não desenvolvimento.
keywords: SEO backlog, Merchant Center, Google Business Profile, Pinterest Rich Pins, Etsy backlink, Search Console, KPI baseline
valid_from: 2026-08-17
valid_to:
ingested_at: 2026-08-17T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - artnshine.pt
  - Merchant Center
  - Search Console
  - Google Business Profile
  - Pinterest
sources:
  - ficheiro:docs/SEO/seo.md
  - ficheiro:docs/SEO/auditoria-tecnica-2026-07-30.md
  - conversa:2026-08-17
---

O plano-mestre vive em `docs/SEO/seo.md` — **fora do git** (untracked). Última
actualização de estado: 05/03/2026, com 24 de 46 tarefas feitas; a contagem
actual de marcas de concluído é 30, com **22 por fazer**.

## O que importa perceber

**A maior parte do que falta não se resolve com código.** São contas e
operação: criar conta no Merchant Center, reclamar o Google Business Profile,
abrir Pinterest Business, pôr loja no Etsy, registar a baseline de KPIs. O
site já faz a sua parte — o feed está pronto em `/feed/products.xml` e só
falta ligá-lo.

Por isso estas tarefas pertencem ao domínio `negocio` tanto quanto ao `seo`:
não avançam sozinhas por se mexer no repositório.

## Prioridade 1 — impacto imediato

- **HTTP→HTTPS no servidor.** Configurar no painel dominios.pt. O redirect
  WWW→non-WWW já está no `app.js`; falta o do protocolo. Sem isto, qualquer
  ligação HTTP entra pela versão insegura.
- **Merchant Center:** criar conta, verificar `artnshine.pt`, submeter
  `https://artnshine.pt/feed/products.xml`, activar as *free listings* do
  Google Shopping.
- **Baseline de KPIs.** Registar agora páginas indexadas, LCP, sessões
  orgânicas e posição média. Sem baseline não se sabe se melhorou.

## Prioridade 2

Google Business Profile (categoria Joalharia) mais schema `LocalBusiness` /
`JewelryStore`; Pinterest Business com Rich Pins (o schema `Product` já
existe); optimizar o Instagram; preencher meta descriptions em falta no
admin; re-submeter o sitemap depois do deploy com slugs.

## Prioridade 3

Directórios portugueses (artesanatoportugal.com.pt, compras.pt), Etsy com
ligação para o site, alertas no GA4, e uma **rotina semanal de 15 minutos**
para ver Search Console e GA4. `PriceSpecification` e `AggregateRating` ficam
para quando houver promoções e avaliações reais.

## O lado técnico já está feito

A auditoria de 2026-07-30 (`docs/SEO/auditoria-tecnica-2026-07-30.md`) correu
as 441 URLs do sitemap e baixou os problemas de 313 para 0 nas páginas fixas e
de 92 para 2 nas de produto. O achado mais grave era o sitemap apontar as
imagens para `/uploads/products/` quando vivem em `/media/products/` — **293
imagens a dar 404**. Ver [[seo-audit-2026-07-30]].

## Ponta solta

`docs/SEO/nomes-produtos.md` está **vazio** (0 bytes) desde 2026-07-08. Foi
criado e nunca preenchido. Cruza com o `LTCU0016` por nomear de
[[seo-naming-2026-07]] e com [[catalogo-monitorizar]].
