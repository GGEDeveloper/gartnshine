# Procedures Documentation

Procedimentos e processos operacionais do sistema.
**Criado em:** 2026-02-18

## 📋 Índice de Procedimentos

### 📦 catalog-validation.md
Processo manual de validação de catálogo de produtos.

**Objetivo:**
- Garantir integridade de dados de produtos
- Validar imagens e metadados
- Verificar consistência de preços
- Validar stock e disponibilidade

**Quando usar:**
- Após importação em massa de produtos
- Antes de deploy de grandes atualizações
- Manutenção trimestral de catálogo
- Auditoria de dados

**Documentação:** [catalog-validation.md](./catalog-validation.md)

---

## 📚 Tipos de Procedimentos

### 🔄 Procedimentos Recorrentes
Processos que devem ser executados regularmente:
- Validação de catálogo (mensal)
- Backup de base de dados (diário - automatizado)
- Auditoria de imagens (trimestral)

### 🚨 Procedimentos de Emergência
Processos para situações críticas:
- Restore de backup
- Rollback de deployment
- Recuperação de dados

### 🛠️ Procedimentos de Manutenção
Processos de manutenção preventiva:
- Limpeza de cache
- Otimização de imagens
- Atualização de dependências

---

## 📝 Como Usar Esta Secção

### Para Operadores

Cada procedimento documenta:
- ✅ **Pré-requisitos** - O que precisa antes de começar
- 📋 **Passos detalhados** - Instruções passo-a-passo
- ⚠️ **Avisos importantes** - Pontos de atenção
- ✔️ **Validação** - Como confirmar sucesso
- 🐛 **Troubleshooting** - Problemas comuns e soluções

### Frequência Recomendada

| Procedimento | Frequência | Automático |
|--------------|------------|------------|
| Validação Catálogo | Mensal | ❌ Manual |
| Backup DB | Diário | ✅ Auto |
| Auditoria Imagens | Trimestral | ❌ Manual |
| Limpeza Cache | Semanal | ✅ Auto |

---

## 🆕 Adicionar Novo Procedimento

Ao documentar novo processo:

1. **Criar ficheiro**
   ```bash
   touch docs/procedures/nome-do-processo.md
   ```

2. **Template sugerido**
   ```markdown
   # Nome do Procedimento
   
   ## Objetivo
   [Para que serve]
   
   ## Pré-requisitos
   - [ ] Item 1
   - [ ] Item 2
   
   ## Passos
   1. Passo 1
   2. Passo 2
   
   ## Validação
   Como confirmar que deu certo
   
   ## Troubleshooting
   Problemas comuns
   
   ## Reversão
   Como desfazer se necessário
   ```

3. **Atualizar este README**
   - Adicionar no índice
   - Incluir na tabela de frequência
   - Documentar se é manual ou automático

---

## 🔐 Níveis de Acesso

Alguns procedimentos requerem permissões específicas:

- 👤 **Operador** - Acesso padrão admin
- 🔧 **Técnico** - Acesso a servidor/DB
- 👑 **Admin Senior** - Acesso root/produção

Cada procedimento especifica nível necessário.

---

## 📊 Logs e Auditoria

Ao executar procedimentos:
- ✅ Registar início e fim no sistema
- ✅ Documentar problemas encontrados
- ✅ Manter log de alterações
- ✅ Notificar equipa se relevante

---

## 📞 Suporte

Para dúvidas sobre procedimentos:
1. Consultar documentação do procedimento
2. Verificar troubleshooting
3. Contactar equipa técnica se persistir

---

**Mantido por:** Equipa de Operações Gonzaga's
**Última atualização:** 2026-02-18
