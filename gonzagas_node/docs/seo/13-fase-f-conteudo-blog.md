# FASE F — Conteúdo & Blog

**Objetivo:** Long-tail keywords + autoridade de domínio crescente  
**Branch:** `dev/feature-blog` _(a criar)_  
**Prioridade:** 🟢 Futura — investimento long-term, resultados em 3-12 meses

---

## Contexto

Conteúdo é o motor de SEO a longo prazo. Cada artigo é uma nova porta de entrada no Google — captura keywords que as páginas de produto não conseguem. Um blog sobre joias artesanais, prata 925 e pedras naturais:

- Captura long-tail keywords com alta intenção
- Aumenta o domain authority progressivamente
- Gera backlinks naturais (outros sites citam os artigos)
- Aumenta o tempo de permanência no site (engagement signal)
- Cria uma ligação emocional com a marca

---

## Task F1 — Estrutura Técnica do Blog

### Rota e templates

```
/blog                    → Lista de artigos
/blog/:slug              → Artigo individual
/blog/categoria/:slug    → Artigos por categoria
```

### Modelo de dados (DB)

```sql
CREATE TABLE blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,              -- resumo (~160 chars, usado na meta description)
  content LONGTEXT,          -- corpo do artigo (HTML ou Markdown)
  featured_image VARCHAR(255),
  category VARCHAR(100),
  tags VARCHAR(500),         -- keywords separadas por vírgula
  author VARCHAR(100) DEFAULT 'Art & Shine',
  published BOOLEAN DEFAULT FALSE,
  published_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Rota Express

```javascript
// routes/blog.js
router.get('/blog', async (req, res) => {
  const posts = await BlogPost.findAll({ where: { published: true }, order: [['published_at', 'DESC']] });
  res.render('pages/blog-list', { posts, title: 'Blog — Art & Shine', metaDescription: 'Artigos sobre joias artesanais, prata 925 e pedras naturais.' });
});

router.get('/blog/:slug', async (req, res) => {
  const post = await BlogPost.findOne({ where: { slug: req.params.slug, published: true } });
  if (!post) return res.status(404).render('404');
  res.render('pages/blog-post', {
    post,
    title: post.title,
    metaDescription: post.excerpt,
    canonicalUrl: `${process.env.BASE_URL}/blog/${post.slug}`,
    ogImage: post.featured_image ? `${process.env.BASE_URL}/uploads/blog/${post.featured_image}` : null
  });
});
```

### Schema Article por post

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "<%- post.title %>",
  "description": "<%- post.excerpt %>",
  "image": "<%- ogImage %>",
  "author": {
    "@type": "Organization",
    "name": "Art & Shine",
    "url": "https://artnshine.pt"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Art & Shine",
    "logo": {
      "@type": "ImageObject",
      "url": "https://artnshine.pt/images/logo-artnshine.png"
    }
  },
  "datePublished": "<%- post.published_at.toISOString() %>",
  "dateModified": "<%- post.updated_at.toISOString() %>",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "<%- canonicalUrl %>"
  }
}
</script>
```

---

## Task F2 — Plano Editorial (Primeiro Ano)

### Artigos prioritários (por volume de pesquisa e relevância)

| # | Título | Keyword principal | Tipo | Prioridade |
|---|--------|-------------------|------|------------|
| 1 | Como cuidar de prata 925: guia completo | `cuidar prata 925` | Guia | 🔴 Alta |
| 2 | Significado das pedras naturais: ónix, turquesa, ametista | `significado pedras naturais` | Informativo | 🔴 Alta |
| 3 | Diferença entre prata 925 e prata esterlina | `prata 925 vs prata esterlina` | Comparativo | 🔴 Alta |
| 4 | Como escolher um anel de prata 925 | `escolher anel prata` | Guia de compra | 🟡 Média |
| 5 | O processo de criação de joias artesanais | `joias artesanais como fazer` | Behind the scenes | 🟡 Média |
| 6 | Pedras naturais e os seus benefícios | `beneficios pedras naturais` | Informativo | 🟡 Média |
| 7 | Como limpar anel de prata 925 em casa | `limpar prata 925 casa` | Tutorial | 🟡 Média |
| 8 | O que significa prata 925? | `o que e prata 925` | Informativo | 🟡 Média |
| 9 | Joalharia artesanal portuguesa: tradição e modernidade | `joalharia artesanal portuguesa` | Marca | 🟢 Baixa |
| 10 | Guia de presentes em prata 925 | `presentes prata 925` | Sazonal | 🟢 Baixa |

### Estrutura de cada artigo

```
H1: [Título com keyword principal]

[Introdução 2-3 parágrafos — keyword principal no 1º parágrafo]

H2: [Subtema 1]
[Conteúdo 200-300 palavras]

H2: [Subtema 2]
[Conteúdo 200-300 palavras]

[...]

H2: Produtos relacionados
[Links internos para produtos Art & Shine relevantes]

[CTA: "Descubra a nossa coleção de X"]
```

**Extensão mínima:** 800 palavras  
**Extensão ideal:** 1.200-1.500 palavras  
**Imagens:** Mínimo 2 por artigo (WebP, alt text com keywords)

---

## Task F3 — Links Internos (Link Juice)

Cada artigo deve ter **mínimo 3 links internos** para:
- Produtos relacionados com o tema do artigo
- Outros artigos do blog (após ter mais de 1)
- Página de catálogo ou coleção relevante

**Exemplo:**
No artigo "Como cuidar de prata 925" → links para produtos de prata 925 + link para colecção prata.

---

## Task F4 — Adicionar Blog ao Sitemap

Ao implementar o blog, adicionar as rotas ao `routes/seo.js` (sitemap):

```javascript
// Artigos do blog
const posts = await BlogPost.findAll({ where: { published: true } });
posts.forEach(post => {
  urls.push({
    loc: `${BASE_URL}/blog/${post.slug}`,
    lastmod: post.updated_at.toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.6'
  });
});

// Página de listagem do blog
urls.push({
  loc: `${BASE_URL}/blog`,
  lastmod: new Date().toISOString().split('T')[0],
  changefreq: 'weekly',
  priority: '0.7'
});
```

---

## Checklist de Implementação

### Estrutura técnica
- [ ] Tabela `blog_posts` criada na DB
- [ ] Rotas `/blog` e `/blog/:slug` implementadas
- [ ] Templates `blog-list.ejs` e `blog-post.ejs` criados
- [ ] Schema `Article` em `blog-post.ejs`
- [ ] Meta tags SEO em cada post
- [ ] Rotas adicionadas ao sitemap
- [ ] Link para `/blog` no menu de navegação

### Primeiro artigo
- [ ] Artigo #1 escrito: "Como cuidar de prata 925"
- [ ] Mínimo 800 palavras
- [ ] Imagem de destaque (WebP, 1200×630px)
- [ ] Links internos para produtos
- [ ] Publicado e visível em produção
- [ ] URL submetido no Search Console (Inspecionar URL)

---

## Métricas de sucesso (6 meses)

| Métrica | Target |
|---------|--------|
| Artigos publicados | 5-10 |
| Tráfego orgânico via blog | +30% do total organic |
| Keywords long-tail rankeadas | +50 novas |
| Tempo médio na página (blog) | > 3 minutos |
| Links externos recebidos | > 5 domínios únicos |

---

**Doc anterior:** `12-fase-e-seo-local.md`  
**Roadmap completo:** `07-seo-roadmap-avancado.md`
