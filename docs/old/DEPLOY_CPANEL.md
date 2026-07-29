# Deploy no cPanel - Domínios.pt

## Pré-requisitos

1. **Conta de hosting Node.js ativa** no domínios.pt
2. **Base de dados MySQL/MariaDB criada** no cPanel
3. **Git repository conectado** ao cPanel

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
    - /bin/cp -R * $DEPLOYPATH
    - cd $DEPLOYPATH
    - npm install --production
    - chmod 755 server.js
    - chmod -R 755 public/
    - chmod -R 755 views/
    - chmod -R 755 routes/
    - chmod -R 755 controllers/
    - chmod -R 755 models/
    - chmod -R 755 middleware/
    - chmod -R 755 config/
    - chmod -R 755 scripts/
    - echo "Deployment completed successfully"
```

## Processo de Deploy

### 1. Via Git no cPanel
1. Aceder ao cPanel → Git Version Control
2. Fazer "Pull or Deploy" do repositório
3. O `.cpanel.yml` executará automaticamente

### 2. Configuração Node.js
1. Aceder ao cPanel → Node.js Selector
2. Selecionar versão Node.js (recomendado: 18.x ou superior)
3. Definir startup file: `server.js`
4. Adicionar variáveis de ambiente se necessário

### 3. Configurar Domínio
1. No cPanel → Subdomains ou no domínio principal
2. Apontar para a pasta onde o projeto foi deployado
3. Configurar proxy reverso se necessário (porta 3000)

## Resolução de Problemas

### Permissões
```bash
# Se tiver acesso SSH
chmod 755 server.js
chmod -R 755 public/
find . -type f -name "*.js" -exec chmod 644 {} \;
```

### Dependências
```bash
# Reinstalar se houver problemas
rm -rf node_modules package-lock.json
npm install --production
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

## Suporte

Em caso de problemas:
1. Verificar logs do Node.js no cPanel
2. Consultar documentação do domínios.pt
3. Verificar configurações de firewall/proxy 