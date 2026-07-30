# Instruções de deploy — Página inicial, navegação de Coleções e SEO

**Para:** agente de deployment
**Destino:** produção `artnshine.pt` (servidor waphix, Docker Compose)
**Alcance:** commits `e0a364c` → `14db113` (branch `homepage-redesign`, a
integrar em `main`)

> Deploy anterior: [`DEPLOY_COLECOES_GALERIA.md`](DEPLOY_COLECOES_GALERIA.md).
> Se esse ainda **não** foi feito, fazer primeiro esse (traz as migrações
> 006–009 e a semeadura da galeria) e só depois este.

---

## ⛔ Regras invioláveis (ler antes de tudo)

1. **NUNCA correr `npm run db:init` nem `npm run db:reset`.** Fazem `DROP
   TABLE` em `products`, `product_images`, `product_families`, `customers` e
   `suppliers` (ver `scripts/init-db.js:188-190`). Apagariam o catálogo de
   produção.
2. **NUNCA correr `scripts/setup.js`** nem qualquer script com "init", "reset"
   ou "seed" no nome. **Este deploy não precisa de nenhum script.**
3. **NUNCA importar um dump SQL** para a base de dados de produção. A produção
   tem produtos e imagens mais recentes que não existem em mais lado nenhum.
4. **Backup completo antes de qualquer alteração** (Passo 1). Se falhar, parar
   e reportar.
5. Se **qualquer verificação falhar**, parar e reportar. Não improvisar
   correções na base de dados.

---

## O que este deploy é (e não é)

**É só código.** Zero migrações, zero scripts, zero dependências novas
(`git diff` do `package.json` está vazio). Nenhuma linha da base de dados é
lida para escrita, alterada ou apagada.

Isto significa que o **rollback é um `git reset` e um restart** — o backup do
Passo 1 é uma rede de segurança, não algo que se espere usar.

### Conteúdo

| Área | O que muda |
|---|---|
| Página inicial | Novo hero (etiqueta, título, divisor, duas chamadas), manifesto de três pontos, secção de Coleções curadas, "Explorar por Material", faixa de fecho |
| Navegação | Novo item **Coleções** → `/colecoes`; **Galeria** continua em `/collections` |
| Novas páginas | `/colecoes` (índice das coleções curadas) e `/colecao/:slug` (uma coleção) |
| Páginas de material | `/collection/:slug` passa a incluir os produtos das subcategorias (antes algumas apareciam vazias) |
| Textos | Manifesto e faixa de fecho reescritos: já não afirmam que as peças são feitas à mão na casa — a Art&Shine selecciona peças de fornecedores |
| Contactos | Emails passam para `g.art.shine@gmail.com` |
| SEO | Imagens do sitemap, meta descriptions e títulos duplicados (detalhe abaixo) |

### Correcções de SEO incluídas

- As **293 `<image:loc>` do sitemap davam 404**: apontavam para
  `/uploads/products/`, quando as imagens estão em `/media/products/`.
- O sitemap deixa de incluir **famílias sem produtos activos** (eram páginas de
  listagem vazias).
- **95 páginas** tinham meta descriptions abaixo de 60 caracteres, e
  `/catalog`, `/privacy-policy` e `/terms-of-service` partilhavam a mesma.
- **31 modelos repetem o nome** entre peças diferentes, dando títulos e
  descrições iguais; quando o slug foi desambiguado, o título passa a levar a
  referência.
- O login do admin passa a ter `noindex`.

Depois do deploy convém **pedir uma reindexação do sitemap** na Search Console
(ver Passo 5) — foi o único ponto que afectava o Google de forma medível.

---

## Passo 1 — Backup (obrigatório, antes de tudo)

Ler as credenciais de `/srv/stacks/artnshine/.env` (`DB_USER`, `DB_PASSWORD`,
`DB_NAME`) — não as escrever em ficheiros nem em logs.

```bash
cd /srv/stacks/artnshine
set -a; . ./.env; set +a

STAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p /srv/backups/artnshine

docker exec mariadb mysqldump \
  -u"$DB_USER" -p"$DB_PASSWORD" \
  --single-transaction --routines --triggers \
  "$DB_NAME" | gzip > "/srv/backups/artnshine/pre_home_seo_${STAMP}.sql.gz"

ls -lh "/srv/backups/artnshine/pre_home_seo_${STAMP}.sql.gz"
gunzip -t "/srv/backups/artnshine/pre_home_seo_${STAMP}.sql.gz" && echo "backup íntegro"
```

**Condição de paragem:** ficheiro com menos de 1 MB ou `gunzip -t` a falhar →
**parar** e reportar.

Registar as contagens actuais, para comparar no fim:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT 'products' t, COUNT(*) n FROM products
UNION ALL SELECT 'product_images', COUNT(*) FROM product_images
UNION ALL SELECT 'product_families', COUNT(*) FROM product_families
UNION ALL SELECT 'collections', COUNT(*) FROM collections
UNION ALL SELECT 'collection_products', COUNT(*) FROM collection_products
UNION ALL SELECT 'gallery_items', COUNT(*) FROM gallery_items
UNION ALL SELECT 'orders', COUNT(*) FROM orders;"
```

Guardar este output. **No fim têm de ser exactamente os mesmos números.**

---

## Passo 2 — Confirmar que o deploy anterior já está aplicado

Este lote assume as migrações 006–009. Verificar:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SHOW COLUMNS FROM product_families WHERE Field IN
  ('hero_image','card_image','seo_title','seo_description');
SHOW TABLES LIKE 'collection%';
SHOW TABLES LIKE 'gallery_items';"
```

**Esperado:** as quatro colunas e as tabelas `collections`,
`collection_products` e `gallery_items`.

Se faltar alguma coisa, **parar** e aplicar primeiro
[`DEPLOY_COLECOES_GALERIA.md`](DEPLOY_COLECOES_GALERIA.md) (as migrações são
idempotentes, podem ser corridas de novo sem risco).

---

## Passo 3 — Actualizar o código

```bash
cd /srv/stacks/artnshine/app_repo

# ANOTAR o commit actual — é para aqui que se volta em caso de rollback.
git rev-parse --short HEAD | tee /tmp/artnshine_commit_anterior.txt

git fetch origin
git status                            # não deve haver alterações locais
git log --oneline HEAD..origin/main   # confirmar os commits esperados
```

**Condição de paragem:** se `git status` mostrar ficheiros modificados no
servidor, **parar e reportar** — alguém editou código directamente em produção
e isso perder-se-ia.

```bash
git merge --ff-only origin/main
git log --oneline -1                  # deve mostrar 14db113 ou mais recente
```

Os commits esperados neste lote:

```
e0a364c feat(home): upgrade visual da página inicial
6db3930 polish(home): véu dos cartões e alvos de toque
4fb8b91 fix(home): textos verdadeiros e "por Material" a agrupar por material
3dbd4cf feat: navegação para a área de coleções
15c3e53 chore: email de contacto passa a g.art.shine@gmail.com
14db113 fix(seo): imagens do sitemap, descrições finas e títulos duplicados
```

---

## Passo 4 — Reiniciar a aplicação

```bash
cd /srv/stacks/artnshine

# Confirmar que o mariadb está de pé ANTES (causa do 502 de 2026-05-20).
# Sem healthcheck definido este comando devolve vazio — nesse caso confirmar
# com `docker ps` que está "Up".
docker inspect --format='{{.State.Health.Status}}' mariadb
docker ps --filter name=mariadb --format '{{.Names}} {{.Status}}'

docker compose up -d --force-recreate artnshine-app
sleep 20
docker inspect --format='{{.State.Health.Status}}' artnshine-app
docker logs --tail 50 artnshine-app
```

**Esperado:** `healthy` e, nos logs, `✅ Todos os módulos foram inicializados
com sucesso!` sem stack traces.

Não é preciso `npm install` — não há dependências novas.

---

## Passo 5 — Verificação

### Códigos de estado

```bash
for p in / /catalog /colecoes /collections /about /privacy-policy \
         /terms-of-service /sitemap.xml /robots.txt /feed/products.xml; do
  printf "%-24s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://artnshine.pt$p)"
done
```

Todas devem dar **200**. `/colecoes` é nova — se der 404, o código não foi
actualizado.

### As imagens do sitemap deixaram de dar 404 (a correcção principal)

```bash
curl -s https://artnshine.pt/sitemap.xml | grep -c 'uploads/products'   # esperado: 0
curl -s https://artnshine.pt/sitemap.xml | grep -o '<image:loc>[^<]*' \
  | head -5 | sed 's|<image:loc>||' \
  | while read u; do printf "%s -> %s\n" "$u" "$(curl -s -o /dev/null -w '%{http_code}' "$u")"; done
```

**Esperado:** `0` ocorrências de `uploads/products` e as cinco imagens a **200**.
Se alguma der 404, **parar e reportar** — significa que os ficheiros
`-medium.jpg` não foram gerados para esses produtos em produção.

### Sem páginas de listagem vazias no sitemap

```bash
curl -s https://artnshine.pt/sitemap.xml \
  | grep -o 'artnshine.pt/collection/[a-z0-9-]*' | sed 's|artnshine.pt||' \
  | while read p; do
      n=$(curl -s "https://artnshine.pt$p" | grep -c 'product-card')
      [ "$n" -eq 0 ] && echo "VAZIA: $p"
    done
echo "(sem output = nenhuma página vazia)"
```

### No browser

| Verificar | Esperado |
|---|---|
| `https://artnshine.pt/` | Hero novo: etiqueta "Prata 925 · Latão · Pedras Naturais · Macramé", título grande, dois botões |
| `https://artnshine.pt/` — manifesto | Três blocos: **Selecção**, **Materiais**, **Estilo**. **Não** deve dizer "Feitura", "feito à mão" nem "desenhadas em Portugal" |
| `https://artnshine.pt/` — "Explorar por Material" | Cartões de **materiais** (Prata, Latão, Macramé, Pedras Naturais), não de tipos de peça |
| Menu principal | Tem **Coleções**, **Catálogo** e **Galeria**, por esta ordem |
| Clicar em **Coleções** | Vai a `/colecoes`; o item fica destacado (activo) |
| Clicar em **Galeria** | Vai a `/collections`; **Coleções** deixa de estar destacado |
| `/colecoes` | Índice com cartões **visíveis** e, em cada um, "N peças · Família A · Família B" |
| Uma página de material (ex.: Prata) | Mostra produtos, incluindo os das subcategorias, com **preços reais** |
| Rodapé e página de contacto | Email `g.art.shine@gmail.com` (já não o antigo) |
| Ver código-fonte de uma página de produto | `<title>` sem o sufixo longo "- Gonzaga's Art & Shine"; `<meta name="description">` com mais de 60 caracteres |
| `https://artnshine.pt/admin/login` | Ver código-fonte: `<meta name="robots" content="noindex, nofollow">` |
| Telemóvel, página inicial | Hero completo visível: etiqueta, título e **os dois botões** sem corte |

### Nada se perdeu

Repetir a contagem do Passo 1. **Os números têm de ser idênticos.** Se algum
baixou, fazer rollback e reportar.

### Depois de tudo verde — Search Console

Na Search Console de `artnshine.pt`:

1. **Sitemaps** → reenviar `https://artnshine.pt/sitemap.xml`.
2. **Inspecção de URL** → pedir indexação de `https://artnshine.pt/colecoes`.

Isto é o que faz o Google voltar a buscar as imagens que antes davam 404.

---

## Rollback

Como não há alterações de base de dados, o rollback é só código:

```bash
cd /srv/stacks/artnshine/app_repo
git reset --hard "$(cat /tmp/artnshine_commit_anterior.txt)"   # anotado no Passo 3
cd /srv/stacks/artnshine && docker compose up -d --force-recreate artnshine-app
```

Restaurar a base de dados **só** se as contagens do Passo 5 acusarem perda de
dados (o que não deveria ser possível neste deploy):

```bash
gunzip < /srv/backups/artnshine/pre_home_seo_<STAMP>.sql.gz \
  | docker exec -i mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
```

---

## Notas sobre os dados

- **As coleções curadas de produção começam vazias.** A secção "Coleções" da
  página inicial e o `/colecoes` só mostram conteúdo depois de alguém criar
  coleções em `/admin/collections` e lhes associar produtos. Até lá, `/colecoes`
  mostra uma mensagem a encaminhar para o catálogo — é o comportamento
  esperado, não uma falha do deploy.
- **Nenhuma coleção nem destaque é criado por este deploy.** No ambiente local
  de desenvolvimento existem duas coleções de teste ("Pedras Naturais" e
  "Serpentes") e 23 produtos marcados como destacados; isso é **só local** e
  não viaja com o código.
- **Sem capa definida**, os cartões de coleção usam automaticamente a foto de
  uma peça da coleção — nada aparece a preto.
- Nada neste deploy altera produtos, encomendas, clientes ou stock.

---

## Estado da validação local antes deste deploy

- `npm test` — **19/19** a passar.
- Auditoria de SEO das 441 URLs do sitemap — **0 problemas** nas 44 páginas
  fixas; nas 409 páginas de produto, apenas 2 títulos a 64 caracteres (contra
  um limite de 62), o que é irrelevante.
- Sitemap e feed do Merchant Center — XML válido, 441 URLs e 409 artigos, todas
  as imagens a resolver.
- Auditoria visual da página inicial, `/colecoes`, `/catalog`,
  `/colecao/:slug` e `/collections` em 1920, 1440, 820, 390 e 320 px —
  sem overflow horizontal, sem texto cortado, sem erros de JS, sem 404.
