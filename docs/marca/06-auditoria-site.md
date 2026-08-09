# 06 · Auditoria do site

Avaliação do site contra as regras dos documentos 01–05.
**Data:** 2026-08-04 · **Método:** site local (`localhost:3000`) capturado a
1440 px e 390 px, mais leitura do CSS e das vistas.

---

## Veredicto

O site **não é fraco**. A homepage tem hero a sério, escuro e atmosférico; a
loja tem navegação por material com capas; a ficha de produto tem paginação
por categoria e caminho de migalhas. As fundações de CSS foram arrumadas em
Agosto e a estrutura está lá.

O que falha é outra coisa: **a marca nova ainda não chegou ao site.** O
lettering não está aplicado em lado nenhum, o logótipo e a imagem de partilha
continuam com o nome antigo, e a cor nunca foi consolidada. A somar a isso,
há um conjunto de defeitos pequenos e visíveis que custam mais à percepção de
qualidade do que qualquer decisão de design.

Por camadas:

| Camada | Estado |
|---|---|
| Estrutura e navegação | **Boa** |
| Fundações de CSS (espaço, tipo, grelha) | **Boa** — feita em Agosto |
| Identidade aplicada | **Ausente** — o lettering não está no site |
| Cor | **Fragmentada** — três paletas, sete dourados |
| Fotografia de produto | **Fraca** — o maior custo à marca |
| Acabamento (copy, formatos, erros) | **Fraco** — muitos defeitos pequenos e visíveis |

---

## Bloqueadores — a marca antiga ainda está publicada

| # | O quê | Onde | Impacto |
|---|---|---|---|
| B1 | **Imagem de partilha com o nome antigo.** Diz "GONZAGA'S ART & SHINE" e "artnshine.pt", sobre fundo azul-preto frio | `public/images/og-artnshine.jpg` | Quem partilhar **qualquer** página nas redes mostra a marca antiga |
| B2 | **`logo.svg` é o logótipo antigo** — e não é vectorial: é um PNG em base64 dentro de um invólucro SVG | `public/logo.svg` | É o logótipo da organização no schema.org e no admin. O `PLANO.md` descreve-o como "desenho vectorial a sério"; **não é** |
| B3 | **Favicons antigos e ilegíveis** — mancha verde escura, sem forma reconhecível a 32 px | `public/favicon*.png`, `.ico` | Primeiro sinal da marca num separador |
| B4 | **O lettering não está aplicado.** O nome é desenhado em Cinzel no cabeçalho, no hero, no "sobre" e no rodapé | `views/partials/header.ejs:26`, `footer.ejs` | O activo mais forte do projecto está fora do site |

Os assets já existem para resolver B4: `public/brand/*.svg`. Ver
[02](02-identidade.md).

---

## Coerência de marca

| # | O quê | Onde |
|---|---|---|
| C1 | **"Gonzaga's Gonzaga"** — sobra literal da mudança de nome, visível duas vezes na página "sobre" | `views/about.ejs:30` e `:35` |
| C2 | **O admin inteiro ainda diz "Gonzaga's Art & Shine"** — título, login, rodapé, meta, `alt` do logótipo. A Fase 1 centralizou o frontend e não o admin | `views/admin/layouts/main.ejs:7,8,10`, `admin/login.ejs:104`, `admin/partials/footer.ejs:5`, `admin/partials/sidebar.ejs:5`, `admin/pages/settings.ejs:29` |
| C3 | **O rodapé não lê `config/brand.js`** — usa `siteTitle`, o que contorna a fonte única | `views/partials/footer.ejs:62` |
| C4 | **Logótipo de teste incompatível** ainda em circulação (nó celta + serifa) | `docs/rebranding/logo-teste1-*.PNG` — arquivar, ver [02 §7](02-identidade.md#7-o-que-morre) |

---

## Língua e copy

O tom de voz definido é português europeu, próximo e elegante. O site tem
**três línguas em simultâneo**.

| # | O quê | Onde |
|---|---|---|
| L1 | `"All rights reserved."` no rodapé de todas as páginas | `views/partials/footer.ejs:62` |
| L2 | `"Return to Home"` e `"Back to Dashboard"` na página de erro | `views/error.ejs:129-130` |
| L3 | **Português do Brasil** — "A página que **você** está procurando" | `views/error/404.ejs:100` |

L3 é o mais grave dos três: não é uma falta de tradução, é a voz errada.

---

## Cor

Detalhado em [03](03-cor.md). Resumo:

- **363 literais hexadecimais**, **84 valores distintos** no CSS do frontend.
- **Sete dourados** diferentes em circulação.
- **Três paletas** em simultâneo: `--color-*` (fria, herdada), `--igp-*`
  (showcase) e a TERRA do lettering (a única desenhada com a marca nova).
- A paleta base do site é **fria** (`#05070a` tem o canal azul acima do
  vermelho). A marca define-se como "nunca fria, nunca artificial".

O `DESIGN_SYSTEM.md` fixou espaçamento, tipo, raios e camadas em Agosto —
**a cor foi a única escala que ficou por fixar**, e é onde a divergência se
concentrou.

---

## Fotografia

Detalhado em [05](05-fotografia.md). Numa página do catálogo, oito produtos,
**cinco fundos diferentes**: papel-toalha com fibras visíveis, cartolina
cinzenta, tecido, ganga azul (**cor proibida**) e fundo claro sobreexposto.

Duas das oito imagens aparecem com **barras brancas** em cima e em baixo
dentro do cartão — imagens não quadradas num contentor quadrado.

---

## Acabamento

| # | O quê | Onde |
|---|---|---|
| A1 | **Dois formatos de preço em páginas consecutivas** — `25,00 €` no cartão, `€25.00` na ficha | `views/catalog/product-detail.ejs:574,675` contra `views/partials/_productCard.ejs:43` |
| A2 | **`Peso: 0.000`** exibido sem unidade quando o campo está vazio | `views/catalog/product-detail.ejs:601` |
| A3 | **`Estilo: PAN`** — código interno exposto ao cliente | mesma tabela |
| A4 | **Botão WhatsApp em verde de plataforma** (`#25D366`), o elemento mais berrante da ficha — mais forte do que "adicionar ao carrinho", que é a acção principal | ficha de produto |
| A5 | **Página de erro com o layout partido** — rodapé a flutuar à direita, cabeçalho a meio da página, conteúdo fora da grelha | `views/error/404.ejs` |
| A6 | **Nome do produto em Cinzel a duas linhas** nos cartões, com entrelinha apertada | grelha do catálogo |

A2 e A3 são a mesma decisão por tomar: **um campo vazio ou interno não se
mostra.** A tabela de especificações deve filtrar antes de desenhar.

---

## Mobile

O questionário diz **"mobile é prioridade máxima"**.

Na captura de `/loja` a 390 px, a fila de capas de material aparece **cortada
à direita** — a segunda coluna passa para lá do viewport e os rótulos
truncam ("Pedras Natur…"). O CSS da grelha parece correcto
(`catalog-enhanced.css:1822` faz `repeat(2, minmax(0, 1fr))` abaixo de
768 px), pelo que a causa provável está no contentor e não na grelha.

**Por confirmar antes de corrigir** — a verificação está no `DESIGN_SYSTEM.md`
e é esta, a 390 px:

```js
document.scrollWidth === document.documentElement.clientWidth
```

Não estava incluída na auditoria de Agosto para esta página.

---

## O que está bem e não se mexe

Vale a pena registar, para não se perder no meio das correcções:

- **O hero da homepage.** Escuro, atmosférico, com o mote e dois CTA claros.
  É exactamente o "hero híbrido" que o questionário pede.
- **A navegação por material na loja**, com capa, contagem e estado activo.
- **A paginação por categoria na ficha** ("1.ª de 28 em Anéis - Prata") —
  raro e bom.
- **As fundações de CSS de Agosto.** Quatro breakpoints, nove degraus de
  tipo, zero literais de raio e de `z-index`. É a razão pela qual a
  consolidação de cor é agora um trabalho pequeno.
- **O caminho de migalhas e o "voltar a"** com contexto preservado.
