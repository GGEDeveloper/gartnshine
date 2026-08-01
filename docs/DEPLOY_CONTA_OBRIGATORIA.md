# Instruções de deploy — conta obrigatória para finalizar a compra

**Para:** agente de deployment
**Destino:** produção `artnshine.pt` (servidor waphix, Docker Compose)
**Alcance:** commits deste lote em `main`
**Migrações a correr:** `013` — aditiva
**Dependência nova:** `express-mysql-session` (obriga a `npm install`)
**Configuração nova obrigatória:** variáveis `SMTP_*` no `.env` de produção

> Deploy anterior: [`DEPLOY_PAINEL_CLIENTES_CARRINHOS.md`](DEPLOY_PAINEL_CLIENTES_CARRINHOS.md).

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

## ⚠️ Ler antes: este deploy muda o comportamento da loja

Ao contrário dos anteriores, este **altera o que os clientes podem fazer**.
A partir daqui ninguém finaliza uma compra sem conta. Duas consequências:

- **Compras como convidado deixam de existir.** Quem estivesse a meio de uma
  compra sem conta vai ser encaminhado para o login. O carrinho não se perde.
- **Sem SMTP configurado, quem perder a password não consegue comprar** e a
  única saída é o WhatsApp. Por isso o Passo 2 é obrigatório e não opcional.

Se as credenciais SMTP não estiverem prontas, **é preferível adiar este deploy**
a publicá-lo sem elas.

---

## O que este deploy faz

| Área | O que muda |
|------|------------|
| `/cart` | Continua aberto a visitantes. O botão passa a "Entrar e finalizar" para quem não tem sessão |
| `/checkout` | Passa a exigir conta. Sem sessão → `/account/login?returnTo=/checkout` |
| `/api/checkout/*` | Passa a responder **401** sem sessão (a barreira não é só visual) |
| Login/registo/Google | Trazem o carrinho anónimo para a conta e juntam-no ao que já existisse |
| `/account/forgot-password` | Novo — recuperação de password, que não existia |
| Sessões | Deixam de viver em memória; passam para a tabela `sessions` |
| Encomendas | Ficam sempre no email da conta; o campo no checkout é só de leitura |

### Alterações de base de dados

- **Migração `013`** — duas colunas nullable e um índice em `customers`.
  Aditiva e idempotente. Não toca em passwords existentes, contas Google,
  encomendas, produtos nem stock.
- **Tabela `sessions`** — criada pelo próprio store no arranque
  (`createDatabaseTable: true`). Não é preciso criá-la à mão.

### O que NÃO está incluído

- Não há verificação de email na criação de conta (decisão explícita: menos
  atrito, e o email fica validado na prática pela encomenda e pelo Stripe).
- Não há migração de encomendas antigas para contas — elas já apareciam por
  email em `/account/orders`, e continuam a aparecer.
- Nada muda no admin, no catálogo, na galeria ou no Instagram.

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
  "$DB_NAME" | gzip > "/srv/backups/artnshine/pre_conta_obrigatoria_${STAMP}.sql.gz"

ls -lh "/srv/backups/artnshine/pre_conta_obrigatoria_${STAMP}.sql.gz"
gunzip -t "/srv/backups/artnshine/pre_conta_obrigatoria_${STAMP}.sql.gz" && echo "backup íntegro"
```

**Condição de paragem:** menos de 1 MB ou `gunzip -t` a falhar → parar.

Registar as contagens actuais:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT 'customers' t, COUNT(*) n FROM customers
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'cart_sessions', COUNT(*) FROM cart_sessions
UNION ALL SELECT 'products', COUNT(*) FROM products;"
```

---

## Passo 2 — SMTP no `.env` (obrigatório, antes de reiniciar)

Sem isto, a recuperação de password não funciona e clientes podem ficar
trancados fora da loja.

```bash
cd /srv/stacks/artnshine
cp .env ".env.bak_$(date +%Y%m%d_%H%M%S)"
```

Acrescentar ao `.env` (valores reais, não estes):

```
SMTP_HOST=smtp.exemplo.pt
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=geral@artnshine.pt
SMTP_PASS=<password>
SMTP_FROM=Gonzaga Art & Shine <geral@artnshine.pt>
```

Confirmar também que `BASE_URL` aponta para `https://artnshine.pt` — é o que
monta o link de recuperação que vai no email. Se estiver errado, os clientes
recebem um link para o sítio errado.

```bash
grep -E '^(BASE_URL|SMTP_HOST|SMTP_FROM)=' .env
```

**Condição de paragem:** se as credenciais SMTP não existirem, parar e reportar.
Não continuar sem elas.

---

## Passo 3 — Actualizar o código e instalar a dependência

```bash
cd /srv/stacks/artnshine/app_repo

git rev-parse --short HEAD | tee /tmp/artnshine_commit_anterior.txt

git fetch origin
git status                            # não deve haver alterações locais
git log --oneline HEAD..origin/main
git merge --ff-only origin/main
```

**Este deploy tem dependência nova** — ao contrário dos anteriores, o
`npm install` é obrigatório:

```bash
docker compose run --rm --entrypoint sh artnshine-app -c "cd /app && npm ci --omit=dev"
```

Se o vosso fluxo constrói a imagem em vez de instalar no volume, reconstruir a
imagem em vez deste comando. O que importa é que `express-mysql-session` fique
instalado antes do arranque.

---

## Passo 4 — Migração 013

```bash
cd /srv/stacks/artnshine

docker exec -i mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  < app_repo/gonzagas_node/sql/migrations/013_customer_password_reset.sql
```

Esperado: `Migration 013 completed: customers.password_reset_token + _expires ready`.

É idempotente — se já tiver corrido, volta a dar a mesma mensagem sem alterar nada.

Confirmar:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SHOW COLUMNS FROM customers LIKE 'password_reset%';"
```

Duas linhas, ambas `YES` em Null.

---

## Passo 5 — Reiniciar

```bash
cd /srv/stacks/artnshine

docker inspect --format='{{.State.Health.Status}}' mariadb
docker compose up -d --force-recreate artnshine-app
sleep 25
docker inspect --format='{{.State.Health.Status}}' artnshine-app
docker logs --tail 80 artnshine-app
```

Nos logs **tem de aparecer**:

```
✅ Sessões persistentes na base de dados (tabela `sessions`)
```

Se em vez disso aparecer `⚠️  Falha a criar o store de sessões na BD, a usar
memória`, o site funciona mas cada deploy volta a desligar os clientes —
**reportar e não dar o deploy por concluído**.

Confirmar que a tabela nasceu:

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SHOW COLUMNS FROM sessions;"
```

---

## Passo 6 — Verificação

### A barreira funciona nos dois sítios

```bash
# Página: tem de redireccionar para o login com returnTo
curl -s -o /dev/null -w "checkout %{http_code} -> %{redirect_url}\n" \
  https://artnshine.pt/checkout

# API: tem de devolver 401, não 200 nem 500
curl -s -o - -w "\nsubmit %{http_code}\n" \
  -X POST -H "Content-Type: application/json" \
  -d '{"customerName":"Teste","customerEmail":"teste@exemplo.pt"}' \
  https://artnshine.pt/api/checkout/submit
```

Esperado: **302** para `/account/login?returnTo=/checkout`, e **401** com
`"É preciso ter conta para finalizar a compra."`.

**Condição de paragem:** se o `POST` devolver 200, está a criar encomendas sem
conta — parar e reverter.

### O carrinho continua aberto a visitantes

```bash
for p in /loja /cart /account/login /account/forgot-password; do
  printf "%-28s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' https://artnshine.pt$p)"
done
```

Todos **200**. Se `/cart` redireccionar, a barreira ficou no sítio errado.

### No browser

1. Em janela anónima, adicionar uma peça ao carrinho em `/loja`.
2. Ir ao carrinho: o botão deve dizer **"Entrar e finalizar"**.
3. Clicar: vai para o login, com o aviso *"Para finalizar a compra é preciso
   ter conta"*.
4. Criar conta (ou entrar com Google): **tem de voltar ao checkout** e o
   carrinho tem de estar lá, com o email da conta já preenchido e bloqueado.
5. **Testar o email a sério:** em `/account/forgot-password`, pedir recuperação
   para uma conta real e confirmar que o email chega, que o link abre o
   formulário, e que deixa de funcionar depois de usado.
6. **Testar que o login sobrevive ao deploy:** com sessão iniciada, correr
   `docker compose restart artnshine-app`, esperar, e recarregar `/checkout`.
   Tem de continuar autenticado. É o objectivo da mudança das sessões.

### Contagens depois do deploy

```bash
docker exec mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT 'customers' t, COUNT(*) n FROM customers
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'cart_sessions', COUNT(*) FROM cart_sessions
UNION ALL SELECT 'products', COUNT(*) FROM products;"
```

Iguais às do Passo 1, à parte de actividade real de clientes. Nenhuma pode
**descer** — em particular `customers` e `orders`.

---

## Rollback

```bash
cd /srv/stacks/artnshine/app_repo
git reset --hard "$(cat /tmp/artnshine_commit_anterior.txt)"
cd /srv/stacks/artnshine
docker compose up -d --force-recreate artnshine-app
```

Ao reverter, o checkout volta a aceitar convidados e as sessões voltam a viver
em memória. **A migração 013 não precisa de ser revertida** — duas colunas
nullable que ninguém passa a ler. A tabela `sessions` também pode ficar; fica
apenas a acumular linhas expiradas até alguém a apagar.

Se quiser mesmo limpar, o bloco de rollback está comentado no fim de
`013_customer_password_reset.sql`.

**Base de dados:** só se as contagens do Passo 6 acusarem perda.

```bash
gunzip < /srv/backups/artnshine/pre_conta_obrigatoria_<STAMP>.sql.gz \
  | docker exec -i mariadb mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
```

---

## Notas sobre os dados

- **As 3 contas que existem foram todas criadas por Google e nenhuma tem
  password** (verificado na base local; confirmar em produção). Se algum destes
  clientes tentar entrar com password, recebe uma mensagem a dizer que a conta
  é Google — e não um "password incorrecta" enganador.
- **Encomendas antigas feitas como convidado continuam a aparecer** em
  `/account/orders` se a pessoa se registar com o mesmo email. A ligação sempre
  foi por email e continua a ser — não existe `orders.customer_id`.
- **O carrinho vive no cookie `cart_session_id` (30 dias) e na base de dados**,
  não na sessão. Por isso sobrevive a reinícios, a logout e à expiração da
  sessão. O que passou a sobreviver também é o **login**.
- A junção de carrinhos **apaga as sessões antigas depois de as absorver**.
  É deliberado: senão o cliente ficava com o mesmo carrinho duplicado. As
  quantidades somam-se com o stock como tecto.
- O rate limit das rotas de conta é de **20 tentativas por 15 minutos por IP**,
  e não conta as que têm sucesso. Se algum cliente se queixar de estar
  bloqueado, é isto — passa sozinho.

---

## Estado da validação local

- Visitante anónimo: `/loja` 200, adiciona ao carrinho, `/cart` 200,
  `/checkout` **302** para o login com `returnTo`, `POST /api/checkout/submit`
  **401**.
- Registo com `returnTo=/checkout` voltou ao checkout com o carrinho intacto
  (total €27,00 = €25 + portes) e o email da conta fixado e bloqueado.
- Junção de carrinhos entre dois "browsers": 3 unidades num, 2 no outro →
  **5 depois do login**, com o item do outro carrinho trazido junto. Com o
  tecto do stock: 6 + 5 → **6**, não 11.
- Recuperação de password de ponta a ponta ao nível das rotas: o link abre o
  formulário, a password nova entra na conta, **o mesmo link deixa de
  funcionar**, e a password antiga deixa de servir.
- Sem SMTP, `/account/forgot-password` mostra o aviso e não finge que enviou.
- Conta só-Google a tentar entrar com password recebe a mensagem certa.
- **Login sobreviveu a matar e relançar o processo** com a mesma cookie:
  `/checkout` continuou a responder 200 e autenticado.
- Base local reposta no estado inicial no fim; a conta de teste foi apagada.
- `npm test` — **53/53**.

### Dois bugs encontrados a testar, e corrigidos

Vale a pena saber que existiram, porque ambos só aparecem com a junção de
carrinhos activa:

1. **Itens adicionados depois do login não ficavam associados ao cliente** — o
   `INSERT` do carrinho não escrevia `customer_email` e a marcação só corria
   uma vez por sessão.
2. **A junção perdia itens** — absorvia só as linhas marcadas mas apagava a
   sessão antiga inteira. Reproduzido com 2 unidades a desaparecer. Corrigido
   para ler todas as linhas das sessões que vai apagar.

### O que não foi possível validar localmente

- **O envio real de email.** Não há SMTP no ambiente local, por isso o caminho
  "pedir recuperação → email chega → clicar no link" foi validado da geração do
  token para a frente, mas não o envio em si. É o ponto 5 do Passo 6.
- **Login com Google.** Depende do OAuth configurado no domínio real; o código
  partilha o mesmo caminho de sessão e junção de carrinho que o login por
  password, que foi validado.
