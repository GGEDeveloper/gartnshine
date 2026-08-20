---
slug: waphix-production-infra
tipo: facto
dominio: infra
titulo: "A produção do artnshine.pt corre em Docker Compose num servidor próprio (waphix) — o cPanel foi descontinuado"
resumo: O cPanel foi descontinuado: as instruções de deploy antigas do repositório não são actuais. A produção é Docker Compose num servidor na LAN.
keywords: produção, servidor próprio, Docker Compose, implantação, alojamento, infraestrutura, proxy reverso, cópias de segurança, self-hosted production deployment, waphix, cPanel discontinued
valid_from: 2026-07-29
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - server.js
  - gonzagas_node/DEPLOYMENT.md
  - /gartnshine-3/gonzagas_node/DEPLOYMENT.md
  - DEPLOYMENT_CPANEL_LEGACY.md
  - DEPLOY_CPANEL.md
  - PRODUCTION_SETUP.md
  - Node.js
  - Docker Compose
  - waphix
  - cPanel
  - cpanel
  - docker compose
sources:
  - migracao:project_waphix_production_infra.md
---

artnshine.pt production is a self-hosted Docker Compose stack on a server nicknamed "waphix" (LAN IP 192.168.1.101). The old cPanel/Dominios.pt hosting described in the repo's legacy docs is **discontinued** — do not treat cPanel deploy instructions as current.

**Why:** user confirmed directly (2026-07-29) after I had wrongly consolidated cPanel deploy docs and marked one as "canonical" without knowing this.

**Infra summary** (config lives outside this repo, on the waphix server itself):
- Stack dir: `/srv/stacks/artnshine/`, compose file `/srv/stacks/artnshine/compose.yml`
- App code: separate git repo at `/srv/stacks/artnshine/app_repo` (branch `main`), `gonzagas_node/` bind-mounted into the container
- App container: `artnshine-app`, `node:20-alpine`, no custom Dockerfile (runs `npm install` + `node server.js` from compose), internal port 3001
- DB: separate `mariadb` stack (`/srv/stacks/mariadb`, MariaDB 11.4), DB name `artnshin_gonzagas_db`, user `gartnshine`
- Startup order matters: `mariadb` must be healthy before `artnshine-app` starts (past incident 2026-05-20 caused a 502 when this was violated — now enforced by a script on the server)
- Networking: Docker networks `backend` (app↔mariadb) and `frontend` (Nginx Proxy Manager↔app); NPM handles reverse proxy + Let's Encrypt SSL; DNS on Cloudflare with DDNS updating the A record every ~5 min; no Cloudflare Tunnel, direct port-forward 80/443 on the router

**How to apply:** [gonzagas_node/DEPLOYMENT.md](../../../gartnshine-3/gonzagas_node/DEPLOYMENT.md) in the repo now documents this correctly (rewritten 2026-07-29). The old cPanel guides are archived under `docs/old/` (`DEPLOYMENT_CPANEL_LEGACY.md`, `DEPLOY_CPANEL.md`, `PRODUCTION_SETUP.md`) — never suggest cPanel-specific deploy steps, "Setup Node.js App" panel, or `.cpanel.yml` as the real deploy path. When discussing prod issues (502s, DB connectivity, restarts), think in terms of `docker compose`, container health checks, and the mariadb→app startup order, not cPanel's Node.js app manager. Detailed infra docs (redeploy scripts, backups, incident log) live on the server itself, not in this git repo — if deep infra detail is needed, ask the user rather than assuming it's discoverable here.
