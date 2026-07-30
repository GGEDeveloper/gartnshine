# Instruções de deploy — Coleções, Galeria e Movimento

**Para:** agente de deployment
**Destino:** produção `artnshine.pt` (servidor waphix, Docker Compose)
**Alcance:** commits `c069153` → `5dd9fe2` em `main`

---

## ⛔ Regras invioláveis (ler antes de tudo)

1. **NUNCA correr `npm run db:init` nem `npm run db:reset`.** Estes scripts
   fazem `DROP TABLE` em `products`, `product_images`, `product_families`,
   `customers` e `suppliers` (ver `scripts/init-db.js:188-190`). Apagariam o
   catálogo de produção. Não são precisos para este deploy.
2. **NUNCA correr `scripts/setup.js`** nem qualquer script com "init", "reset"
   ou "seed" no nome **exceto** o único indicado no Passo 4.
3. **NUNCA importar um dump SQL** para a base de dados de produção. A produção
   tem produtos mais recentes que não existem em mais lado nenhum — um import
   destruiria trabalho real.
4. **Backup completo antes de qualquer alteração** (Passo 1). Se o backup
   falhar, parar e reportar; não avançar.
5. Se **qualquer passo de verificação falhar**, parar e reportar antes de
   continuar. Não improvisar correções na base de dados.

---

## Contexto do que vai ser instalado

Novas funcionalidades e várias correções. As quatro migrações são
**aditivas** (só acrescentam colunas/tabela nova) — nenhuma linha de dados
existente é lida, alterada ou apagada.

| Migração | O que faz |
|---|---|
| `006_add_family_hero_and_gallery.sql` | Coluna `product_families.hero_image` (nullable) + tabela nova `gallery_items` |
| `007_add_section_backgrounds.sql` | Colunas `site_settings.featured_background` e `media_strip_background` (nullable) |
| `008_collection_params.sql` | Colunas `product_families.card_image`, `seo_title` e `seo_description` (nullable) |
| `009_curated_collections.sql` | Tabelas novas `collections` e `collection_products` (coleções curadas) |

Todas são idempotentes (verificam se já existem antes de criar), por isso
podem ser corridas mais do que uma vez sem efeito duplicado.

**Modo de falha se as migrações não correrem:** o site continua a funcionar,
mas as funcionalidades novas ficam inertes — **exceto a galeria**, que
apareceria vazia (ver Passo 4, é o passo crítico).

---

## Passo 1 — Backup (obrigatório, antes de tudo)

Ler as credenciais de `/srv/stacks/artnshine/.env` (variáveis `DB_USER`,
`DB_PASSWORD`, `DB_NAME`) — não as escrever em ficheiros nem em logs.

```bash
cd /srv/stacks/artnshine
set -a; . ./.env; set +a

STAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p /srv/backups/artnshine

docker exec mariadb mysqldump \
  -u"$DB_USER" -p"$DB_PASSWORD" \
  --single-transaction --routines --triggers \
  "$DB_NAME" | gzip > "/srv/backups/artnshine/pre_colecoes_${STAMP}.sql.gz"

# Verificar que o backup não está vazio nem truncado
ls -lh "/srv/backups/artnshine/pre_colecoes_${STAMP}.sql.gz"
gunzip -t "/srv/backups/artnshine/pre_colecoes_${STAMP}.sql.gz" && echo "backup íntegro"
```

**Condição de paragem:** se o ficheiro tiver menos de 1 MB ou `gunzip -t`
falhar, **parar** e reportar.

Registar também as contagens atuais, para comparar no fim:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT 'products' t, COUNT(*) n FROM products
UNION ALL SELECT 'product_images', COUNT(*) FROM product_images
UNION ALL SELECT 'product_families', COUNT(*) FROM product_families
UNION ALL SELECT 'orders', COUNT(*) FROM orders;"
```

Guardar este output. **No fim, estes números têm de ser exatamente os mesmos.**

---

## Passo 2 — Atualizar o código

```bash
cd /srv/stacks/artnshine/app_repo

# ANOTAR o commit atual — é para aqui que se volta em caso de rollback.
git rev-parse --short HEAD | tee /tmp/artnshine_commit_anterior.txt

git fetch origin
git log --oneline HEAD..origin/main   # confirmar que aparecem os commits esperados
git status                            # confirmar que não há alterações locais por gravar
```

**Condição de paragem:** se `git status` mostrar ficheiros modificados no
servidor, **parar e reportar** — alguém editou código diretamente em produção
e isso perder-se-ia.

```bash
git merge --ff-only origin/main
git log --oneline -1                  # deve mostrar 5dd9fe2 (ou mais recente)
```

---

## Passo 3 — Migrações de base de dados

```bash
cd /srv/stacks/artnshine/app_repo/gonzagas_node

docker exec -i mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  < sql/migrations/006_add_family_hero_and_gallery.sql

docker exec -i mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  < sql/migrations/007_add_section_backgrounds.sql

docker exec -i mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  < sql/migrations/008_collection_params.sql

docker exec -i mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  < sql/migrations/009_curated_collections.sql
```

Cada uma deve imprimir uma linha `Migration 00X completed: ...`.

Verificar:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SHOW COLUMNS FROM product_families WHERE Field IN
  ('hero_image','card_image','seo_title','seo_description');
SHOW COLUMNS FROM site_settings LIKE '%background%';
SHOW TABLES LIKE 'gallery_items';
SHOW TABLES LIKE 'collection%';"
```

**Esperado:** as quatro colunas em `product_families`
(`hero_image`, `card_image`, `seo_title`, `seo_description`), as duas de
`site_settings` (`featured_background`, `media_strip_background`) e as tabelas
`gallery_items`, `collections` e `collection_products`. Se faltar alguma,
**parar e reportar**.

---

## Passo 4 — Semear a galeria ⚠️ PASSO CRÍTICO

A página `/collections` deixou de ler a pasta de imagens diretamente e passou
a ler da base de dados. **Sem este passo a galeria pública fica vazia.**

Tem de correr **dentro do container** (é lá que estão as dependências e o
`.env` que a app usa):

```bash
docker exec -w /app artnshine-app node scripts/seed-gallery-items-from-fs.js
```

Output esperado: `Galeria semeada: N adicionada(s), 0 já existente(s), de N ficheiro(s).`

O script lê a pasta `public/media/gallery/` **do servidor de produção** e cria
uma linha por imagem, pela ordem atual. É idempotente: correr outra vez não
duplica nada.

Verificar:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT COUNT(*) AS total, SUM(is_active) AS visiveis FROM gallery_items;"
```

**Condição de paragem:** se `total` for 0, **parar e reportar** — a galeria
pública ficaria vazia.

---

## Passo 5 — Reiniciar a aplicação

```bash
cd /srv/stacks/artnshine

# Confirmar que o mariadb está a correr ANTES (causa do 502 de 2026-05-20).
# Se o container não tiver healthcheck definido, este comando devolve vazio —
# nesse caso confirmar com `docker ps` que está "Up".
docker inspect --format='{{.State.Health.Status}}' mariadb   # esperado: healthy
docker ps --filter name=mariadb --format '{{.Names}} {{.Status}}'

docker compose up -d --force-recreate artnshine-app
sleep 20
docker inspect --format='{{.State.Health.Status}}' artnshine-app
docker logs --tail 50 artnshine-app
```

**Esperado:** `healthy` e, nos logs, `✅ Todos os módulos foram inicializados
com sucesso!` sem stack traces.

Nota: não é preciso instalar nada de novo — não foram adicionadas dependências
de runtime (só `jest`/`supertest`, que são de desenvolvimento). A dependência
`sequelize` foi removida do `package.json`; o código já não a usa.

---

## Passo 6 — Verificação funcional

```bash
for p in / /collections /catalog /sitemap.xml /feed/products.xml; do
  printf "%s -> %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://artnshine.pt$p)"
done
```

Todas devem dar **200**.

Depois, verificar no browser:

| Verificar | Esperado |
|---|---|
| `https://artnshine.pt/collections` | Mostra as imagens da galeria (não "Coleção em Preparação") |
| Clicar numa imagem da galeria | Abre a ampliação (antes não abria — estava bloqueada) |
| `https://artnshine.pt/` | Secção "Explorar Coleções" com **fotografias** nos cartões (não blocos pretos) e botão "Ver galeria completa" |
| `https://artnshine.pt/collection/1` | Preços reais visíveis (antes dizia sempre "Preço sob consulta") e cabeçalho com imagem |
| `/admin` → menu lateral | Tem **Coleções** e **Galeria**. **Não** deve ter "Media" |
| `/admin` → menu lateral | Tem **Coleções**, **Galeria** e **Aspeto do Site** |
| `/admin/collections` | Área das coleções curadas (vazia no início — é normal, ainda não existe nenhuma) |
| `/admin/site-appearance` | Dois separadores legíveis: imagens das categorias e fundos da página inicial |
| `https://artnshine.pt/collection/99999` | Dá **404 depressa**. Antes deste deploy o pedido ficava pendurado sem resposta |
| `/admin/gallery` | Lista as imagens semeadas no Passo 4 |
| `/admin/products` → editar um produto → "Adicionar da biblioteca" | Continua a abrir e a listar imagens (usa a API de media, que foi mantida) |

Confirmar por fim que **nenhum dado se perdeu** — repetir a contagem do Passo 1:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT 'products' t, COUNT(*) n FROM products
UNION ALL SELECT 'product_images', COUNT(*) FROM product_images
UNION ALL SELECT 'product_families', COUNT(*) FROM product_families
UNION ALL SELECT 'orders', COUNT(*) FROM orders;"
```

**Os números têm de ser idênticos aos do Passo 1.** Se algum baixou, fazer
rollback imediatamente (secção seguinte) e reportar.

---

## Rollback

**Código** (resolve tudo o que seja visual ou de aplicação):

```bash
cd /srv/stacks/artnshine/app_repo
git reset --hard "$(cat /tmp/artnshine_commit_anterior.txt)"   # anotado no Passo 2
cd /srv/stacks/artnshine && docker compose up -d --force-recreate artnshine-app
```

As colunas e a tabela novas podem ficar na base de dados sem problema — o
código antigo ignora-as. **Não é preciso reverter as migrações.**

**Base de dados** (só se as contagens do Passo 6 acusarem perda de dados):

```bash
gunzip < /srv/backups/artnshine/pre_colecoes_<STAMP>.sql.gz \
  | docker exec -i mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
```

---

## Notas sobre os dados

- As **capas das coleções** começam todas vazias em produção — é o esperado.
  Sem capa definida, tanto os cartões da página inicial como o cabeçalho da
  página da coleção usam automaticamente uma fotografia de uma peça dessa
  coleção, por isso nada aparece vazio. Definir capas no admin
  (`/admin/collections`) é opcional e serve para escolher melhor a
  imagem.
- A página **`/admin/media/library` deixou de existir** (dava 404). Era um
  segundo painel a gerir as mesmas imagens que a Galeria. Se alguém tiver esse
  endereço nos favoritos, passa a usar `/admin/gallery`.
- Os **fundos das secções** (`featured_background`, `media_strip_background`)
  começam a NULL — sem alteração visual até alguém escolher uma imagem.
- Nada neste deploy altera produtos, encomendas, clientes ou stock.
