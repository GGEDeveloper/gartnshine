# 🚀 Comandos de Deployment - Servidor waphix

## 📋 Comandos Rápidos para Deployment

### 1. **Conectar ao Servidor**

```bash
# Dados de acesso: ver gestor de credenciais interno
ssh <user>@<host-waphix>
```

### 2. **Procedimento Completo de Atualização**

```bash
# Navegar para o diretório do projeto
cd <caminho-do-projeto-no-waphix>

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
cd <caminho-do-projeto-no-waphix>
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
cd <caminho-do-projeto-no-waphix>/gonzagas_node
source <caminho-do-nodevenv-no-waphix>/bin/activate
# Reiniciar via cPanel é preferível
```

---

## ⚡ Comando Único (Copy-Paste)

```bash
cd <caminho-do-projeto-no-waphix> && cp -r gonzagas_node gonzagas_node_backup_$(date +%Y%m%d_%H%M%S) && git checkout -- . && git fetch origin && git checkout main && git reset --hard origin/main && git log --oneline -1 && cd gonzagas_node && chmod 755 server.js && chmod -R 755 public/ views/ controllers/ models/ && cd .. && git status
```

## 🔧 Resolver Alterações Locais Não Desejadas

Se houver muitos ficheiros modificados que não devem estar modificados:

```bash
# Descartar TODAS as alterações locais
cd <caminho-do-projeto-no-waphix>
git checkout -- .

# Ou descartar apenas ficheiros específicos
git checkout -- gonzagas_node/public/css/catalog-enhanced.css

# Depois fazer o reset normal
git reset --hard origin/main
```

---

**Nota:** Após executar os comandos, reiniciar a aplicação via cPanel.

