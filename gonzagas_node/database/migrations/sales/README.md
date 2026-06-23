# DEPRECATED

Este schema UUID (`customer_orders`, etc.) **não deve ser usado**.

Use o schema unificado INT em:

`modules/ecommerce/sql/migrations/006_ecommerce_unified.sql`

Motivo: `products.id` é INT; o schema UUID aqui é incompatível com o catálogo actual.
