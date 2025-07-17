# Deploy no cPanel - Domínios.pt

## Pré-requisitos

1. **Conta de hosting Node.js ativa** no domínios.pt
2. **Base de dados MySQL/MariaDB criada** no cPanel
3. **Git repository conectado** ao cPanel

## ⚠️ IMPORTANTE: CloudLinux NodeJS Selector

O servidor domínios.pt usa **CloudLinux** que exige que `node_modules` seja um **symlink**, não uma pasta física. 

**Regra crítica:**
- ✅ **NUNCA** fazer commit da pasta `node_modules`
- ✅ **SEMPRE** usar "Run NPM Install" do cPanel
- ✅ O cPanel criará automaticamente o symlink correto

## Configuração da Base de Dados

### 1. Criar Base de Dados no cPanel
- Aceder ao cPanel → MySQL Databases
- Criar nova base de dados: `gonzagas_production`
- Criar utilizador da base de dados
- Dar todas as permissões ao utilizador

### 2. Importar Dados
```bash
# Upload do ficheiro gonzagas_production_dump.sql via phpMyAdmin ou Terminal
mysql -u username -p gonzagas_production < gonzagas_production_dump.sql
```

## Configuração do Ambiente

### 1. Editar `.env` no servidor
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=seu_username_mysql
DB_PASSWORD=sua_password_mysql
DB_NAME=gonzagas_production
SESSION_SECRET=sua_chave_secreta_super_forte
```

### 2. Editar `.cpanel.yml`
Substituir `yourusername` pelo seu username real do cPanel:
```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/SEU_USERNAME/public_html/
    - /bin/rm -rf $DEPLOYPATH/node_modules
    - /bin/cp -R * $DEPLOYPATH
    - cd $DEPLOYPATH
    - /bin/rm -rf node_modules
    - chmod 755 server.js
    - chmod -R 755 public/
    - chmod -R 755 views/
    - chmod -R 755 routes/
    - chmod -R 755 controllers/
    - chmod -R 755 models/
    - chmod -R 755 middleware/
    - chmod -R 755 config/
    - chmod -R 755 scripts/
    - echo "Deployment completed - use cPanel NPM Install button"
```

## Processo de Deploy

### 1. Via Git no cPanel
1. Aceder ao cPanel → Git Version Control
2. Fazer "Pull or Deploy" do repositório
3. O `.cpanel.yml` executará automaticamente
4. **⚠️ CRÍTICO**: Após o deploy, ir ao **Setup Node.js App** e clicar **"Run NPM Install"**

### 2. Configuração Node.js
1. Aceder ao cPanel → Node.js Selector
2. Selecionar versão Node.js (recomendado: 18.x ou superior)
3. Definir startup file: `server.js`
4. Clicar em **"Run NPM Install"** (criará o symlink correto)
5. Clicar em **"Start App"**

### 3. Configurar Domínio
1. No cPanel → Subdomains ou no domínio principal
2. Apontar para a pasta onde o projeto foi deployado
3. Configurar proxy reverso se necessário (porta 3000)

## 🔧 Resolução do Erro CloudLinux

### Se aparecer este erro:
```
Cloudlinux NodeJS Selector demands to store node modules for application in separate folder (virtual environment) pointed by symlink called "node_modules". That's why application should not contain folder/file with such name in application root
```

### Solução:
1. **Parar a aplicação** no cPanel
2. **SSH para o servidor** (ou File Manager):
   ```bash
   cd /home/seuusername/public_html/
   rm -rf node_modules
   ```
3. **Voltar ao cPanel** → Setup Node.js App
4. **Clicar "Run NPM Install"** (criará symlink automaticamente)
5. **Clicar "Start App"**

## Resolução de Problemas

### Permissões
```bash
# Se tiver acesso SSH
chmod 755 server.js
chmod -R 755 public/
find . -type f -name "*.js" -exec chmod 644 {} \;
```

### Dependências (CloudLinux)
```bash
# NO SERVIDOR - NUNCA fazer isto:
# npm install  ❌ ERRADO

# SEMPRE usar o cPanel:
# Setup Node.js App → "Run NPM Install"  ✅ CORRETO
```

### Base de Dados
- Verificar credenciais no `.env`
- Confirmar que a base de dados foi importada corretamente
- Testar conexão via phpMyAdmin

## Acesso ao Site

- **Site público**: https://seudominio.pt (password: "0009")
- **Admin**: https://seudominio.pt/admin/login
  - Email: gonzaga@artnshine.pt
  - Password: covil

## Notas Importantes

1. O site tem proteção por password ("0009") na página inicial
2. O admin só aceita um utilizador (gonzaga/covil)
3. Todas as imagens devem estar na pasta `/public/media/products/`
4. O sistema de notificações está ativo
5. Preços podem ser ocultados dinamicamente ("Preços sob consulta")
6. **CloudLinux**: SEMPRE usar "Run NPM Install" do cPanel, nunca comandos SSH

## Suporte

Em caso de problemas:
1. Verificar logs do Node.js no cPanel
2. Consultar `CLOUDLINUX_FIX.md` para erros específicos
3. Verificar configurações de firewall/proxy
º4. Documentação do domínios.pt 