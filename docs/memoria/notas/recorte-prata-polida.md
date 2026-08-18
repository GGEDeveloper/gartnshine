---
slug: recorte-prata-polida
tipo: facto
dominio: fotografia
titulo: "Recortar prata polida em `recortar-prata.js` — a face espelhada tem exactamente a cor da cartolina; o que a distingue d
resumo: "Recortar prata polida em `recortar-prata.js` — a face espelhada tem exactamente a cor da cartolina; o que a distingue do vazio é ser mais escura, não ser menos lisa"
valid_from: 2026-08-11
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - gonzagas_node/scripts/category-headers/recortar-prata.js
  - cat-1-hero-1920.jpg
  - build.js
  - resultado.js
  - manifest.js
sources:
  - migracao:project_recorte_prata_polida.md
---

`gonzagas_node/scripts/category-headers/recortar-prata.js` recorta as peças do
lote de Julho de 2026 para as capas de categoria. Correcções de **2026-08-11**,
depois de os anéis saírem com o corpo comido no `cat-1-hero-1920.jpg`.

**A causa:** a semeadura do «vazio do meio» aceita qualquer pixel que esteja à
cor da cartolina. Numa prata polida **a face espelhada devolve a cartolina** —
mesma cor, ponto por ponto — e o alagamento entra pela peça adentro. A guarda
antiga (`COMER_MAX`, comparar a corrida prudente com a larga) não apanhava
nada, porque as duas vinham igualmente contaminadas.

**O que NÃO separa:** a planura. O desvio padrão da luminância dá **29** no
vazio verdadeiro de uma pulseira (que também tem o degradê da sombra de
contacto) contra **21** na face comida de um anel — troca as voltas. Medi e
deitei fora.

**O que separa:** **quanto da mancha é mais escura do que a cartolina.** Vazio
verdadeiro: 18 %–32 % dos pixéis abaixo do fundo. Face de metal apanhada por
engano: 93 %–100 %. Há um fosso entre os dois; a linha ficou em
`ESCURAS_MAX = 0.65`, aplicada por **mancha ligada** e não ao alagamento todo.

**Segunda correcção, as migalhas brancas:** entre o contorno e a sombra ficam
bocados de cartolina encurralados que o alagamento de fora não alcança e que a
regra da sombra não apanha (não são escuros). Sobre um cabeçalho preto lêem-se
como salpicos. Sai um alagamento final com trela curta — só o que estiver a
menos de `D_FUNDO` do **campo local**. Nas pulseiras de elos isto baixa a tinta
de 22 % para 13 %, e está certo: é a cartolina entre os elos.

**Terceira, no `build.js`:** a exposição era `modulate + linear(1.18,-14)`
calibrada para o percentil 99 sair a 221. Numa prata polida **o topo é um
planalto** — a face espelhada são milhares de pixéis no mesmo valor — e meio
por cento de tinta a bater no 255 vira um buraco branco de contorno duro.
Passou a haver um **ombro**: recta até 188, depois curva exponencial com
assímptota em 251. Nada satura e a peça não escurece.

**Também no `build.js`:** uma corrida parcial (`build.js aneis-prata`) apagava
do `resultado.json` as outras 24 categorias, que continuam no disco e apontadas
pela base de dados. Agora junta com o que lá estava.

**Estado:** `aneis-prata` (cat-1) e `pulseiras-prata` (cat-4) refeitos com o
lote de Julho. As outras seis famílias de prata ainda têm as peças antigas no
`manifest.json`. Ver [[project-capas-categorias-fundo-frio]] e
[[project-capas-fotografia-2026-08-11]].
