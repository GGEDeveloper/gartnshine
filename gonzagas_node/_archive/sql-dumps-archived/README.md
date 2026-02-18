# SQL Dumps Archive

Dumps históricos de base de dados movidos da raiz do projeto.
**Arquivados em:** 2026-02-18

## 📁 Organização

### 2025-06-01-backup/
Backup automático de produção (Junho 2025).
- `gonzagas_db_backup_20250601_160053.sql` (93.5KB)

**Tipo:** Backup completo
**Data:** 01 Junho 2025, 16:00:53
**Origem:** Sistema de backup automático

### production-dumps/
Dumps gerados por scripts de criação para setup de desenvolvimento.

- `gonzagas_essential_production_dump.sql` (58.2KB) - Dados essenciais
- `gonzagas_local_complete_dump.sql` (97.3KB) - Dump completo local
- `gonzagas_local_complete_optimized.sql` (12KB) - Versão otimizada
- `gonzagas_production_dump.sql` (100.8KB) - Dump de produção
- `gonzagas_production_dump_fixed.sql` (21.4KB) - Versão corrigida
- `gonzagas_production_ready_dump.sql` (60.5KB) - Pronto para produção

**Tipo:** Dumps gerados por script
**Propósito:** Setup inicial de ambiente de desenvolvimento
**Scripts geradores:** Ver `_archive/scripts-archived/database-generation/`

---

## ⚠️ IMPORTANTE

### ❌ NÃO USAR para restore de produção

Estes dumps são **históricos** e estão **desatualizados**.

### ✅ Para backups atuais

Consultar: `gonzagas_node/backups/` (dumps recentes)

### 📊 Para estrutura DB atual

Consultar:
- `gonzagas_node/database/schema/` - Estrutura atual
- `gonzagas_node/import_essential_only.sql` - Estrutura essencial

---

## 🔍 Razão do Arquivamento

**Problemas identificados:**
1. Dumps SQL na raiz do projeto (expõe dados)
2. Versionamento Git inadequado para binários/dados
3. Torna repositório pesado
4. Confusão entre dumps históricos e atuais

**Solução:**
- Movidos para arquivo organizado
- Mantidos para referência histórica de estrutura DB
- `.gitignore` atualizado para prevenir novos dumps na raiz

## 📝 Uso Histórico

Estes dumps foram usados para:
- Sincronização inicial dev ↔ produção
- Testes de migração de estrutura
- Referência de dados de exemplo

## 🔄 Restauração

Se necessário consultar estrutura histórica:
```bash
cd _archive/sql-dumps-archived/production-dumps/
mysql -u user -p database < [ficheiro_desejado].sql
```

⚠️ **Atenção:** Apenas para consulta, não para produção!
