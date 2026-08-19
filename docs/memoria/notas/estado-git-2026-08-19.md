---
slug: estado-git-2026-08-19
tipo: estado
dominio: infra
titulo: Estado a 2026-08-19 — tudo commitado no ramo `memoria`, e o que continua por decidir
resumo: As dez frentes que estavam fora do git entraram; sobra a branch `claude/zen-mcnulty-044d6c` por decidir e três worktrees por limpar.
keywords: repository state, committed, pending branch, stale worktree, branch topology, permanent fork
valid_from: 2026-08-19
valid_to:
ingested_at: 2026-08-19T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - claude/zen-mcnulty-044d6c
  - memoria
  - temporario-nova-media
sources:
  - conversa:2026-08-19
  - ficheiro:.gitignore
---

Sucede [[trabalho-em-curso-2026-08]], que descrevia dez frentes fora do git.
**Já não há nenhuma:** a árvore está limpa e tudo vive no ramo permanente
`memoria`, publicado em `origin/memoria`. Ver [[fork-memoria-permanente]].

## O que entrou a 2026-08-19

Sete commits: o motor da memória, a interface web, as notas, a camada que faz
os agentes encontrarem a memória, o trabalho de marca que estava por guardar
(lettering no cabeçalho, capas de categoria, documentos de marca), e os
262 MB de fotografia que o site serve.

Também entraram, e estavam nomeados como pendentes na nota anterior:
`docs/hipoteses-prata/`, os PDFs das capas, `branding-desing/`, os 8 SVG de
`gonzagas_node/public/brand/` e `docs/SEO/`.

## O que continua por decidir

**`claude/zen-mcnulty-044d6c` — 7 commits, parados desde 2026-06-26.**
Continua por integrar e por decidir: correcções do header em ecrãs pequenos,
a consolidação do CSS do header mobile, e a escolha da imagem do Hero no
admin. **Atenção:** o trabalho de marca commitado agora mexe no mesmo
território — `views/partials/header.ejs` e `public/css/header.css` — portanto
integrar essa branch vai dar conflito, e é conflito a sério e não textual.

**Três worktrees por limpar** em `.claude/worktrees/`
(`artnshine-repo-audit-89de08`, `brave-satoshi-f74ba9`,
`product-inventory-naming-bccc89`): não têm nada por integrar, ocupam espaço e
duplicam os markdown do repositório. Foi por isso que uma contagem deu 3099
ficheiros `.md` quando os reais são cerca de 60 — qualquer varrimento de
documentação tem de as excluir.

**O `.git` pesa 1,3 GB.** Os 2,59 GB da bancada da fotografia ficaram de fora
de propósito.
