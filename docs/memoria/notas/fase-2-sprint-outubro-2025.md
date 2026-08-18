---
slug: fase-2-sprint-outubro-2025
tipo: facto
dominio: geral
titulo: Fase 2 (Outubro de 2025) — o sprint de seis fases, e o que ficou meio ligado
resumo: 31 commits em dois dias criaram câmara mobile, pesquisa, WhatsApp, media e BI; três das cinco tabelas de analytics nunca receberam uma linha.
keywords: sprint, mobile camera capture, WhatsApp integration, media management, business intelligence, analytics tables, unused feature
valid_from: 2025-10-07
valid_to:
ingested_at: 2026-08-17T00:00:00+00:00
superseded_by:
confianca: 0.8
entities:
  - analytics_events
  - analytics_page_views
  - analytics_search_queries
  - analytics_conversions
  - media_files
  - camera-capture
sources:
  - commit:2025-10-07..2025-10-08
  - ficheiro:aa-temporary/PLANO_GERAL.md
---

31 commits e 42 documentos, quase todos em **dois dias** (7 e 8 de Outubro de
2025). O plano vive em `aa-temporary/PLANO_GERAL.md` e previa 18 tarefas em
3 sprints ao longo de 5–6 semanas; foi executado num fim-de-semana.

Entregou, por ordem: captura de fotografia pela câmara do telemóvel no admin,
pesquisa mais integração com WhatsApp, optimização de base de dados e
segurança, Dashboard V2, Product Detail V2, «Homepage Revolution», sistema de
gestão de media e *business intelligence*.

## Ler os relatórios desta fase com desconfiança

Os commits e documentos falam em «676/690 tarefas», «FASE 3 — 100% COMPLETA»,
«4 Fases (67%)». **Essa contabilidade não corresponde ao que ficou a
funcionar.** Verificado na base local a 2026-08-17, dez meses depois:

| Tabela criada nesta fase | Linhas |
|---|---|
| `analytics_events` | 17 486 |
| `analytics_sessions` | 3 |
| `analytics_page_views` | **0** |
| `analytics_search_queries` | **0** |
| `analytics_conversions` | **0** |
| `media_files` | 274 |
| `media_folders` | 7 |
| `media_collections` | **0** |
| `media_processing_jobs` | **0** |

O *business intelligence* regista eventos genéricos mas **nunca alimentou as
tabelas especializadas**. Quem for construir relatórios sobre páginas vistas,
pesquisas ou conversões não tem dados — tem de os derivar de
`analytics_events` ou ligar o que falta.

Ressalva: isto é a base **local**, que difere da de produção
([[db-dev-vs-production]]). Confirmar em produção antes de concluir que o
mesmo se passa lá.

## O que está vivo e a ser usado

- **Captura por câmara** — montada em `views/admin/products/product-form.ejs`,
  `views/admin/partials/camera-module-import.ejs` e
  `views/admin/quick-product/form.ejs`.
- **WhatsApp** — presente em `index.ejs`, `product-detail.ejs`, `header.ejs` e
  `footer.ejs`.
- **Gestão de media** — `media_files` com 274 registos e 7 pastas; é a base do
  trabalho de media de 2026 ([[media-nova-2026-08]]).
- **`routes/admin/analytics.js`** continua montado.

## Lição

Um volume grande de commits e uma percentagem alta de conclusão não provam
que a funcionalidade está ligada. A verificação que vale é olhar para os
dados: uma tabela a zero dez meses depois diz mais do que qualquer relatório.
Ver [[catalogo-monitorizar]] para o mesmo princípio aplicado ao catálogo.
