# Instruções de deploy — Instagram, categorias no catálogo e transições

**Para:** agente de deployment
**Destino:** produção `artnshine.pt` (servidor waphix, Docker Compose)
**Alcance:** commits `420340f` e `d6b1b9c` em `main`

> Deploy anterior: [`DEPLOY_CATEGORIAS_GALERIA.md`](DEPLOY_CATEGORIAS_GALERIA.md).
> Este lote **assume** que esse já foi aplicado (endereços `/categoria/:slug` e
> `/galeria` a funcionar). O Passo 2 confirma-o.

---

## ⛔ Regras invioláveis (ler antes de tudo)

1. **NUNCA correr `npm run db:init` nem `npm run db:reset`.** Fazem `DROP
   TABLE` em `products`, `product_images`, `product_families`, `customers` e
   `suppliers` (ver `scripts/init-db.js:188-190`).
2. **NUNCA correr `scripts/setup.js`** nem qualquer script com "init", "reset"
   ou "seed" no nome.
3. **NUNCA importar um dump SQL** para produção.
4. **Backup completo antes de tudo** (Passo 1). Se falhar, parar e reportar.
5. Se **qualquer verificação falhar**, parar e reportar.

---

## O que este deploy faz

| Área | O que muda |
|---|---|
| **Instagram** | Publicações da conta passam a ser guardadas e geridas em `/admin/instagram`: esconder, destacar, sincronizar. Aparecem em `/galeria`, acima da galeria da casa. |
| **Token** | Passa a viver na base de dados e a renovar-se sozinho. O actual, no `.env`, **está expirado desde 10/07/2026**. |
| **Catálogo** | Categorias no topo com as imagens do admin e cartão "Ver todos". Com filtro activo encolhem para uma tira. |
| **Contagens** | `getMaterialsForHome` passa a respeitar `hide_out_of_stock` — mostrava 409 peças ao lado do total de 220 do catálogo. Afecta também a página inicial. |
| **Filtros** | Controlos alinhados com a linguagem da marca (arestas vivas, Georgia, seta dourada). |
| **Transições** | View Transitions entre páginas (CSS puro) e `scroll-behavior` a respeitar movimento reduzido. |

### Alterações de base de dados

**Migração 010 — aditiva.** Duas tabelas novas:

| Tabela | Para quê |
|---|---|
| `instagram_media` | Publicações sincronizadas + estado de moderação |
| `instagram_account` | Token, validade e resultado da última sincronização (uma linha só) |

Nada existente é lido para escrita, alterado ou apagado. **Não toca em
produtos, encomendas, clientes nem stock.**

> **Nota de segurança:** `instagram_account.access_token` fica em texto simples,
> como já acontece com as chaves Stripe. Pertence ao lote de segurança que o
> dono do projecto adiou. Está assinalado no cabeçalho da migração.

### O que NÃO está incluído

**Stories do Instagram não são suportadas** e não o serão por esta via: a API
Instagram Login não as expõe, e mesmo pela Graph API com conta Business
expiram em 24 horas. Ficam posts, reels e carrosséis.

---

## Passo 1 — Backup (obrigatório)

```bash
cd /srv/stacks/artnshine
set -a; . ./.env; set +a

STAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p /srv/backups/artnshine

docker exec mariadb mysqldump \
  -u"$DB_USER" -p"$DB_PASSWORD" \
  --single-transaction --routines --triggers \
  "$DB_NAME" | gzip > "/srv/backups/artnshine/pre_instagram_${STAMP}.sql.gz"

ls -lh "/srv/backups/artnshine/pre_instagram_${STAMP}.sql.gz"
gunzip -t "/srv/backups/artnshine/pre_instagram_${STAMP}.sql.gz" && echo "backup íntegro"
```

**Condição de paragem:** menos de 1 MB ou `gunzip -t` a falhar → parar.

Registar as contagens actuais:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT 'products' t, COUNT(*) n FROM products
UNION ALL SELECT 'product_images', COUNT(*) FROM product_images
UNION ALL SELECT 'product_families', COUNT(*) FROM product_families
UNION ALL SELECT 'gallery_items', COUNT(*) FROM gallery_items
UNION ALL SELECT 'orders', COUNT(*) FROM orders;"
```

---

## Passo 2 — Confirmar o deploy anterior

```bash
for p in /categoria/prata /galeria; do
  printf "%-20s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://artnshine.pt$p)"
done
```

Ambos **200**. Se der 404, aplicar primeiro
[`DEPLOY_CATEGORIAS_GALERIA.md`](DEPLOY_CATEGORIAS_GALERIA.md).

---

## Passo 3 — Actualizar o código

```bash
cd /srv/stacks/artnshine/app_repo

git rev-parse --short HEAD | tee /tmp/artnshine_commit_anterior.txt

git fetch origin
git status                            # não deve haver alterações locais
git log --oneline HEAD..origin/main
git merge --ff-only origin/main
git log --oneline -1                  # deve mostrar d6b1b9c ou mais recente
```

**Condição de paragem:** se `git status` mostrar ficheiros modificados no
servidor, parar e reportar.

---

## Passo 4 — Migração

```bash
cd /srv/stacks/artnshine/app_repo/gonzagas_node

docker exec -i mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  < sql/migrations/010_instagram_media.sql
```

Esperado: `Migration 010 completed: instagram_media + instagram_account ready`.
É idempotente — pode correr mais do que uma vez.

Verificar:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SHOW TABLES LIKE 'instagram%';
SELECT COUNT(*) AS linha_conta FROM instagram_account;"
```

**Esperado:** as duas tabelas e `linha_conta = 1`. Se faltar, **parar**.

---

## Passo 5 — Reiniciar

```bash
cd /srv/stacks/artnshine

docker inspect --format='{{.State.Health.Status}}' mariadb
docker ps --filter name=mariadb --format '{{.Names}} {{.Status}}'

docker compose up -d --force-recreate artnshine-app
sleep 25
docker inspect --format='{{.State.Health.Status}}' artnshine-app
docker logs --tail 60 artnshine-app
```

Não é preciso `npm install` — não há dependências novas.

Nos logs, cerca de 15 segundos após o arranque, aparece uma linha do
verificador do token. Com o token expirado é esperado ver:

```
[instagram] token não renovado: expirado — só um token novo resolve
```

Isto **não é uma falha do deploy** — é o estado real da ligação, que o Passo 7
resolve.

---

## Passo 6 — Verificação

```bash
for p in / /catalog /colecoes /galeria /categoria/prata /sitemap.xml; do
  printf "%-20s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://artnshine.pt$p)"
done
```

Todos **200**. `/galeria` tem de continuar a funcionar mesmo sem Instagram
ligado — a secção do feed simplesmente não aparece.

### No browser

| Verificar | Esperado |
|---|---|
| `/catalog` | Categorias no topo com imagens e cartão "Ver todos" |
| `/catalog` — contagens | A soma das categorias tem de **bater certo** com o número ao lado de "Ver todos". Se não bater, reportar |
| `/catalog?families=<id>` | As categorias encolhem para tira e a que está activa fica marcada |
| `/catalog` — controlos | Arestas vivas, etiquetas em maiúsculas espaçadas, seta dourada nos menus de ordenação |
| Navegar entre páginas | Transição suave; **nenhuma página fica esbatida** ou meio transparente |
| `/galeria` | Sem Instagram ligado: só a galeria da casa, sem divisória órfã |
| `/admin` → menu lateral | Tem **Instagram** |
| `/admin/instagram` | Mostra "Token expirado" e avisa que o do `.env` não pode ser renovado |

### Contagens

Repetir a contagem do Passo 1. **Números idênticos** (as tabelas novas estão
vazias, o que é o esperado).

---

## Passo 7 — Ligar a conta do Instagram (depois do deploy)

**Isto é para o dono do projecto fazer, não para o agente de deployment** —
requer aceder à conta do Instagram.

1. Gerar um **token de longa duração** da conta do Instagram.
   O token actual expirou a 10/07/2026 e **não pode ser renovado** — tem
   mesmo de ser um novo.
2. Entrar em `https://artnshine.pt/admin/instagram`.
3. Colar o token em &laquo;Colar token de acesso&raquo; e gravar.
   É validado contra a API antes de ser guardado; se não prestar, é recusado
   com a mensagem de erro da API.
4. A sincronização corre automaticamente a seguir. As publicações aparecem
   logo no site — escondem-se as que não servirem.

A partir daí o token renova-se sozinho (verificação ao arrancar e uma vez por
dia, com 10 dias de margem sobre os 60 de validade).

---

## Rollback

**Código:**

```bash
cd /srv/stacks/artnshine/app_repo
git reset --hard "$(cat /tmp/artnshine_commit_anterior.txt)"
cd /srv/stacks/artnshine && docker compose up -d --force-recreate artnshine-app
```

As tabelas novas podem ficar — o código antigo ignora-as. **Não é preciso
reverter a migração.**

**Base de dados** (só se as contagens do Passo 6 acusarem perda):

```bash
gunzip < /srv/backups/artnshine/pre_instagram_<STAMP>.sql.gz \
  | docker exec -i mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
```

---

## Notas sobre os dados

- **As tabelas do Instagram começam vazias em produção.** No ambiente local
  existem 9 registos de teste que usam imagens da galeria local — são só
  locais e não viajam com o código.
- Esconder uma publicação **persiste** entre sincronizações. Removê-la apenas
  a apaga da base local; volta na sincronização seguinte. Para a tirar do site
  em definitivo, esconder.
- Nada neste deploy altera produtos, encomendas, clientes ou stock.

---

## Estado da validação local

- `npm test` — **26/26**.
- Auditoria de SEO das 441 URLs — **0 problemas**.
- **Nenhum scroll horizontal** em 12 páginas × 6 tamanhos de ecrã.
- Percorridas 6 páginas até ao fim: nenhum dos **423** elementos com revelação
  ao scroll fica preso invisível.
- Navegação pelos 4 itens do menu: sem opacidade presa, sem erros de
  JavaScript, sempre a chegar ao topo da página.
- Com `prefers-reduced-motion: reduce`: `scroll-behavior` passa a `auto` e
  nenhum elemento é escondido.
- Falha da API do Instagram testada com o token expirado: o erro fica
  registado no admin e as páginas públicas continuam a servir normalmente.
