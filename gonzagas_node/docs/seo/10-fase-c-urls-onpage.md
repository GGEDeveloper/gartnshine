# FASE C — URLs Semânticas & On-Page SEO

**Objetivo:** Cada produto rankeia individualmente para keywords específicas em Portugal  
**Branch:** `dev/seo-semantic-urls` _(a criar)_  
**Prioridade:** 🔴 Alta — maior impacto long-term em rankings orgânicos

---

## Contexto

URLs como `/catalog/product/47` não têm nenhum valor SEO. O Google lê o URL como sinal de relevância. Uma URL como `/catalog/product/anel-prata-925-onix-negro` diz ao Google exactamente do que trata a página — e rankeia para essas keywords.

---

## Task C1 — URLs Semânticas nos Produtos

### Sistema de slugs

O `seoUtils.js` já tem um gerador de slugs. O que falta é aplicá-lo nas rotas de produtos.

### Estratégia de URL

```
# Antes
https://artnshine.pt/catalog/product/47

# Depois
https://artnshine.pt/catalog/product/anel-prata-925-onix-negro
```

### Implementação em `routes/catalog.js`

```javascript
const { generateSlug } = require('../utils/seoUtils');

// Rota com slug
router.get('/catalog/product/:slug', async (req, res) => {
  const { slug } = req.params;

  // Tentar encontrar produto pelo slug
  let product = await Product.findBySlug(slug);

  // Fallback: se não encontrar pelo slug, tentar pelo ID (retrocompatibilidade)
  if (!product && /^\d+$/.test(slug)) {
    product = await Product.findById(slug);
    if (product) {
      // Redirecionar para URL canónica com slug
      const productSlug = generateSlug(product.name, product.id);
      return res.redirect(301, `/catalog/product/${productSlug}`);
    }
  }

  if (!product) return res.status(404).render('404');

  res.render('pages/product-detail', { product });
});
```

### Gerar slug a partir do nome

Exemplo de função em `utils/seoUtils.js`:

```javascript
function generateProductSlug(name, id) {
  const slug = name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remover acentos
    .replace(/[^a-z0-9\s-]/g, '')                     // só letras, números, espaços, hífens
    .trim()
    .replace(/\s+/g, '-')                              // espaços → hífens
    .replace(/-+/g, '-');                              // hífens duplos → simples

  return slug; // Ex: "anel-prata-925-onix-negro"
  // Se quiser garantir unicidade: return `${slug}-${id}`;
}
```

### Migração de URLs existentes

> ⚠️ **IMPORTANTE:** Ao mudar URLs de produto, fazer redirect 301 das URLs antigas para as novas. Sem isto perde-se qualquer autoridade já acumulada e criam-se erros 404 no Search Console.

```javascript
// Redirecionar URLs antigas: /catalog/product/47 → /catalog/product/anel-prata-925
router.get('/catalog/product/:id(\\d+)', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).render('404');
  const slug = generateProductSlug(product.name, product.id);
  res.redirect(301, `/catalog/product/${slug}`);
});
```

### Campo `slug` na DB

Adicionar coluna `slug` na tabela `products`:

```sql
ALTER TABLE products ADD COLUMN slug VARCHAR(255) UNIQUE;

-- Popular slugs existentes
UPDATE products SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name, '[^a-zA-Z0-9 -]', ''),
    ' +', '-'
  )
);
```

---

## Task C2 — Alt Text Automático nas Imagens

### Porquê é crítico

- Google Images é uma fonte de tráfego significativa para joias
- Imagens sem alt text são invisíveis para o Google
- Alt text deficiente = oportunidade desperdiçada

### Fórmula de alt text

```
[Nome do produto] em prata 925 — Art & Shine
[Material específico se disponível]
```

**Exemplos:**
- `alt="Anel em prata 925 com ónix negro — Art & Shine"`
- `alt="Colar artesanal em prata 925 com pedra turquesa — Art & Shine"`
- `alt="Brincos em prata 925 com ametista — Art & Shine"`

### Helper EJS

Adicionar em `utils/seoUtils.js`:

```javascript
function generateImageAlt(product) {
  const type = product.category_name || 'Joia';
  const stone = product.stone ? ` com ${product.stone}` : '';
  const material = product.material || 'prata 925';
  return `${type} artesanal em ${material}${stone} — Art & Shine`;
}

module.exports = { generateProductSlug, generateImageAlt };
```

### Aplicar nos templates EJS

```html
<!-- product-detail.ejs -->
<img
  src="/uploads/products/<%= product.image %>"
  alt="<%= product.name %> em prata 925 — Art & Shine"
  width="800"
  height="800">

<!-- product-card.ejs (nos grids) -->
<img
  src="/uploads/products/<%= p.image %>"
  alt="<%= p.name %> — joias artesanais Art & Shine"
  width="400"
  height="400"
  loading="lazy">
```

---

## Task C3 — Meta Descriptions Únicas por Produto

### O problema

Produtos sem `description` na DB → meta description genérica para todos → Google penaliza conteúdo duplicado.

### Prioridade de meta description

```javascript
// Lógica actual em seo-head-standalone.ejs
const _desc = product.description
  || `${product.name} artesanal em prata 925. Elegância que nasce da terra — Art & Shine.`;
```

### Template de description por produto

Preencher na DB seguindo este modelo:

```
[Nome do produto] artesanal em prata 925[, com material/pedra].
[Característica única ou inspiração].
[CTA] — Descubra em Art & Shine.
```

**Exemplos:**
```
Anel artesanal em prata 925 com ónix negro. 
Desenhado para quem valoriza elegância natural e materiais genuínos. 
Peça única — Art & Shine.
```

```
Colar em prata 925 com pedra turquesa natural. 
Inspirando-se na terra portuguesa, cada peça é trabalhada à mão. 
Descubra em Art & Shine.
```

> ⚠️ **Limite:** 150-160 caracteres. Texto mais longo é cortado nos resultados Google.

### Script de auditoria (verificar produtos sem description)

```sql
SELECT id, name, 
  CHAR_LENGTH(description) as desc_length,
  CASE WHEN description IS NULL OR description = '' THEN 'VAZIO' ELSE 'OK' END as status
FROM products
ORDER BY status DESC, name ASC;
```

---

## Task C4 — H1 Otimizado por Página

### Regras

- **1 único H1 por página** (Google lê o primeiro H1 como tema principal)
- H1 deve conter a keyword principal da página
- H1 ≠ título da meta tag (podem ser parecidos mas não exactamente iguais)

### Por página

| Página | H1 atual | H1 recomendado |
|--------|---------|----------------|
| Homepage | _(verificar)_ | `Joias Artesanais em Prata 925` |
| Produto | Nome do produto | `[Nome] — Prata 925 Art & Shine` |
| Coleção | Nome da coleção | `Coleção [Nome] — Joias Artesanais` |
| Catálogo | _(verificar)_ | `Catálogo de Joias — Prata 925 e Pedras Naturais` |
| About | _(verificar)_ | `Art & Shine — Elegância que nasce da terra` |

---

## Task C5 — Audit de Keywords PT

### Keywords primárias (alto volume, alta intenção de compra)

| Keyword | Volume estimado PT | Dificuldade | Página alvo |
|---------|-------------------|-------------|-------------|
| `prata 925 portugal` | 🟡 Médio | 🟡 Médio | Homepage |
| `joias artesanais prata` | 🟡 Médio | 🟡 Médio | Homepage / Catálogo |
| `anel prata 925` | 🟢 Alto | 🔴 Alto | Produtos anéis |
| `colar pedra natural` | 🟡 Médio | 🟡 Médio | Produtos colares |
| `brincos prata 925` | 🟡 Médio | 🟡 Médio | Produtos brincos |

### Keywords long-tail (menor volume, maior conversão)

| Keyword | Tipo | Página alvo |
|---------|------|-------------|
| `anel prata 925 onix` | Produto específico | Produto com ónix |
| `colar prata pedra natural artesanal` | Produto + atributo | Produtos colares |
| `joias artesanais portuguesas` | Origem | Homepage / About |
| `prata 925 pedras naturais` | Material | Catálogo |
| `joias feitas à mão portugal` | Artesanal | About / Homepage |

### Onde aplicar as keywords

1. **Título da página** (meta title) — keyword principal
2. **H1** — keyword principal ou variação
3. **Primeiros 100 palavras** do conteúdo
4. **Alt text** das imagens
5. **URL** (após implementação dos slugs)
6. **Meta description** (de forma natural)

> ⚠️ **Evitar keyword stuffing.** Google penaliza repetição excessiva. Usar variações naturais.

---

## Checklist de Implementação

### C1 — URLs Semânticas
- [ ] Função `generateProductSlug()` em `seoUtils.js` testada
- [ ] Coluna `slug` adicionada à tabela `products` na DB
- [ ] Slugs gerados para todos os produtos existentes
- [ ] Rota `/catalog/product/:slug` implementada
- [ ] Redirect 301 de URLs numéricas para slugs
- [ ] Testado em local (DB local)
- [ ] Testado em produção (sem quebrar links existentes)
- [ ] Search Console — verificar ausência de erros 404 após deploy

### C2 — Alt Text
- [ ] `generateImageAlt()` em `seoUtils.js`
- [ ] `product-detail.ejs` — imagem principal com alt text
- [ ] `product-card.ejs` — grid com alt text
- [ ] `search-results.ejs` — resultados com alt text
- [ ] `index.ejs` — produtos em destaque com alt text

### C3 — Meta Descriptions
- [ ] SQL audit executado — lista de produtos sem description
- [ ] Descriptions preenchidas na DB (prioridade: top 20 produtos por vendas)
- [ ] Fallback genérico confirmado para produtos sem description

### C4 — H1
- [ ] Auditoria de H1 em todas as páginas principais
- [ ] H1 único por página confirmado
- [ ] Keywords naturalmente integradas nos H1

---

**Doc anterior:** `09-fase-b-schema-avancado.md`  
**Doc seguinte:** `11-fase-d-merchant-center.md`
