# Instruções de deploy — Instagram, loja e transições

**Para:** agente de deployment
**Destino:** produção `artnshine.pt` (servidor waphix, Docker Compose)
**Alcance:** commits `420340f` → `HEAD` em `main` (inclui a mudança de nome
para "Gonzaga", a migração `/catalog` → `/loja` e a categoria em slug no URL)
**Migrações a correr:** `010`, `011` e `012` — todas aditivas

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
| **Transições** | View Transitions entre páginas, com a fotografia a acompanhar a navegação (o cartão transforma-se na imagem da ficha). `scroll-behavior` passa a respeitar movimento reduzido. |
| **Barra de progresso** | Linha fina por baixo do cabeçalho com marcas nas secções, que permitem saltar. |
| **Setas entre peças** | Anterior/seguinte na ficha, dentro da mesma categoria, com posição ("12 / 90") e transição direccional. |
| **Correcção de links** | O cartão de produto ligava a `/catalog?family=N` em vez da ficha — e nem filtrava, porque o catálogo lê `families` (plural). |
| **Cabeçalhos de material** | Prata, Latão e Macramé apareciam sem fotografia: a subquery da imagem de recurso ignorava as subcategorias. |
| **Mudança de nome** | "Gonzaga's Art & Shine" passa a **Gonzaga** (SEO: "Gonzaga Jewellery"). A marca vive agora em `config/brand.js`. |
| **Botão "voltar"** | Em todas as páginas menos a inicial, com destino hierárquico. |
| **Catálogo passa a Loja** | `/catalog` → `/loja` e `/catalog/product/:slug` → `/loja/produto/:slug`. **410 URLs indexadas**, todas com 301 permanente. |
| **Categoria no URL** | `?families=16` passa a `?categoria=prata`. O antigo continua a responder, com 301. Acrescenta canónico e `robots` por caso. |
| **Cartão "Ver todos"** | Ganha imagem, título e legenda no admin (migração 012). A contagem passa a ser a da loja inteira, não a do filtro. |
| **Subcategorias na loja** | Escolher um material abre as subcategorias por baixo; numa subcategoria mostram-se as irmãs. |
| **Ordem intercalada** | As peças deixam de vir em blocos por família — eram 30 anéis antes do primeiro colar. |
| **Chips de filtro** | Deixam de cortar a primeira linha de produtos (não tinham margem inferior nenhuma). |
| **Navegação da ficha** | Três barras empilhadas passam a duas; o caminho inclui a categoria (também no schema.org); "8 / 90" passa a "8.ª de 28 em Anéis - Prata". |
| **Contagem das setas** | Contava as peças activas todas, incluindo escondidas do catálogo e sem stock: dizia "de 90" onde a loja anuncia 28, e levava a peças que não estão à venda. |

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

### Correcções de navegação incluídas

Duas afectam links que já estavam em produção:

- **O cartão de produto não levava à ficha.** Em `/categoria/:slug` e
  `/colecao/:slug` clicar numa peça abria uma listagem. Depois desta
  alteração o crawl interno passou de **116 para 356 ligações** — as fichas
  de produto não estavam ligadas a partir de nenhuma página de categoria ou
  colecção, nem para quem navega nem para o Google.
- **O cartão não mostrava o nome da peça**, só referência, categoria e preço.

### Sobre as transições

São CSS mais dois pontos que **têm de ficar inline no `<head>`** e não em
ficheiros externos — está assim no `views/layouts/main.ejs` e não deve ser
"arrumado" para fora:

1. `@view-transition { navigation: auto }`. Estava em `transitions.css`, a
   16.ª folha de estilo da página, e a transição **nunca chegava a
   acontecer**: `pageswap` criava-a e `pagereveal` descartava-a, porque a
   adesão ainda não tinha sido descoberta.
2. O listener de `pagereveal` que aplica a direcção das setas. Em
   `view-transitions.js` (carregado no fim do `<body>`) o evento já tinha
   passado quando o ficheiro corria.

Onde o browser não suporta View Transitions (hoje sobretudo o Firefox) é
tudo ignorado e a navegação fica como estava — não há risco de páginas
esbatidas.

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

Depois, a migração da mudança de nome:

```bash
docker exec -i mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  < sql/migrations/011_rebranding_gonzaga.sql
```

Substitui o nome antigo em textos guardados (descrições de categorias,
produtos e coleções). No ambiente local só havia **uma** ocorrência, mas
produção tem produtos que não existem localmente — daí correr em todas as
tabelas por precaução.

A migração termina com uma contagem de confirmação: **as quatro linhas têm de
dar 0**. Se alguma não der, parar e reportar.

Não altera estrutura nenhuma e é idempotente. **Não é reversível
automaticamente** — o texto antigo não fica guardado; repõe-se do backup do
Passo 1.

Por fim, a migração do cartão "Ver todos" da loja:

```bash
docker exec -i mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  < sql/migrations/012_loja_cartao_ver_todos.sql
```

Esperado: `Migration 012 completed: site_settings.shop_all_card_image + _title
+ _subtitle ready`.

Três colunas novas (nullable) em `site_settings`, que é uma tabela de uma só
linha. Idempotente e reversível — o rollback está comentado no fim do
ficheiro. Enquanto ficarem a NULL, o cartão comporta-se exactamente como
hoje.

Verificar:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SHOW TABLES LIKE 'instagram%';
SELECT COUNT(*) AS linha_conta FROM instagram_account;
SHOW COLUMNS FROM site_settings LIKE 'shop_all_card%';"
```

**Esperado:** as duas tabelas do Instagram, `linha_conta = 1` e as **três**
colunas `shop_all_card_*`. Se faltar alguma, **parar**.

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

### A migração /catalog → /loja

```bash
# Os endereços novos respondem:
curl -s -o /dev/null -w '%{http_code}\n' https://artnshine.pt/loja

# E os antigos redireccionam, levando os filtros consigo:
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "https://artnshine.pt/catalog?families=1"
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://artnshine.pt/catalog/product/anel-de-prata-com-onix-oval
```

**Esperado:** `/loja` a 200; os dois antigos a **301**, o primeiro para
`/loja?families=1` (com a query intacta) e o segundo para
`/loja/produto/anel-de-prata-com-onix-oval`.

Se a query se perder no redirect, um link partilhado com filtros chega à loja
sem eles — parar e reportar.

```bash
# O sitemap não pode anunciar os endereços antigos:
curl -s https://artnshine.pt/sitemap.xml | grep -c 'artnshine.pt/catalog'  # esperado: 0
curl -s https://artnshine.pt/sitemap.xml | grep -c 'artnshine.pt/loja'     # esperado: 410
```

### A categoria no URL

```bash
# O parâmetro numérico redirecciona para o slug:
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "https://artnshine.pt/loja?families=16"

# E leva os outros filtros consigo:
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "https://artnshine.pt/loja?families=16&sort=name-asc"

# A forma nova responde directamente, sem segundo redirect:
curl -s -o /dev/null -w '%{http_code}\n' "https://artnshine.pt/loja?categoria=prata"
```

**Esperado:** `301 https://artnshine.pt/loja?categoria=prata`, depois
`301 …?categoria=prata&sort=name-asc`, e `200` no último.

Atenção ao id: `16` é "Prata" **no ambiente local**. Em produção os ids podem
ser outros — confirmar primeiro com
`SELECT id, name, slug FROM product_families WHERE parent_id IS NULL;` e usar
o id de lá. O que interessa é que o slug de chegada seja o certo.

```bash
# Canónico e indexação por caso:
curl -s "https://artnshine.pt/loja?categoria=prata" | grep -o '<link rel="canonical"[^>]*>'
curl -s "https://artnshine.pt/loja?categoria=prata&price_range=0-50" | grep -o '<meta name="robots"[^>]*>'
```

**Esperado:** o primeiro aponta para `/categoria/prata` (a versão rica da
mesma listagem — sem isto as duas competem pela mesma pesquisa); o segundo
diz `noindex, follow`.

**Condição de paragem:** se `/loja?categoria=prata` responder 404 ou 500, a
resolução de slugs não está a funcionar e metade dos links da loja estão
partidos.

### O bug dos links foi mesmo corrigido

```bash
# Nenhum cartão pode continuar a apontar para uma listagem:
curl -s https://artnshine.pt/categoria/prata | grep -c 'catalog?family='   # esperado: 0
curl -s https://artnshine.pt/categoria/prata | grep -c '/catalog/product/' # esperado: >0
```

**Condição de paragem:** se a primeira não der 0, o código novo não está a
correr — parar e reportar.

### As transições estão activas

```bash
# A adesão tem de estar inline no <head>, não num ficheiro externo:
curl -s https://artnshine.pt/ | grep -c '@view-transition'   # esperado: 1
curl -s https://artnshine.pt/ | grep -c 'scroll-progress.js' # esperado: 1
```

Se `@view-transition` não aparecer no HTML da própria página, as transições
não vão acontecer, mesmo que o `transitions.css` carregue.

### No browser

| Verificar | Esperado |
|---|---|
| `/loja` | Categorias no topo com imagens e cartão "Ver todos" |
| `/loja` — contagens | A soma das categorias tem de **bater certo** com o número ao lado de "Ver todos". Se não bater, reportar |
| `/loja?categoria=prata` | As categorias encolhem para tira, a activa fica marcada e **abrem as subcategorias por baixo** |
| `/loja?categoria=aneis-prata` | A tira mostra as **irmãs** (Brincos, Colares…), com "Anéis" marcado |
| `/loja` — controlos | Arestas vivas, etiquetas em maiúsculas espaçadas, seta dourada nos menus de ordenação |
| `/loja?categoria=prata` — ordem | As peças vêm **misturadas** entre subcategorias. Se aparecerem 20 anéis seguidos, a intercalação não pegou |
| `/loja?categoria=prata` — chips | A caixa "Prata ×" **não pode encostar** à primeira linha de fotografias |
| `/loja` — barra lateral | Marcar uma família na árvore muda o endereço para `?categoria=<slug>`, sem recarregar |
| `/admin/site-appearance` | Primeiro bloco: **cartão "Ver todos" da loja**, com selector de imagem e dois campos de texto |
| Definir imagem e textos aí | Aparecem no primeiro cartão de `/loja`. Deixar os textos vazios volta a "Ver todos" + contagem |
| Navegar entre páginas | Transição suave; **nenhuma página fica esbatida** ou meio transparente |
| `/galeria` | Sem Instagram ligado: só a galeria da casa, sem divisória órfã |
| Página inicial | Sem Instagram ligado, a faixa "Do Atelier" **não aparece de todo** — não deve ficar um título sem imagens por baixo |
| `/admin` → menu lateral | Tem **Instagram** |
| `/admin/instagram` | Mostra "Token expirado" e avisa que o do `.env` não pode ser renovado |
| **Qualquer página** | Diz **Gonzaga**, não "Art & Shine". O título da aba é `… \| Gonzaga` |
| Página inicial | Título grande: **Gonzaga** / JEWELLERY |
| Código-fonte, schema.org | `"name": "Gonzaga Jewellery"` e `"alternateName": ["Gonzaga", "Gonzaga's Art & Shine"]` — **o nome antigo aqui é intencional**, liga as duas identidades no Google. É a única ocorrência que deve sobrar |
| Logótipo, imagem de partilha, ícones | **Ainda têm a marca antiga** — é trabalho de design, Fase 3 do plano. Não parte nada |
| **Botão "voltar"** | Presente em todas as páginas menos a inicial. Em `/categoria/aneis-prata` diz "Prata"; numa ficha de produto diz o nome da categoria |
| Voltar vindo de dentro do site | Recua no histórico e **repõe a posição de scroll** — não navega para o link |
| Voltar chegando de fora (abrir o URL directamente) | Navega para a página acima. Nunca fica um botão que não faz nada |
| **Clicar numa peça** em `/categoria/prata` | Abre a **ficha do produto**. Se abrir uma listagem, o deploy não pegou |
| Cartão de peça | Mostra o **nome** da peça, além da referência e do preço |
| `/categoria/prata` — cabeçalho | Tem **fotografia** de fundo (antes era liso) |
| Ficha de produto — topo | **Uma** linha com o voltar e o caminho `Início · Loja · <Categoria> · <Peça>` — não três barras empilhadas |
| Ficha de produto — setas | Barra com **← Peça anterior / "8.ª de 28 em <Categoria>" / Peça seguinte →** |
| Esse total | Tem de ser **o mesmo** que `/loja?categoria=<slug>` anuncia. Se disser "de 90" onde a loja diz 28, o código novo não está a correr |
| Clicar em "Seguinte" | Muda de peça e a página entra **pela direita**; em "Anterior" entra pela esquerda |
| Qualquer página longa | Linha dourada fina por baixo do cabeçalho, a encher conforme se desce |
| Marcas na barra | Pontos que saltam para as secções (não aparecem nas categorias — lá o índice lateral já faz isso) |

### Contagens

Repetir a contagem do Passo 1. **Números idênticos** (as tabelas novas estão
vazias, o que é o esperado).

---

## O site sem Instagram ligado

Este deploy pode e deve avançar **sem** o token. Foi verificado com a base de
dados vazia — o mesmo estado em que produção vai ficar — que nenhuma das 6
páginas principais mostra secção vazia, divisória órfã, imagem partida ou
cabeçalho sem conteúdo por baixo. As secções do Instagram simplesmente não
são desenhadas e ninguém que visite o site percebe que existe uma
funcionalidade à espera.

Não há alternativa ao token: testado a 31/07/2026, a página pública do perfil
já não expõe a lista de publicações, o endpoint `?__a=1` está morto e o
oembed público exige token desde 2020.

---

## Passo 7 — Ligar a conta do Instagram (quando houver token)

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

Ao reverter, tem-se presente que voltam dois problemas que este lote corrige:
os cartões de produto deixam outra vez de ligar às fichas, e os cabeçalhos
de material voltam a ficar sem fotografia. Nenhum deles perde dados.

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
- O cartão "Ver todos" fica **exactamente como está hoje** até alguém lhe
  definir imagem ou textos no admin. As três colunas novas nascem a NULL.
- **A verificar em produção, não é deste deploy:** no ambiente local há **38**
  imagens referenciadas na base que não têm ficheiro em
  `public/media/products/` — nem original nem derivados. Dão 404 e a peça
  mostra o marcador "imagem não disponível". Como a base local não é a de
  produção, o mais provável é serem carregamentos feitos em produção que
  nunca desceram para cá. Vale a pena confirmar lá com o mesmo cruzamento
  entre `product_images` e a pasta.
- Nada neste deploy altera produtos, encomendas, clientes ou stock.

---

## Estado da validação local

- `npm test` — **43/43**.
- Auditoria de SEO das **441 URLs do sitemap** (todas, não uma amostra): só
  os títulos longos de nomes de peça já conhecidos, entre 62 e 64 caracteres.
  Zero endereços antigos e zero `families=` no sitemap.
- **345** ligações internas verificadas: nenhuma a dar erro e **nenhuma a
  passar por redirect** — ou seja, o site já liga sempre à forma nova.
- **Nenhum scroll horizontal** em 10 páginas × 3 larguras (30 combinações),
  incluindo as tiras de subcategorias, que correm na horizontal no telemóvel.
- Os chips de filtro deixaram de encostar à grelha: **28px de folga** onde
  antes eram 0.
- Ordem intercalada verificada nas duas pontas da listagem — na primeira
  página **e na última**, que é onde o round-robin simples deixaria o bloco
  da família maior.
- Cartão "Ver todos" testado de ponta a ponta: escolher imagem e textos no
  admin, ver aparecer em `/loja`, limpar os textos e voltar ao automático.
- Filtragem pela barra lateral (sem recarregar) confirmada a escrever
  `?categoria=prata` no endereço e a devolver a mesma ordem que o servidor
  renderiza — se divergissem, recarregar mudava a listagem sem razão.
- Percorridas 6 páginas até ao fim: nenhum dos **423** elementos com revelação
  ao scroll fica preso invisível.
- Navegação pelos 4 itens do menu: sem opacidade presa, sem erros de
  JavaScript, sempre a chegar ao topo da página.
- Com `prefers-reduced-motion: reduce`: `scroll-behavior` passa a `auto` e
  nenhum elemento é escondido.
- Falha da API do Instagram testada com o token expirado: o erro fica
  registado no admin e as páginas públicas continuam a servir normalmente.
- Transições confirmadas por `document.getAnimations()` e não a olho:
  `pagina-entra`/`pagina-sai` na navegação do menu,
  `::view-transition-group(media-produto)` ao clicar numa peça,
  `peca-entra-direita`/`peca-entra-esquerda` nas setas. Com movimento
  reduzido a lista vem vazia.
- Barra de progresso presente nas 6 páginas testadas, com o progresso a
  acompanhar o scroll.

### Como verificar transições (para quem vier a mexer)

Capturas de ecrã durante uma transição **bloqueiam o browser** e não servem.
A forma que funciona é, dentro do evento `pagereveal`, esperar por
`e.viewTransition.ready` e ler `document.getAnimations()` filtrado pelos
pseudo-elementos `view-transition`. Foi assim que se descobriu que as
transições não estavam a acontecer de todo, depois de duas verificações
anteriores as terem dado por boas.
