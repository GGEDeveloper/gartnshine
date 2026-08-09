# Deploy — Capas e cartões das categorias

**Lote:** imagens próprias para o cabeçalho de cada categoria e para os cartões
dos materiais na homepage e na loja.
**Migração:** `sql/migrations/015_category_headers.sql` (só UPDATE, sem ALTER).
**Data de preparação:** 2026-08-09.

---

## O que muda

Antes, 22 das 25 categorias não tinham cabeçalho e caíam na primeira fotografia
de produto da família — uma foto quadrada de catálogo esticada por uma faixa de
4:1 pelo `background-size: cover`. As três que tinham apontavam para fotos de
galeria com relva ao sol e céu azul. O mesmo valia para os cartões dos materiais
e para o cartão "Ver todos".

Passam a existir 30 imagens montadas a partir de peças reais de cada categoria
(ver `gonzagas_node/scripts/category-headers/README.md`):

| Ficheiro | Onde aparece | Quantos |
|---|---|---|
| `cat-<id>-hero-1920.jpg` | cabeçalho de `/categoria/:slug` | 25 |
| `cat-<id>-card-1200.jpg` | cartão na homepage e em `/loja` | 4 |
| `todos-card-1200.jpg` | cartão "Ver todos" em `/loja` | 1 |

Vêm no commit, em `gonzagas_node/public/media/categories/`. **Não é preciso
correr nenhum script de geração no servidor** — a pasta estava no `.gitignore`
por ser território de upload do admin, e este lote abre uma excepção só para
estes nomes (`cat-*-hero-1920.jpg`, `cat-*-card-1200.jpg`, `todos-card-1200.jpg`).
Os ficheiros com carimbo de tempo, que o editor de enquadramento do admin cria,
continuam ignorados.

Além disso, quatro ficheiros CSS:

- `brand-showcase.css` — o véu do cabeçalho era `rgba(5,7,10,0.72)` chapado, um
  preto azulado que apagava qualquer imagem; passa a degradê em preto terra,
  mais o `text-shadow` do título.
- `homepage.css`, `catalog-enhanced.css` — o mesmo preto frio nos véus dos
  cartões, agora `rgba(18,16,14,…)`.
- `catalog-enhanced.css` — **correcção de um bug real**: o cartão "Ver todos"
  usava o atalho `background:` para o degradê, e o atalho repõe também o
  `background-size`, que voltava a `auto`. Qualquer imagem escolhida nas
  definições aparecia ao tamanho natural, vendo-se só o seu canto superior
  esquerdo. Nunca se notou porque a imagem antiga era textura de ponta a ponta.

---

## O que a migração toca — e o que não toca

**Toca**, apenas nestas colunas:

- `product_families.hero_image` — 25 linhas, por `slug`
- `product_families.card_image` — 4 linhas (materiais de topo)
- `product_families.hero_source` — posto a `NULL` nas mesmas 25
- `site_settings.shop_all_card_image` — 1 linha

**Não toca** em produtos, preços, stock, encomendas, clientes, carrinhos,
imagens de produto, coleções nem galeria. Não há `DELETE`, `DROP` nem `ALTER`.

### As quatro salvaguardas

1. **Nenhuma coluna é assumida.** `card_image` (migração 008), `hero_source`
   (014) e `shop_all_card_image` podem não existir em produção. Cada uma é
   consultada em `information_schema` primeiro e o SQL que a usa só é preparado
   se ela existir. Testado numa base sem as três: corre até ao fim e avisa
   `sem coluna card_image nesta base de dados — cartões por aplicar`.
2. **O valor anterior é guardado antes de ser substituído**, na tabela
   `bak_015_imagens_categoria`. O `INSERT` é `IGNORE`, por isso correr a
   migração outra vez não estraga a primeira cópia.
3. **A correspondência é por `slug`, nunca por `id`.** Os ids em produção podem
   não ser os do repositório. Uma categoria que exista em produção e não conste
   da lista fica exactamente como está — não é apagada nem posta a `NULL`.
4. **Idempotente.** Pode correr as vezes que forem precisas.

> O `id` no nome do ficheiro (`cat-16-hero-1920.jpg`) é o id **local** e é só
> parte do nome. A ligação é feita pelo `slug`, por isso não faz mal que os ids
> de produção sejam outros.

---

## Antes de correr

```bash
# 1. Backup da base de dados (obrigatório, mesmo sendo um lote pequeno)
docker exec mariadb sh -c 'mysqldump -u root -p"$MARIADB_ROOT_PASSWORD" \
  artnshin_gonzagas_db' > ~/backups/artnshine-$(date +%Y%m%d-%H%M).sql

# 2. Confirmar que o backup não está vazio
ls -lh ~/backups/artnshine-*.sql | tail -1
```

## Passos

```bash
# 3. Código
cd /srv/stacks/artnshine/app_repo
git pull origin main

# 4. Confirmar que as 30 imagens chegaram
ls gonzagas_node/public/media/categories/cat-*-hero-1920.jpg | wc -l   # 25
ls gonzagas_node/public/media/categories/*-card-1200.jpg | wc -l       # 5

# 5. Migração
docker exec -i mariadb mysql -u root -p"$MARIADB_ROOT_PASSWORD" \
  artnshin_gonzagas_db < gonzagas_node/sql/migrations/015_category_headers.sql

# 6. Reiniciar (o CSS é servido do disco, mas as definições do site
#    ficam em cache em memória — sem restart o cartão "Ver todos" não muda)
docker restart artnshine-app
```

## Condições de paragem

Parar e não continuar se:

- o backup do passo 1 falhar ou sair vazio;
- o passo 4 não devolver 25 e 5;
- a migração devolver **menos de 25** capas — significa que os `slug` em
  produção não são os do repositório. Nada foi partido (as que não coincidiram
  ficaram como estavam), mas vale a pena perceber porquê antes de seguir;
- aparecer `Illegal mix of collations` — é a tabela de backup; ver a nota no
  próprio ficheiro da migração.

## Verificação

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://artnshine.pt/categoria/aneis-prata
curl -s -o /dev/null -w "%{http_code}\n" https://artnshine.pt/media/categories/cat-1-hero-1920.jpg
```

E a olho, em telemóvel e em desktop:

- `/categoria/aneis-prata` — anéis de prata no cabeçalho, título legível por
  cima;
- `/loja` — os cinco cartões do topo com peças, nenhum verde nem preto vazio;
- página inicial, secção "Explorar por Material" — quatro cartões com peças.

## Rollback

O bloco está comentado no fim de `015_category_headers.sql`. Em resumo:

```sql
UPDATE product_families f
  JOIN bak_015_imagens_categoria b ON b.alvo = f.slug
   SET f.hero_image = b.hero_image, f.card_image = b.card_image;

UPDATE site_settings
   SET shop_all_card_image = (SELECT hero_image FROM bak_015_imagens_categoria
                               WHERE alvo = 'site_settings.shop_all_card_image')
 ORDER BY id LIMIT 1;
```

Depois `docker restart artnshine-app`. O CSS volta atrás com um `git revert` do
commit. Testado nesta ordem em desenvolvimento: estado original → migração →
rollback → estado original, com os valores a baterem certo.

A tabela `bak_015_imagens_categoria` pode ser apagada quando as capas novas
estiverem aceites — mas só nessa altura, é ela que torna o rollback possível.
