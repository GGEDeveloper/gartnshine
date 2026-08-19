---
slug: trabalho-em-curso-2026-08
tipo: estado
dominio: geral
titulo: Frentes abertas a 2026-08-17 — o que está fora do git e por integrar
resumo: Dez frentes por commitar, uma branch com 7 commits por integrar e três worktrees já integradas que podem ser limpas.
keywords: work in progress, uncommitted, pending branch, stale worktree, branding, silver covers
valid_from: 2026-08-17
valid_to: 2026-08-19
ingested_at: 2026-08-17T00:00:00+00:00
superseded_by: estado-git-2026-08-19
confianca: 1.0
entities:
  - claude/zen-mcnulty-044d6c
  - branding-desing
  - docs/hipoteses-prata
  - gonzagas_node/public/brand
sources:
  - conversa:2026-08-17
  - ficheiro:docs/memoria/bin/cronograma.py
---

Levantamento feito a 2026-08-17 com `cronograma.py` e `monitor.py`.

## Por integrar em `main`

**`claude/zen-mcnulty-044d6c` — 7 commits, parados desde 2026-06-26.**
Correcções do header em ecrãs pequenos (o botão do hambúrguer saía cortado a
≤375px e a ≤360px escondem-se carrinho e conta), a consolidação do CSS do
header mobile numa fonte única, e uma funcionalidade de admin para escolher a
imagem de fundo do Hero da homepage. É trabalho real e não está em lado
nenhum senão nessa branch — decidir se entra ou se se abandona.

## Worktrees que já não servem

Três worktrees em `.claude/worktrees/` não têm nada por integrar (`main..` dá
zero): `artnshine-repo-audit-89de08`, `brave-satoshi-f74ba9` e
`product-inventory-naming-bccc89`. Ocupam espaço e **duplicam os ficheiros
markdown do repositório** — foi por isso que uma primeira contagem deu 3099
ficheiros `.md` quando os reais são cerca de 60. Qualquer varrimento de
documentação tem de as excluir.

## Fora do git (untracked)

- **`docs/hipoteses-prata/`** e os três PDFs `Capas-*.pdf` em `docs/` — as
  hipóteses das capas de categoria em prata. Ver [[capas-categorias-fundo-frio]]
  e [[capas-fotografia-2026-08-11]].
- **`branding-desing/`** — `brand_bible_profissional.md` e
  `auditoria_coerencia_artnshine.md`, com PDF de cada. Ver
  [[marca-gonzaga-2026-08-04]].
- **`gonzagas_node/public/brand/`** — 8 SVGs da marca nova já produzidos
  (`lockup`, `wordmark`, `monograma-g`, `losango`, `selo`, `jewellery`,
  `wordmark-gravacao`, `wordmark-reduzido`).
- **`docs/SEO/`** — a auditoria técnica e o `nomes-produtos.md` vazio.
- **`docs/db/`** — dois dumps de 2026-07-09, um de produção e outro local com
  SEO.
- **45 fotografias** novas em `public/media/gallery/`.
- **`temporario-novo-stocks/`** (lote FIA de 2026-07, com pastas por família) e
  **`temporario-nova-media/`** (inventário e catalogação: `CATALOGO.json`,
  `INVENTARIO.json`, `GALERIA-SELECAO.json` e os scripts que os produziram).

## Modificado e por commitar

`docs/DESIGN_SYSTEM.md`, e em `gonzagas_node/scripts/category-headers/` o
`build.js`, o `manifest.json`, o `resultado.json` e o recorte `PPU0080.webp`,
mais as capas `cat-1-hero-1920.jpg` e `cat-4-hero-1920.jpg`. É o trabalho das
capas a meio.
