# Bancada — fotografia de ambiente, 10 de Agosto de 2026

Material de avaliação. **Nada daqui está ligado ao site**: as imagens não estão
em `public/media/`, não há registo na base de dados e nenhuma ficha de produto
as usa.

| | |
|---|---|
| [`index.html`](index.html) | A página de revisão, auto-contida — abre com duplo clique |
| [`imagens/`](imagens/) | As 4 tratadas em qualidade original, mais a folha de contacto das 43 |
| [`galeria-manifesto.json`](galeria-manifesto.json) | O levantamento, uma linha por fotografia |
| [`galeria-lista.json`](galeria-lista.json) | Índice → nome do ficheiro em `public/media/gallery/` |
| [`marcados.json`](marcados.json) | O que foi escrito no EXIF de cada imagem tratada |
| [`ambiente.js`](ambiente.js) · [`metadados.js`](metadados.js) | Os scripts que produziram tudo isto |

## O resultado, em duas linhas

Das 43 fotografias da galeria, **4 casam com uma referência**: foto 0 →
`PAN0075`, foto 10 → `PPB0013`, fotos 16 e 18 → `PPU0032`. As outras 39 mostram
peças que existem no catálogo, mas em variantes quase iguais entre si — dizer
qual é qual exige quem tem as peças na mão.

## Duas coisas que ficam registadas

**O emparelhamento automático não serve.** Foi tentado por assinatura de imagem
(dHash) e deitado fora: um anel ocupa ~10 % de uma foto de cartão, portanto o
que a assinatura compara é o fundo.

**As montagens compostas foram reprovadas.** Foram feitas duas — peça recortada
sobre um pedaço real de outra fotografia da casa — e apagadas: contorno duro na
peça e a sombra a virar mancha no vazio das argolas. Para as peças sem
fotografia de ambiente, o que falta é fotografia a sério, não composição.

## O tratamento que passou

Em [`ambiente.js`](ambiente.js): saturação a 62 %, aquecimento leve
(`linear([1.06, 1.0, 0.92], [-6, -4, -2])`), gamma 1.08 e vinheta em `#12100E`.
Corta-se sempre o céu azul e o amarelo — cores fora da paleta TERRA
(`docs/marca/`).

A que peça cada imagem se refere vive **no EXIF do próprio ficheiro**
(`ImageDescription`, `XPKeywords`), não neste JSON — assim viaja com a imagem
para qualquer máquina.

## Por fazer

- Identificar as 39 fotografias restantes. É o que destranca o resto.
- `PAN0075` está na família errada: são brincos catalogados em *Aneis - Prata*.
- A fotografia 25 tem flores amarelas; se for usada, corta-se.
