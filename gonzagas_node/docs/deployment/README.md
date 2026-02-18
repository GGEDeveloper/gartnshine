# Deployment Documentation

Documentação consolidada de deployment e deploy.
**Criado em:** 2026-02-18

## 📋 Índice de Documentação

### 📦 Ficheiros de Deployment

#### files-checklist.md
Checklist de ficheiros necessários para deploy em produção.

**Conteúdo:**
- Lista completa de ficheiros/pastas para deploy
- Ficheiros que NÃO devem ir para produção
- Validações pré-deploy
- Estrutura mínima necessária

**Documentação:** [files-checklist.md](./files-checklist.md)

---

### 📚 Documentação Existente na Raiz

Esta pasta **complementa** (não substitui) a documentação existente:

#### ../DEPLOYMENT.md (raiz)
**Conteúdo:**
- Visão geral do processo de deployment
- Configuração inicial
- Troubleshooting geral
- Links para docs específicas

**Status:** ✅ Mantido na raiz (ficheiro principal)
**Tipo:** Índice e overview

#### ../DEPLOY_CPANEL.md (raiz)
**Conteúdo:**
- Processo específico para cPanel
- Configurações Dominios.pt
- Git deployment no cPanel
- Node.js setup em shared hosting

**Status:** ✅ Mantido na raiz
**Tipo:** Guia específico cPanel

#### ../PRODUCTION_SETUP.md (raiz)
**Conteúdo:**
- Setup inicial de ambiente produção
- Configurações de servidor
- Variáveis de ambiente
- Otimizações de performance

**Status:** ✅ Mantido na raiz
**Tipo:** Setup detalhado

---

## 🗂️ Organização da Documentação

### Raiz vs docs/deployment/

**Mantidos na RAIZ:**
- `DEPLOYMENT.md` - **Índice principal** e overview
- `DEPLOY_CPANEL.md` - Guia específico plataforma
- `PRODUCTION_SETUP.md` - Setup detalhado servidor

**Razão:** Documentos principais devem estar visíveis na raiz do projeto.

**Em docs/deployment/:**
- `files-checklist.md` - Checklist técnico
- Futuros docs de processos específicos
- Scripts e automações de deploy

**Razão:** Detalhes técnicos e ferramentas auxiliares.

---

## 🚀 Processo de Deployment

### Workflow Geral

```
1. Desenvolvimento Local
   └─> Branch: feature/*

2. Testing
   └─> Branch: develop/main
   └─> Validações locais

3. Pre-Deploy Checklist
   └─> Consultar: files-checklist.md
   └─> Validar: DEPLOYMENT.md

4. Deploy para Produção
   └─> Seguir: DEPLOY_CPANEL.md
   └─> Setup: PRODUCTION_SETUP.md

5. Validação Pós-Deploy
   └─> Testes em produção
   └─> Monitoramento
```

### Documentos por Fase

| Fase | Documento | Localização |
|------|-----------|-------------|
| **Planning** | DEPLOYMENT.md | Raiz |
| **Preparation** | files-checklist.md | docs/deployment/ |
| **Execution** | DEPLOY_CPANEL.md | Raiz |
| **Setup** | PRODUCTION_SETUP.md | Raiz |
| **Validation** | DEPLOYMENT.md | Raiz |

---

## 📝 Quick Reference

### Deploy Rápido (Produção)

```bash
# 1. Validar branch
git status
git branch

# 2. Consultar checklist
cat docs/deployment/files-checklist.md

# 3. Push para produção
git push production main

# 4. Verificar deployment (cPanel)
# Seguir DEPLOY_CPANEL.md
```

### Rollback Rápido

```bash
# 1. Reverter commit
git revert HEAD
git push production main

# 2. Ou deploy de commit anterior
git push production [commit-hash]:main --force

# 3. Validar em produção
```

---

## ⚠️ Avisos Importantes

### Antes de Deploy

- [ ] **Backup de DB** realizado
- [ ] **Testes locais** passando
- [ ] **Files checklist** verificado
- [ ] **Variáveis de ambiente** configuradas
- [ ] **Notificar equipa** sobre deploy

### Durante Deploy

- ⚠️ **Não interromper** processo de deployment
- ⚠️ **Monitorar logs** em tempo real
- ⚠️ **Validar** cada etapa antes de continuar

### Após Deploy

- ✅ **Testar funcionalidades** críticas
- ✅ **Verificar logs** de erro
- ✅ **Monitorar performance**
- ✅ **Confirmar** com equipa

---

## 🔧 Ferramentas e Scripts

### Scripts Disponíveis

```json
// Em package.json
{
  "scripts": {
    "deploy:check": "node scripts/pre-deploy-check.js",
    "deploy:backup": "node scripts/backup-before-deploy.js",
    "deploy:validate": "node scripts/validate-deployment.js"
  }
}
```

### Automações Futuras

(Esta secção será expandida com scripts de automação)

---

## 🆘 Troubleshooting

### Problemas Comuns

**Deploy falha no cPanel:**
- Consultar: `DEPLOY_CPANEL.md` > Troubleshooting
- Verificar: Logs em `logs/deploy/`

**Node.js não inicia:**
- Consultar: `PRODUCTION_SETUP.md` > Node Setup
- Verificar: `.htaccess` e configurações cPanel

**Ficheiros em falta:**
- Consultar: `files-checklist.md`
- Verificar: `.gitignore` não está bloqueando ficheiros necessários

---

## 📞 Suporte

### Recursos

- 📖 **Documentação Principal:** `DEPLOYMENT.md` (raiz)
- 🔧 **Setup Servidor:** `PRODUCTION_SETUP.md` (raiz)
- 🖥️ **cPanel Specific:** `DEPLOY_CPANEL.md` (raiz)
- ✅ **Checklist:** `docs/deployment/files-checklist.md`

### Contactos

(Adicionar contactos de suporte técnico)

---

**Mantido por:** Equipa DevOps Gonzaga's
**Última atualização:** 2026-02-18
**Plataforma:** Dominios.pt (cPanel + Node.js)
