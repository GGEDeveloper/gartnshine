---
slug: marca-gonzaga-2026-08-04
tipo: decisao
dominio: marca
titulo: Base de marca criada em docs/marca/; lettering proprietário extraído de HTML para SVG; paleta TERRA escolhida contra a p
resumo: O lettering existe como SVG vetorial real, escondido dentro de um `.dc.html` com 41 blocos. A paleta TERRA foi escolhida contra a fria herdada, e o ouro reprova o contraste sobre fundo claro.
valid_from: 2026-08-04
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - views/error/404.ejs
sources:
  - migracao:project_marca_gonzaga_2026_08_04.md
---

A 2026-08-04 criou-se `docs/marca/` (README + 01 plataforma, 02 identidade,
03 cor, 04 tipografia, 05 fotografia, 06 auditoria do site, 07 roteiro) e
extraíram-se 8 assets para `gonzagas_node/public/brand/*.svg`.

**O que não é óbvio e custa a redescobrir:**

- O lettering da marca **existe como SVG vetorial real**, escondido dentro de
  `branding-desing/nome-e-lettering/Gonzaga Lettering.dc.html` (41 blocos
  `<svg>`, paths `Q`, stroke `#f2ede4`). Não é imagem. A extração faz-se por
  posição do bloco — os blocos são progressivos (versões "antes"/"depois"),
  por isso **o índice importa**: 0 = wordmark fio único, 20 = lockup numa
  linha, 21 = peso de gravação 20u, 28 = versão reduzida, 29/30/31 =
  monograma G / losango / selo.
- **Todas as versões do wordmark já têm o kerning final** (translates 12, 226,
  426, 609, 799, 1029, 1259). O que varia entre blocos é só `stroke-width`.
- A travessa do A está em **y=202 no fio único e y=214 só no peso 20u** — é
  compensação óptica, não inconsistência. Por isso são ficheiros separados.
- O **lockup empilhado não está especificado**. A fonte mostra as duas
  palavras em coluna mas com escalas e traços independentes (498px vs 240px,
  gap 34px) — é figura de documento, não lockup desenhado. Não foi gerado
  ficheiro de propósito. Ver [[design-system-2026-08-01]].

**Decisões tomadas (recomendadas por mim, o utilizador ainda não confirmou):**

- **Paleta TERRA** (`#12100E #3A4038 #6B5844 #B9A06A #C8C6C1 #F2EDE4`) contra
  a `--color-*` fria herdada (`#05070a` tem o azul acima do vermelho). Ouro
  sobre preto-terra dá 7.50:1; **ouro sobre claro dá 2.17:1 e reprova** —
  em superfície clara o acento é o preto, não o ouro.
- O logótipo de teste do **nó celta** (`docs/rebranding/logo-teste1-*.PNG`)
  fica arquivado — incompatível com o lettering.
- **Cinzel fica em observação**, não morre já: só se avalia depois de o
  lettering estar aplicado no site.

**Armadilha de auditoria:** `views/error/404.ejs` tem o layout partido e o
site tem 3 línguas (PT, EN, pt-BR). O `/sobre` dá 404 mas isso é normal — o
header aponta para `/about`. Ver [[conta-obrigatoria-checkout]].
