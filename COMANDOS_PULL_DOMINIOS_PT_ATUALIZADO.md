# 🔧 Comandos para Pull das Alterações no dominios.pt

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

# Ver último commit atual
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

# Ver estado do remoto (deve mostrar commit: abb1c1e)
git log --oneline origin/main -5
```

### ⚡ Passo 3: Atualizar para Main Remoto
```bash
# Mudar para a branch main (se não estiver já)
git checkout main

# Resetar completamente para o origin/main atualizado
git reset --hard origin/main

# Verificar que está no commit correto (deve ser abb1c1e)
git rev-parse HEAD

# Verificar que não há diferenças
git status
```

### ✅ Passo 4: Verificação dos Arquivos Importantes
```bash
# Verificar que os arquivos de correção foram atualizados
ls -la gonzagas_node/controllers/ProductController.js
ls -la gonzagas_node/models/Product.js
ls -la gonzagas_node/views/admin/products/index.ejs
ls -la gonzagas_node/views/admin/products/product-form.ejs

# Verificar que a pasta de arquivo foi criada
ls -la _arquivo_imagens_produtos/

# Verificar que os testes e2e foram adicionados
ls -la gonzagas_node/scripts/test-e2e-*.js
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
chmod -R 755 controllers/
chmod -R 755 models/

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
# Deve mostrar: abb1c1e Merge fix/admin-products-pagination-filters into main

# Verificar que não há diferenças
git status
# Deve mostrar: nothing to commit, working tree clean

# Confirmar estrutura do projeto
ls -la gonzagas_node/views/admin/products/index.ejs
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
   - Admin Products: https://artnshine.pt/admin/products
   - Verificar que os filtros persistem ao navegar entre páginas
   - Verificar que não há paginação duplicada do DataTables
   - Verificar que o botão "Voltar" preserva filtros
   - Verificar que editar produto e voltar mantém filtros e página

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

- [ ] ✅ `git log --oneline -1` mostra: `abb1c1e Merge fix/admin-products-pagination-filters into main`
- [ ] ✅ `git status` mostra: `nothing to commit, working tree clean`
- [ ] ✅ Arquivo `gonzagas_node/views/admin/products/index.ejs` existe e foi atualizado
- [ ] ✅ Arquivo `gonzagas_node/controllers/ProductController.js` foi atualizado
- [ ] ✅ Pasta `_arquivo_imagens_produtos/` existe
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
chmod -R 755 public/ views/ controllers/ models/
cd ..

# Verificação final
git status
ls -la gonzagas_node/views/admin/products/index.ejs
```

**Depois:** Ir ao cPanel → Setup Node.js App → Run NPM Install → Restart App

---

## 📝 Notas sobre as Alterações

### Alterações Incluídas neste Pull:
- ✅ Correção de paginação e filtros na página admin/products
- ✅ Persistência de filtros ao navegar entre páginas
- ✅ Remoção de elementos de paginação do DataTables
- ✅ Correção do botão "Voltar" para preservar filtros
- ✅ Organização de imagens: arquivo de pastas antigas
- ✅ Testes e2e adicionados
- ✅ Correções nos campos `current_stock` e `max_stock_level`

### Commit Hash Esperado:
- **Commit mais recente**: `abb1c1e`
- **Mensagem**: `Merge fix/admin-products-pagination-filters into main`

