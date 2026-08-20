---
slug: capas-categorias-fundo-frio
tipo: facto
dominio: fotografia
titulo: "Capas e cartões de categoria — a prata precisa de clarão frio, senão lê-se castanha; onde ficam os limites de largura e
resumo: Correr o script reconstrói as 25 capas e os 5 cartões sem mudar nomes de ficheiro, portanto trocar uma imagem não exige migração. O clarão tem duas temperaturas e não é gosto: o castanho serve o latão, a prata precisa de cinza frio.
valid_from: 2026-08-04
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - gonzagas_node/scripts/category-headers/build.js
  - -hero-1920.jpg
  - -card-1200.jpg
  - manifest.js
  - rembg
sources:
  - migracao:project_capas_categorias_fundo_frio.md
---

`gonzagas_node/scripts/category-headers/build.js` monta as 25 capas
(`cat-<id>-hero-1920.jpg`) e os 5 cartões (`*-card-1200.jpg`) a partir de
recortes em `cutouts/`. Correr o script reconstrói **tudo**; os nomes dos
ficheiros não mudam, por isso **não é preciso migração** para trocar uma imagem.

**O clarão do fundo tem duas temperaturas, e isto não é gosto:** o castanho
`#6B5844` serve o latão, o macramé e as pedras, mas à prata faz o contrário —
o metal acinzentado apanha a dominante e lê-se castanho, baço, como se
estivesse sujo. As categorias de prata estão listadas em `capasFrias` no
`manifest.json` e levam o clarão em `#C8C6C1`, com opacidade muito mais baixa
(0.30/0.11 contra 0.78/0.28) — um clarão claro a cheio lavaria a peça.

**O limite de largura de 34 % é só do cabeçalho**, para a peça não ir parar por
trás do título. No cartão não há título por cima e o limite sobe para 80 %
(`limiteLargura` em `peca()`). Foi por causa desse limite que os cartões
pareciam vazios.

**Cuidado com `require()` deste script:** é um IIFE, portanto importá-lo
executa a construção toda.

**Recortes:** `rembg` com `isnet-general-use`. Duas armadilhas provadas —
`alpha_matting` deixa uma franja clara à volta de contas escuras; sem ele, o
modelo **preenche o vazio do meio** de uma pulseira, entregando um disco. Para
peças com furo, o caminho que funcionou foi limpar o recorte antigo por cor:
matar os pixéis ao mesmo tempo claros (luminância > 128) e sem cor
(saturação < 0.20), que é cartolina, não pedra.

Ver [[marca-gonzaga-2026-08-04]] e [[lote-julho-2026]].
