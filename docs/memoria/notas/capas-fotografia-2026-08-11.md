---
slug: capas-fotografia-2026-08-11
tipo: decisao
dominio: fotografia
titulo: "Capas de categoria em fotografia de ambiente — 15 das 25 podem trocar; a medição de contraste tem de incluir o ::before
resumo: Nada foi trocado — o script escreve para `propostas/`. Trocar as capas é só trocar ficheiros de imagem, nem CSS nem HTML. Medir o contraste sem o véu do `::before` reprova as 25.
valid_from: 2026-08-11
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - gonzagas_node/scripts/category-headers/capas-foto.js
  - capas-foto.js
  - -hero-1920.jpg
  - brand-showcase.css
  - INVENTARIO.js
sources:
  - migracao:project_capas_fotografia_2026_08_11.md
---

Trabalho de **2026-08-11**: reabordagem das capas de categoria com a media nova
de [[media-nova-2026-08]]. Proposta em
`gonzagas_node/scripts/category-headers/capas-foto.js` + `capas-foto.json`,
com a explicação no README dessa pasta. Página de decisão publicada em
https://claude.ai/code/artifact/d857c1f4-a43e-4cfa-ad8f-324dcccda044

**Nada foi trocado.** O script escreve para `propostas/`, não para
`public/media/categories/`. Quando houver decisão, muda-se o `OUT` e os nomes
para `cat-<id>-hero-1920.jpg` — a base de dados já aponta para lá e **não é
preciso migração**.

**A armadilha que quase me fez concluir o contrário:** medir o contraste do
título só no ficheiro JPEG dá 1,7:1 a 2,9:1 e reprova tudo — mesmo com o meio
escurecido a 80 %, que já é tarja e não véu. Falta uma camada: o `::before` de
`body.showcase-theme .collection-header.has-background` em
`brand-showcase.css` desenha um véu **por cima da imagem** antes de o texto
entrar. Medida a montagem completa (corte `cover` a 4.35:1 + véu do CSS), as
quinze passam: 4,95:1 a 6,74:1 no computador, mínimo 5,5:1 no telemóvel. **Qualquer
medição de contraste destes cabeçalhos tem de incluir o `::before`.**

Consequência: **trocar as capas é só trocar ficheiros de imagem** — nem CSS nem
HTML. A variante «terço escuro» (título à esquerda, escuridão a entrar pela
esquerda, peça à direita) sobe o contraste para 9,4:1+ e compõe muito melhor,
mas custa uma regra de `text-align` e é opção de gosto, não de acessibilidade.
No terço escuro a sombra tem de chegar a **meio** da imagem e não a um terço,
porque no telemóvel só se vê a fatia central de 63 % da largura.

**Dez famílias ficam montagem** por não haver uma única fotografia da peça
sozinha em cenário natural: `pulseiras-pedras-naturais` (55 fotos, todas ao
pulso ou em tabuleiro — a pior), `pulseiras-pe-prata`, `aneis-latao`,
`cuffs-latao`, `colares-latao`, `pendentes-latao`, `pentes-de-cabelo-latao`,
`piercings-latao`, `piercings-sem-furo-latao`, `brincos-macrame`.

**Três erros do INVENTARIO.json apanhados ao ver as imagens em tamanho de capa**
(as folhas de contacto não os mostravam):
- `DSC_3657`–`3659` — não é pulseira sobre casca, é **uma osga num muro**, sem peça.
- `IMG_0325`–`0327` — não é pendente de macramé, é o **braço de uma pessoa** com
  bracelete de latão numa feira, com top vermelho (cor fora da paleta).
- `WA0075`, `WA0076`, `WA0090` — anéis de **prata** com pedra quente, não de latão.

**Por confirmar com quem tem as peças:** `IMG-20260226-WA0072`, que proponho
para `pulseiras-latao`, pode ser uma gargantilha.

Ver [[capas-categorias-fundo-frio]] e [[marca-gonzaga-2026-08-04]].
