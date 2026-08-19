# Fundações de design — `design-system.css`

**Ficheiro:** `gonzagas_node/public/css/design-system.css`
**Carregado em:** `views/layouts/main.ejs`, logo a seguir a `variables.css` e
antes de todas as folhas de componente.

> **A cor não está aqui.** Esta camada fixa espaçamento, tipo, raios,
> contentores e camadas — a cor foi a única escala que ficou por fixar, e é
> hoje onde a divergência se concentra (363 literais, 84 valores distintos,
> sete dourados). A paleta e os tokens de papel estão em
> [`marca/03-cor.md`](marca/03-cor.md); as regras de marca que mandam nesta
> implementação estão em [`marca/`](marca/README.md).

---

## A regra

> **Nenhuma folha de componente inventa um valor novo.**
> Espaçamento, tamanho de letra, raio, contentor, camada e alvo de toque saem
> todos da escala. Se falta um degrau, acrescenta-se **aqui** — não se escreve
> `padding: 1.37rem` numa folha de componente.

Isto não é preferência de estilo. Sem escala, nada alinha entre páginas e
cada componente novo aumenta a divergência.

---

## Ponto de partida (2026-08-01)

| Métrica | Antes | Depois |
|---|---|---|
| Breakpoints distintos | 16 | **4** |
| Larguras de contentor | 8 | **4 tokens** |
| Tamanhos de letra | 45 valores | **9 degraus** |
| Valores de `padding` | 165 | **~34 literais** (medidas de componente) |
| `border-radius` | 18 | **5 tokens**, 0 literais |
| `z-index` | 20 valores ad-hoc (1→10000) | **escala nomeada**, 0 literais |
| `!important` (frontend) | 534 | 495 |

---

## Escalas

### Tipografia

As duas famílias que o `<head>` descarrega são **Cinzel** (display) e
**Source Sans 3** (corpo). Antes desta camada, o CSS pedia *Playfair Display*,
*Poppins* e *Georgia* — nenhuma delas carregada — pelo que o site inteiro
renderizava em fallbacks do sistema e as fontes da marca só apareciam no
header.

```css
--font-display  /* Cinzel — títulos */
--font-body     /* Source Sans 3 — corpo */
```

**Para trocar a tipografia de todo o site mudam-se estas duas linhas** (e o
`<link>` das Google Fonts em `views/layouts/main.ejs`). Os aliases
`--font-primary` / `--font-heading` existem só para as folhas antigas
continuarem a funcionar.

Escala modular fluida, base 16px, com `clamp()` para não haver saltos:

```
--text-2xs  12px    --text-lg   18→22px
--text-xs   13px    --text-xl   22→28px
--text-sm   14px    --text-2xl  26→36px
--text-base 16px    --text-3xl  32→48px
--text-md   18px    --text-4xl  40→64px
```

**12px é o piso.** Antes havia rótulos funcionais a 11px e alguns a 9px.

### Espaçamento (base 4px)

```
--space-3xs  4px    --space-lg   32px
--space-2xs  8px    --space-xl   48px
--space-xs  12px    --space-2xl  64px
--space-sm  16px    --space-3xl  96px
--space-md  24px
```

Ritmo entre secções: `--space-section` (48→96px fluido) e `--space-section-sm`.

### Contentores

```
--container-prose    42rem   /*  672px — texto corrido puro */
--container-reading  52rem   /*  832px — páginas-documento (legais) */
--container-base     75rem   /* 1200px — padrão do site */
--container-wide     87.5rem /* 1400px — galeria, grelhas largas */
--container-gutter   clamp(1rem, 4vw, 2rem)
```

A goteira é a **mesma em todo o site** — era o que fazia o header, o catálogo
e o rodapé desalinharem verticalmente entre si.

### Grelha de produtos

```
--card-min      clamp(9.5rem, 42vw, 11rem)  /* telemóvel: 2 colunas garantidas */
--card-min-md   15rem
--card-min-lg   16.5rem
--grid-gap      clamp(12px, 2vw, 24px)
```

**Para mudar a densidade da grelha mudam-se estes tokens** — não se acrescenta
outra regra. A definição única vive em `catalog-enhanced.css` e cobre
`.products-grid`, `.products-grid.grid-view` e `.catalog-grid`, porque
`views/category.ejs` usa a primeira **sem** `.grid-view`.

### Camadas (z-index)

```
--z-below   -1     --z-header   1000
--z-base     0     --z-drawer   1050
--z-layer-1  1     --z-overlay  1100
--z-layer-2  2     --z-modal    1200
--z-layer-3  3     --z-toast    1300
--z-layer-4  4
--z-raised  10
--z-sticky 100
```

`--z-layer-*` é para empilhamento **dentro** de um componente (fundo → véu →
conteúdo → controlo). Nunca para sobrepor componentes diferentes.

### Raios

`--radius-xs` 2px · `--radius-sm` 4px · `--radius-md` 8px · `--radius-lg` 16px
· `--radius-pill` 999px

---

## Breakpoints — contrato fechado

As media queries não podem ler custom properties, por isso os valores ficam
literais. Mas o conjunto é fechado. Usar **sempre** um destes:

```
(max-width:  479.98px)   xs    (min-width:  480px)   xs+
(max-width:  767.98px)   sm    (min-width:  768px)   sm+
(max-width: 1023.98px)   md    (min-width: 1024px)   md+
(max-width: 1279.98px)   lg    (min-width: 1280px)   lg+
```

As frações `.98` evitam o buraco de 1px entre `max-width: 768px` e
`min-width: 769px` em ecrãs de densidade fracionária — o padrão que existia
antes deixava layouts sem regra em larguras como 768.5px.

---

## Primitivas de layout

| Classe | O que faz |
|---|---|
| `.u-container` | Centrado, `--container-base`, goteira consistente |
| `.u-container--prose` / `--reading` / `--wide` | Variantes de largura |
| `.u-section` / `.u-section-sm` | Ritmo vertical de secção |
| `.u-stack` | Espaçamento uniforme entre filhos |
| `.u-grid-products` | Grelha de produtos com os tokens |
| `.u-measure` / `.u-prose` | Limite de medida de linha (68ch) |
| `.u-ratio-product` / `--tile` | Proporção fixa (evita CLS) |
| `.u-visually-hidden` | Só para leitores de ecrã |
| `.u-skip-link` | Salto para o conteúdo (WCAG 2.4.1) |
| `.u-tap-area` | Área de toque de 44px sem mudar o desenho |

---

## Armadilhas conhecidas

1. **`:where()` tem especificidade zero.** Serve para regras que qualquer
   componente deve poder sobrepor. Quando a regra *tem* de ganhar a uma classe
   existente (ex.: limitar `.container` numa página-documento), **não** usar
   `:where()` — o `.container` do `main.css` ganharia.

2. **`section` é um seletor de elemento perigoso.** `<section>` aparece a
   qualquer profundidade; dar-lhe padding global soma a cada nível de
   aninhamento. A regra é `main > section`, não `section`.

3. **Layout responsivo é do CSS, nunca do JS.**
   `public/js/modules/catalog-grid.js` escrevia `grid-template-columns` inline
   a partir de breakpoints próprios — um estilo inline ganha a qualquer folha
   de estilo. Foi neutralizado de propósito. Não voltar a calcular colunas em JS.

4. **Alvos de toque de 44px aplicam-se a controlos nomeados**, não a `button`
   em geral: um seletor genérico inflaciona também os botões decorativos.
   Para controlos pequenos de propósito, usar `.u-tap-area`.

5. **`small` é relativo** (0.875em) e compõe-se com o tamanho do pai. Está
   fixado num degrau da escala para não descer abaixo dos 12px.

---

## Verificação

O estado auditado (contraste WCAG AA, transbordo horizontal, CLS) está
descrito em [`DEPLOY_DESIGN_SYSTEM_CATEGORIAS.md`](DEPLOY_DESIGN_SYSTEM_CATEGORIAS.md).
Ao mexer no CSS, o mínimo a repetir é:

- **contraste** — nenhum texto abaixo de 4.5:1 (3:1 para texto grande);
- **transbordo** — `document.scrollWidth === clientWidth` em 390px e 1440px;
- **CLS** — abaixo de 0.1 em todas as páginas.
