---
slug: seo-feed-merchant-consultar
tipo: procedimento
dominio: seo
titulo: Feed do Merchant, sitemap e robots — como consultar, e o preço zero que ainda sai
resumo: Os três endpoints públicos que dizem o que o Google recebe; o feed inclui produtos sem preço e emite 0.00 EUR, que o Merchant recusa.
keywords: Google Merchant Center, product feed, sitemap, robots.txt, structured data, price zero, availability, google_product_category, feed validation
valid_from: 2026-08-18
valid_to:
ingested_at: 2026-08-18T00:00:00+00:00
superseded_by:
confianca: 1.0
entities:
  - /feed/products.xml
  - /sitemap.xml
  - /robots.txt
  - routes/seo.js
  - getAllForMerchantFeed
sources:
  - ficheiro:gonzagas_node/routes/seo.js
  - ficheiro:gonzagas_node/models/Product.js
  - conversa:2026-08-18
relations:
  - routes/seo.js | gera | /feed/products.xml
  - getAllForMerchantFeed | alimenta | /feed/products.xml
---

Tudo o que o Google recebe sai de `gonzagas_node/routes/seo.js`, em três rotas
públicas. Consultam-se sem autenticação, em produção
([[consultar-as-duas-bases]]).

```bash
curl -s https://artnshine.pt/feed/products.xml    # Merchant Center
curl -s https://artnshine.pt/sitemap.xml          # Search Console
curl -s https://artnshine.pt/robots.txt
```

## O feed

`routes/seo.js:212`, alimentado por `Product.getAllForMerchantFeed()`.
Emite por item: `g:id` (a referência), título, descrição, link,
`g:image_link` (variante `-medium.jpg`), preço em EUR, disponibilidade,
`g:brand`, `g:mpn`, `g:product_type` (o nome da família),
`g:google_product_category` fixo em **188**, cor, `g:gender` unisex,
`g:age_group` adult e portes.

Contagens rápidas:

```bash
F=$(curl -s https://artnshine.pt/feed/products.xml)
echo "$F" | grep -c '<item>'                  # itens
echo "$F" | grep -c '<g:price>0.00 EUR'       # preço zero
echo "$F" | grep -c 'in_stock'                # disponíveis
```

## Problema em aberto: o preço zero chega ao Google

```js
const price = product.sale_price ? parseFloat(product.sale_price).toFixed(2) : '0.00';
```

**É a mesma armadilha do €0,00 corrigida em quatro vistas** — mas o feed ficou
de fora ([[lote-julho-2026]]). E o filtro de `getAllForMerchantFeed()` é só
`WHERE p.is_active = 1`: não olha ao preço nem a `deleted_at`.

Medido a 2026-08-18: **23 itens publicados com `<g:price>0.00 EUR</g:price>`**
(a base local daria 103, mas produção tem mais preços preenchidos).

Isto importa porque as peças sob consulta são deliberadamente sem preço — no
site mostram *«Preço sob consulta»*, o que está certo. **No feed não há esse
conceito:** ou o item tem preço válido, ou não devia lá estar. O Merchant
Center recusa itens a 0,00, e a conta acumula erros.

A correcção provável é excluir do feed quem não tem preço, em vez de lhes pôr
zero — mas é decisão de negócio (essas peças deixam de aparecer no Shopping),
por isso ficou assinalada e não corrigida.

Segundo problema, menor: **33 itens sem imagem principal** (`is_primary = 1`).
Desses, só 1 não tem imagem nenhuma — os outros 32 têm fotografias mas
nenhuma marcada como principal, e o feed serve-lhes a genérica
`og-artnshine.jpg`.

## O sitemap

Mesma armadilha de filtro: `getAllForSitemap()` também usa
`WHERE p.is_active = 1`. Já foi corrigido para exigir família com produtos
activos, e o caminho das imagens passou de `/uploads/products/` para
`/media/products/` — eram **293 imagens a dar 404** ([[seo-audit-2026-07-30]]).

## O que não se consegue ver daqui

**Search Console e Merchant Center exigem sessão** — não há como consultá-los
por linha de comandos sem credenciais. O que se pode verificar deste lado é
apenas o que *sai* do site; se o Google *aceitou* vê-se só nos painéis.

Das 22 tarefas de SEO por fazer, a maioria é exactamente isso: criar contas e
ligar serviços, que ninguém faz a partir do repositório
([[seo-pendentes-2026-08]]). O feed está pronto desde Fevereiro de 2026 e
continua por submeter.

## Verificação automática

O `monitor.py` cobre isto em duas secções: **Feed local** (o que a base de
desenvolvimento produziria) e **Produção publicada** (o que está mesmo no ar),
com a diferença entre as duas.

```bash
docs/memoria/.venv/bin/python docs/memoria/projeto/monitor.py --breve
```
