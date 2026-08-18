---
slug: catalogo-monitorizar
tipo: procedimento
dominio: catalogo
titulo: Monitorizar o catálogo — o que é deliberado e o que é anomalia
resumo: As verificações do catálogo, e a regra que separa uma opção de negócio de um erro de dados.
keywords: product catalog monitoring, missing price, missing image, cost price, stock level, deliberate vs anomaly
valid_from: 2026-08-17
valid_to:
ingested_at: 2026-08-17T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - LTCU0016
  - PAN0069
  - products
  - product_images
sources:
  - ficheiro:docs/memoria/bin/monitor.py
  - conversa:2026-08-17
relations:
  - monitor.py | verifica | products
---

`docs/memoria/bin/monitor.py` mede o estado real e compara-o com o esperado.
Corre com o Python do ambiente da memória e **só faz leituras**:

```
docs/memoria/.venv/bin/python docs/memoria/bin/monitor.py
```

Sai com código 1 se houver problemas, 0 caso contrário — serve para correr
automaticamente. `--breve` esconde o que está bem; `--json` alimenta notas de
estado.

## A regra que evita falsos alarmes

**Ausência de preço não é erro por si.** As 102 peças criadas em 2026-08 (as
70 do lote de Julho mais as 32 pulseiras) estão sem preço **de propósito** —
vendem-se sob consulta. Ver [[lote-julho-2026]].

Por isso a verificação não conta "produtos sem preço"; conta **produtos sem
preço criados antes de 2026-08-01**. Esse número deve ser zero. Se subir, é
que entrou uma peça sem preço fora do lote, e aí é erro a sério.

A mesma lógica vale para o resto: o que se mede é o desvio face ao que se
decidiu, não o valor em bruto.

## O que cada verificação quer dizer

| Verificação | Limiar | Porquê |
|---|---|---|
| `sem_preco_anomalo` | 0 | fora do lote de Agosto, sem preço é erro |
| `sem_imagem` | 0 | produto activo sem foto não se vende |
| `sem_custo` | aviso | sem `purchase_price` não há cálculo de margem |
| `sem_stock` | aviso acima de 25% | esgotados a mais indiciam inventário desactualizado |
| `sem_descricao` / `sem_slug` | 0 | quebram o SEO; ver [[seo-audit-2026-07-30]] |

## Estado quando isto foi escrito (2026-08-17)

511 produtos activos. **Dois problemas em aberto**, ambos de peça única:

- **PAN0069** (Anel de Prata com Lápis-Lazúli Oval) — preço 0 e stock 0 desde
  2025-05-22. É a única peça sem preço fora do lote de Agosto. Com stock a
  zero não chega a aparecer como comprável, mas o `sale_price = 0` é sujidade
  que faz a verificação disparar. Decidir: pôr preço ou desactivar.
- **LTCU0016** (Bracelete de Latão) — o **único** produto activo sem imagem,
  com preço (35 €) e stock 1. Está à venda sem foto. Já vinha assinalado
  em [[seo-naming-2026-07]] como pendente.

Avisos: 429 de 511 (84%) sem preço de custo, e 189 de 511 (37%) com stock
zero.

## Armadilha do schema

A base local **não** tem coluna `price` — tem `sale_price`, `base_price` e
`purchase_price`. Há também `active` **e** `is_active`, ambas preenchidas.
Introspeccionar antes de escrever queries; o schema local difere do de
produção, ver [[db-dev-vs-production]].
