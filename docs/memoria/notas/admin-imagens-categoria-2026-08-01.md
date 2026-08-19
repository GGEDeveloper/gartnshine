---
slug: admin-imagens-categoria-2026-08-01
tipo: decisao
dominio: design
titulo: "Editor de enquadramento das imagens de categoria no admin (migração 014); recorte aplicado ao ficheiro com sharp, não n
resumo: "Editor de enquadramento das imagens de categoria no admin (migração 014); recorte aplicado ao ficheiro com sharp, não no browser"
valid_from: 2026-08-01
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - sql/migrations/014_category_image_crop.sql
  - utils/categoryImageProcessor.js
  - public/admin/js/category-cropper.js
  - categoryImageProcessor.js
  - design-system.css
  - sharp
sources:
  - migracao:project_admin_imagens_categoria_2026_08_01.md
---

Em 2026-08-01 o admin de categorias (`/admin/product-families/edit/:id`) passou a
permitir customizar a página pública e o enquadramento das imagens.

**O que existe:**

- Migração **014** (`sql/migrations/014_category_image_crop.sql`, aditiva e
  idempotente): `hero_source`, `hero_crop`, `card_source`, `card_crop` em
  `product_families`. As colunas `hero_image`/`card_image` continuam a ser o
  que as views usam — as novas só guardam a *decisão* de enquadramento.
- `utils/categoryImageProcessor.js` — recorta com `sharp` (fallback Jimp) e gera
  JPEG + WebP em três larguras. Hero 16:9, cartão 4:5.
- `public/admin/js/category-cropper.js` — editor em JavaScript simples.
- Rota `POST /admin/product-families/edit/:id/imagem/:tipo` (`hero` | `card`).
  A antiga `/hero-image` ficou a redireccionar.

**Decisões que não se leem no código:**

- **O recorte é aplicado ao ficheiro, no servidor**, não com `object-fit` no
  browser. Foi escolha deliberada: o enquadramento passa a ser o escolhido (e
  não o centro geométrico) e o ficheiro servido tem o tamanho certo.
- **Dois editores separados** (16:9 e 4:5) porque a mesma fotografia raramente
  funciona nas duas proporções sem ser reenquadrada.
- **Cropper escrito à mão, sem biblioteca**, porque a CSP do site só autoriza
  scripts do próprio domínio e de três CDNs — trazer uma biblioteca de recorte
  implicaria alterar a CSP.
- As proporções em `TIPOS` (categoryImageProcessor.js) **têm de acompanhar**
  `--ratio-hero` / `--ratio-tile` em `design-system.css`. Se divergirem, o
  browser volta a cortar por cima do nosso recorte.
- O ficheiro **original nunca é alterado**; as variantes antigas só são
  apagadas depois de as novas existirem.
- O nome das variantes leva carimbo de tempo — sem ele, a Cloudflare e o
  browser serviam a versão anterior e o reenquadramento não se via.

**Por fazer:** as views usam `background-image` para estes fundos, o que não faz
negociação de formato — o WebP é gerado mas não servido. Fica para quando se
converterem em `<picture>`.

Ver [[design-system-2026-08-01]].
