# 🚀 Comandos de Deployment - Servidor dominios.pt

## 📋 Comandos Rápidos para Deployment

### 1. **Conectar ao Servidor**

```bash
ssh artnshin@cpanel159.dominios.pt
```

### 2. **Procedimento Completo de Atualização**

```bash
# Navegar para o diretório do projeto
cd /home/artnshin/artnshine.pt

# Criar backup (RECOMENDADO)
cp -r gonzagas_node gonzagas_node_backup_$(date +%Y%m%d_%H%M%S)

# Descartar todas as alterações locais (IMPORTANTE)
git checkout -- .

# Atualizar repositório
git fetch origin
git checkout main
git reset --hard origin/main

# Verificar atualização
git log --oneline -1

# Ajustar permissões
cd gonzagas_node
chmod 755 server.js
chmod -R 755 public/ views/ controllers/ models/
cd ..

# Verificar estado (deve estar limpo agora)
git status
```

### 3. **Resolução de Conflitos (se necessário)**

```bash
# Se houver conflitos, descartar alterações locais
cd /home/artnshin/artnshine.pt
git checkout -- gonzagas_node/public/css/catalog-enhanced.css
git reset --hard origin/main
```

### 4. **Reiniciar Aplicação**

**Via cPanel (RECOMENDADO):**
1. Aceder ao cPanel
2. Ir a "Node.js Selector" ou "Node.js App"
3. Selecionar a aplicação
4. Clicar em "Restart App"

**Via Terminal (se necessário):**
```bash
cd /home/artnshin/artnshine.pt/gonzagas_node
source /home/artnshin/nodevenv/artnshine.pt/gonzagas_node/18/bin/activate
# Reiniciar via cPanel é preferível
```

---

## ⚡ Comando Único (Copy-Paste)

```bash
cd /home/artnshin/artnshine.pt && cp -r gonzagas_node gonzagas_node_backup_$(date +%Y%m%d_%H%M%S) && git checkout -- . && git fetch origin && git checkout main && git reset --hard origin/main && git log --oneline -1 && cd gonzagas_node && chmod 755 server.js && chmod -R 755 public/ views/ controllers/ models/ && cd .. && git status
```

## 🔧 Resolver Alterações Locais Não Desejadas

Se houver muitos ficheiros modificados que não devem estar modificados:

```bash
# Descartar TODAS as alterações locais
cd /home/artnshin/artnshine.pt
git checkout -- .

# Ou descartar apenas ficheiros específicos
git checkout -- gonzagas_node/public/css/catalog-enhanced.css

# Depois fazer o reset normal
git reset --hard origin/main
```

---

**Nota:** Após executar os comandos, reiniciar a aplicação via cPanel.

