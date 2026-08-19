---
slug: consultar-as-duas-bases
tipo: procedimento
dominio: bd
titulo: Como consultar as duas bases — a local em WSL e a de produção, que só se alcança por HTTP
resumo: A local responde a SQL; a de produção não tem SSH nem MySQL abertos e vê-se pelo feed e pelo sitemap públicos. Os números diferem e a diferença é informação.
keywords: local database, production database, MySQL, MariaDB, waphix, SSH closed, HTTP feed, sitemap, read-only queries, environment divergence
valid_from: 2026-08-18
valid_to:
ingested_at: 2026-08-18T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - gonzagas_local
  - artnshin_gonzagas_db
  - waphix
  - artnshine.pt
  - monitor.py
sources:
  - conversa:2026-08-18
  - ficheiro:gonzagas_node/DEPLOYMENT.md
  - ficheiro:docs/memoria/projeto/monitor.py
relations:
  - gonzagas_local | espelha_atrasado | artnshin_gonzagas_db
  - monitor.py | consulta | gonzagas_local
  - monitor.py | consulta | artnshine.pt
---

**Há duas bases de dados e não são a mesma coisa.** Confundi-las leva a
conclusões erradas — já aconteceu: um diagnóstico de «103 itens vão para o
Google com preço zero» media a base local, quando em produção são 23.

## 1. Local — desenvolvimento, em WSL

| | |
|---|---|
| Motor | MySQL 8.0 |
| Base | `gonzagas_local` |
| Utilizador | `gonzagas_dev` |
| Credenciais | `gonzagas_node/.env` (`DB_PASSWORD`, não `DB_PASS`) |

Consulta-se com SQL directo. **Nunca passar a senha na linha de comandos** —
usar `MYSQL_PWD`, como o `monitor.py` faz:

```bash
cd gonzagas_node
PW=$(grep -h '^DB_PASSWORD' .env | cut -d= -f2 | tr -d '\r ')
MYSQL_PWD="$PW" mysql -u gonzagas_dev gonzagas_local -e "SELECT ..."
```

**Só leituras.** Correcções de dados são decisão do programador, não de quem
está a consultar.

## 2. Produção — waphix, e só por HTTP

| | |
|---|---|
| Servidor | waphix, Docker Compose em `/srv/stacks/artnshine/` |
| Motor | MariaDB 11.4, stack separada em `/srv/stacks/mariadb` |
| Base | `artnshin_gonzagas_db`, utilizador `gartnshine` |
| Domínio | `artnshine.pt`, atrás da Cloudflare |

**Não há acesso directo a partir daqui, e é de propósito.** Testado a
2026-08-18:

- **SSH não passa.** Há um `Host waphix` no `~/.ssh/config` (IP
  `176.79.155.200`, chave `id_pc_dev_waphix`), mas a ligação dá *timeout*: o
  router **só encaminha 80 e 443**, não a 22. O IP também é fixo no config
  enquanto o DNS anda por DDNS, portanto pode estar desactualizado.
- **MySQL não está exposto** — a base vive na rede Docker `backend`, sem porta
  publicada.
- `artnshine.pt` resolve para IPs da Cloudflare (`2606:4700:…`), não para o
  servidor.

**O que resta, e chega para quase tudo:** os endpoints públicos, sem
autenticação.

```bash
curl -s https://artnshine.pt/feed/products.xml   # catálogo inteiro, ~505 KB
curl -s https://artnshine.pt/sitemap.xml
curl -s https://artnshine.pt/robots.txt
curl -s https://artnshine.pt/loja/produto/<slug>
```

O **feed é o melhor espelho do catálogo real**: traz referência, nome,
descrição, preço, disponibilidade, imagem, família e cor de cada peça activa.
Para contar preços a zero em produção:

```bash
curl -s https://artnshine.pt/feed/products.xml \
  | grep -c '<g:price>0.00 EUR'
```

O `monitor.py` já faz isto na secção **Produção publicada**, e compara com a
local.

## A divergência medida (2026-08-18)

| | Local | Produção |
|---|---|---|
| Itens no feed | 511 | 511 |
| Preço 0,00 EUR | **103** | **23** |
| `in_stock` | 322 | 292 |

**A base local está 80 preços atrás.** Não é erro — é o normal: os preços vão
sendo postos em produção pelo admin e a cópia local não acompanha. O mesmo
vale para o schema, que também difere ([[db-dev-vs-production]]), e para os
ficheiros de media ([[media-local-vs-producao]]).

**Regra:** qualquer afirmação sobre *o que o cliente vê* ou *o que o Google
recebe* tem de ser verificada em produção, não na base local. A local serve
para perceber estrutura, testar queries e desenvolver.

## Se for preciso acesso profundo a produção

Pedir ao programador. A documentação de infraestrutura — scripts de
redeploy, backups, registo de incidentes — vive no próprio servidor, não neste
repositório ([[waphix-production-infra]]). Há dumps de 2026-07-09 em
`docs/db/`, mas estão **ignorados pelo git de propósito**: contêm a chave
`sk_live` da Stripe em texto simples ([[seguranca-chaves-stripe]]).
