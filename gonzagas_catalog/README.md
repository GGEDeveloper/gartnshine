# Gonzaga's Art & Shine - Catálogo de Joias

Um sistema de catálogo online para joias de prata sterling, com área administrativa para gestão de estoque e catálogo.

## Requisitos

- PHP 7.4 ou superior
- MariaDB / MySQL
- Servidor web (Apache, Nginx)
- Extensões PHP: mysqli, gd, json, session

## Estrutura do Projeto

```
gonzagas_catalog/
├── admin/              # Área administrativa
├── config/             # Arquivos de configuração
├── database/           # Scripts de banco de dados
├── includes/           # Funções e classes utilitárias
├── media_processed/    # Arquivos de mídia processados
├── public/             # Frontend do catálogo (acessível ao público)
├── vendor/             # Dependências (gerenciadas pelo Composer)
└── checkpoints/        # Backups do banco de dados
```

## Instalação

1. Clone este repositório para seu servidor web:

```bash
cd /caminho/para/webroot
git clone [url-do-repositorio] gonzagas_catalog
```

2. Configure o banco de dados:

```bash
# Criar banco de dados e usuário
mysql -u root -p
```

```sql
CREATE DATABASE gonzagas_catalog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gonzagas_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON gonzagas_catalog.* TO 'gonzagas_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

3. Importe o esquema do banco de dados:

```bash
mysql -u gonzagas_user -p gonzagas_catalog < /caminho/para/gonzagas_catalog/database/schema.sql
```

4. Configure as credenciais do banco de dados:

Edite o arquivo `config/database.php` com as credenciais corretas:

```php
<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'gonzagas_user');
define('DB_PASS', 'sua_senha_segura');
define('DB_NAME', 'gonzagas_catalog');
```

5. Instale as dependências via Composer:

```bash
cd gonzagas_catalog
composer require phpoffice/phpspreadsheet
```

6. Configure permissões de diretório:

```bash
chmod -R 755 gonzagas_catalog
chmod -R 775 gonzagas_catalog/media_processed
chmod -R 775 gonzagas_catalog/checkpoints
```

7. Processe as imagens dos produtos:

```bash
cd gonzagas_catalog/includes
php process_media.php
```

8. Importe os dados do arquivo Excel:

```bash
cd gonzagas_catalog/database
php import_data.php
```

## Acesso

- **Catálogo Público**: http://seu-dominio.com/gonzagas_catalog/public/
  - Senha de acesso: `0009`

- **Área Administrativa**: http://seu-dominio.com/gonzagas_catalog/admin/
  - Usuário: `gonzaga`
  - Senha: `covil`

## Funcionalidades

### Catálogo

- Vitrine para os produtos (joias)
- Filtragem por categorias
- Busca por referência ou nome
- Visualização detalhada dos produtos

### Área Administrativa

- Dashboard com métricas e alertas de estoque
- Gerenciamento de produtos
- Controle de estoque
- Gestão do catálogo online
- Criação de checkpoints (backup de dados)
- Relatórios

## Personalizações

As cores e elementos visuais podem ser personalizados editando o arquivo `config/config.php`.

## Segurança

- Este sistema utiliza proteção por senha para o catálogo e autenticação para a área administrativa
- As senhas estão definidas diretamente no código (no arquivo config.php)
- Para um ambiente de produção, recomenda-se implementar mecanismos mais robustos de autenticação

## Manutenção

Para criar backups regulares do banco de dados, acesse a área administrativa e use a funcionalidade de Checkpoints.

## Licença

Este projeto é proprietário e desenvolvido exclusivamente para Gonzaga's Art & Shine. 