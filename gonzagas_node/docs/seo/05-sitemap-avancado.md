# Fase 5: Sitemap Avançado e Seguro

## O Problema
O `sitemap.xml` anterior apresentava deficiências severas que prejudicariam ativamente o SEO do projeto:
1. **Páginas Fantasma:** O sitemap estava a gerar links para páginas que ainda não existem fisicamente no servidor (ex: `/catalogo`, `/galeria`, `/manifesto`, `/artesaos`), o que resulta em erros 500/404. O Google penaliza sites que enviam sitemaps com links \"mortos\".
2. **URLs mal formatados:** As páginas dinâmicas não usavam slugs (ex: `/catalog/product/123` em vez de `/produto/anel-onix`).
3. **Falta de Imagens:** O sitemap não continha o namespace `<image:image>`, perdendo a oportunidade de indexação no Google Images (crucial para uma marca visual como joalharia).

## A Solução Implementada

O ficheiro `routes/seo.js` foi completamente reescrito para gerar um sitemap robusto, dinâmico e cirurgicamente limpo.

### 1. Limpeza de Rotas (Prevenção de Erros 500)
Foi estabelecida a Regra de Ouro do Sitemap: **Só entra o que devolve HTTP 200.**
Foram removidas do XML todas as referências a views futuras do tema \"Dark Nature\".

As rotas estáticas ativas são exclusivamente:
- `/` (Homepage)
- `/about`
- `/collections` (Galeria de famílias)
- `/catalog`
- `/privacy-policy`
- `/terms-of-service`

### 2. Imagens no Sitemap
A query de produtos na base de dados (`pool.execute`) foi alterada para fazer um sub-select (JOIN implícito) à tabela `product_images`, recolhendo a `main_image` (`is_primary = 1`).

Sempre que um produto tem imagem, o sitemap gera a estrutura:
```xml
<image:image>
  <image:loc>https://artnshine.pt/uploads/products/nome-da-imagem.jpg</image:loc>
  <image:title>Nome do Produto Escapado</image:title>
  <image:caption>Gonzaga's Art & Shine — Nome do Produto</image:caption>
</image:image>
```

### 3. Utilitários de Texto
Criado o `utils/seo-helpers.js` com a função `generateSlug()`. 
**Nota Técnica:** Atualmente as rotas da aplicação ainda operam via ID numérico (`/catalog/product/:id`). A função `generateSlug` foi criada para preparar o sitemap para o momento em que a arquitetura de rotas migrar para URLs baseados em slugs (ex: `/produto/:slug`).

### 4. Correção de Rotas Dinâmicas
As rotas de coleção estavam incorretamente mapeadas como `/catalog/family/:id` no sitemap antigo. Foram corrigidas para a rota real da aplicação: `/collection/:id`.

## Regra de manutenção (IMPORTANTE)

**Só adicionar ao sitemap uma rota quando:**
1. A route Express existir em `gonzagas_node/routes/`
2. A view EJS correspondente existir
3. Retornar HTTP 200 confirmado localmente

**Rotas ativas e no sitemap (estado atual):**

| Rota | View | Título |
|------|------|--------|
| `/` | `index.ejs` | Art&Shine — Elegância que nasce da terra |
| `/catalog` | CatalogController | Catálogo |
| `/catalog/product/:id` | `catalog/product-detail.ejs` | Nome do produto |
| `/collections` | `collections.ejs` | Galeria de Peças |
| `/collection/:id` | `collection.ejs` | Nome da coleção |
| `/about` | `about.ejs` | Sobre Nós |
| `/privacy-policy` | `privacy-policy.ejs` | Política de Privacidade |
| `/terms-of-service` | `terms-of-service.ejs` | Termos de Serviço |