---
slug: db-dev-vs-production
tipo: decisao
dominio: bd
titulo: artnshine.pt (gonzagas_node) — DB local de dev difere do schema real em produção no servidor waphix
resumo: Um INSERT em `customers` com uma coluna que só existe em local rebentou em produção. Na dúvida ganha a versão que já lá está, não a local.
valid_from: 2026-06-23
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - waphix
sources:
  - migracao:project_db_dev_vs_production.md
---

A base de dados local de desenvolvimento (WSL, pc-dev) **não tem o mesmo schema** que a base de dados real de produção no servidor de deployment "waphix". Já causou um bug real: um INSERT em `customers` incluía uma coluna `name` que existe na BD de dev local mas não existe na BD de produção, causando erro em produção (corrigido no commit `c601d3e fix(production): remover campo name do INSERT customers`).

**Why:** o utilizador alertou explicitamente que a BD de produção (waphix) é a que importa e exige cuidado redobrado — schema pode ter divergido da BD local ao longo do tempo (migrations corridas em momentos diferentes, alterações manuais, etc.).

**How to apply:** antes de escrever ou alterar queries SQL (INSERT/UPDATE/ALTER) no módulo `gonzagas_node/modules/ecommerce/` ou em qualquer controller que toque na tabela `customers` (ou outras tabelas alteradas por migrations recentes), não assumir que o schema local reflete produção. Quando há dúvida ou um merge traz versões conflitantes de queries SQL, preferir a versão que já está em produção/`origin/main` (commits com prefixo `fix(production):`), pois normalmente reflecte uma correção já validada contra a BD real do waphix. Ver também [[git-divergence-2026-06-23]].
