# Contexto do Projeto - Gonzaga's Art & Shine

**Última atualização:** 2026-07-29

## Ambiente

| Item | Detalhes |
|------|----------|
| **OS** | WSL (Windows Subsystem for Linux) em Windows 10 |
| **Deploy** | Servidor próprio "waphix", Docker Compose (container `artnshine-app` + `mariadb`, Nginx Proxy Manager, DNS Cloudflare/DDNS) |
| **CI/CD** | GitHub (push manual + pull no servidor) |
| **Hosting** | Self-hosted (waphix) — **cPanel descontinuado**, não usar guias antigos de dominios.pt/cPanel (arquivados em `docs/old/legacy-cpanel-dominios/`) |
| **Base de dados** | MariaDB (container `mariadb` separado, DB `artnshin_gonzagas_db`) |

## Stack Tecnológico

- **Backend:** Node.js + Express
- **Template:** EJS
- **DB:** MariaDB (mysql2)
- **Frontend:** Bootstrap 5, CSS custom

## Estrutura do Repositório

```
gartnshine-2/
├── gonzagas_node/     # Aplicação principal
├── _dev-info/         # Backups, schema, docs de dev
├── db_backups/        # Backups antigos
├── docs/              # Documentação geral
└── ...
```

## Links Úteis

- Instagram: https://www.instagram.com/gonzagaartnshine/
- Facebook: https://www.facebook.com/profile.php?id=61573519807731

## Credenciais (referência)

- Admin: user "gonzaga" / pw "covil"
- Site password: "0009"
- Ver CREDENCIAIS_ADMIN.md no gonzagas_node para lista completa
