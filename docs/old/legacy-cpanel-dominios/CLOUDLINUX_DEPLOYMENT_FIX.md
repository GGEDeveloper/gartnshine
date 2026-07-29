# 🔧 SOLUÇÃO DEFINITIVA: CloudLinux NodeJS Deployment

## ⚠️ PROBLEMA CRÍTICO
```
ERROR: Cloudlinux NodeJS Selector demands to store node modules for application in separate folder (virtual environment) pointed by symlink called "node_modules"
```

## 🎯 SOLUÇÃO STEP-BY-STEP

### PASSO 1: Preparação do Repositório
```bash
# NO SEU AMBIENTE LOCAL (antes do push):
# 1. Garantir que .gitignore contém:
echo "node_modules/" >> .gitignore
echo "package-lock.json" >> .gitignore

# 2. Remover node_modules do git se existir:
git rm -r --cached node_modules/
git commit -m "Remove node_modules from git tracking"

# 3. Push para o repositório:
git push origin main
```

### PASSO 2: Deploy via cPanel Git
```yaml
# Arquivo .cpanel.yml (correto para CloudLinux):
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/artnshin/artnshine.pt/gonzagas_node
    - /bin/rm -rf $DEPLOYPATH/node_modules
    - /bin/cp -R * $DEPLOYPATH
    - cd $DEPLOYPATH
    - /bin/rm -rf node_modules package-lock.json
    - chmod 755 server.js
    - chmod -R 755 public/
    - chmod -R 755 views/
    - echo "Deploy completed - use cPanel NPM Install"
```

### PASSO 3: Configuração cPanel NodeJS
1. **cPanel** → **Setup Node.js App**
2. **Configurar aplicação:**
   - **Node.js version**: 18.x ou superior
   - **Application root**: `/artnshine.pt/gonzagas_node`
   - **Application URL**: `artnshine.pt`
   - **Startup file**: `server.js`
3. **❗ CRÍTICO**: Clicar **"Run NPM Install"** (cria symlink automaticamente)
4. **Editar variáveis ambiente** (.env)
5. **Start application**

### PASSO 4: Verificação do Symlink
```bash
# SSH para verificar:
cd /home/artnshin/artnshine.pt/gonzagas_node
ls -la | grep node_modules

# DEVE MOSTRAR (exemplo):
# lrwxrwxrwx ... node_modules -> /home/artnshin/nodevenv/artnshine.pt/gonzagas_node/18/lib/node_modules
```

## 🚫 O QUE NUNCA FAZER

### ❌ COMANDOS PROIBIDOS NO SERVIDOR:
```bash
npm install           # ❌ NUNCA - quebra o CloudLinux
mkdir node_modules    # ❌ NUNCA - deve ser symlink
cp -r node_modules/   # ❌ NUNCA - ignora ambiente virtual
```

### ❌ ESTRUTURAS PROIBIDAS:
```
❌ /artnshine.pt/gonzagas_node/node_modules/  (pasta física)
✅ /artnshine.pt/gonzagas_node/node_modules → symlink
```

## ✅ PROCESSO CORRETO COMPLETO

### 1. Preparação Local:
```bash
# Limpar repositório:
git rm -r --cached node_modules/ package-lock.json
echo -e "node_modules/\npackage-lock.json" >> .gitignore
git add .gitignore
git commit -m "CloudLinux compatibility: remove node_modules"
git push origin main
```

### 2. Deploy Remoto:
```bash
# cPanel → Git Version Control → Pull or Deploy
# O .cpanel.yml executará automaticamente
```

### 3. Configuração NodeJS:
```
cPanel → Setup Node.js App → 
- Run NPM Install ✅
- Configure Environment (.env) ✅
- Start App ✅
```

### 4. Verificação:
```bash
curl -I https://artnshine.pt
# DEVE retornar: HTTP/1.1 200 OK
```

## 🔄 RECOVERY PROCEDURE

Se algo der errado:
```bash
# 1. Parar app no cPanel
# 2. SSH para o servidor:
cd /home/artnshin/artnshine.pt/gonzagas_node
rm -rf node_modules package-lock.json

# 3. Voltar ao cPanel:
# Setup Node.js App → Run NPM Install → Start App
```

## 📋 CHECKLIST DE SUCESSO

- [ ] ✅ Repository sem node_modules/
- [ ] ✅ .cpanel.yml configurado corretamente
- [ ] ✅ Deploy via cPanel Git executado
- [ ] ✅ "Run NPM Install" executado no cPanel
- [ ] ✅ node_modules é symlink (não pasta)
- [ ] ✅ Aplicação iniciada no cPanel
- [ ] ✅ Site funciona: https://artnshine.pt
- [ ] ✅ Admin funciona: https://artnshine.pt/admin

## 🎯 RESULTADO ESPERADO

```
✅ Aplicação Node.js funcionando
✅ CloudLinux satisfeito (node_modules = symlink)
✅ Zero conflitos de dependências
✅ Deploy futuro sem problemas
``` 