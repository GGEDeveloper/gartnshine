---
slug: fase-4-fevereiro-2026
tipo: facto
dominio: geral
titulo: Fase 4 (Fevereiro–Março de 2026) — a paleta fria, a modularização e a fundação de SEO
resumo: 99 commits: Quick Product, Media Library, a troca de azul por prata/bronze, o CSS modularizado e dez sprints que puseram o SEO de pé.
keywords: colour palette, silver bronze, hardcoded colours, CSS modularisation, SEO foundation, schema markup, sitemap, WebP, Merchant Center feed
valid_from: 2026-02-11
valid_to:
ingested_at: 2026-08-17T00:00:00+00:00
superseded_by:
confianca: 0.85
entities:
  - variables.css
  - dark-luxe.css
  - PR-SEO-FOUNDATION.md
  - WebP
  - quick-product
sources:
  - commit:2026-02-11..2026-03-04
  - ficheiro:PR-SEO-FOUNDATION.md
relations:
  - paleta-prata-bronze | foi_substituida_por | marca-gonzaga-2026-08-04
---

99 commits, a maior concentração da história do projecto. Quatro frentes.

## Quick Product e Media Library

O módulo de criação rápida de produtos no admin, com câmara, categorias e
cores, e a Media Library a ler do disco. A Media Library deu luta: uma dúzia
de commits seguidos a 12 de Fevereiro sobre miniaturas, *overflow* em mobile,
autenticação nos *thumbnails* (o `img src` não envia cookies em mobile) e
estilos inline para forçar tamanhos no deploy.

É aqui que nasce o `fix(media-library): Jimp fallback para dominios.pt/cPanel
quando Sharp falha` — a dívida que [[fase-1-arranque-2025-05]] descreve e que
ainda hoje está em `routes/admin/media.js`.

## A paleta fria

Uma sequência longa a 13 e 16 de Fevereiro a arrancar azul, roxo, violeta,
verde e beige do site e a pôr **prata, bronze e dourado** no lugar. Os títulos
dizem-no bem: «Remove TODOS os gradientes azuis», «LIMPEZA FINAL: últimos
vestígios de azul», «CORREÇÃO DEFINITIVA».

**Esta é a paleta fria que a marca de Agosto de 2026 veio substituir** pela
paleta TERRA. Ver [[marca-gonzaga-2026-08-04]]. Quem encontrar tons prateados
e cinzentos em CSS antigo está a olhar para esta fase, não para a identidade
actual.

Ficheiros que sobrevivem desta altura: `variables.css`, `dark-luxe.css`,
`admin-dark-luxe.css`. Hoje há 30 ficheiros CSS em `public/css/`, e a fonte
única de escalas passou a ser o `design-system.css` de Agosto
([[design-system-2026-08-01]]).

## Modularização de CSS

Documentada em `docs/CSS_MODULARIZATION_GUIDE.md` e no *quick start*. Os
commits reclamam «MODULARIZAÇÃO CSS COMPLETA», «FASE 3 COMPLETA»,
«FINALIZAÇÃO 100%». Como em [[fase-2-sprint-outubro-2025]], a percentagem é
de quem a escreveu — a auditoria de CSS que se lhe segue a 17 de Fevereiro
existe justamente porque ficou coisa por arrumar.

## A fundação de SEO — o que mais durou

A 22 e 23 de Fevereiro, dez sprints seguidos põem de pé quase tudo o que hoje
sustenta o SEO: meta tags dinâmicas, Open Graph e canónicos; schema de
produto, *breadcrumbs* e `OnlineStore` num `@graph` unificado com
`SearchAction`; GA4 com consentimento de cookies; sitemap com imagens e
slugs; URLs semânticos; `noindex` na pesquisa; verificação do Search Console;
o **feed do Merchant Center**; política de fora-de-stock; redirect WWW e
limpeza de CSP.

Correcções de detalhe que importam: o `robots.txt` tinha um
`Disallow /*.xml$` que **bloqueava o próprio sitemap**, e o `lang` estava em
`pt-BR` em vez de `pt-PT`.

Está documentado em `PR-SEO-FOUNDATION.md` e no `CHECKLIST-MASTER.md`. O
plano-mestre que daqui saiu marcava 24 de 46 tarefas a 05/03/2026; hoje
faltam 22, quase todas externas — ver [[seo-pendentes-2026-08]].

## Ciclo do WebP

Posto nos sprints 2 e 10 de Fevereiro (`WebP picture tags`), e a 4 de Março
**removido**: `fix: remove WebP references to fix 404 on product images`. As
referências existiam sem os ficheiros por trás.

Voltou depois e ganhou: hoje há **2176 ficheiros `.webp`** em
`public/media/products/` e cinco views a servi-los por `<picture>`. O padrão
repete o do lazy loading — ver [[lazy-loading-ciclo]]: a funcionalidade estava
certa, faltava-lhe o suporte por baixo.
