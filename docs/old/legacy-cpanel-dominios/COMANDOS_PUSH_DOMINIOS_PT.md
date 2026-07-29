# 🔧 Comandos para Push das Alterações no dominios.pt

## 📋 Comandos para Executar na Consola SSH do dominios.pt

### ⚠️ IMPORTANTE: Backup Antes de Prosseguir
```bash
# 1. Fazer backup do estado atual (recomendado)
cd /home/artnshin/artnshine.pt
cp -r gonzagas_node gonzagas_node_backup_$(date +%Y%m%d_%H%M%S)
```

### 🔍 Passo 1: Verificar Estado Atual
```bash
# Navegar para a RAIZ do repositório git
cd /home/artnshin/artnshine.pt

# Ver em que branch está
git branch

# Ver último commit
git log --oneline -5

# Ver status
git status
```

### 🔄 Passo 2: Atualizar do Repositório Remoto
```bash
# Fazer fetch do repositório remoto
git fetch origin

# Ver diferenças entre local e remoto
git log --oneline HEAD..origin/main

# Ver estado do remoto (deve mostrar commit: 73b380f)
git log --oneline origin/main -5
```

### ⚡ Passo 3: Atualizar para Main Remoto
```bash
# Mudar para a branch main (se não estiver já)
git checkout main

# Resetar completamente para o origin/main atualizado
git reset --hard origin/main

# Limpar arquivos não rastreados (opcional, cuidado!)
# git clean -fd

# Verificar que está no commit correto (deve ser 73b380f)
git rev-parse HEAD

# Verificar que não há diferenças
git status
```

### ✅ Passo 4: Verificação dos Arquivos Importantes
```bash
# Verificar que o novo partial foi criado
ls -la gonzagas_node/views/partials/_productCardHomepage.ejs

# Verificar que o index.ejs foi atualizado
ls -la gonzagas_node/views/index.ejs

# Verificar estrutura do projeto
ls -la gonzagas_node/views/partials/
```

### 🔧 Passo 5: Preparar para Deployment (CloudLinux)
```bash
# Navegar para dentro de gonzagas_node
cd gonzagas_node

# Remover node_modules (CloudLinux requirement - será recriado como symlink)
rm -rf node_modules

# Verificar permissões
chmod 755 server.js
chmod -R 755 public/
chmod -R 755 views/

# Voltar para a raiz
cd ..
```

### 📝 Passo 6: Verificar Variáveis de Ambiente
```bash
# Verificar se .env existe e tem as configurações corretas
cd gonzagas_node
cat .env | grep -E "NODE_ENV|PORT|DB_|SESSION_SECRET" || echo "⚠️ .env não encontrado ou incompleto"
cd ..
```

### ✅ Passo 7: Verificação Final
```bash
# Confirmar que está no commit correto
git log --oneline -1
# Deve mostrar: 73b380f feat: aplicar sistema modular de product cards na homepage

# Verificar que não há diferenças
git status
# Deve mostrar: nothing to commit, working tree clean

# Confirmar estrutura do projeto
ls -la gonzagas_node/views/partials/_productCardHomepage.ejs
# Deve existir o arquivo
```

---

## 🔄 Após Executar os Comandos: Configuração no cPanel

Depois de executar os comandos acima:

1. **cPanel → Setup Node.js App**
   - Selecionar a aplicação do artnshine.pt
   - Clicar **"Run NPM Install"** (cria symlink CloudLinux)
   - Verificar variáveis de ambiente (.env)
   - Clicar **"Restart App"** ou **"Start App"**

2. **Testar as alterações:**
   - Homepage: https://artnshine.pt/
   - Verificar que os product cards estão usando o sistema modular
   - Verificar que não há badge "Novo" nos product cards da homepage
   - Verificar que as imagens estão com aspect ratio correto (quadrado)
   - Catalog: https://artnshine.pt/catalog
   - Verificar que o catalog continua funcionando normalmente

---

## 🚨 Comandos de Emergência

### Se Algo Der Errado - Restaurar Backup:
```bash
cd /home/artnshin/artnshine.pt
rm -rf gonzagas_node
mv gonzagas_node_backup_YYYYMMDD_HHMMSS gonzagas_node
# Depois reiniciar app no cPanel
```

### Verificar se App Está Rodando:
```bash
ps aux | grep node
```

### Ver Logs:
```bash
# Ver logs do Node.js no cPanel ou via SSH:
tail -f /home/artnshin/logs/nodejs.log
```

### Parar App Manualmente (se necessário):
```bash
pkill -f "node.*server.js"
```

### Reiniciar via cPanel:
- cPanel → Setup Node.js App → Stop App → Start App

---

## 📋 Checklist de Verificação

Após executar os comandos, verificar:

- [ ] ✅ `git log --oneline -1` mostra: `73b380f feat: aplicar sistema modular de product cards na homepage`
- [ ] ✅ `git status` mostra: `nothing to commit, working tree clean`
- [ ] ✅ Arquivo `gonzagas_node/views/partials/_productCardHomepage.ejs` existe
- [ ] ✅ Arquivo `gonzagas_node/views/index.ejs` foi atualizado
- [ ] ✅ `node_modules` foi removido (será recriado como symlink pelo cPanel)
- [ ] ✅ Permissões dos arquivos estão corretas (755)
- [ ] ✅ App foi reiniciado no cPanel após "Run NPM Install"

---

## 🎯 Resumo dos Comandos Principais (Copy & Paste)

```bash
# Backup (opcional mas recomendado)
cd /home/artnshin/artnshine.pt
cp -r gonzagas_node gonzagas_node_backup_$(date +%Y%m%d_%H%M%S)

# Atualizar do repositório
git fetch origin
git checkout main
git reset --hard origin/main

# Verificar commit
git log --oneline -1

# Preparar deployment (CloudLinux)
cd gonzagas_node
rm -rf node_modules
chmod 755 server.js
chmod -R 755 public/ views/
cd ..

# Verificação final
git status
ls -la gonzagas_node/views/partials/_productCardHomepage.ejs
```

**Depois:** Ir ao cPanel → Setup Node.js App → Run NPM Install → Restart App

