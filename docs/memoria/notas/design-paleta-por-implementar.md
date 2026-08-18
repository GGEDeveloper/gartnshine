---
slug: design-paleta-por-implementar
tipo: estado
dominio: design
titulo: A paleta TERRA foi decidida mas não chegou ao CSS — e a que está em produção é fria
resumo: Quatro das cinco cores TERRA não existem em nenhum ficheiro CSS; o site corre com a paleta de Fevereiro, cujos neutros são azulados apesar da campanha para remover azul.
keywords: colour palette, design tokens, warm vs cool neutrals, TERRA palette, variables.css, unimplemented decision, blue tint
valid_from: 2026-08-18
valid_to:
ingested_at: 2026-08-18T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - variables.css
  - design-system.css
  - paleta TERRA
  - "#B9A06A"
  - "#C0C0C0"
sources:
  - ficheiro:gonzagas_node/public/css/variables.css
  - ficheiro:gonzagas_node/public/css/design-system.css
  - conversa:2026-08-18
relations:
  - paleta-TERRA | decidida_em | 2026-08-04
  - variables.css | define | paleta-em-producao
---

Verificado a 2026-08-18. **Há uma decisão de marca que não chegou ao código.**

## A paleta TERRA não está implementada

Das cinco cores escolhidas a 2026-08-04 ([[marca-gonzaga-2026-08-04]]), quantos
ficheiros CSS as contêm:

| Cor | Papel | Ficheiros CSS |
|---|---|---|
| `#12100E` | fundo | 1 |
| `#3A4038` | verde | **0** |
| `#6B5844` | castanho | **0** |
| `#B9A06A` | dourado | **0** |
| `#F2EDE4` | creme | **0** |

O site corre com a paleta de Fevereiro de 2026 ([[fase-4-fevereiro-2026]]),
definida em `public/css/variables.css`.

## O que está em produção é frio — medido

Diferença R−B de cada cor (positivo é quente, negativo é frio):

| Token | Valor | R−B | |
|---|---|---|---|
| `--color-secondary` | `#0b1016` | −11 | fria |
| `--color-tertiary` | `#121922` | −16 | fria |
| `--color-text-muted` | `#aab3bf` | **−21** | fria |
| `--color-primary` | `#05070a` | −5 | neutra |
| `--color-highlight` | `#C0C0C0` | 0 | neutra (prata) |

Contra a TERRA: castanho `#6B5844` dá **+39** e dourado `#B9A06A` dá **+79**.

**A ironia:** Fevereiro de 2026 teve uma campanha inteira para «remover TODOS
os azuis» — e o que ficou foram neutros azulados. Removeram-se os azuis
*saturados* (gradientes, botões, checkboxes) e ficaram os neutros de base
frios. O Brand Bible **proíbe azul** ([[marca-brand-bible]]); estes tokens não
são azul declarado, mas puxam para lá, e é isso que faz a prata «ler-se»
diferente do pretendido — o mesmo fenómeno que obrigou ao clarão frio nas
capas ([[capas-categorias-fundo-frio]]).

## Armadilha: as cores não vivem onde parece

**`design-system.css` não define paleta.** Define tipografia (`--font-display`
Cinzel, `--font-body` Source Sans 3), escalas de texto, alturas de linha e
espaçamento — 77 variáveis, e apenas três valores hexadecimais em todo o
ficheiro.

Quem for mudar cores tem de ir a **`variables.css`**, e não ao
`design-system.css`, apesar de este ser a fonte única de *escalas*
([[design-system-2026-08-01]]).

## Tensão a resolver

O Brand Bible diz que **prata e dourado têm peso equivalente**. A paleta TERRA
é quente e não tem prateado; a de produção é fria e tem `#C0C0C0` como
`--color-highlight`. As duas não podem estar ambas certas.

Decidir antes de implementar: ou a TERRA ganha um neutro prateado que conviva
com o dourado, ou o Brand Bible passa a reflectir que o dourado tem
precedência. Implementar a TERRA como está deixa a marca sem o prateado que o
próprio plano exige.
