# Documentação de Implantação - Gonzaga's Art & Shine

Este documento fornece instruções detalhadas para implantar a aplicação Node.js no cPanel do Dominios.pt.

## Pré-requisitos

- Acesso ao cPanel do Dominios.pt
- Conta de e-mail configurada para envio de e-mails
- Acesso ao banco de dados MySQL/MariaDB
- Node.js instalado localmente para desenvolvimento
- Git instalado localmente

## 1. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

### Configurações do Banco de Dados
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario_db
DB_PASSWORD=sua_senha_db
DB_NAME=nome_do_banco
```

### Configurações do Servidor
```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
SITE_URL=https://artnshine.pt
```

### Autenticação e Sessão
```
JWT_SECRET=seu_segredo_jwt_aqui
JWT_EXPIRES_IN=7d
SESSION_SECRET=seu_segredo_de_sessao_aqui
COOKIE_DOMAIN=artnshine.pt
```

### Configurações de E-mail
```
EMAIL_SERVICE=seu_servico_email
EMAIL_HOST=seu_servidor_smtp
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=seu_email@exemplo.com
EMAIL_PASS=sua_senha_de_app
EMAIL_FROM="Gonzaga's Art & Shine <contato@artnshine.pt>"
```

### Configurações de Segurança
```
CORS_ORIGIN=https://artnshine.pt
ENABLE_CSRF=true
```

## 2. Implantação no cPanel

### 2.1. Acessando o cPanel

1. Acesse o cPanel através do link fornecido pelo Dominios.pt
2. Faça login com suas credenciais

### 2.2. Configurando a Aplicação Node.js

1. No painel de controle, procure por "Setup Node.js App" e clique nele
2. Clique em "Create Application"
3. Preencha os campos:
   - **Node.js Version**: Selecione a versão LTS mais recente
   - **Application Mode**: Selecione "Production"
   - **Application Root**: `/home/artnshin/artnshine.pt`
   - **Application URL**: Selecione `artnshine.pt`
   - **Application Startup File**: `server.js`

4. Na seção "Environment Variables", adicione todas as variáveis do seu arquivo `.env`

### 2.3. Configurando o Banco de Dados

1. No cPanel, vá para "MySQL® Databases"
2. Crie um novo banco de dados
3. Crie um usuário e conceda todas as permissões a este banco de dados
4. Atualize as variáveis de ambiente no cPanel com as credenciais do banco de dados

### 2.4. Implantando o Código

#### Opção 1: Usando Git (Recomendado)

1. No cPanel, vá para "Git Version Control"
2. Clique em "Clone a Repository"
3. Cole a URL do seu repositório Git
4. Defina o diretório de implantação como `/home/artnshin/artnshine.pt`
5. Clique em "Clone"

#### Opção 2: Upload Manual

1. Comprima todos os arquivos do projeto (exceto a pasta `node_modules`)
2. No cPanel, vá para "File Manager"
3. Navegue até o diretório `/home/artnshin/artnshine.pt`
4. Faça upload do arquivo compactado
5. Extraia os arquivos

### 2.5. Instalando Dependências

1. No gerenciador de aplicações Node.js, localize sua aplicação
2. Clique em "Run NPM Install"
3. Aguarde a instalação das dependências

> **Nota:** Não existe `npm run build` — a app é Node.js + EJS, sem bundler.

### 2.5b. Migração E-commerce (loja online)

Via SSH, no directório `gonzagas_node/`:

```bash
npm run db:ecommerce
```

Depois de iniciar a app, validar (opcional): `npm run test:ecommerce` (19/19 esperado).

Activar no admin: `/admin/settings/ecommerce`. Ver `modules/ecommerce/README.md`.

### 2.6. Iniciando a Aplicação

1. No gerenciador de aplicações Node.js, localize sua aplicação
2. Clique em "Start Application" ou "Restart Application"
3. Verifique os logs para garantir que a aplicação iniciou corretamente

## 3. Configuração do Domínio

### 3.1. Configuração de DNS

1. No cPanel, vá para "Zone Editor"
2. Verifique se existem registros para `artnshine.pt` e `www.artnshine.pt`
3. Se necessário, adicione os registros A apontando para o IP do servidor

### 3.2. Configuração de SSL

1. No cPanel, vá para "SSL/TLS"
2. Em "Install an SSL Certificate", selecione o domínio `artnshine.pt`
3. Use o "AutoSSL" para obter um certificado Let's Encrypt gratuito
4. Habilite o "Auto-Redirect to HTTPS" para forçar o uso de HTTPS

## 4. Configuração de E-mail

1. No cPanel, vá para "Email Accounts"
2. Crie contas de e-mail para `contato@artnshine.pt` e `suporte@artnshine.pt`
3. Configure um cliente de e-mail ou use o webmail do cPanel

## 5. Monitoramento e Manutenção

### 5.1. Acompanhamento de Logs

1. No gerenciador de aplicações Node.js, clique em "View Logs"
2. Monite os logs regularmente para identificar erros ou problemas

### 5.2. Atualizações

1. Para atualizar a aplicação, faça push das alterações para o repositório Git
2. No cPanel, vá para "Git Version Control"
3. Clique em "Pull" para atualizar os arquivos
4. Reinicie a aplicação

## 6. Solução de Problemas

### 6.1. Erro 502 Bad Gateway

1. Verifique se a aplicação está em execução
2. Verifique os logs da aplicação
3. Verifique se a porta configurada está correta

### 6.2. Arquivos Estáticos Não Carregam

1. Verifique se os arquivos estão no diretório `public`
2. Verifique as permissões dos arquivos
3. Verifique os logs do servidor web

### 6.3. Problemas de Banco de Dados

1. Verifique as credenciais do banco de dados
2. Verifique se o banco de dados está acessível
3. Verifique os logs do banco de dados

## 7. Contato

Para suporte adicional, entre em contato com a equipe de desenvolvimento.
