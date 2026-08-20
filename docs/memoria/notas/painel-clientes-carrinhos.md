---
slug: painel-clientes-carrinhos
tipo: decisao
dominio: admin
titulo: "artnshine.pt — painéis /admin/clientes e /admin/carrinhos (live), decisões não óbvias e a única escrita que fazem"
resumo: São só-leitura de propósito, sob a condição explícita de não estragar dados de produção. A única escrita que fazem é `cart_sessions.customer_email`.
valid_from: 2026-08-01
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - migração 006
  - modules/ecommerce/admin/services/schemaIntrospect.js
  - _content.ejs
  - /dados.js
  - docs/DEPLOY_PAINEL_CLIENTES_CARRINHOS.md
  - waphix
sources:
  - migracao:project_painel_clientes_carrinhos.md
---

Painéis de admin criados a 2026-08-01: `/admin/clientes` (clientes da loja + utilizadores do backoffice) e `/admin/carrinhos` (carrinhos em tempo real, auto-refresh de 10s). O pedido do utilizador veio com a condição explícita de **não estragar nenhum dado da BD de produção**.

**Why:** decisões tomadas sob essa condição, que não se deduzem do código:

- Os painéis são deliberadamente **só de leitura** — não há editar/apagar cliente nem esvaziar carrinho, mesmo sendo trivial acrescentar. Foi escolha, não omissão.
- Por causa de [[db-dev-vs-production]], nenhuma query assume colunas: `modules/ecommerce/admin/services/schemaIntrospect.js` lê o `information_schema` e as queries montam-se só com as colunas existentes. Se faltar uma coluna em produção, a página mostra `—` em vez de rebentar. Qualquer query nova nestes painéis deve seguir o mesmo padrão.
- **Há exactamente uma escrita em todo o lote:** `cartService.tagSessionCustomer()` preenche `cart_sessions.customer_email` (coluna que existia desde a migração 006 e estava sempre a NULL) quando o cliente tem sessão. Sem ela todos os carrinhos apareciam como anónimos. Usa `SET ... updated_at = updated_at` de propósito — senão o auto-update da coluna falseava a "última actividade" que o painel mostra. Corre uma vez por sessão via flag `req.session.cartTaggedFor`.
- O auto-refresh devolve um **fragmento HTML** (`/admin/carrinhos/dados`, view `_content.ejs` com `layout:false`), não JSON re-renderizado em JS — evita duplicar o template. Há um `/dados.json` à parte só para debugging.
- Não há ligação `orders.customer_id`: as métricas por cliente cruzam-se **por email**. O "total pago" só conta `payment_status = 'paid'`, por isso aparece €0.00 se os pagamentos forem tratados manualmente sem marcar o estado.

**How to apply:** ao mexer nestes painéis, manter o só-leitura e a introspecção de schema. Antes de acrescentar qualquer escrita nova em `cart_sessions` ou `customers`, verificar primeiro que a coluna existe em produção. Deploy documentado em `docs/DEPLOY_PAINEL_CLIENTES_CARRINHOS.md` — sem migrações. Ver também [[waphix-production-infra]] e [[estado-2026-07-30]].
