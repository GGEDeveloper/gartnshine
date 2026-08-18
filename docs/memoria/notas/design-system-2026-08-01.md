---
slug: design-system-2026-08-01
tipo: facto
dominio: design
titulo: Fundações de design (design-system.css) criadas em 2026-08-01; regra de não inventar literais; layout é do CSS e não do 
resumo: Fundações de design (design-system.css) criadas em 2026-08-01; regra de não inventar literais; layout é do CSS e não do JS; armadilhas de :where() e do seletor section
valid_from: 2026-08-01
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - gonzagas_node/public/css/design-system.css
  - views/layouts/main.ejs
  - variables.css
  - docs/DESIGN_SYSTEM.md
  - public/js/modules/catalog-grid.js
  - catalog-enhanced.css
  - views/category.ejs
  - brand-showcase.css
sources:
  - migracao:project_design_system_2026_08_01.md
---

Em 2026-08-01 foi criada a camada de fundações do frontend em
`gonzagas_node/public/css/design-system.css`, carregada em `views/layouts/main.ejs`
logo a seguir a `variables.css` e antes de todas as folhas de componente.
Documentada em `docs/DESIGN_SYSTEM.md`.

**Regra combinada:** nenhuma folha de componente inventa valores novos de
espaçamento, tamanho de letra, raio, contentor ou z-index. Se falta um degrau,
acrescenta-se à escala no design-system, não se escreve o literal no componente.

**Decisões que não se leem no código:**

- As fontes da marca são Cinzel (display) e Source Sans 3 (corpo). Para trocar a
  tipografia do site inteiro mudam-se só `--font-display`/`--font-body` + o
  `<link>` das Google Fonts. Os aliases `--font-primary`/`--font-heading`
  existem só para as folhas antigas continuarem a funcionar.
- Breakpoints fechados em 480 / 768 / 1024 / 1280 (com frações `.98` nos
  `max-width`). Não acrescentar tiers.
- **Layout responsivo é responsabilidade do CSS.** `public/js/modules/catalog-grid.js`
  escrevia `grid-template-columns` inline a partir de breakpoints próprios e
  anulava o CSS — foi neutralizado de propósito. Não voltar a calcular colunas em JS.
- A grelha de produtos tem **uma definição única** em `catalog-enhanced.css` que
  cobre `.products-grid`, `.products-grid.grid-view` e `.catalog-grid`, porque
  `views/category.ejs` usa a primeira **sem** `.grid-view`. Prender a regra a
  `.grid-view` deixa as páginas de categoria sem colunas.
- As marcas de secção da barra de progresso foram **removidas de propósito**
  (o utilizador avaliou-as como incompreensíveis e inutilizáveis). Ficou só a
  linha decorativa.
- O `!important` desceu de 534 para 495 nas folhas do frontend; a purga completa
  ficou por fazer (sobretudo `brand-showcase.css` 235 e `catalog-enhanced.css` 137).

**Armadilhas que custaram tempo e vão voltar:**

1. `:where()` tem especificidade **zero** — não serve quando a regra tem de ganhar
   a uma classe existente (ex.: limitar `.container` numa página-documento).
2. `section` como seletor de elemento soma padding a **cada nível de aninhamento**.
   A regra correcta é `main > section`.
3. Um seletor genérico em `button` para alvos de toque de 44px inflaciona
   controlos decorativos (aconteceu com os pontos de 7px da barra de progresso).
4. Estilos inline escritos por JS ganham a qualquer folha de estilo — foi o que
   manteve o catálogo numa coluna em telemóvel apesar do CSS estar correcto.

**Estado verificado no fim:** contraste WCAG AA sem violações em 22 vistas,
CLS < 0.1 em todas as páginas, zero transbordo horizontal a 390px e 1440px.

Ver [[project-admin-imagens-categoria-2026-08-01]] e
[[project-seo-audit-2026-07-30]].
