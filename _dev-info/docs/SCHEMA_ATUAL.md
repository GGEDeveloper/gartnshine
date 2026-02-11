# Schema da Base de Dados - Análise

**Data do dump:** 2025-02-11  
**Origem:** artnshine.pt → artnshin_gonzagas_db  
**MariaDB:** 10.6.24-cll-lve

## Tabelas Identificadas (schema_20260211.sql)

| Tabela | Descrição |
|--------|-----------|
| `activity_logs` | Log de atividades dos utilizadores admin |
| `admin_users` | Utilizadores administrativos |
| `audit_logs` | Auditoria (GDPR, consent, etc.) |
| `cookie_consents` | Consentimentos de cookies |
| `product_families` | Famílias/categorias de produtos |
| `products` | Produtos do catálogo |
| `product_images` | Imagens dos produtos |
| `site_settings` | Configurações do site |
| `users` | Utilizadores (sistema de auth - login admin) |

**Nota:** `inventory_transactions`, `checkpoints`, `product_price_history` podem existir na DB de produção - verificar backup completo.

## Notas para Desenvolvimento

- O sistema usa tanto `admin_users` como `users` - verificar qual é usado no login admin
- `inventory_transactions` - confirmar valores de `transaction_type` suportados
- Schema completo em: `_dev-info/schema/schema_20260211.sql`
