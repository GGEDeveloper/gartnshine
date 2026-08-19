---
slug: consultar-catalogo
tipo: procedimento
dominio: catalogo
titulo: Consultar o catálogo — o schema real, os prefixos de referência e as colunas que enganam
resumo: Não há coluna `price`; há `active` e `is_active`; as referências seguem prefixo por subcategoria. As queries que se repetem, prontas.
keywords: product schema, catalogue queries, stock, pricing columns, reference prefixes, product families, taxonomy, duplicate columns
valid_from: 2026-08-18
valid_to:
ingested_at: 2026-08-18T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - products
  - product_families
  - product_images
  - sale_price
  - is_active
sources:
  - conversa:2026-08-18
  - ficheiro:gonzagas_node/models/Product.js
relations:
  - products | pertence_a | product_families
  - product_images | ilustra | products
---

Estrutura estável do catálogo. Os **números** vivem no `monitor.py`, não aqui
— ver [[memoria-verificar-factos]]. Qual base consultar:
[[consultar-as-duas-bases]].

## Colunas que enganam

**Não existe `price`.** Há três colunas de preço com papéis diferentes:

| Coluna | Para quê |
|---|---|
| `sale_price` | o que o cliente paga; **zero significa «sob consulta»** |
| `base_price` | criado para o tratamento de IVA na Stripe |
| `purchase_price` | custo; está por preencher na larga maioria |

**Há `active` *e* `is_active`**, ambas preenchidas. O código usa `is_active`;
`active` é resíduo. Há também `min_stock` e `min_stock_level`, igualmente
duplicadas.

`deleted_at` é *soft delete* — filtrar sempre `deleted_at IS NULL`. Nem todo o
código o faz: `getAllForMerchantFeed()` e `getAllForSitemap()` filtram só por
`is_active = 1` ([[seo-feed-merchant-consultar]]).

O IVA depende da definição `prices_include_tax` em `ecommerce_settings`
(hoje `true`, taxa 23) e é lido em seis sítios — ver
[[fase-5-loja-e-pagamentos-2026-06]].

## Referências: prefixo por subcategoria, não série global

As referências **reservam o próximo número livre dentro do prefixo**. Os
prefixos em uso, por ordem de peso:

| Prefixo | Peso | O que é |
|---|---|---|
| `PAN` | ~156 | Anéis de prata |
| `PPU` | ~117 | Pulseiras de prata |
| `PPB` | ~57 | Brincos de prata |
| `LTA` | ~38 | Anéis de latão |
| `LTB` | ~28 | Brincos de latão |
| `PVO` | ~25 | Colares de prata |
| `LTCU` | ~24 | Cuffs de latão |
| `LTG` | ~16 | Gargantilhas de latão |
| `PPCF`, `MCCL`, `PNC`, `PNP`, `LTPD`, `LTPRS` | poucos | pedras, macramé, pendentes |

Alguns prefixos têm quatro letras (`LTCU`, `PPCF`, `MCCL`, `LTPRS`), por isso
**agrupar por `LEFT(reference, 3)` mistura famílias**. Para contar a sério,
juntar pela família (`product_families`).

## Queries que se repetem

```sql
-- Estado geral (o que o monitor mede)
SELECT COUNT(*) total,
  SUM(sale_price IS NULL OR sale_price=0) sem_preco,
  SUM(current_stock<=0) sem_stock,
  SUM(purchase_price IS NULL OR purchase_price=0) sem_custo
FROM products WHERE deleted_at IS NULL AND is_active=1;

-- Por família, com lacunas
SELECT f.name familia, COUNT(*) n,
  SUM(p.sale_price IS NULL OR p.sale_price=0) sem_preco,
  SUM(p.current_stock<=0) sem_stock
FROM products p LEFT JOIN product_families f ON f.id=p.family_id
WHERE p.deleted_at IS NULL AND p.is_active=1
GROUP BY f.name ORDER BY n DESC;

-- Sem imagem nenhuma (≠ sem imagem principal)
SELECT p.reference, p.name FROM products p
WHERE p.is_active=1 AND p.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id=p.id);

-- Tem imagens mas nenhuma marcada como principal — o feed serve a genérica
SELECT COUNT(*) FROM products p WHERE p.is_active=1
  AND EXISTS (SELECT 1 FROM product_images i WHERE i.product_id=p.id)
  AND NOT EXISTS (SELECT 1 FROM product_images i
                  WHERE i.product_id=p.id AND i.is_primary=1);

-- Quando entrou cada lote
SELECT DATE_FORMAT(created_at,'%Y-%m') mes, COUNT(*) n
FROM products WHERE deleted_at IS NULL GROUP BY mes ORDER BY mes;
```

## Taxonomia

Dois níveis: **material → tipo+material**. As famílias chamam-se
«Aneis - Prata», «Cuffs - Latão», «Colares - Pedras Naturais». O filtro do
catálogo percorre a árvore com descendentes — ver
[[conceitos-categoria-colecao-galeria]] para a diferença entre categoria,
colecção e galeria.

## Cuidados

- **Só leituras.** Uma correcção de dados é decisão do programador.
- Introspeccionar antes de escrever queries novas: o schema local difere do de
  produção ([[db-dev-vs-production]]).
- Não concluir sobre o que o cliente vê a partir da base local — para isso,
  o feed publicado.
