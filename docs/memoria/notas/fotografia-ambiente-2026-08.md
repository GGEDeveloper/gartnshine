---
slug: fotografia-ambiente-2026-08
tipo: decisao
dominio: fotografia
titulo: Fotografia de ambiente 2026-08 — só 4 das 43 fotos da galeria têm peça identificada; montagens compostas foram reprovada
resumo: Fotografia de ambiente 2026-08 — só 4 das 43 fotos da galeria têm peça identificada; montagens compostas foram reprovadas pelo utilizador
valid_from: 2026-08-01
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - PAN0075
  - PPB0013
  - PPU0032
  - docs/bancada-2026-08-10/ambiente.js
  - metadados.js
  - rembg
sources:
  - migracao:project_fotografia_ambiente_2026_08.md
---

> **Verificado a 2026-08-18:** a galeria tem hoje **88 imagens** (72 `.jpg` +
> 16 `.jpeg`) e um vídeo, com **87 registos** em `gallery_items`, todos com
> ficheiro. Uma imagem está na pasta sem registo, portanto **não aparece no
> site**. As 43 abaixo são o levantamento de 2026-08-10; entretanto entrou a
> selecção descrita em [[media-nova-2026-08]].
>
> Atenção à mistura de extensões: contar só `*.jpg` dá 72 e subestima o
> acervo em 16 imagens — erro que este projecto já cometeu.

Levantamento das 43 fotografias de `gonzagas_node/public/media/gallery/`, feito
a **2026-08-10**. Resultado e material em `docs/bancada-2026-08-10/`.

**De 43 fotos, só 4 se conseguem casar com uma referência:** foto 0 →
`PAN0075`, foto 10 → `PPB0013`, fotos 16 e 18 → `PPU0032`. As outras 39 mostram
tranças, bizantinas, argolas e bangles lisos, de que há dezenas de variantes
quase iguais. **Só a casa destranca isto** — sem essa lista não há como tratar
as restantes com honestidade.

**O emparelhamento automático por assinatura de imagem (dHash) não serve
aqui e não vale a pena repeti-lo:** um anel ocupa ~10 % de uma foto de cartão,
portanto o que a assinatura compara é o fundo, não a peça.

**Montagens compostas estão reprovadas.** Compus duas — peça recortada por
`rembg` sobre um pedaço real de outra foto da casa — e o utilizador rejeitou-as
("estão péssimos"); foram apagadas. Falhas: contorno duro na peça, e a sombra
de contacto a virar mancha no vazio de peças vazadas (argolas). **Não voltar a
propor esta via**: para as peças sem foto de ambiente, o que falta é
fotografia a sério.

O tratamento que **passou** (`docs/bancada-2026-08-10/ambiente.js`): saturação
a 0.62, `linear([1.06,1.0,0.92],[-6,-4,-2])`, gamma 1.08, vinheta em `#12100E`.
Corta-se sempre o céu azul e o amarelo (cores proibidas pela paleta TERRA).

**A informação de que peça é cada imagem vive no EXIF do próprio ficheiro**
(`ImageDescription` e `XPKeywords`), não num JSON à parte — ver
`metadados.js`. Assim viaja com a imagem.

Ver [[project-lote-julho-2026]] e [[project-marca-gonzaga-2026-08-04]].
