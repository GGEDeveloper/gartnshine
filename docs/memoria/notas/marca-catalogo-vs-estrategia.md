---
slug: marca-catalogo-vs-estrategia
tipo: facto
dominio: negocio
titulo: Onde o catálogo real contradiz o Brand Bible — três números
resumo: Os fios de prata que deviam representar a marca são 19 peças; o latão que não devia dominar é 25%; e a faixa de preço declarada é o dobro da real.
keywords: brand strategy vs reality, catalogue mix, product family share, price range, silver chains, brass share, positioning gap
valid_from: 2026-08-18
valid_to:
ingested_at: 2026-08-18T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - Colares - Prata
  - Aneis - Prata
  - Pulseiras - Prata
  - Latão
sources:
  - ficheiro:docs/brand_bible_profissional.md
  - conversa:2026-08-18
relations:
  - brand-bible | contradiz | catalogo-real
---

O [[marca-brand-bible]] afirma coisas sobre o negócio que se podem verificar.
Três não batem certo. Medido na base local a 2026-08-18, 511 produtos activos
— confirmar em produção antes de agir ([[db-dev-vs-production]]).

## 1. Os «fios de prata» quase não existem

O plano diz que **pulseiras e fios de prata** são simultaneamente os mais
fortes comercialmente e os que melhor representam a marca. O catálogo:

| Família | Peças | % |
|---|---|---|
| **Anéis – Prata** | **156** | **30,5%** |
| Pulseiras – Prata | 88 | 17,2% |
| Brincos – Prata | 57 | 11,2% |
| Cuffs – Prata | 30 | 5,9% |
| **Colares – Prata** («fios») | **19** | **3,7%** |
| Pulseiras Pé – Prata | 6 | 1,2% |
| Pendentes – Prata | 1 | 0,2% |

As pulseiras confirmam-se em segundo lugar, mas **os anéis dominam** com quase
o dobro, e os fios são **residuais**: 19 peças. Uma homepage construída à
volta de fios de prata mostraria menos de 4% do que há para vender.

A auditoria de coerência já tinha marcado isto como «parcialmente coerente» e
recomendado «repriorizar homepage, colecções e featured para pulseiras e
fios» — mas com 19 peças a recomendação não é executável como está.

**Decidir uma das duas:** ou os fios passam a ser produzidos e fotografados
para sustentar o papel que o plano lhes dá, ou o plano reconhece os **anéis**
como a família que representa a marca.

## 2. O latão pesa um quarto do catálogo

O plano diz que **latão e macramé não devem dominar a imagem**. Na prática:

- **Latão: 127 peças, 24,9%** (anéis 38, brincos 28, cuffs 24, gargantilhas
  16, pendentes 8, pentes 5, piercings 7, pulseiras 1)
- Macramé: 10 peças, 2,0%
- Prata: 357 peças, ~70%

O macramé cumpre o previsto. O latão **não domina** — a prata é claramente
maioritária — mas um quarto do catálogo é peso a sério, e não é compatível com
tratá-lo como material secundário na imagem sem uma regra explícita de
montra: quanto latão pode aparecer em destaques e em capas de categoria.

## 3. A faixa de preço declarada é o dobro da real

| | Plano | Catálogo |
|---|---|---|
| Mínimo | 10 € | **5 €** |
| Máximo | 500 € | **240 €** |
| Média | — | 45,43 € |

O topo da gama declarado **não existe**: nada acima de 240 €, quando o plano
promete até 500 €. Isto sustenta a secção «Premium futuro» do próprio Brand
Bible (prata com ouro e pedras naturais) — a faixa alta é aspiração, não
inventário.

Com média a 45 €, o posicionamento vivido é **mid-range baixo**, não
«mid-range com acabamento premium». Se a objecção principal do público é o
preço, como o plano diz, isto é coerente com o mercado — mas a comunicação
não deve prometer uma gama que não se pode entregar.

**Hipótese testada e recusada.** Seria cómodo pensar que as 102 peças sem
preço (sob consulta) são justamente a gama alta, e que a faixa dos 500 €
existe mas está invisível. **Não existe:** dessas 102, nenhuma tem
`base_price`, nenhuma tem `purchase_price` e **nenhuma tem peso registado**.
Não há nelas nenhum indício de gama — não têm dados de todo. Ver
[[catalogo-monitorizar]] e [[lote-julho-2026]].

## Achado colateral: o peso está quase todo por preencher, e um está errado

Só **97 de 511** produtos (19%) têm peso. Dos que têm, um está corrompido:

- **PPU0036** («Pulseira Rígida de Prata com Infinito», 20 €) tem
  **45 752 g — 45,7 kg**. Quase de certeza um `45,752 g` em que o separador
  decimal se perdeu.

Sem esse valor, a distribuição é perfeitamente sã: média **16,5 g**, máximo
62 g. Com ele, a média salta para 488 g.

**Está à vista do cliente.** `views/catalog/product-detail.ejs:607` mostra
`<strong>Peso:</strong> <%= product.weight %>`, por isso a ficha pública
desta pulseira anuncia «Peso: 45752.000».

Os portes **não** dependem do peso — `shipping_methods` tem preços fixos
(5,99 € standard, 12,99 € expresso, 0 € levantamento) — por isso não há
prejuízo no cálculo, hoje. Passa a haver no dia em que os portes forem por
peso.

O `monitor.py` passou a assinalar qualquer peça acima de 500 g.
