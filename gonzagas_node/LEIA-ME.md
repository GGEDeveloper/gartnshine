# Lettering 2 — ficheiros para o site

Lettering proprietário Gonzaga, versão **lettering 2**: traçado da fotografia do lettering
original por ajuste de linha ao eixo de cada traço. Contornos já fechados (não traço), cor
por `currentColor` — como nos ficheiros que já existem em `public/brand/`.

Como `<img>` a tinta sai preta (é o valor inicial de `color`). Para controlar a cor, ou se
insere o SVG em linha e se define `color`, ou se usa `mask-image` com um `background` da
cor pretendida — os dois casos estão no exemplo abaixo.

## Onde colocar

Copiar a pasta `public/brand/lettering2` para:

    gonzagas_node/public/brand/lettering2/

Fica ao lado do `public/brand/` que já existe (wordmark.svg, monograma-g.svg, etc.),
sem tocar em nada do que está lá. As referências no site ficam:

    /brand/lettering2/wordmark.svg
    /brand/lettering2/monograma-g.svg
    /brand/lettering2/jewellery.svg
    /brand/lettering2/letras/G.svg

## Inventário

| Ficheiro | O que é | Estado |
|---|---|---|
| `wordmark.svg` | GONZAGA completo, 1117 × 316 u de tinta (1 : 3,53) | medido do original |
| `monograma-g.svg` | G principal, base do logo, barra interior nivelada, 161 × 308 u (1 : 1,91) | medido do original |
| `jewellery.svg` | linha de apoio JEWELLERY, tracking de 70 u | **provisório** — tracking a confirmar |
| `letras/G O N Z A.svg` | as cinco letras da palavra | medidas do original |
| `letras/J E W L R Y.svg` | as letras que faltam para JEWELLERY | desenhadas no mesmo idioma |

O `CATALOGO.json` tem, para cada ficheiro, o viewBox, a caixa de tinta e o estado.

## Grelha

Todas as letras partilham a mesma grelha, para se poderem compor palavras:

- altura de maiúscula 200 u, linha de base y = 270, topo plano y = 70
- pontas transbordam: ápices até y ≈ 48, vértices inferiores até y ≈ 313
- cintura dos losangos y = 164 · traço 15 u uniforme
- viewBox das letras `0 0 200 330` (o W usa `0 0 260 330`)

O `wordmark.svg`, o `monograma-g.svg` e o `jewellery.svg` vêm com o viewBox cortado à
tinta, para assentarem à face sem margens fantasma.

## Como usar

```html
<!-- inline, herda a cor do texto -->
<span class="marca"><!-- conteúdo de monograma-g.svg --></span>

<!-- como imagem -->
<img src="/brand/lettering2/wordmark.svg" alt="Gonzaga" height="48">

<!-- como máscara, para gradientes ou cor via CSS -->
.marca-g {
  width: 42px; aspect-ratio: 161 / 308;
  background: currentColor;
  -webkit-mask: url(/brand/lettering2/monograma-g.svg) center / contain no-repeat;
          mask: url(/brand/lettering2/monograma-g.svg) center / contain no-repeat;
}
```

## Limites

- **Tamanho mínimo do G:** 32 px de altura em ecrã, 10 mm em impressão. Aos 16 px a
  abertura da aresta superior direita fecha.
- **Ar mínimo do G:** 80 u em toda a volta (o comprimento da barra interior).
- **Não esticar:** manter as proporções — G 1 : 1,91, wordmark 1 : 3,53.
- O wordmark conserva as irregularidades do original: os dois G são instâncias distintas
  (o segundo é 4 % menor) e a cintura desce da esquerda para a direita. É de propósito.
  Se para o site fizer mais sentido uma versão regularizada, é um pedido à parte.

## Proveniência

Medido de `uploads/lettering-ai-dani-2.jpeg`. Largura total do traçado: 1116 u contra
1119 u da fotografia. A folha de construção do G está no projeto Omelette,
em «Logo — base G».

Versão 1.0 — 19 de agosto de 2026.
