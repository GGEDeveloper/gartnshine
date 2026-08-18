---
slug: brand-config-fonte-unica
tipo: facto
dominio: marca
titulo: O nome da marca vive só em config/brand.js
resumo: Nenhum ficheiro fora de config/brand.js escreve o nome; mudá-lo outra vez é mudar um ficheiro. O nome antigo fica de propósito no alternateName.
keywords: brand name, single source of truth, app.locals.brand, schema.org alternateName, rebranding
valid_from: 2026-07-31
valid_to:
ingested_at: 2026-08-17T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - config/brand.js
  - app.locals.brand
  - alternateName
sources:
  - ficheiro:gonzagas_node/config/brand.js
  - migracao:project_estado_2026_07_30.md
relations:
  - config/brand.js | e_fonte_unica_de | nome-da-marca
---

Extraído de [[estado-2026-07-30]], que entretanto foi fechado. Isto não era
estado — é invariante de arquitectura, e por isso vive à parte.

A marca mudou para **Gonzaga** («Gonzaga Jewellery» no SEO e no schema.org).
Toda a identidade vive em `gonzagas_node/config/brand.js` (64 linhas),
exposta às vistas em `app.locals.brand`.

**Nenhum ficheiro fora daí escreve o nome.** Voltar a mudar a marca é mudar
um ficheiro. O checkpoint anterior à mudança está na tag
`antes-rebranding-gonzaga`.

## O nome antigo é deliberado

Fica no `alternateName` do schema.org **de propósito**, para o Google ligar as
duas identidades. É a única ocorrência no HTML servido, uma por página.
Retirar só por volta de Janeiro de 2027 (~6 meses depois) — o plano está em
`docs/rebranding/PLANO.md`.

Quem encontrar o nome antigo numa auditoria e o tomar por resíduo esquecido
está a olhar para uma decisão, não para um lapso.

## Por fazer (é trabalho de design, não de código)

`public/logo.svg`, a imagem de partilha `og-artnshine.jpg` e os ícones ainda
têm a marca antiga. Entretanto foram produzidos 8 SVG novos em
`gonzagas_node/public/brand/` — ver [[trabalho-em-curso-2026-08]] e
[[marca-gonzaga-2026-08-04]].
