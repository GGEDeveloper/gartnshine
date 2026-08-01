# Instruções de deploy — fundações de design + imagens de categoria

**Para:** agente de deployment
**Destino:** produção `artnshine.pt` (servidor waphix, Docker Compose)
**Alcance:** commits deste lote em `main`
**Migrações a correr:** `014` — aditiva
**Dependências novas:** nenhuma (`sharp` e `jimp` já estavam instalados)
**Configuração nova obrigatória:** nenhuma

> Deploy anterior: [`DEPLOY_CONTA_OBRIGATORIA.md`](DEPLOY_CONTA_OBRIGATORIA.md).

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

## ⚠️ Ler antes: este deploy muda o aspeto do site

Ao contrário dos anteriores, este **muda o que o cliente vê em todas as
páginas**. Duas coisas em concreto:

### 1. A tipografia passa a ser a da marca

O site descarregava Cinzel e Source Sans 3 do Google Fonts mas o CSS pedia
Playfair Display, Poppins e Georgia — nenhuma delas carregada. Resultado: as
fontes da marca só apareciam no header e tudo o resto renderizava em fallbacks
do sistema.

A partir deste deploy, **os títulos são Cinzel em todo o site**. É a
tipografia que a marca já declarava, mas é uma mudança visível.

**Se o cliente não gostar, é reversível numa linha:**
`public/css/design-system.css`, tokens `--font-display` / `--font-body`.

### 2. A página de categoria passa a mostrar menos peças

`/categoria/prata` mostrava **258 peças**; a loja mostrava **112** para o mesmo
material. A diferença era a definição `hide_out_of_stock` do site (que está a
`1`): a loja respeitava-a, a página de categoria não.

Agora ambas mostram **112**. Não se perdeu nada — as peças esgotadas continuam
na base de dados e voltam a aparecer se a definição for desligada no admin.

---

## Passo 1 — Backup (obrigatório)

```bash
ssh <waphix>
cd /opt/gonzaga   # ou o caminho do compose em uso
docker compose exec -T db mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" \
  --single-transaction --routines --triggers gonzagas_db \
  > ~/backup-antes-design-system-$(date +%F-%H%M).sql
ls -lh ~/backup-antes-design-system-*.sql
```

Se o ficheiro tiver menos de 1 MB, **parar** — o dump falhou.

Backup dos ficheiros de média (as imagens de categoria são novas, mas a pasta
`gallery` é a origem delas):

```bash
tar czf ~/backup-media-$(date +%F-%H%M).tar.gz -C /opt/gonzaga/public media/
```

---

## Passo 2 — Atualizar o código

```bash
cd /opt/gonzaga
git fetch origin
git log --oneline HEAD..origin/main    # confirmar que são os commits esperados
git pull origin main
```

Não há dependências novas, mas correr `npm ci --omit=dev` se o `package-lock.json`
tiver mudado (não devia ter).

---

## Passo 3 — Migração 014 (aditiva)

Acrescenta quatro colunas *nullable* a `product_families`:
`hero_source`, `hero_crop`, `card_source`, `card_crop`.

Guardam a origem e o rectângulo de recorte escolhidos no admin, para se poder
reabrir o editor no enquadramento anterior. **`hero_image` e `card_image`
continuam a ser o que as views usam** — nada nas views depende das colunas
novas.

```bash
docker compose exec -T db mysql -u root -p"$MYSQL_ROOT_PASSWORD" gonzagas_db \
  < sql/migrations/014_category_image_crop.sql
```

Saída esperada:

```
Migration 014 completed: product_families.hero_source/hero_crop/card_source/card_crop ready
```

Verificar:

```bash
docker compose exec -T db mysql -u root -p"$MYSQL_ROOT_PASSWORD" gonzagas_db \
  -e "DESCRIBE product_families;" | grep -E 'hero|card'
```

Devem aparecer seis linhas: `hero_image`, `hero_source`, `hero_crop`,
`card_image`, `card_source`, `card_crop`.

A migração é **idempotente** — pode correr as vezes que forem precisas.

---

## Passo 4 — Pasta de imagens de categoria

O processador cria `public/media/categories/` sozinho, mas em Docker convém
garantir que existe e que o utilizador do container escreve nela:

```bash
mkdir -p /opt/gonzaga/public/media/categories
chown -R node:node /opt/gonzaga/public/media/categories   # ajustar ao utilizador do container
```

Se este volume não for persistente no compose, **as imagens de categoria
desaparecem no próximo deploy**. Confirmar que `public/media` está num volume
montado (deve estar — os produtos já lá vivem).

---

## Passo 5 — Reiniciar

```bash
docker compose up -d --build app
docker compose logs -f --tail=80 app
```

Esperar por `✅ Todos os módulos foram inicializados com sucesso!` e
`✅ Sessões persistentes na base de dados`.

---

## Passo 6 — Verificações (todas obrigatórias)

### 6.1 Rotas públicas

```bash
for p in / /loja /colecoes /galeria /about /cart /account/login \
         /account/register /privacy-policy /terms-of-service /user-rights \
         /categoria/prata /categoria/aneis-prata; do
  printf "%-40s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://artnshine.pt$p)"
done
```

Todas **200**. Uma peça qualquer da loja também: 200.

### 6.2 Contagens coerentes

```bash
curl -s https://artnshine.pt/categoria/prata | grep -o '[0-9]\+ peças' | head -1
```

Tem de **bater com o número mostrado no cartão "Prata" da loja**. Se
divergirem, a correção do `hide_out_of_stock` não apanhou — parar e reportar.

### 6.3 Tipografia

```bash
curl -s https://artnshine.pt/ | grep -c 'design-system.css'   # → 1
curl -s https://artnshine.pt/css/design-system.css | grep -c 'font-display'  # → ≥1
```

E **ver a homepage num browser**: os títulos têm de estar em Cinzel
(maiúsculas largas, serifadas), não em Times/Georgia.

### 6.4 Grelha do catálogo em telemóvel

Abrir `https://artnshine.pt/loja` num telemóvel (ou DevTools a 390px):
**duas colunas** de produtos. Se aparecer uma coluna só, o
`catalog-grid.js` antigo ficou em cache — forçar refresh e confirmar que o
`?v=` mudou.

### 6.5 Painel de filtros

Abrir "Filtros" na loja. Verificar:

- caixas de selecção **douradas e alinhadas** com o texto (não quadrados
  brancos do sistema);
- as quatro famílias de topo (Latão, Macramé, Pedras Naturais, Prata) têm
  **contagem** ao lado, e a de Prata bate com a do cartão da loja;
- os botões **Aplicar / Limpar** ficam visíveis no fundo do painel sem ser
  preciso percorrer a lista toda.

### 6.6 Admin — imagens de categoria

1. Entrar em `/admin/product-families` e editar uma categoria.
2. Confirmar que aparecem **dois editores**: "Faixa da página de categoria"
   (16:9) e "Cartão da loja e da página inicial" (4:5).
3. Escolher uma imagem da galeria, arrastar, aproximar, **Guardar
   enquadramento**.
4. Confirmar que aparecem ficheiros novos:

```bash
ls -la /opt/gonzaga/public/media/categories/ | head
```

Devem existir `cat-<id>-hero-1920-*.jpg` + `.webp`, `-1280-`, `-800-`.
**Se só existirem `.jpg` e nenhum `.webp`, o `sharp` não está a funcionar no
container** — o sistema cai no Jimp (que não gera WebP). Funciona, mas reportar:
as imagens ficam mais pesadas do que deviam.

5. Abrir a página pública da categoria e confirmar o enquadramento escolhido.

### 6.7 Botão de WhatsApp das fichas de produto

Era o defeito mais grave do lote anterior: o botão apontava para
`wa.me/351XXXXXXXXX` — um número inexistente — porque `WHATSAPP_NUMBER` não
está definida no ambiente e o fallback era o literal do placeholder. Passou a
usar `config/brand.js` (`+351939500592`), a mesma origem do rodapé.

```bash
curl -s https://artnshine.pt/loja/produto/anel-prata-lapiz-azul | grep -o 'wa.me/[0-9X]*' | head -1
```

Tem de devolver `wa.me/351939500592`. **Se aparecer algum `X`, parar e
reportar** — nenhum cliente consegue contactar por ali.

Se o número da loja mudar, define-se `WHATSAPP_NUMBER` no `.env` (só dígitos,
com indicativo: `351...`) ou edita-se `config/brand.js`.

### 6.8 Sem erros no log

```bash
docker compose logs --tail=200 app | grep -iE 'error|unhandled|ECONNREFUSED'
```

Avisos do `mysql2` sobre `acquireTimeout` / `timeout` são pré-existentes e
inofensivos. Qualquer outro erro: parar e reportar.

---

## Rollback

### Código

```bash
cd /opt/gonzaga
git log --oneline -5
git checkout <sha-anterior>
docker compose up -d --build app
```

### Migração 014

**Não é preciso para o rollback do código** — as colunas novas são *nullable* e
o código antigo ignora-as. Só se quiser mesmo limpar:

```sql
ALTER TABLE product_families DROP COLUMN hero_source;
ALTER TABLE product_families DROP COLUMN hero_crop;
ALTER TABLE product_families DROP COLUMN card_source;
ALTER TABLE product_families DROP COLUMN card_crop;
```

⚠️ Isto apaga os enquadramentos guardados. As imagens já geradas continuam a
funcionar (`hero_image` / `card_image` não são tocadas), mas o editor volta a
abrir do zero.

### Só a tipografia

Se o problema for **apenas** o aspeto das fontes, não é preciso reverter nada:
editar `public/css/design-system.css` e trocar `--font-display` /
`--font-body` pelos valores anteriores. Um `docker compose restart app` chega.

---

## O que este lote NÃO resolve

Fica registado para não haver surpresas:

- **A hero da homepage continua a pesar 3,6 MB** (6000×4000px, servida como
  `background-image` em CSS). É a maior melhoria de velocidade disponível e
  não foi feita aqui — é reprocessamento de imagem, não regras de layout.
- **`!important` desceu de 534 para 495.** A purga de `brand-showcase.css`
  (235) e `catalog-enhanced.css` (137) fica por fazer.
- **As imagens de categoria já existentes não são reprocessadas.** As
  categorias que já tinham `hero_image` continuam a usá-la tal como está; o
  recorte só passa a existir quando alguém abrir o editor e gravar. Nada
  quebra, mas o benefício (peso e enquadramento) só chega categoria a
  categoria.
- **As imagens de categoria em WebP são geradas mas não servidas**: as views
  usam `background-image`, que não faz negociação de formato. Fica para quando
  se converterem esses fundos em `<picture>`.
