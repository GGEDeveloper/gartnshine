# Documentação SEO - Gonzaga's Art & Shine

Esta diretoria contém a documentação completa do desenvolvimento da **Fundação SEO (Fase 1 a 5)** para o projeto `artnshine.pt`.

## Objetivo
Estabelecer uma infraestrutura sólida de SEO Técnico e Analytics, alinhada com a identidade visual e o copy real da marca ("Elegância que nasce da terra", pratas 925, pedras naturais), preparando a plataforma para indexação correta no Google.

## Estado da Implementação (Fevereiro 2026)
O sistema está 100% dinâmico, mas o sitemap reflete **apenas as páginas funcionais**. As views futuras do tema Dark Nature (catálogo, manifesto, artesãos) têm o suporte SEO preparado, mas só entrarão no sitemap quando existirem.

## Índice da Documentação

1. [**Fase 1: Robots.txt e BASE_URL**](01-robots-sitemap.md)
   - Correção do bloqueio de sitemap
   - Definição da BASE_URL em todos os ambientes

2. [**Fase 2: Meta Tags Dinâmicas e Copy**](02-meta-tags.md)
   - Layout global e views standalone
   - Title, Description, Canonical URL, Open Graph, Twitter Cards
   - Correção de copy (remoção de "joalharia gótica", uso de "Art & Shine", "Prata 925")

3. [**Fase 3: Schema Markup (JSON-LD)**](03-schema-markup.md)
   - Schema de Produto (`Product`)
   - Breadcrumbs (`BreadcrumbList`)
   - Loja Online (`OnlineStore`)

4. [**Fase 4: Analytics e Cookie Consent**](04-ga4-tracking.md)
   - Integração do GA4 com o banner de cookies existente
   - Eventos de E-commerce (`view_item`, `search`)
   - Content Security Policy (CSP)

5. [**Fase 5: Sitemap Inteligente**](05-sitemap-avancado.md)
   - Utilitários de geração de slugs limpos
   - Inclusão de imagens de produtos (`<image:image>`)
   - Regra de exclusão de páginas 404/500

---

### Manutenção Futura
Sempre que uma nova view EJS for criada (ex: `pages/catalogo-dark-nature.ejs`), o developer deve:
1. Incluir o partial de SEO (`seo-head-standalone.ejs`) ou usar o `main.ejs`.
2. Adicionar a rota ao ficheiro `routes/seo.js` para entrar no `sitemap.xml`.