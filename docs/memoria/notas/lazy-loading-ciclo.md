---
slug: lazy-loading-ciclo
tipo: decisao
dominio: loja
titulo: Lazy loading das imagens — posto, retirado e reposto
resumo: Optimização de Outubro de 2025, removida em Novembro para resolver imagens invisíveis, reposta em 2026; hoje 30 usos e um eager no hero.
keywords: lazy loading, eager loading, image visibility, product card, grid layout, performance regression
valid_from: 2026-06-23
valid_to:
ingested_at: 2026-08-17T00:00:00+00:00
superseded_by:
confianca: 0.9
entities:
  - loading="lazy"
  - product-detail.ejs
  - product cards
sources:
  - commit:2025-11-17
  - commit:2026-07-31
  - ficheiro:gonzagas_node/views
relations:
  - loading-lazy | foi_removido_em | 2025-11-17
  - loading-lazy | foi_reposto_em | 2026
---

O atributo `loading="lazy"` nas imagens do catálogo passou por três estados.
Quem mexer nisto deve saber porquê, para não repetir a volta inteira.

## 1. Posto — Outubro de 2025

Entrou como optimização de desempenho, no commit
`feat(phase-1): complete core optimization - lazy loading + backup + SEO`.
Ver [[fase-2-sprint-outubro-2025]].

## 2. Retirado — 17 de Novembro de 2025

Nesse dia há uma sequência longa de tentativas contra imagens que não
apareciam no catálogo:

```
fix: force ALL product images to load immediately, not just viewport ones
fix: simplify loadImage method to ensure all images load correctly
fix: remove loading='lazy' attribute since we load all images immediately
fix: complete image loading solution - all images load immediately
```

O problema real eram cartões de produto com **altura zero** e a ocuparem duas
células da grelha — commits do mesmo dia mexem em `min-height`, em
`min-height: 0` no `product-info` e em impedir que o cartão ocupasse duas
linhas. Com altura zero, o *viewport* nunca considerava a imagem visível e o
lazy loading nunca disparava.

**A remoção do `lazy` tratou o sintoma, não a causa.** O custo foi carregar
todas as imagens do catálogo de uma vez.

## 3. Reposto — 2026

Voltou gradualmente com o trabalho de loja e design de Junho a Agosto de 2026
(`fix(production): hotfixes para deploy waphix`, e depois a série de
`feat` de 29 de Julho a 1 de Agosto). O plano de SEO regista-o como feito:
«A3 — Lazy loading + eager nas imagens hero ✅». Ver [[seo-pendentes-2026-08]].

## Estado hoje (2026-08-17)

**30 ocorrências de `loading="lazy"`** nas views e **uma de
`loading="eager"`**, no `views/catalog/product-detail.ejs` — a imagem
principal da ficha de produto, que é o LCP dessa página e por isso não deve
esperar.

Esta é a configuração correcta e não deve ser desfeita. Se voltarem a
aparecer imagens invisíveis no catálogo, **o sítio para onde olhar é a altura
do cartão na grelha**, não o atributo de carregamento.
