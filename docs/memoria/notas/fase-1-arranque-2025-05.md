---
slug: fase-1-arranque-2025-05
tipo: facto
dominio: geral
titulo: Fase 1 (Maio–Julho de 2025) — arranque, e o que dela ainda vive
resumo: Migração para Node, painel admin, galeria e arquitectura modular; sobrou uma defesa contra o cPanel que já não existe.
keywords: project bootstrap, node migration, admin panel, GLightbox, modular CSS, cPanel legacy, Jimp fallback
valid_from: 2025-05-22
valid_to:
ingested_at: 2026-08-17T00:00:00+00:00
superseded_by:
confianca: 0.8
entities:
  - GLightbox
  - Jimp
  - sharp
  - routes/admin/media.js
  - gonzaga@artnshine.pt
sources:
  - commit:2025-05-22..2025-07-18
  - ficheiro:gonzagas_node/DEPLOYMENT.md
relations:
  - routes/admin/media.js | usa_fallback | Jimp
---

74 commits entre 2025-05-22 e 2025-07-18. O projecto nasce da migração de um
`gonzagas_catalog` antigo para a aplicação Node que hoje existe. Nesta fase
montaram-se o painel de administração e o login, a galeria pública, o upload
de imagens de produto com imagem principal, os filtros de inventário do lado
do servidor, e o *deploy* em cPanel.

A 2025-07-18 há um dia denso de correcções de mobile no admin — margens,
botões, carregamento de módulos — e o *checkpoint* que introduz a
**arquitectura modular de CSS e JS** que ainda organiza `public/css/` e
`public/js/modules/`.

Nota de confiança: esta fase não tem registo conversacional nenhum (os
transcripts só começam a 2026-07-29), por isso o *porquê* das decisões está
inferido dos commits e do código, não confirmado. Ver [[memoria-como-funciona]].

## O que ainda está vivo hoje

- **GLightbox** na galeria e no detalhe de produto — entrou a 2025-05-30, a
  substituir o Lightbox2, e continua em `public/js/modules/ui.js`,
  `catalog-quick-view.js`, `views/collections.ejs`,
  `views/catalog/product-detail.ejs` e `views/layouts/main.ejs`.
- **A arquitectura modular** de CSS/JS, base do que veio a ser o design system
  ([[design-system-2026-08-01]]).

## Dívida viva: o fallback de Jimp

`routes/admin/media.js` ainda faz isto:

```js
sharp = null; // cPanel pode falhar - usa Jimp
```

O comentário seguinte diz «fallback puro JS para cPanel/dominios.pt». **Essa
restrição já não existe:** o cPanel foi descontinuado e a produção corre em
Docker Compose no waphix ([[waphix-production-infra]]). O `sharp` funciona —
verificado neste ambiente, vips 8.17.2.

Consequência: o projecto carrega `jimp@^1.6.0` como dependência para servir um
único ficheiro, a defender-se de um ambiente abandonado. É candidato a
limpeza, mas convém confirmar primeiro que o `sharp` também arranca no
contentor de produção antes de remover a rede de segurança.

## Facto corrigido pelo tempo

O commit de 2025-07-16 troca o email de contacto de `mike@artnshine.pt` para
`geral@artnshine.pt`. **Nenhum dos dois é o actual:** hoje o site usa
`gonzaga@artnshine.pt` (3 ocorrências) e `noreply@artnshine.pt` para envios
automáticos.

## O que morreu

Todo o aparato de cPanel e Passenger — troubleshooting de `Cannot find
module`, `.htaccess` para MIME types, `module.paths` remendado no `server.js`.
Os guias foram arquivados em `docs/old/` e o `DEPLOYMENT.md` avisa disso logo
no cabeçalho.
