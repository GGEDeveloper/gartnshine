# 🔧 Comandos para Deployment no dominios.pt

## 📋 Comandos para Executar na Consola SSH do dominios.pt

### ⚠️ IMPORTANTE: Backup Antes de Prosseguir
```bash
# 1. Fazer backup do estado atual (opcional mas recomendado)
cd /home/artnshin/artnshine.pt
cp -r gonzagas_node gonzagas_node_backup_$(date +%Y%m%d_%H%M%S)
```

### 🔄 Passo 1: Navegar para a RAIZ do Repositório Git
```bash
# ⚠️ IMPORTANTE: O repositório git está na RAIZ, não dentro de gonzagas_node
cd /home/artnshin/artnshine.pt
```

### 🔍 Passo 2: Verificar Estado Atual
```bash
# Ver em que branch está
git branch

# Ver último commit
git log --oneline -5

# Ver status
git status

# Verificar estrutura (deve mostrar gonzagas_node/)
ls -la
```

### 🔄 Passo 3: Atualizar do Repositório Remoto
```bash
# Fazer fetch do repositório remoto
git fetch origin

# Ver diferenças entre local e remoto
git log --oneline HEAD..origin/main

# Ver estado do remoto
git log --oneline origin/main -5
```

### ⚡ Passo 4: Resetar para o Main Remoto Atualizado
```bash
# Mudar para a branch main (se não estiver já)
git checkout main

# Resetar completamente para o origin/main atualizado
git reset --hard origin/main

# Verificar que está correto
git log --oneline -5
```

### ✅ Passo 5: Verificação Final
```bash
# Confirmar que está no commit correto (deve ser fbc1c3e ou mais recente)
git rev-parse HEAD

# Verificar que não há diferenças
git status

# Verificar estrutura do projeto
ls -la gonzagas_node/

# Verificar arquivos importantes dentro de gonzagas_node
ls -la gonzagas_node/views/admin/products/index.ejs
ls -la gonzagas_node/views/admin/layouts/main.ejs
```

### 🔧 Passo 6: Limpar e Preparar para Deployment
```bash
# Navegar para dentro de gonzagas_node para limpeza
cd gonzagas_node

# Remover node_modules (CloudLinux requirement)
rm -rf node_modules

# Verificar permissões
chmod 755 server.js
chmod -R 755 public/
chmod -R 755 views/

# Voltar para a raiz
cd ..
```

### 📝 Passo 7: Verificar Variáveis de Ambiente
```bash
# Verificar se .env existe dentro de gonzagas_node e tem as configurações corretas
cd gonzagas_node
cat .env | grep -E "NODE_ENV|PORT|DB_|SESSION_SECRET" || echo "⚠️ .env não encontrado ou incompleto"
cd ..
```

---

## 🚀 Alternativa: Se Precisar Forçar Reset Completo

Se o passo 4 não funcionar e precisar forçar completamente:

```bash
# ⚠️ CUIDADO: Este comando descarta TODAS as mudanças locais
cd /home/artnshin/artnshine.pt

# Fazer backup primeiro
cp -r gonzagas_node gonzagas_node_backup_$(date +%Y%m%d_%H%M%S)

# Resetar completamente (na RAIZ do repositório)
git fetch origin
git checkout main
git reset --hard origin/main
git clean -fd

# Verificar
git log --oneline -3
```

---

## 📋 Checklist de Verificação

Após executar os comandos, verificar:

- [ ] ✅ `git log --oneline -1` mostra: `898f242 docs: add deployment validation report`
- [ ] ✅ `git status` mostra: `nothing to commit, working tree clean`
- [ ] ✅ Arquivo `views/admin/products/index.ejs` contém referências a GLightbox
- [ ] ✅ Arquivo `views/admin/layouts/main.ejs` contém links para GLightbox CSS/JS
- [ ] ✅ `node_modules` foi removido (será recriado como symlink pelo cPanel)

---

## 🔄 Após Reset: Configuração no cPanel

Depois de executar os comandos acima:

1. **cPanel → Setup Node.js App**
2. Clicar **"Run NPM Install"** (cria symlink CloudLinux)
3. Verificar variáveis de ambiente (.env)
4. Clicar **"Start App"**
5. Testar: https://artnshine.pt/admin/products (verificar zoom de imagens)

---

## ⚠️ Se Algo Der Errado

### Restaurar Backup:
```bash
cd /home/artnshin/artnshine.pt
rm -rf gonzagas_node
mv gonzagas_node_backup_YYYYMMDD_HHMMSS gonzagas_node
```

### Ver Logs:
```bash
# Ver logs do Node.js no cPanel ou via SSH:
tail -f /home/artnshin/logs/nodejs.log
```

---

## 📞 Comandos de Emergência

### Verificar se App Está Rodando:
```bash
ps aux | grep node
```

### Parar App Manualmente (se necessário):
```bash
pkill -f "node.*server.js"
```

### Reiniciar via cPanel:
- cPanel → Setup Node.js App → Stop App → Start App

