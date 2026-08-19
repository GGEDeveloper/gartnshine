---
slug: lote-julho-2026
tipo: estado
dominio: catalogo
titulo: "Lote de Julho de 2026 — 70 peças (migração 016) + 32 pulseiras (017); os quatro sítios onde o €0,00 se escondia; PAN0075 na família errada"
resumo: "Lote de Julho de 2026 — 70 peças (migração 016) + 32 pulseiras (017); os quatro sítios onde o €0,00 se escondia; PAN0075 na família errada"
valid_from: 2026-08-10
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - PPU0079
  - PPU0110
  - PPU0072
  - PPU0078
  - PAN0075
  - PAN0091
  - PNC0007
  - PNP0001
  - 016_lote_julho_2026.sql
  - docs/DEPLOY_LOTE_JULHO_2026.md
  - cartService.js
  - views/public/catalog.ejs
sources:
  - migracao:project_lote_julho_2026.md
---

Estado em **2026-08-10** do lote de peças novas de `temporario-novo-stocks/`.

**Criadas: 70**, na migração `016_lote_julho_2026.sql` (66 anéis de prata, 1
colar de âmbar, 1 pendente de larimar, 2 pendentes crescente). Commits
`5558ca0a` e `70e2fd93`, ambos em `origin/main`. **Produção tem a 015
aplicada mas ainda não a 016** — instruções em `docs/DEPLOY_LOTE_JULHO_2026.md`.

Entram com `sale_price = 0` e `current_stock = 1`. **A combinação é
deliberada** (decisão do utilizador, contra a minha recomendação): o stock é o
que as torna visíveis enquanto `hide_out_of_stock` estiver ligada, o preço a
zero é o que mostra *Preço sob consulta*. Por isso a compra a €0 está fechada
em dois níveis, e **não se pode desfazer nenhum deles**:

- nas vistas calcula-se `semPreco = !sale_price || parseFloat(sale_price) <= 0`.
  A armadilha: `sale_price` chega da BD como **string** (`"0.00"` é verdadeiro)
  e `formatted_sale_price` de zero é `"0,00 €"`, também verdadeiro. **Quem
  decide tem de ser o número, nunca o texto formatado.**
- `cartService.js` recusa do lado do servidor. A API validava activo e stock,
  **não** o preço.

**O €0,00 apareceu em produção porque faltavam quatro sítios**, corrigidos a
2026-08-10 (commit `e7835546`): `views/public/catalog.ejs` (o cartão de `/loja`
tem marcação **própria**, não usa `_productCard.ejs`), `catalog/search-results.ejs`,
o botão "copiar" e as peças semelhantes em `product-detail.ejs`, e — o pior —
o JSON-LD em `views/layouts/main.ejs` e `partials/schema-product.ejs`, que
declarava `"price": "0"` ao Google. Sem preço, o bloco `offers` deixa de ser
emitido; um `Product` sem `Offer` continua a ser schema válido. **Há dois
geradores de JSON-LD de produto** — mexer só num não chega.

**Pulseiras: 32 criadas** (migração `017_pulseiras_julho_2026.sql`, `PPU0079`–
`PPU0110`), de 36 fotografias — três grupos eram a mesma peça de ângulos
diferentes (`0836`+`0837`, `0838`+`0839`, `0906`+`0907`+`0908`).

**`PPU0072`–`PPU0078` existiam sem fotografia nenhuma**, criadas a 2026-06-23
com preço e stock. Vários nomes batiam certo com fotos deste lote (*Elos
Cubanos* ↔ `IMG_0822`, *Dragon Bone* ↔ `IMG_0840`), mas ficou a regra: **não
tocar sem confirmação de quem tem as peças** — ligar a foto à peça errada é
pior do que não ligar.

> **Resolvido a 2026-08-11.** As sete têm hoje uma imagem principal cada. Os
> nomes de ficheiro (`images-1782218018053-980118127.jpg` e afins) são do
> `multer`, ou seja **carregamento manual pelo admin**, não associação por
> script — foi feito por quem tem as peças, que era a condição posta.
> Verificado a 2026-08-18.

**46 peças da mesma pasta já estavam em produção** (fotografias idênticas),
todas vindas da subpasta por classificar; as três subpastas arrumadas é que
eram trabalho novo. A BD local também as tem, com preços.

**`PAN0075` está na família errada:** são brincos catalogados em
*Aneis - Prata*. Assinalado e não corrigido — é `UPDATE` num produto vivo.

> **Continua por corrigir a 2026-08-18:** `PAN0075` mantém-se em
> *Aneis - Prata*, com preço 40 €. É a única pendência desta nota.

**As referências seguem a subcategoria**, não uma série global: reserva-se o
próximo número livre por prefixo (`PAN0091`+, `PNC0007`, `PNP0001`,
`LTPD0006`–`0007`).

Ver [[fotografia-ambiente-2026-08]], [[media-local-vs-producao]]
e [[waphix-production-infra]].
