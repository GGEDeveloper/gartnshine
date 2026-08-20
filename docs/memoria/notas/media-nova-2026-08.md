---
slug: media-nova-2026-08
tipo: estado
dominio: fotografia
titulo: "Media nova de temporario-nova-media — 580 ficheiros catalogados, 67 apagados, 45 escolhidas para a galeria; a medida de
resumo: 67 ficheiros apagados de vez; as 99 repetições foram aprovadas mas o utilizador mandou não apagar. Nenhuma medida automática separou «mesma peça» de «peça diferente».
valid_from: 2026-08-01
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - CATALOGO.js
  - CATALOGO.md
  - media-classificar.js
  - media-rever.js
  - media-decidir.js
  - nitidez3.js
  - temporario-nova-media/GALERIA-SELECAO.js
  - gonzagas_node/scripts/galeria/importar-selecao.js
  - INVENTARIO.js
  - INVENTARIO.md
  - catalogar.js
sources:
  - migracao:project_media_nova_2026_08.md
---

Trabalho de **2026-08-10** sobre `temporario-nova-media/Eventos` (seis eventos,
580 ficheiros, 2,3 GB). Catálogo em `CATALOGO.json` / `CATALOGO.md`; scripts
`media-classificar.js`, `media-rever.js`, `media-decidir.js`, `nitidez3.js`.

**Estado:** 67 apagados de vez (privadas, pessoas, queimadas, desfocadas — lista
em `_descartadas/APAGADOS.txt`). O utilizador aprovou a lista de 99 repetições
mas mandou **não apagar**: «podem ficar todas», ficam como material de trabalho
para redes. 41 duplicados do projecto e 13 repetidas continuam em quarentena.

**Selecção para a galeria do site: 45 fotografias**, em
`temporario-nova-media/GALERIA-SELECAO.json` e `.md`, com a legenda de cada uma
já escrita para ir tal e qual para `/admin/gallery`. Juntam-se às 43 que já lá
estão (mesmo mundo visual) — não as substituem. **Já importadas no dev local**
por `gonzagas_node/scripts/galeria/importar-selecao.js` (idempotente, converte a
1600 px, escreve a legenda no EXIF, insere em `gallery_items`); a galeria local
tem 88 itens, `sort_order` 44–88. **Falta enviar para produção** — os ficheiros
novos vivem em `public/media/gallery/` e as linhas em `gallery_items`.

**Inventário do conteúdo: `INVENTARIO.json` / `INVENTARIO.md`**, gerado por
`catalogar.js`. Diz, por ficheiro, que peças tem, materiais, cenário,
enquadramento, luz e que **famílias da loja serve** (mapeadas aos slugs reais de
`product_families`). As regras são escritas à mão por número de ficheiro e o
programa **recusa-se a gravar se algum ficheiro ficar sem regra** — é a garantia
de completude. 124 das 422 imagens são candidatas a capa de categoria.

**Seis famílias não têm uma única capa possível** (nenhuma peça delas foi
fotografada sozinha em cenário natural): `pulseiras-pe-prata`, `colares-latao`,
`cuffs-latao`, `pulseiras-latao`, `pentes-de-cabelo-latao`,
`pulseiras-pedras-naturais`. É a lista de compras da próxima sessão de fotografia.

**A classe «feira» estava mal-entendida:** além das bancas, contém as melhores
fotografias de **macramé** de todo o lote (`IMG_0321`–`0332`, pendentes sobre
erva) e os brincos de **latão** sobre cortiça (`IMG_0335`–`0339`). Não é material
de arrumação — é material de capa.

**Critério que decidiu a selecção:** a galeria mostra em grelha quadrada, todas
do mesmo tamanho. Uma peça que ocupe um vigésimo do enquadramento desaparece na
grelha por muito boa que seja a luz. Depois cortou-se pela repetição de
*motivo*, não de ficheiro, e por fim pelos fundos que não são da marca.

**Nenhuma medida de imagem separa "a mesma peça outra vez" de "outra peça na
mesma mesa".** Tentadas três — imagem inteira, por celas, e só o recorte à volta
do assunto: mesma peça dá 21 a 43 de diferença média, peça diferente dá 20 a 44.
Sobrepõe-se por inteiro, porque 90 % do enquadramento é fundo idêntico. A lista
automática de 226 remoções apagava dez anéis distintos. **A medida serve só para
agrupar por cena; a escolha dentro da cena tem de ser a olho.** É o mesmo achado
que [[fotografia-ambiente-2026-08]] regista para o dHash.

**Nitidez: medir por celas de 1/14 da imagem e valer a melhor.** A pergunta certa
é «existe um sítio focado?», não «quanta imagem está focada» — profundidade de
campo curta é a intenção, não defeito. Sobre a imagem inteira reprovava 68, metade
delas as melhores.

**As pastas de evento estão trocadas:** os ficheiros `IMG-20260226-WA00xx`
(musgo, casca, líquen — Sintra) estão dentro de `2026-07-ALENTEJO`, e os
`IMG_03xx` (cortiça) estão dentro de `2026-02-SINTRA`. Não confiar no nome da
pasta para datar nem para nomear.

**Por decidir:** 37 vídeos por rever; a série da piscina (~40, água turquesa
contra a proibição do azul da paleta TERRA); as bancadas de feira (mostram peças
de outros expositores).

Ver [[lote-julho-2026]], [[marca-gonzaga-2026-08-04]] e
[[capas-categorias-fundo-frio]].
