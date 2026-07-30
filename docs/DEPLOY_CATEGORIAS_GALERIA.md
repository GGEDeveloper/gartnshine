# Instruções de deploy — Categorias, Galeria e separação de conceitos

**Para:** agente de deployment
**Destino:** produção `artnshine.pt` (servidor waphix, Docker Compose)
**Alcance:** commits a seguir a `ff44d57` em `main`

> Deploy anterior: [`DEPLOY_HOME_NAV_SEO.md`](DEPLOY_HOME_NAV_SEO.md), já
> aplicado (confirmado em produção: sitemap sem `/uploads/`, categorias vazias
> excluídas, meta description nova no catálogo).

---

## ⛔ Regras invioláveis (ler antes de tudo)

1. **NUNCA correr `npm run db:init` nem `npm run db:reset`.** Fazem `DROP
   TABLE` em `products`, `product_images`, `product_families`, `customers` e
   `suppliers` (ver `scripts/init-db.js:188-190`).
2. **NUNCA correr `scripts/setup.js`** nem qualquer script com "init", "reset"
   ou "seed" no nome. O único script deste deploy é o do Passo 3, que só
   escreve na coluna `slug`.
3. **NUNCA importar um dump SQL** para produção.
4. **Backup completo antes de tudo** (Passo 1). Se falhar, parar e reportar.
5. Se **qualquer verificação falhar**, parar e reportar.

---

## O que este deploy faz

Separa três conceitos que estavam misturados nos endereços e nas vistas:

| Conceito | Endereço novo | Endereço antigo |
|---|---|---|
| **Categoria** (taxonomia: material → tipo) | `/categoria/:slug` | `/collection/:id` |
| **Coleção curada** (conjunto escolhido à mão) | `/colecoes`, `/colecao/:slug` | (já estava certo) |
| **Galeria** (fotografias, sem produtos) | `/galeria` | `/collections` |

Antes, `/collection/` e `/collections` diziam ambos "colecção" e nenhum dos
dois era uma colecção.

### A correcção de fundo: as categorias não tinham slug

A coluna `product_families.slug` existia, e havia até um redirect de id→slug,
mas `create` e `update` nunca a escreviam. Resultado: **as 25 categorias
estavam todas a NULL** e produção servia 23 URLs numéricos indexados
(`/collection/16`). O Passo 3 preenche-os.

### Uma alteração de CSS global

`html`/`body` tinham `overflow-x: hidden`, o que os torna contentor de scroll e
quebra `position: sticky` em toda a página — era o que impedia o índice lateral
de colar. Passaram a `overflow-x: clip`, com `hidden` declarado antes como
recurso para browsers antigos. Foi verificado que **nenhuma** das 12 páginas
principais ganha scroll horizontal, em 6 tamanhos de ecrã.

### Alterações de base de dados

**Nenhuma migração de schema.** A única escrita é o preenchimento da coluna
`slug` nas categorias que a têm vazia (Passo 3). Não toca em produtos,
encomendas, clientes nem stock.

### Redirects 301 (o que protege o SEO)

- `/collection/:id` e `/collection/:slug` → `/categoria/:slug`
- `/collections` → `/galeria`
- `/instagram`, `/instagram-preview`, `/instagram-lab` → `/galeria`
  (directamente, para não criar cadeia de 301)

---

## Passo 1 — Backup (obrigatório)

Ler as credenciais de `/srv/stacks/artnshine/.env` — não as escrever em
ficheiros nem em logs.

```bash
cd /srv/stacks/artnshine
set -a; . ./.env; set +a

STAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p /srv/backups/artnshine

docker exec mariadb mysqldump \
  -u"$DB_USER" -p"$DB_PASSWORD" \
  --single-transaction --routines --triggers \
  "$DB_NAME" | gzip > "/srv/backups/artnshine/pre_categorias_${STAMP}.sql.gz"

ls -lh "/srv/backups/artnshine/pre_categorias_${STAMP}.sql.gz"
gunzip -t "/srv/backups/artnshine/pre_categorias_${STAMP}.sql.gz" && echo "backup íntegro"
```

**Condição de paragem:** menos de 1 MB ou `gunzip -t` a falhar → parar.

Registar as contagens actuais:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT 'products' t, COUNT(*) n FROM products
UNION ALL SELECT 'product_images', COUNT(*) FROM product_images
UNION ALL SELECT 'product_families', COUNT(*) FROM product_families
UNION ALL SELECT 'orders', COUNT(*) FROM orders;"
```

**Guardar também os slugs actuais**, porque é a coluna que vai mudar:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT id, name, slug FROM product_families ORDER BY id;"
```

---

## Passo 2 — Actualizar o código

```bash
cd /srv/stacks/artnshine/app_repo

git rev-parse --short HEAD | tee /tmp/artnshine_commit_anterior.txt

git fetch origin
git status                            # não deve haver alterações locais
git log --oneline HEAD..origin/main
git merge --ff-only origin/main
```

**Condição de paragem:** se `git status` mostrar ficheiros modificados no
servidor, parar e reportar.

---

## Passo 3 — Preencher os slugs das categorias ⚠️ PASSO CRÍTICO

**Sem este passo os URLs `/categoria/:slug` não funcionam** e as categorias
ficam inacessíveis.

Ver primeiro o que vai fazer, sem escrever nada:

```bash
docker exec -w /app artnshine-app node scripts/backfill-family-slugs.js --dry-run
```

Deve listar as categorias sem slug e os slugs que lhes daria (ex.:
`Prata → prata`, `Aneis - Prata → aneis-prata`). Confirmar que os nomes fazem
sentido e que não há nada estranho.

Depois, aplicar:

```bash
docker exec -w /app artnshine-app node scripts/backfill-family-slugs.js
```

Output esperado: `Slugs preenchidos: N de N.` e
`Verificado: nenhuma categoria ficou sem slug.`

O script só escreve onde `slug IS NULL OR slug = ''`, por isso **não altera
slugs já existentes** e é idempotente.

Verificar:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT COUNT(*) AS sem_slug FROM product_families WHERE slug IS NULL OR slug = '';
SELECT id, name, slug FROM product_families ORDER BY id;"
```

**Condição de paragem:** se `sem_slug` for maior que 0, **parar e reportar**.

---

## Passo 4 — Reiniciar a aplicação

```bash
cd /srv/stacks/artnshine

docker inspect --format='{{.State.Health.Status}}' mariadb
docker ps --filter name=mariadb --format '{{.Names}} {{.Status}}'

docker compose up -d --force-recreate artnshine-app
sleep 20
docker inspect --format='{{.State.Health.Status}}' artnshine-app
docker logs --tail 50 artnshine-app
```

Não é preciso `npm install` — não há dependências novas.

---

## Passo 5 — Verificação

### Endereços novos

```bash
for p in / /catalog /colecoes /galeria /categoria/prata /categoria/aneis-prata \
         /sitemap.xml /robots.txt /feed/products.xml; do
  printf "%-26s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://artnshine.pt$p)"
done
```

Todos **200**. Se `/categoria/prata` der 404, o Passo 3 não correu.

### Os 301 (o que protege o SEO)

```bash
for p in /collection/16 /collection/1 /collections /instagram; do
  printf "%-18s %s → %s\n" "$p" \
    "$(curl -s -o /dev/null -w '%{http_code}' https://artnshine.pt$p)" \
    "$(curl -s -o /dev/null -w '%{redirect_url}' https://artnshine.pt$p)"
done
```

**Esperado:** todos `301`, e o destino a ser `/categoria/...` ou `/galeria`.
Nenhum pode apontar para outro redirect (cadeia).

Confirmar que **todos** os 23 URLs antigos redireccionam:

```bash
for i in 1 2 3 4 5 6 7 8 9 11 12 13 14 15 16 17 18 19 22 23 24 25 26; do
  c=$(curl -s -o /dev/null -w '%{http_code}' "https://artnshine.pt/collection/$i")
  [ "$c" != "301" ] && echo "FALHA: /collection/$i deu $c"
done
echo "(sem output = todos a redireccionar)"
```

### O sitemap já não anuncia os endereços antigos

```bash
curl -s https://artnshine.pt/sitemap.xml | grep -c 'artnshine.pt/collection'   # esperado: 0
curl -s https://artnshine.pt/sitemap.xml | grep -c 'artnshine.pt/categoria/'   # esperado: 23
curl -s https://artnshine.pt/sitemap.xml | grep -c 'artnshine.pt/galeria'      # esperado: 1
```

### No browser

| Verificar | Esperado |
|---|---|
| `https://artnshine.pt/categoria/prata` | Produtos **agrupados por subcategoria** (Aneis, Brincos, Colares...) com índice lateral fixo à esquerda |
| Clicar num item do índice | Salta para o bloco e o item fica marcado a dourado |
| Fazer scroll numa categoria de topo | O índice **fica colado** ao lado enquanto os produtos passam. Se ele desaparecer para cima, o `overflow-x: clip` de `main.css`/`frontend-mobile.css` não foi aplicado |
| Continuar a fazer scroll | O item marcado acompanha a secção em que se está |
| Telemóvel, `/categoria/prata` | O índice passa a barra horizontal colada ao topo, deslizável |
| `https://artnshine.pt/categoria/aneis-prata` | Sem índice (não tem subcategorias), mas com "Mais em Prata" no fim e o selector de ordenação |
| Fim de qualquer categoria | Secção de navegação **sem categorias vazias** e sem misturar materiais com tipos |
| Menu principal, numa categoria | Fica aceso **Catálogo**, não "Coleções" |
| Menu principal, em `/galeria` | Fica aceso **Galeria** |
| Página de um produto | Diz "Categoria:" (não "Collection:") e o botão é "Ver categoria" |
| Botão voltar ao topo | Aparece ao descer — **já existia**, não foi duplicado |

### Nada se perdeu

Repetir a contagem do Passo 1. **Números idênticos.**

### Depois de tudo verde — Search Console

1. **Sitemaps** → reenviar `https://artnshine.pt/sitemap.xml`.
2. **Inspecção de URL** → pedir indexação de
   `https://artnshine.pt/categoria/prata` e `https://artnshine.pt/galeria`.
3. Nas semanas seguintes, o relatório de cobertura vai mostrar os
   `/collection/:id` como "Página com redirecionamento" — é o esperado.

---

## Rollback

**Código:**

```bash
cd /srv/stacks/artnshine/app_repo
git reset --hard "$(cat /tmp/artnshine_commit_anterior.txt)"
cd /srv/stacks/artnshine && docker compose up -d --force-recreate artnshine-app
```

Os slugs preenchidos **podem ficar** — o código antigo já sabia lidar com
eles (tinha o redirect id→slug) e passaria a servir `/collection/prata` em vez
de `/collection/16`, o que não parte nada.

Se mesmo assim se quiser limpar os slugs (não recomendado, perde-se o
trabalho do Passo 3):

```bash
# Só com os valores anotados no Passo 1 à frente, para repor o estado exacto.
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
UPDATE product_families SET slug = NULL WHERE id IN (...);"
```

**Base de dados completa** (só se as contagens acusarem perda):

```bash
gunzip < /srv/backups/artnshine/pre_categorias_<STAMP>.sql.gz \
  | docker exec -i mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
```

---

## Estado da validação local

- `npm test` — **26/26** (eram 19; os 7 novos guardam os 301, o agrupamento
  por subcategoria e a garantia de que nenhuma categoria fica sem slug).
- Auditoria de SEO das 441 URLs do sitemap — **0 problemas** nas 44 páginas
  fixas; nas 409 de produto, 2 títulos a 64 caracteres (limite 62).
- Auditoria visual de `/categoria/prata`, `/categoria/aneis-prata`, `/`,
  `/galeria`, `/colecoes`, `/catalog` e `/colecao/:slug` em 1920, 1440, 820,
  390 e 320 px — sem overflow horizontal do `body`, sem texto cortado, sem
  erros de JS, alvos de toque ≥44px.
