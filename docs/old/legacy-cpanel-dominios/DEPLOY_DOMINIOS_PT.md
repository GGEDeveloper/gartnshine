# Deploy - dominios.pt

## Informação

- **Plataforma:** dominios.pt (cPanel / CloudLinux)
- **Método:** GitHub (push → deploy automático ou manual)
- **Base de dados:** MySQL/MariaDB (artnshin_gonzagas_db)

## Limitações conhecidas (dominios.pt)

1. **node_modules** – CloudLinux exige symlink para pasta do Node.js Selector; não usar pasta física
2. **Upload de imagens** – Máx. 5MB por ficheiro (Multer). Fotos de telemóvel (3–5MB) podem causar lentidão; recomenda-se compressão em clientes
3. **Tabelas DB** – Algumas DBs de produção podem não ter `inventory_transactions`; o código cria o produto na mesma forma resiliente
4. **Rate limiting** – Configurável via .env (RATE_LIMIT_*). Default: 400 req/15min por IP. **CRÍTICO:** Em produção com proxy, definir `TRUST_PROXY=1` no .env para que o rate limit use o IP real por utilizador (sem isto, todos partilham o IP do proxy e o limite dispara rápido).

## Comandos Úteis (referência dos ficheiros do projeto)

Ver ficheiros na raiz:
- COMANDOS_PUSH_DOMINIOS_PT.md
- COMANDOS_PULL_DOMINIOS_PT_ATUALIZADO.md
- COMANDOS_POS_PULL_DOMINIOS_PT.md
- DEPLOY_CPANEL.md
- MULTI_DOMAIN_DEPLOYMENT_GUIDE.md

## Migrações (após deploy)

### 1. Quick Product + Categorias
```bash
mysql -u artnshin_dev -p artnshin_gonzagas_db < _dev-info/schema/migration_quick_product_20260211.sql
```
Adiciona: `parent_id` em `product_families`, `color` em `products`.

### 2. Cores (opções de cor para produtos)
```bash
mysql -u artnshin_dev -p artnshin_gonzagas_db < _dev-info/schema/migration_product_colors_20260211.sql
```
Cria tabela `product_colors` com opções pré-definidas (Prata, Dourado, etc.).

## Notas

- Credenciais de produção (DB, etc.) estão no servidor - não commitar
- Para backup da DB de produção: usar SSH ao servidor ou painel dominios.pt
- Este repo usa .env local para desenvolvimento
