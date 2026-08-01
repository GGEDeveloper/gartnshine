# Instruções de deploy — painel de clientes e carrinhos em tempo real

**Para:** agente de deployment
**Destino:** produção `artnshine.pt` (servidor waphix, Docker Compose)
**Alcance:** commits deste lote em `main` (painéis `/admin/clientes` e `/admin/carrinhos`)
**Migrações a correr:** **nenhuma**

> Deploy anterior: [`DEPLOY_INSTAGRAM_CATALOGO.md`](DEPLOY_INSTAGRAM_CATALOGO.md).
> Este lote **não depende** desse — não toca em nada do catálogo, da loja
> pública nem do Instagram. Só acrescenta duas páginas ao backoffice.

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
|------|------------|
| Admin → Loja | Duas entradas novas na barra lateral: **Carrinhos (live)** e **Clientes e Utilizadores** |
| `/admin/clientes` | Lista de clientes registados na loja + utilizadores do backoffice, com pesquisa, ordenação e paginação. Ficha individual em `/admin/clientes/:id` |
| `/admin/carrinhos` | O que os visitantes têm no carrinho neste momento, com auto-refresh de 10s |
| Loja pública | **Nada muda visualmente.** A única alteração é passar a associar o carrinho ao email do cliente autenticado |

### Alterações de base de dados

**Nenhuma migração. Nenhum `ALTER TABLE`. Nenhuma tabela nova.**

Os painéis lêem tabelas que já existem: `customers`, `users`, `cart_sessions`,
`orders`, `products`, `product_images`.

Existe **uma única escrita** em todo o lote, e é esta: quando um cliente com
sessão iniciada tem carrinho, preenche-se `cart_sessions.customer_email`. É
uma coluna que já existe desde a migração `006` e que até hoje esteve sempre a
`NULL`. Sem ela, todos os carrinhos apareceriam no painel como "anónimos".

O que essa escrita **não** faz: não toca em produtos, quantidades, preços,
encomendas, stock nem contas de cliente. Corre uma vez por sessão e preserva
`updated_at` (`SET ... updated_at = updated_at`), para não falsear a coluna de
"última actividade" que o painel usa.

### Sobre o schema divergente

O schema de produção não é necessariamente igual ao da base local — já houve
um incidente com a coluna `name` em `customers` (commit `c601d3e`). Por isso
este lote **não assume colunas nenhumas**: `modules/ecommerce/admin/services/schemaIntrospect.js`
consulta o `information_schema` (com cache de 5 minutos) e as queries são
montadas só com as colunas que realmente existem.

Consequência prática para quem faz o deploy: **se em produção faltar
`google_id`, `is_active`, `created_at`, ou até a tabela `orders` inteira, as
páginas continuam a abrir** e mostram `—` nesses campos. Não é preciso
verificar o schema antes.

### O que NÃO está incluído

- Não há forma de **criar, editar ou apagar** clientes por estes painéis.
- Não há forma de **esvaziar ou alterar** o carrinho de um cliente.
- Não há exportação de dados nem envio de emails de recuperação de carrinho.
- Não há dependências npm novas.

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
  "$DB_NAME" | gzip > "/srv/backups/artnshine/pre_painel_clientes_${STAMP}.sql.gz"

ls -lh "/srv/backups/artnshine/pre_painel_clientes_${STAMP}.sql.gz"
gunzip -t "/srv/backups/artnshine/pre_painel_clientes_${STAMP}.sql.gz" && echo "backup íntegro"
```

**Condição de paragem:** menos de 1 MB ou `gunzip -t` a falhar → parar.

Registar as contagens actuais, para comparar no Passo 5:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT 'customers' t, COUNT(*) n FROM customers
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'cart_sessions', COUNT(*) FROM cart_sessions
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'products', COUNT(*) FROM products;"
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
git log --oneline -1
```

**Condição de paragem:** se `git status` mostrar ficheiros modificados no
servidor, parar e reportar.

---

## Passo 3 — Reiniciar

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
Não é preciso correr nenhuma migração.

Nos logs deve aparecer `✅ Módulo carregado: ecommerce` e
`Server listening`. Se aparecer algum aviso do género
`[admin/schema] Não foi possível ler colunas de ...`, **não é fatal** — é o
mecanismo defensivo a dizer que aquela tabela não existe, e a página vai
mostrar `—`. Registar no relatório, mas não é motivo de paragem.

---

## Passo 4 — Verificação

### As páginas públicas continuam iguais

```bash
for p in / /loja /galeria /categoria/prata /cart; do
  printf "%-20s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://artnshine.pt$p)"
done
```

Tudo **200** (ou o que já dava antes do deploy). Este lote não mexe no site
público — se algo aqui mudou, parar.

### As páginas novas exigem login

Sem sessão de admin, as rotas novas têm de **redireccionar para o login**
(302 para `/admin/login`), nunca devolver 200 com dados:

```bash
for p in /admin/clientes /admin/carrinhos /admin/carrinhos/dados.json; do
  printf "%-32s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://artnshine.pt$p)"
done
```

**Condição de paragem:** se alguma devolver **200** sem autenticação, há uma
fuga de dados de clientes — parar imediatamente e reportar.

### No browser (com sessão de admin)

1. Entrar em `https://artnshine.pt/admin/login`.
2. Barra lateral, secção **Loja**: devem aparecer **Carrinhos (live)** e
   **Clientes e Utilizadores**.
3. **`/admin/clientes`**
   - O total de clientes no cartão do topo tem de bater certo com a contagem
     de `customers` registada no Passo 1.
   - Separador **Utilizadores do admin**: confirmar que aparecem os
     utilizadores reais e que **não há nenhuma password nem hash visível**
     (nem na página nem no código-fonte da página).
   - Abrir uma ficha de cliente e confirmar que as encomendas dele aparecem
     e ligam a `/admin/orders/:id`.
4. **`/admin/carrinhos`**
   - Se não houver carrinhos abertos em produção, é normal ver a lista vazia
     com os contadores a zero. Não é uma falha.
   - Para testar a sério: numa janela anónima, adicionar uma peça ao carrinho
     em `https://artnshine.pt/loja` e confirmar que aparece no painel dentro
     de ~10 segundos, com ponto verde de "activo agora".
   - Confirmar que o contador de "Actualizado às HH:MM:SS" no fundo da página
     avança sozinho, sem recarregar.

### Contagens depois do deploy

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT 'customers' t, COUNT(*) n FROM customers
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'cart_sessions', COUNT(*) FROM cart_sessions
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'products', COUNT(*) FROM products;"
```

Têm de ser **iguais** às do Passo 1 (à parte de actividade real de clientes
entretanto, que só pode fazer `cart_sessions` e `orders` subir). Nenhuma pode
**descer**.

Confirmar também que a associação carrinho↔cliente só preenche a coluna do
email e não mexe em mais nada:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT id, customer_email, product_id, quantity, updated_at
FROM cart_sessions ORDER BY updated_at DESC LIMIT 10;"
```

Os `product_id` e `quantity` são os que já lá estavam. O `customer_email`
começa a preencher-se à medida que clientes autenticados usem o carrinho.

---

## Rollback

Só código — **não há migração para reverter**:

```bash
cd /srv/stacks/artnshine/app_repo
git reset --hard "$(cat /tmp/artnshine_commit_anterior.txt)"
cd /srv/stacks/artnshine
docker compose up -d --force-recreate artnshine-app
```

Ao reverter perdem-se apenas os dois painéis novos. Os emails já gravados em
`cart_sessions.customer_email` ficam lá, inofensivos — a loja nunca leu essa
coluna e continua a não a ler.

**Base de dados:** só se as contagens do Passo 4 acusarem perda.

```bash
gunzip < /srv/backups/artnshine/pre_painel_clientes_<STAMP>.sql.gz \
  | docker exec -i mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
```

---

## Notas sobre os dados

- **Os painéis são só de leitura.** Os serviços novos
  (`adminCustomersService.js`, `liveCartsService.js`) e as rotas
  (`admin/routes/customers.js`, `admin/routes/carts.js`) só executam
  `SELECT` — verificado por auditoria ao código.
- **A lista de utilizadores nunca selecciona a coluna da password.** Só
  `id, name, username, email, role, is_active, last_login, created_at,
  updated_at`, e apenas as que existirem.
- **Muitos carrinhos vão aparecer como "Visitante anónimo"**, e isso está
  correcto: a maioria das pessoas navega sem conta. Só ficam identificados
  quem tem sessão iniciada ou quem já encomendou antes com aquela mesma
  sessão de carrinho.
- **O total pago por cliente** é a soma das encomendas com
  `payment_status = 'paid'`. Se em produção os pedidos forem tratados
  manualmente sem marcar o pagamento, este valor aparece a €0.00 mesmo com
  encomendas na conta — não é um erro do painel.
- Os artigos marcados com **produto removido**, **inactivo** ou **stock: N**
  no painel de carrinhos são clientes que vão bater numa parede no checkout.
  Vale a pena olhar para esses.
- O auto-refresh faz um pedido de 10 em 10 segundos **por separador aberto**,
  e pára quando o separador vai para segundo plano. Se em algum momento
  incomodar, o interruptor **Auto** desliga-o.

---

## Estado da validação local

- Serviços corridos contra a base local: 3 clientes, 4 utilizadores admin,
  2 carrinhos (€50, ambos anónimos e abandonados) — conferidos contra
  `SELECT COUNT(*)` directo.
- Login real no admin local; as 5 rotas responderam **200** com dados
  verdadeiros: `/admin/clientes`, `/admin/clientes/:id`, `/admin/carrinhos`,
  `/admin/carrinhos/dados` e `/admin/carrinhos/dados.json`.
- O fragmento do auto-refresh confirmado **sem `<!DOCTYPE>`** — ou seja, o
  layout não vem duplicado dentro da página a cada 10 segundos.
- `tagSessionCustomer()` executado contra a base local com uma sessão
  inexistente: SQL válida, 0 linhas afectadas, e `cart_sessions` verificada
  **intacta** a seguir (emails ainda a `NULL`, `updated_at` inalterado).
- Auditoria dos ficheiros do painel: zero
  `INSERT`/`UPDATE`/`DELETE`/`ALTER`/`DROP`/`TRUNCATE`.
- Views compiladas com `ejs.compile` e ficheiros JS com `node --check`, todos
  sem erros.
- `npm test` — **47/47** (43 anteriores + 4 novos): as duas páginas respondem
  200 com conteúdo real, o fragmento do auto-refresh vem sem `<!DOCTYPE>`, a
  listagem de utilizadores não contém hashes de password, e as três rotas
  redireccionam para o login sem sessão de admin.

### O que não foi possível validar localmente

- **Carrinhos identificados.** Na base local todos os carrinhos são anónimos,
  por isso o caminho "cliente autenticado → email no painel" foi validado ao
  nível da SQL, mas não de ponta a ponta com um cliente real com sessão. Vale
  a pena fazer esse teste em produção (Passo 4, ponto 4).
- **Divergências de schema.** A defesa contra colunas em falta foi testada
  por construção, não contra o schema real do waphix — que é precisamente o
  que não conseguimos ver daqui.
