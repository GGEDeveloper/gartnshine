---
slug: git-divergence-2026-06-23
tipo: facto
dominio: infra
titulo: artnshine.pt — branch local divergiu de origin/main com hotfixes de produção; merge feito em 2026-06-23
resumo: artnshine.pt — branch local divergiu de origin/main com hotfixes de produção; merge feito em 2026-06-23
valid_from: 2026-06-23
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - productImageProcessor.js
  - waphix
sources:
  - migracao:project_git_divergence_2026_06_23.md
---

Em 2026-06-23, a branch de trabalho local (`claude/brave-satoshi-f74ba9`, 24 commits ahead) tinha divergido de `origin/main` (6 commits ahead), que continha hotfixes de produção aplicados directamente para o deploy no waphix: fix no INSERT de `customers` (coluna `name` inexistente em produção — ver [[project-db-dev-vs-production]]), fix de header mobile cortado + debug OAuth, dependência sequelize, UX da tabela de produtos no admin (margens, filtros persistentes, drawer mobile).

Fiz merge de `origin/main` para a branch local, resolvendo conflitos manualmente: para fixes de produção (`layout: false` em páginas de erro, normalização de checkboxes, remoção de `prompt: select_account` no Google OAuth mobile, logs de debug OAuth) usei a versão de `origin/main`. Para a correção de rotação EXIF em `productImageProcessor.js` (mais recente, só existia localmente) mantive a versão local. Commit de merge: `fa31c1d`.

**Why:** havia trabalho de produção feito directamente (ou aplicado via outra sessão) que não tinha sido integrado na branch de desenvolvimento local, criando risco de a próxima sessão sobrescrever fixes críticos de produção ao fazer push/merge.

**How to apply:** antes de assumir que `origin/main` está sincronizado com o trabalho local, correr `git log --oneline HEAD..origin/main` para detectar hotfixes de produção não integrados. Hotfixes com prefixo `fix(production):` são feitos directamente contra o ambiente waphix e têm prioridade sobre versões locais equivalentes em caso de conflito.
