# Scripts Archive

Scripts de uso único (one-off) já executados com sucesso.
**Arquivados em:** 2026-02-18

## 📁 Estrutura

### database-generation/
Scripts que geraram dumps SQL para sincronização dev ↔ produção.

---

## 📄 Scripts Arquivados

### create_essential_production_dump.js
**Tamanho:** 5.3KB
**Propósito:** Gerar dump essencial de produção (estrutura + dados mínimos)
**Output:** `gonzagas_essential_production_dump.sql`
**Executado:** ~2025 Q4
**Status:** ✅ Concluído com sucesso

**Funcionalidade:**
- Exporta estrutura completa de tabelas
- Inclui apenas dados essenciais (configurações, categorias)
- Exclui dados sensíveis (passwords, tokens)
- Otimizado para setup de dev

---

### create_production_ready_dump.js
**Tamanho:** 5.0KB
**Propósito:** Gerar dump pronto para deploy em produção
**Output:** `gonzagas_production_ready_dump.sql`
**Executado:** ~2025 Q4
**Status:** ✅ Concluído com sucesso

**Funcionalidade:**
- Exporta estrutura + dados de produção
- Sanitiza dados sensíveis
- Inclui checks de integridade
- Preparado para restore em ambiente novo

---

## 🔍 Razão do Arquivamento

**Porque arquivar?**
1. ✅ Scripts já executados (outputs gerados)
2. ✅ Funcionalidade one-off (não recorrente)
3. ✅ Outputs arquivados em `_archive/sql-dumps-archived/`
4. ✅ Processo documentado para referência

**Não eliminados porque:**
- Podem servir de template para futuros scripts
- Documentam processo de geração de dumps
- Referência para entender estrutura dos dumps arquivados

---

## 📊 Outputs Gerados

Estes scripts geraram os seguintes ficheiros (agora em `_archive/sql-dumps-archived/production-dumps/`):

| Script | Output | Tamanho | Localização |
|--------|--------|---------|-------------|
| create_essential_production_dump.js | gonzagas_essential_production_dump.sql | 58.2KB | sql-dumps-archived/ |
| create_production_ready_dump.js | gonzagas_production_ready_dump.sql | 60.5KB | sql-dumps-archived/ |

---

## 🔄 Reutilização

### Se precisar gerar novo dump

**NÃO** executar estes scripts diretamente. Em vez disso:

1. **Para backup regular:** Usar sistema de backups existente
   ```bash
   # Ver scripts em database/backup/
   npm run backup:create
   ```

2. **Para dump custom:** Criar novo script baseado nestes
   ```bash
   # Copiar template
   cp _archive/scripts-archived/database-generation/create_essential_production_dump.js scripts/backup/new_dump_script.js
   
   # Adaptar para necessidades atuais
   # (estrutura DB pode ter mudado)
   ```

3. **Para sync dev ↔ prod:** Usar processo documentado
   - Ver `docs/procedures/database-sync.md`
   - Usar `import_essential_only.sql` (estrutura atual)

---

## 📝 Histórico

### Contexto Original

**Problema (2025 Q4):**
- Necessidade de sincronizar estrutura DB dev ↔ prod
- Dados de produção sensíveis
- Dumps manuais inconsistentes

**Solução:**
- Scripts automatizados de geração de dumps
- Sanitização de dados
- Dumps específicos por propósito

**Resultado:**
- ✅ Processo automatizado
- ✅ Dumps consistentes
- ✅ Setup de dev simplificado

**Evolução:**
- Scripts cumpriram propósito
- Processo agora integrado em `database/`
- Scripts originais arquivados como referência

---

## ⚠️ Avisos

### Estrutura DB pode ter mudado

Estes scripts foram escritos para estrutura DB de 2025 Q4.
Se estrutura mudou:
- ✅ Scripts podem falhar
- ✅ Usar como referência, não executar diretamente
- ✅ Consultar estrutura atual em `database/schema/`

### Dados de produção

Estes scripts acedem dados de produção.
Se reutilizar:
- ⚠️ Garantir credenciais corretas
- ⚠️ Sanitizar dados sensíveis
- ⚠️ Testar em ambiente dev primeiro

---

## 📚 Referências

- **Dumps gerados:** `_archive/sql-dumps-archived/`
- **Sistema backup atual:** `database/backup/`
- **Estrutura DB:** `database/schema/`
- **Docs de sync:** `docs/procedures/`

---

**Arquivados com:** ❤️ e documentação completa
