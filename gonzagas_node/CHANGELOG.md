# Changelog - Gonzaga's Art & Shine

Todas as mudanças notáveis neste projeto serão documentadas neste ficheiro.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [Fase 4] - 2026-02-18

### 🗂️ Arquivamento e Limpeza de Código

#### ✅ Ficheiros Organizados (25 ficheiros)

**Testes arquivados** → `_archive/tests-archived/`
- 10 ficheiros de teste one-off movidos
- Estrutura: admin-testing/, navigation-testing/, misc-testing/
- Ficheiros: test-admin-layout.js, test-admin-margin-fix.js, test-admin-mobile-solution.js, test-definitive-fix.js, test-final-navigation-fix.js, test-navigation-fix.js, test-mobile-and-catalog.js, test-frontend-styles.js, test-local.js, test_port.js

**SQL Dumps arquivados** → `_archive/sql-dumps-archived/`
- 7 dumps SQL históricos organizados
- Estrutura: 2025-06-01-backup/, production-dumps/
- Dumps: gonzagas_db_backup_20250601_160053.sql, gonzagas_essential_production_dump.sql, gonzagas_local_complete_dump.sql, gonzagas_local_complete_optimized.sql, gonzagas_production_dump.sql, gonzagas_production_dump_fixed.sql, gonzagas_production_ready_dump.sql

**JavaScript deprecated** → `_archive/js-deprecated/`
- 3 ficheiros JS obsoletos arquivados
- Estrutura: admin-versions/, debug-tools/, mobile-fixes-old/
- Ficheiros: admin.old.js, debug-navigation.js, admin-mobile-fix.js

**Scripts one-off** → `_archive/scripts-archived/`
- 2 scripts de geração de dumps arquivados
- Estrutura: database-generation/
- Scripts: create_essential_production_dump.js, create_production_ready_dump.js

**Documentação reorganizada**
- 3 docs movidos para `docs/features/`, `docs/procedures/`, `docs/deployment/`
- 1 HTML de teste arquivado em `_archive/docs-archived/testing/`
- Docs: README_hide_catalog_prices.md → docs/features/hide-catalog-prices.md, deploy-files.md → docs/deployment/files-checklist.md, TESTE_NOTIFICACOES.html → _archive/docs-archived/testing/

#### 📚 Documentação Criada

**7 READMEs explicativos** adicionados:
- `_archive/tests-archived/README.md` - Contexto histórico dos testes
- `_archive/sql-dumps-archived/README.md` - Documentação de dumps SQL
- `_archive/js-deprecated/README.md` - Histórico de JS obsoleto
- `_archive/scripts-archived/README.md` - Scripts one-off executados
- `_archive/docs-archived/README.md` - Docs e testes arquivados
- `docs/features/README.md` - Índice de funcionalidades
- `docs/procedures/README.md` - Processos operacionais
- `docs/deployment/README.md` - Documentação de deploy consolidada

#### 🛠️ Ferramentas

**Script de arquivamento criado**: `fase4-arquivamento.sh`
- Move 29 ficheiros automaticamente com `git mv`
- Preserva histórico Git
- Validações e mensagens detalhadas
- Contadores e resumo final
- Fix aplicado: `((moved_count++))` → `moved_count=$((moved_count+1))` para compatibilidade com `set -e`

#### 🔧 Infraestrutura

**`.gitignore` completo adicionado**
- Previne SQL dumps na raiz
- Bloqueia ficheiros de teste temporários (test-*.js, test_*.js)
- Ignora backups (*.backup, *.old, *.bak)
- Protege credenciais (.env, *.pem, *.key)
- Exclui logs e cache
- Mantém versionado: estrutura SQL essencial, migrations, configs exemplo, _archive

#### 📊 Impacto

**Métricas**:
- ~600KB limpos da raiz do projeto
- 25 ficheiros movidos (4 não existiam neste branch)
- 7 READMEs criados (~15KB de documentação)
- Zero eliminações - tudo preservado
- Git history mantido com `git mv`

**Estrutura final**:
```
gonzagas_node/
├── _archive/
│   ├── tests-archived/       (10 ficheiros + README)
│   ├── sql-dumps-archived/   (7 ficheiros + README)
│   ├── js-deprecated/        (3 ficheiros + README)
│   ├── scripts-archived/     (2 ficheiros + README)
│   └── docs-archived/        (1 ficheiro + README)
├── docs/
│   ├── features/             (1 doc + README)
│   ├── procedures/           (README)
│   └── deployment/           (1 doc + README)
└── (raiz limpa e organizada)
```

#### 🔄 Reversibilidade

**Completa**:
- Todos ficheiros preservados em `_archive/`
- Git history completo via `git mv`
- READMEs documentam contexto histórico
- Commits anteriores a 2026-02-18 mantêm ficheiros originais

#### 🎯 Filosofia

**"Preservar tudo, organizar melhor"**
- Zero eliminações
- Máxima documentação
- Histórico preservado
- Estrutura clara e navegável

---

## [Fase 3] - 2026-02-17

### 🗂️ Arquivamento de CSS e Views Deprecated

#### Arquivados

**CSS deprecated** → `_archive/css-deprecated/`
- Ficheiros antigos de estilos não mais utilizados
- Mantidos para referência histórica

**Views deprecated** → `_archive/views-deprecated/`
- Templates EJS antigos
- Backups de views substituídas

#### Documentação

**READMEs criados**:
- Contexto de cada arquivo
- Razões do arquivamento
- Instruções de reversão

---

## [Fases anteriores]

### Fases 1-2
- Planeamento e estruturação inicial
- Setup de ambiente de desenvolvimento
- Configuração de base de dados
- Implementação de features core

---

## Notas

### Sobre Arquivamento

Todos os ficheiros arquivados em `_archive/`:
- **Não são eliminados** - preservação total
- **Git history mantido** - rastreabilidade completa  
- **Documentados** - cada pasta tem README explicativo
- **Reversíveis** - podem ser restaurados se necessário

### Sobre Versionamento

Este projeto segue:
- **Commits semânticos** - prefixos emoji + mensagens claras
- **Branches feature** - desenvolvimento isolado
- **Documentação inline** - decisões explicadas no código
- **Histórico preservado** - git mv para movimentos

---

**Mantido por:** Equipa Gonzaga's Art & Shine
**Última atualização:** 2026-02-18
