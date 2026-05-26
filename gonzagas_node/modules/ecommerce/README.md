# Módulo E-commerce

Loja online modular para Gonzaga's Art & Shine.

## Estrutura

- `cart/` — carrinho API + página
- `checkout/` — checkout guest + submit
- `orders/` — modelo e serviços de pedidos
- `settings/` — `ecommerce_settings` + pricing
- `shipping/` — portes flat rate (CTT em revisão)
- `fulfillment/` — baixa stock após pagamento
- `admin/` — gestão pedidos
- `accounts/` — conta cliente opcional
- `payments/` — módulo separado em `../payments/`

## Schema UUID deprecated

Não usar `database/migrations/sales/001_create_customers.sql` (UUID).  
Fonte única: `sql/migrations/006_ecommerce_unified.sql`

## Migração

```bash
node modules/ecommerce/scripts/run-migration.js
```

## Activar loja

Admin → Settings → E-commerce → **Activar loja online**

## Stripe (go-live)

1. Preencher keys no admin
2. `payment_mode=test` → testar
3. Webhook: `POST /webhooks/stripe`
4. `payment_mode=live`

Com `payment_mode=disabled`, pedidos ficam pendentes sem redirect Stripe.
