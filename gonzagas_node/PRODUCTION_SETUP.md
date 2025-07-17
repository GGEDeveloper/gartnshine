# 🚀 Gonzaga's Art & Shine - Guia de Instalação em Produção

## 📋 Pré-requisitos

- **cPanel** com acesso SSH
- **Node.js** 18+ 
- **MariaDB/MySQL** 5.7+
- **Nginx/Apache** com suporte para reverse proxy
- **PM2** para gestão de processos

## 🗄️ **1. Importação da Base de Dados**

### Passo 1: Criar Base de Dados
```sql
CREATE DATABASE gonzagas_catalog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gonzagas_user'@'localhost' IDENTIFIED BY 'sua_senha_forte';
GRANT ALL PRIVILEGES ON gonzagas_catalog.* TO 'gonzagas_user'@'localhost';
FLUSH PRIVILEGES;
```

### Passo 2: Importar Dados
```bash
mysql -u gonzagas_user -p gonzagas_catalog < gonzagas_production_dump.sql
```

## ⚙️ **2. Configuração da Aplicação**

### Passo 1: Upload dos Ficheiros
- Fazer upload de toda a pasta `gonzagas_node/` para o servidor
- Colocar no directório público do cPanel (e.g., `public_html/`)

### Passo 2: Configurar Variáveis de Ambiente
Criar ficheiro `.env` na raiz:
```env
# Base de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=gonzagas_user
DB_PASSWORD=sua_senha_forte
DB_NAME=gonzagas_catalog

# Aplicação
NODE_ENV=production
PORT=3000
SECRET_KEY=sua_chave_secreta_muito_forte

# Site
SITE_URL=https://seudominio.com
ADMIN_EMAIL=admin@seudominio.com

# Segurança
SESSION_SECRET=outra_chave_secreta_diferente
```

### Passo 3: Instalar Dependências
```bash
cd gonzagas_node
npm install --production
```

### Passo 4: Configurar PM2
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Criar ficheiro de configuração PM2
```

Criar `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'gonzagas-catalog',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### Passo 5: Iniciar Aplicação
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 **3. Configuração do Servidor Web**

### Para Nginx:
```nginx
server {
    listen 80;
    server_name seudominio.com;
    
    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com;
    
    # Certificados SSL
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    
    # Configurações SSL seguras
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Proxy para a aplicação Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Servir ficheiros estáticos directamente
    location /css/ {
        alias /path/to/gonzagas_node/public/css/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /js/ {
        alias /path/to/gonzagas_node/public/js/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /media/ {
        alias /path/to/gonzagas_node/public/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /images/ {
        alias /path/to/gonzagas_node/public/images/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Para Apache (.htaccess):
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

## 🔐 **4. Segurança e Optimizações**

### Headers de Segurança
A aplicação já inclui configurações de segurança via Helmet.js:
- CSP (Content Security Policy)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options

### Configurações Adicionais
```bash
# Firewall - permitir apenas portas necessárias
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable

# Configurar fail2ban para proteger SSH
sudo apt install fail2ban
```

## 📊 **5. Monitorização**

### PM2 Monitoring
```bash
# Ver status das aplicações
pm2 status

# Ver logs em tempo real
pm2 logs gonzagas-catalog

# Monitorização web
pm2 web
```

### Logs da Aplicação
- Logs de acesso: `/path/to/gonzagas_node/logs/access.log`
- Logs de erro: `/path/to/gonzagas_node/logs/error.log`

## 🔄 **6. Backup e Manutenção**

### Backup Automático da Base de Dados
```bash
#!/bin/bash
# Adicionar ao crontab: 0 2 * * * /path/to/backup_script.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"
DB_NAME="gonzagas_catalog"
DB_USER="gonzagas_user"
DB_PASS="sua_senha"

mysqldump -u$DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Manter apenas os últimos 30 backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### Actualização da Aplicação
```bash
# Fazer backup
pm2 save

# Parar aplicação
pm2 stop gonzagas-catalog

# Actualizar código
git pull origin main
npm install --production

# Reiniciar aplicação
pm2 restart gonzagas-catalog
```

## 🎯 **7. Credenciais de Administração**

### Utilizador Principal
- **Email:** gonzaga@artnshine.pt
- **Password:** covil
- **Role:** admin

### Acesso ao Catálogo Público
- **Password:** 0009

### Área de Administração
- **URL:** https://seudominio.com/admin
- **Funcionalidades:**
  - Gestão de produtos
  - Controlo de stock
  - Gestão de famílias de produtos
  - Sistema de checkpoints
  - Configurações do site

## 📱 **8. Funcionalidades Implementadas**

### ✅ **Sistema Completo**
- 🛍️ **Catálogo Público** com protecção por password
- 🔐 **Área de Administração** completa
- 📊 **Gestão de Stock** com histórico
- 💰 **Sistema de Preços** com histórico de alterações
- 🖼️ **Gestão de Imagens** automática
- 📱 **Design Responsivo** para mobile/desktop
- 🔔 **Sistema de Notificações** elegante
- 💾 **Sistema de Checkpoints** para backup/restore
- 🎨 **Tema escuro** com nuances psicadélicas e geométricas

### ⚡ **Funcionalidades Especiais**
- **"Preços sob consulta"** - Toggle para ocultar preços no catálogo
- **Notificações popup** - Sistema completo com 4 tipos de notificação
- **Filtros avançados** - Por categoria, stock, referência, etc.
- **Upload de media** - Sistema automático de gestão de imagens
- **Auditoria completa** - Log de todas as acções administrativas

## 🆘 **9. Resolução de Problemas**

### Aplicação não inicia
```bash
# Verificar logs
pm2 logs gonzagas-catalog

# Verificar configuração da base de dados
node -e "console.log(require('./config/database'))"
```

### Erro de ligação à base de dados
- Verificar credenciais no `.env`
- Confirmar que a base de dados existe
- Testar ligação: `mysql -u gonzagas_user -p gonzagas_catalog`

### Problemas de permissões
```bash
# Definir permissões correctas
chown -R www-data:www-data /path/to/gonzagas_node
chmod -R 755 /path/to/gonzagas_node
chmod -R 644 /path/to/gonzagas_node/public/media
```

## 📞 **10. Suporte**

Para questões técnicas ou problemas de instalação:
- **Email de suporte:** [incluir email de contacto]
- **Documentação técnica:** Ver ficheiros na pasta `/docs`

---

**🎨 Gonzaga's Art & Shine** - Sistema de Catálogo Profissional
*Desenvolvido especificamente para joalharia em prata 925 com inspiração Bali/Boho* 