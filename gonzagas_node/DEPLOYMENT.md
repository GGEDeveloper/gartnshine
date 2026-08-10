# Deploy — artnshine.pt (produção real: Waphix / Docker Compose)

> Os guias antigos de cPanel (`docs/old/DEPLOYMENT_CPANEL_LEGACY.md`,
> `docs/old/DEPLOY_CPANEL.md`, `docs/old/PRODUCTION_SETUP.md`) estão
> **desatualizados e arquivados**. O cPanel foi descontinuado. A produção
> corre num servidor próprio ("waphix") via Docker Compose.

## Onde vive a configuração de infraestrutura

Este repositório (`gartnshine-3` / `gonzagas_node/`) contém apenas o
**código da aplicação**. A configuração da stack (compose, redes, proxy,
DNS, backups, scripts de arranque) vive **fora deste repositório**, no
próprio servidor waphix, em `/srv/stacks/artnshine/`.

## Resumo da stack (waphix)

- **Diretório da stack:** `/srv/stacks/artnshine/`
- **Compose file:** `/srv/stacks/artnshine/compose.yml`
- **Código:** repo git próprio em `/srv/stacks/artnshine/app_repo` (branch
  `main`), com `gonzagas_node/` montado por bind mount para dentro do
  container
- **Env vars:** `/srv/stacks/artnshine/.env`

### Container da aplicação

- Nome: `artnshine-app`
- Imagem base: `node:20-alpine` (sem Dockerfile próprio — `npm install` +
  `node server.js` no arranque, definido no `compose.yml`)
- Bind mount: `/srv/stacks/artnshine/app_repo/gonzagas_node` → `/app`
- Porta interna: 3001, com healthcheck configurado

### Base de dados

- Container `mariadb` (stack separada em `/srv/stacks/mariadb`, imagem
  `mariadb:11.4`, dados em `/srv/data/mariadb/data`)
- Base do site: `artnshin_gonzagas_db`, utilizador `gartnshine`
- **Dependência crítica:** `mariadb` tem de estar `healthy` antes de
  `artnshine-app` arrancar — ver incidente abaixo

### Rede Docker

Duas redes externas:
- `backend` (172.19.0.0/16) — liga `artnshine-app` ao `mariadb`
- `frontend` (172.18.0.0/16) — liga o Nginx Proxy Manager ao `artnshine-app`

### Proxy reverso e DNS

- Proxy: Nginx Proxy Manager (container `npm`), proxy host #3 →
  `artnshine.pt` / `www.artnshine.pt`, SSL via Let's Encrypt
- DNS: zona própria na Cloudflare, registos A proxied (orange cloud)
- DDNS: timer systemd `ddns-cloudflare@artnshine.timer` (~5/5 min)
- Exposição: sem Cloudflare Tunnel — port-forward direto 80/443 no
  router → `192.168.1.101` (waphix) → NPM → container

### Ordem de arranque (pós-reboot)

1. `mariadb` sobe primeiro
2. `artnshine` sobe a seguir
3. Smoke test: `docker ps | grep artnshine-app`

Introduzido após incidente real (2026-05-20): `mariadb` não estava de pé
quando `artnshine-app` arrancou → `EAI_AGAIN mariadb`, healthcheck preso
em `starting`, site em 502. Corrigido garantindo essa ordem (hoje
automático via script no próprio servidor).

## Atualizar código em produção

O deploy é feito atualizando o `app_repo` dentro do servidor waphix
(pull da branch `main`) e reiniciando o container `artnshine-app` — os
detalhes exatos do script de redeploy vivem no próprio servidor, não
neste repositório.

### Instruções por lote de alterações

Cada lote de alterações que exija passos além do pull + restart tem o seu
documento, com backup obrigatório, condições de paragem e rollback:

| Documento | Lote | Migrações |
|---|---|---|
| [`docs/DEPLOY_COLECOES_GALERIA.md`](../docs/DEPLOY_COLECOES_GALERIA.md) | Coleções curadas, Galeria, Aspeto do Site, movimento | 006–009 + semeadura da galeria |
| [`docs/DEPLOY_HOME_NAV_SEO.md`](../docs/DEPLOY_HOME_NAV_SEO.md) | Página inicial, navegação de Coleções, correções de SEO | nenhuma (só código) |
| [`docs/DEPLOY_CATEGORIAS_GALERIA.md`](../docs/DEPLOY_CATEGORIAS_GALERIA.md) | Separação categoria/coleção/galeria, novos endereços e 301 | nenhuma (script de slugs) |
| [`docs/DEPLOY_INSTAGRAM_CATALOGO.md`](../docs/DEPLOY_INSTAGRAM_CATALOGO.md) | Feed do Instagram gerido no admin, categorias no catálogo, transições | 010 (aditiva) |
| [`docs/DEPLOY_CAPAS_CATEGORIAS.md`](../docs/DEPLOY_CAPAS_CATEGORIAS.md) | Capas dos cabeçalhos de categoria e cartões dos materiais | 015 (só UPDATE) |
| [`docs/DEPLOY_LOTE_JULHO_2026.md`](../docs/DEPLOY_LOTE_JULHO_2026.md) | 70 peças novas de Julho de 2026, sem preço (*sob consulta*) | 016 (só INSERT) |

**Regra que vale para todos:** nunca correr `npm run db:init`,
`npm run db:reset`, `scripts/setup.js` nem importar dumps SQL para produção —
apagariam catálogo real. A produção tem produtos e imagens que não existem em
mais lado nenhum.
