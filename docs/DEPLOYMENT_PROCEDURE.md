# 🚀 Procedimento de Deployment - Gonzaga's Art & Shine

## 📋 Visão Geral

Este documento descreve o procedimento padrão para fazer deploy das alterações do repositório local para o servidor de produção, alojado na **waphix**.

## 🔄 Fluxo de Trabalho

### 1. **Desenvolvimento Local** (WSL/Windows)

```bash
# 1. Verificar estado do repositório
cd /home/ggedeveloper/gartnshine-2
git status

# 2. Adicionar alterações
git add .

# 3. Fazer commit com mensagem descritiva
git commit -m "tipo: descrição breve das alterações

- Detalhe 1
- Detalhe 2"

# 4. Push para o repositório remoto
git push origin main
```

### 2. **Deployment no Servidor** (waphix)

#### A. Conectar ao Servidor

```bash
# SSH para o servidor waphix (dados de acesso: ver gestor de credenciais interno)
ssh <user>@<host-waphix>
```

#### B. Procedimento de Atualização

```bash
# 1. Navegar para o diretório do projeto
cd <caminho-do-projeto-no-waphix>

# 2. Criar backup antes de atualizar (RECOMENDADO)
cp -r gonzagas_node gonzagas_node_backup_$(date +%Y%m%d_%H%M%S)

# 3. Verificar branch atual
git branch

# 4. Obter as últimas alterações do repositório
git fetch origin

# 5. Verificar diferenças (opcional)
git log HEAD..origin/main --oneline

# 6. Atualizar para a versão mais recente
git checkout main
git reset --hard origin/main

# 7. Verificar se a atualização foi bem-sucedida
git log --oneline -1

# 8. Navegar para o diretório da aplicação
cd gonzagas_node

# 9. Remover node_modules antigos (se necessário)
rm -rf node_modules

# 10. Definir permissões corretas
chmod 755 server.js
chmod -R 755 public/ views/ controllers/ models/

# 11. Voltar ao diretório raiz
cd ..

# 12. Verificar se há alterações locais não commitadas
git status
```

#### C. Reiniciar a Aplicação

```bash
# Opção 1: Via cPanel (RECOMENDADO)
# - Aceder ao cPanel
# - Ir a "Node.js Selector" ou "Node.js App"
# - Reiniciar a aplicação

# Opção 2: Via terminal (se tiver acesso)
# Parar o processo atual (se estiver a correr)
pkill -f "node.*server.js"

# Iniciar a aplicação (se necessário configurar manualmente)
cd gonzagas_node
source <caminho-do-nodevenv-no-waphix>/bin/activate
node server.js
```

## ⚠️ Resolução de Conflitos

Se houver conflitos durante o `git pull` ou `git reset`:

```bash
# 1. Verificar ficheiros com conflitos
git status

# 2. Opção A: Descartar alterações locais e usar versão do repo
git checkout -- <ficheiro>
git reset --hard origin/main

# 3. Opção B: Guardar alterações locais primeiro
git stash
git reset --hard origin/main
# Se quiser aplicar alterações locais depois:
# git stash pop
```

## 📝 Checklist de Deployment

- [ ] Alterações testadas localmente
- [ ] Commit feito com mensagem descritiva
- [ ] Push para o repositório remoto
- [ ] Backup criado no servidor
- [ ] Repositório atualizado no servidor
- [ ] Permissões verificadas
- [ ] Aplicação reiniciada
- [ ] Funcionalidades testadas no servidor

## 🔍 Verificação Pós-Deployment

```bash
# 1. Verificar logs da aplicação
tail -f /path/to/logs/app.log

# 2. Verificar se a aplicação está a correr
ps aux | grep node

# 3. Testar endpoints principais
curl http://localhost:3000/
curl http://localhost:3000/catalog
```

## 📞 Contacto

Em caso de problemas durante o deployment, verificar:
- Logs da aplicação
- Logs do servidor
- Estado do repositório Git
- Permissões de ficheiros

---

**Última atualização:** 2025-01-XX  
**Versão:** 1.0

