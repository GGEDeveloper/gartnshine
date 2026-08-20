---
slug: conceitos-categoria-colecao-galeria
tipo: decisao
dominio: loja
titulo: "Categoria, coleção e galeria são conceitos distintos em artnshine.pt — endereços, tabelas e a armadilha do motion.js"
resumo: Três tabelas e três endereços que já estiveram misturados e prejudicaram o site. O REVEAL_SELECTOR do motion.js é por onde a mistura volta a entrar.
valid_from: 2026-07-30
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - public/js/modules/motion.js
  - main.css
  - frontend-mobile.css
  - views/layouts/main.ejs
  - transitions.css
  - view-transitions.js
  - voltar.js
sources:
  - migracao:project_conceitos_categoria_colecao_galeria.md
---

Em artnshine.pt são **três conceitos distintos** que já estiveram misturados e
não podem voltar a misturar-se (o utilizador insistiu nisto: "uma coisa são
coleções, outra coisa são categorias... a mistura que fizemos já está a
prejudicar-nos"):

| Conceito | Endereço | Tabela |
|---|---|---|
| **Categoria** — taxonomia obrigatória, 2 níveis (material → tipo+material) | `/categoria/:slug` | `product_families` |
| **Coleção curada** — conjunto à mão, pode atravessar categorias | `/colecoes`, `/colecao/:slug` | `collections` + `collection_products` |
| **Galeria** — fotografias, sem ligação a produtos | `/galeria` | `gallery_items` |

A **loja** vive em `/loja` e as fichas em `/loja/produto/:slug` (era
`/catalog` e `/catalog/product/`). Os endpoints `/api/catalog/*` mantêm o nome
antigo de propósito: são internos e não são URLs públicos.

A loja filtra por `?categoria=<slug>`, não por id — ver
[[loja-url-e-ordem]] para o contrato completo dos endereços.

Endereços antigos, todos com 301 permanente e a **não reutilizar**:
`/collection/:id` → `/categoria/:slug`, `/collections` → `/galeria`,
`/catalog` → `/loja`, `/catalog/product/:slug` → `/loja/produto/:slug`,
`/instagram*` → `/galeria`.

**Why:** `/collection/` era a categoria e `/collections` era a galeria — dois
endereços a dizer "colecção" sem nenhum deles o ser. Além disso a coluna
`product_families.slug` existia mas `create`/`update` nunca a escreviam, pelo
que as 25 categorias estavam a NULL e produção serviu 23 URLs numéricos
indexados.

**How to apply:**
- Ao renomear a classe do contentor de uma página com produtos, verificar
  `REVEAL_SELECTOR` em `public/js/modules/motion.js`: ele revela por
  `.collection-page .product-card` / `.category-page .product-card`. Uma classe
  fora dessa lista deixa os cartões com o `opacity: 0` que `main.css` põe em
  `.product-card`, e a página fica **em branco** sem erro nenhum.
- Ao auditar visualmente, dois falsos positivos recorrentes: elementos dentro
  de `.category-index-list` (mobile) e de `.slick-list` (carrossel da home)
  saem legitimamente da viewport porque os contentores fazem scroll/clip —
  verificar `documentElement.scrollWidth` em vez do `getBoundingClientRect()`
  de cada elemento. E os itens de galeria só ganham opacidade ao entrar no
  viewport, por isso um varrimento rápido conta-os como invisíveis.
- `html`/`body` tinham `overflow-x: hidden` (em `main.css` e
  `frontend-mobile.css`), o que os torna contentor de scroll e **quebra
  `position: sticky` em toda a página**. Passaram a `overflow-x: clip`, que
  corta o transbordo na mesma sem criar contentor de scroll; `hidden` fica
  declarado antes, como recurso para browsers sem suporte. Se algum elemento
  sticky deixar de colar, é aqui que se procura primeiro.
- Novas categorias já recebem slug automaticamente
  (`ProductFamily.buildSlug`); `update` só regenera se estiver vazio, para não
  partir URLs indexados.

**Transições entre páginas (View Transitions API):** dois pontos **têm de
ficar inline no `<head>`** de `views/layouts/main.ejs` e não em ficheiros
externos — `@view-transition { navigation: auto }` e o listener de
`pagereveal` que aplica a direcção das setas. Com o primeiro em
`transitions.css` (16.ª folha de estilo) a transição nunca acontecia:
`pageswap` criava-a e `pagereveal` descartava-a. Com o segundo em
`view-transitions.js` (fim do `<body>`) o evento já tinha passado.

Verificar transições com capturas de ecrã **não funciona** — bloqueiam o
browser. A forma que funciona é, dentro de `pagereveal`, esperar por
`e.viewTransition.ready` e ler `document.getAnimations()` filtrado pelos
pseudo-elementos `view-transition`.

**`Referrer-Policy: no-referrer`:** o site serve este cabeçalho, por isso
`document.referrer` vem **sempre vazio**, mesmo em navegação interna. Qualquer
funcionalidade que dependa dele não funciona — foi o que aconteceu ao módulo
`voltar.js`, cuja melhoria nunca chegava a activar. Usar `sessionStorage` para
seguir percurso dentro do separador, em vez de baixar a política.

Ver [[seo-audit-2026-07-30]] e [[estado-2026-07-30]].
