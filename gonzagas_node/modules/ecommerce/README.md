# Módulo E-commerce

Loja online modular para Gonzaga's Art & Shine.

## Estrutura

| Submódulo | Função |
|-----------|--------|
| `cart/` | Carrinho API + página |
| `checkout/` | Checkout guest + submit |
| `orders/` | Modelo e serviços de pedidos |
| `settings/` | `ecommerce_settings` + pricing (IVA) |
| `shipping/` | Portes flat rate (CTT em revisão) |
| `fulfillment/` | Baixa stock após pagamento confirmado |
| `admin/` | Gestão de pedidos no painel |
| `accounts/` | Conta cliente opcional |
| `notifications/` | Emails de pedido (SMTP) |
| `analytics/` | GA4 + `product_analytics` |
| `jobs/` | Crons, rate limits, maintenance |

Pagamentos Stripe vivem em **`../payments/`** (registry + webhook).

## Schema

**Fonte única:** `sql/migrations/006_ecommerce_unified.sql` + `007_ecommerce_alter_existing.sql`

O schema UUID em `database/migrations/sales/` está **deprecated** (incompatível com `products.id` INT).

## Migração

```bash
npm run db:ecommerce
# ou
node modules/ecommerce/scripts/run-migration.js
```

**Instalações existentes** com tabela `orders` antiga: a migração 007 adiciona colunas em falta (`billing_*`, `shipping_*`, `subtotal`, etc.). Idempotente — ignora colunas já existentes.

## Activar loja

1. Executar migração (`npm run db:ecommerce`)
2. Admin → **Settings** → **E-commerce** → **Activar loja online**
3. Configurar IVA (`prices_include_tax`), portes e `payment_mode`

Com a loja desactivada, rotas de carrinho/checkout não são expostas ao público.

## Modos de pagamento

| Modo | Comportamento |
|------|----------------|
| `disabled` | Pedido criado; sem redirect Stripe; pagamento manual |
| `test` | Stripe Checkout em modo teste |
| `live` | Stripe produção |

Webhook: `POST /webhooks/stripe` (configurar URL e secret no admin / `.env`).

## Rotas principais

| Rota | Descrição |
|------|-----------|
| `GET /cart` | Página do carrinho |
| `GET /checkout` | Checkout (redirect para `/cart` se vazio) |
| `POST /api/cart/items` | Adicionar produto |
| `POST /api/checkout/submit` | Criar pedido |
| `GET /admin/orders` | Lista de pedidos (auth admin) |
| `GET /admin/settings/ecommerce` | Definições da loja |

## Checklist de testes (local)

```bash
npm start
# noutro terminal:
curl -s -c /tmp/cjar -X POST http://localhost:3000/api/cart/items \
  -H 'Content-Type: application/json' -d '{"productId":5,"quantity":1}'

curl -s -b /tmp/cjar http://localhost:3000/checkout -o /dev/null -w "%{http_code}\n"
# esperado: 200

curl -s -b /tmp/cjar -X POST http://localhost:3000/api/checkout/submit \
  -H 'Content-Type: application/json' \
  -d '{"customerName":"Test","customerEmail":"t@t.com","customerPhone":"912345678","billingAddressLine1":"Rua 1","billingCity":"Lisboa","billingPostalCode":"1000-001","billingCountry":"Portugal","sameAsBilling":true,"shippingMethodCode":"standard"}'
# esperado: {"success":true,"order":{...},"payment":{"mode":"disabled",...}}
```

Validado em 2026-05-26: carrinho, checkout, submit com `payment_mode=disabled`.

## Limitações conhecidas

- **Stripe E2E** — não validado em produção; testar em `test` antes de `live`
- **Emails** — dependem de SMTP configurado; não testados automaticamente
- **Fulfillment / stock** — baixa de stock via webhook após pagamento confirmado; testar com Stripe test
- **Envio CTT** — placeholder flat rate; integração CTT futura
- **UI** — markup mínimo em `public/css/cart.css`, `checkout.css`; estilização final delegada ao branch de styling
- **Conta cliente** — opcional; registo/login não cobertos por testes automáticos

## Variáveis de ambiente (`.env`)

Ver `.env.example` para placeholders Stripe. Keys também editáveis no admin e-commerce.
