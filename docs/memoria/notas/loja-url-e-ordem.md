---
slug: loja-url-e-ordem
tipo: facto
dominio: loja
titulo: "Contrato dos endereços da loja em artnshine.pt (?categoria=slug, valores neutros, canónico por caso) e a ordem intercal
resumo: "Contrato dos endereços da loja em artnshine.pt (?categoria=slug, valores neutros, canónico por caso) e a ordem intercalada por subcategoria"
valid_from: 2026-07-30
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - public/js/modules/catalog-filters.js
  - services/catalogQueryService.js
sources:
  - migracao:project_loja_url_e_ordem.md
---

A loja (`/loja`) filtra por **`?categoria=<slug>`**, não por id. `?families=16`
continua a responder mas devolve **301** para a forma em slug.

**Why:** o id é interno — não diz nada a quem lê o URL nem ao Google, e muda se
a categoria for recriada, partindo todos os links partilhados. O slug já existia
em `product_families` para as páginas `/categoria/:slug`.

**How to apply:**

- **Um só sítio constrói endereços da loja:** `CatalogController.urlDaLoja()`.
  Espelhado no browser por `buildPublicUrl()` em
  `public/js/modules/catalog-filters.js` (a barra lateral filtra sem
  recarregar). Se os dois divergirem, recarregar a página muda o URL sem mudar
  nada do que se vê, e passam a existir dois endereços para a mesma listagem.
- **Valores neutros caem do URL** (`VALORES_NEUTROS` no controlador):
  `page=1`, `sort=default`, `price_range=all`, `per_page=24`. A ordem dos
  parâmetros é fixa. É isto que impede conteúdo duplicado.
- **Canónico por caso**, no controlador:
  - sem filtros → `/loja`, index;
  - **uma** categoria sozinha → canónico para **`/categoria/:slug`** (a versão
    rica da mesma listagem — sem isto as duas competem pela mesma pesquisa);
  - qualquer outra combinação, ou página > 1 → `noindex, follow`.
- A API interna `/api/catalog/filter` aceita as duas formas (`families` e
  `categoria`); o módulo de filtros pede-lhe por id e escreve slug na barra.
- `parseCategoriaParam` aceita repetido *e* separado por vírgulas. Slug
  desconhecido é ignorado: mostra a loja inteira, nunca 404.

## Ordem intercalada por subcategoria

`intercalarPorFamilia()` em `services/catalogQueryService.js` espalha as
subcategorias pela listagem. Ligado por `intercalarSubcategorias: true`, só na
ordenação "Padrão".

**Why:** as referências partilham prefixo por família, por isso a ordem natural
despejava 30 anéis antes do primeiro colar.

**How to apply:**
- Cada peça é colocada pela **posição relativa que ocupa dentro da sua família**
  (`(i + 0.5) / total`), não em round-robin. O round-robin simples esgota as
  famílias pequenas ao início e deixa um **bloco da maior no fim** — que é o
  mesmo problema noutro sítio. Ao validar, olhar a **última** página, não só a
  primeira.
- A intercalação tem de acontecer **antes de paginar**: sobre as 24 peças que a
  SQL devolve, a página 1 continuaria a ser 24 anéis, apenas baralhados. Daí
  carregar só `id`+`family_id` de tudo e paginar em memória (tecto de 5000).
- **Não voltar a pôr os destaques em bloco à cabeça:** 15 dos 20 destaques em
  prata são anéis e davam 13 anéis seguidos mesmo com o resto intercalado. Como
  cada família começa no início da lista intercalada e a ordem SQL já traz os
  destaques primeiro dentro de cada família, eles continuam a cair na primeira
  página.

## Contagens que se contradizem

Armadilha recorrente neste projecto: uma contagem ao lado de outra que não
aplica os mesmos filtros. Já aconteceu três vezes.

- `getMaterialsForHome` ignorava `hide_out_of_stock` → "Prata: 258" ao lado de
  "Ver todos: 220".
- O cartão "Ver todos" usava o total **filtrado** → "Ver todos: 112" ao lado de
  "Prata: 112".
- `Product.getAdjacentInFamily` contava as peças activas todas, incluindo as
  escondidas do catálogo e as sem stock → "8.ª de 90" numa categoria onde a
  loja anuncia 28, e setas a levar a peças que não estão à venda.

Qualquer número novo mostrado ao público tem de respeitar `hide_out_of_stock` e
`is_catalog_visible`. Há um teste que compara o total das setas com o que
`/loja?categoria=<slug>` anuncia.

Ver [[project-conceitos-categoria-colecao-galeria]] e
[[project-seo-audit-2026-07-30]].
