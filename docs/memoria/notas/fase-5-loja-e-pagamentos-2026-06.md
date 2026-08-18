---
slug: fase-5-loja-e-pagamentos-2026-06
tipo: facto
dominio: loja
titulo: Fase 5 (Abril–Junho de 2026) — a loja passa a cobrar, e a produção muda de casa
resumo: Stripe, checkout e a lógica de IVA que precisou de três correcções seguidas; o Instagram, o catálogo com filtros SQL e a mudança para o waphix.
keywords: Stripe checkout, VAT tax handling, prices include tax, base_price, webhook fulfillment, Instagram feed, waphix migration, admin UX
valid_from: 2026-06-25
valid_to:
ingested_at: 2026-08-17T00:00:00+00:00
superseded_by:
confianca: 0.9
entities:
  - Stripe
  - pricingService.js
  - prices_include_tax
  - base_price
  - waphix
  - ecommerce_settings
sources:
  - commit:2026-04-01..2026-06-29
  - ficheiro:gonzagas_node/modules/ecommerce/settings/services/pricingService.js
relations:
  - loja | cobra_por | Stripe
  - pricingService.js | aplica | prices_include_tax
---

56 commits. É a fase em que o site deixa de ser catálogo e passa a loja.

## Stripe e checkout

Entram o checkout, o *fulfillment* e os *webhooks* da Stripe (`stripe@^17.7.0`),
com correcções para retomar pagamentos interrompidos e para portes
dessincronizados. `ecommerce_enabled` está a `true`.

Atenção: **o `.env` local não tem nenhuma variável `STRIPE_*`**. A configuração
de pagamentos vive só em produção. Testar checkout localmente exige pô-las
primeiro.

## O IVA — a parte onde errar custa dinheiro

A lógica precisou de **três commits seguidos** a 24 de Junho para assentar, e
depois ainda de um quarto na Stripe. Foi também aqui que nasceu o campo
`base_price`, precisamente para o tratamento de IVA na Stripe.

A regra final está em
`modules/ecommerce/settings/services/pricingService.js`:

```js
const pricesIncludeTax = settings.prices_include_tax !== false;
if (pricesIncludeTax) {
  const netSubtotal = round2(subtotal / (1 + taxRate));   // preço da BD já traz IVA
  ...
}
```

Configuração actual em `ecommerce_settings`: **`prices_include_tax = true`** e
**`tax_rate = 23`**. Ou seja, o preço guardado no produto **já inclui IVA**, e
o líquido obtém-se dividindo por 1,23. Quando a definição está a `false`, o
preço da base é líquido e multiplica-se.

O `prices_include_tax` é lido em seis sítios (`pricingService`, o módulo da
Stripe, `routes/index.js`, `routes/api.js`, `catalogQueryService` e as rotas
de admin). **Mudar essa definição mexe no que o cliente vê em todo o lado** —
não é uma alteração local.

## A produção muda de casa

A 23 de Junho aparecem os `hotfixes para deploy waphix`: a produção deixa o
cPanel/dominios.pt e passa a Docker Compose em servidor próprio. A limpeza da
documentação só se completa a 9 e 29 de Julho, com três commits a apagar
referências obsoletas. Ver [[waphix-production-infra]].

Da mesma altura são os `fix(production)` sobre `customers` — um *mismatch* de
campos no `INSERT` e um campo `name` que não existe nas queries `UPDATE`.
É a prova concreta de que **o schema local não é o de produção**; ver
[[db-dev-vs-production]] e [[painel-clientes-carrinhos]].

## O resto

Instagram integrado com *showcase theme* e pré-visualização na homepage
(Maio); catálogo com filtros SQL, árvore de famílias e *placeholder* de
imagem (Abril); especificações de produto (peso, dimensões, material, estilo)
na ficha; e uma série de melhorias de admin — barra lateral colapsável,
filtros persistentes, *drawer* mobile, deslizador para o tamanho das
miniaturas.

Um desses commits merece nota: `fix(admin): corrige cache "immutable" que
impedia redeploys de chegar aos browsers`. Se um deploy parecer não ter
efeito, é o primeiro sítio a olhar.

## Ponta solta desta fase

A branch `claude/zen-mcnulty-044d6c` ficou com **7 commits por integrar** desde
2026-06-26 — correcções do header mobile e a escolha da imagem do Hero. Ver
[[trabalho-em-curso-2026-08]].
