---
slug: seo-naming-2026-07
tipo: facto
dominio: seo
titulo: Projeto de nomeação/SEO dos produtos por análise de imagem; BD local atualizada em 2026-07-08
resumo: Projeto de nomeação/SEO dos produtos por análise de imagem; BD local atualizada em 2026-07-08
valid_from: 2026-07-01
valid_to: 
ingested_at: 2026-08-17T14:13:37+00:00
superseded_by: 
confianca: 1.0
entities:
  - LTCU0016
  - PAN0075
  - -medium.jpg
  - routes/seo.js
  - update_seo.sql
  - rollback_seo.sql
sources:
  - migracao:project_seo_naming_2026_07.md
---

Projeto (2026-07-08): nomear os produtos sem nome ("Produto <timestamp>") e gerar SEO (name, slug, description) por **análise das imagens**.

- Catálogo: 328 produtos na BD local `gonzagas_local`; **produção (artnshine.pt) tem mais** (~358, ids até 365) e nomes de ficheiro de imagem **diferentes** dos locais.

> **Números actualizados a 2026-08-18:** a base local tem hoje **511 produtos
> activos** — os 328 desta nota mais o lote de Julho e as pulseiras de Agosto
> ([[lote-julho-2026]]). **Zero** produtos com nome por gerar: o trabalho de
> nomeação está completo, incluindo o `LTCU0016` que aqui ficava pendente, que
> tem hoje nome, slug e descrição. **Continua sem imagem** — é o único produto
> activo nessa situação, ver [[catalogo-monitorizar]].
- Padrão de imagem em produção: `https://artnshine.pt/media/products/<base>-medium.jpg` (o `/uploads/products/` da og:image dá 404; usar `/media/products/` + `-medium.jpg`). Referência fiável de cada produto = campo `sku` no JSON-LD da página `/catalog/product/:id`.
- SEO no site: `<title>` e og:title vêm do `name`; `slug` alimenta URL canónica/sitemap/feed (`routes/seo.js`). Não há colunas meta dedicadas nos produtos (as famílias e as coleções têm `seo_title`/`seo_description`).
- **Desactualizado a partir de 2026-07-30** (ver [[project-seo-audit-2026-07-30]]): o sufixo " | Art&Shine" passou a ser condicional (só entra se o título couber em ~60 chars) e a meta-description já não é o corte simples da `description` — descrições curtas são completadas com material, família e contexto.
- **Aplicado à BD local**: 327/328 produtos com name+slug+description (SQL `update_seo.sql`). Backup reversível em `rollback_seo.sql` (raiz do worktree). Pendente: **LTCU0016** (não existe em produção nem tem imagem local).
- Divergências assinaladas: PAN0075 (família Aneis mas imagem = brincos); LTG0015 (família Brincos-Prata mas imagem = gargantilha prateada). Muitas peças "Latão" têm acabamento prateado.
- Entregáveis na raiz do worktree: `SEO_PRODUTOS_COMPLETO.xlsx`, `update_seo.sql`, `rollback_seo.sql`, `INVENTARIO_NOMES_PRODUTOS.xlsx`.
