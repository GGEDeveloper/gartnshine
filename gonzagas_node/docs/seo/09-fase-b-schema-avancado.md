# FASE B — Schema Markup Avançado

**Objetivo:** Rich results no Google — estrelas, preços e disponibilidade visíveis diretamente nos resultados de pesquisa  
**Branch:** `dev/seo-schema-graph` _(a criar)_  
**Prioridade:** 🔴 Alta — impacto direto no CTR (+20-35%)

---

## Contexto

O schema básico já existe (Fase 3 da fundação) mas está fragmentado — cada página tem o seu bloco JSON-LD independente, sem ligação entre entidades.

O Google prefere um **`@graph` unificado** onde todas as entidades estão relacionadas: a Organização tem um Website, o Website tem Páginas, as Páginas têm Produtos. Esta estrutura conectada maximiza as hipóteses de rich results.

---

## O que temos vs. o que queremos

| Schema | Estado atual | Target |
|--------|-------------|--------|
| `Organization` | ❌ Inexistente | ✅ Com `sameAs` Instagram/Facebook |
| `WebSite` | ❌ Inexistente | ✅ Com `SearchAction` (sitelinks search box) |
| `WebPage` | ❌ Inexistente | ✅ Por tipo de página |
| `Product` | ✅ Básico | ✅ Completo com `offers`, `brand`, `material` |
| `BreadcrumbList` | ✅ Existe | ✅ Manter e ligar ao @graph |
| `ItemList` | ❌ Inexistente | ✅ Nas páginas de coleção |
| `LocalBusiness` | ❌ Inexistente | 🟡 Se houver presença física |
| `AggregateRating` | ❌ Inexistente | 🟢 Quando implementares reviews |

---

## Task B1 — Estrutura @graph Unificada

### Arquitetura do grafo

```
Organization (artnshine.pt)
    └── WebSite (artnshine.pt)
            ├── WebPage (homepage)
            ├── WebPage (produto) → Product
            │       └── Offer
            ├── WebPage (coleção) → ItemList
            │       └── ListItem → Product (×N)
            └── WebPage (about)
```

### Template @graph completo para produto

Substituir o bloco JSON-LD atual em `views/pages/product-detail.ejs`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://artnshine.pt/#organization",
      "name": "Art & Shine",
      "url": "https://artnshine.pt",
      "logo": {
        "@type": "ImageObject",
        "url": "https://artnshine.pt/images/logo-artnshine.png",
        "width": 200,
        "height": 60
      },
      "sameAs": [
        "https://www.instagram.com/artnshine/",
        "https://www.facebook.com/artnshine/"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": "Portuguese"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://artnshine.pt/#website",
      "url": "https://artnshine.pt",
      "name": "Art & Shine",
      "description": "Joias artesanais em prata 925 e pedras naturais",
      "publisher": { "@id": "https://artnshine.pt/#organization" },
      "inLanguage": "pt-PT",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://artnshine.pt/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "WebPage",
      "@id": "<%- canonicalUrl %>/#webpage",
      "url": "<%- canonicalUrl %>",
      "name": "<%- title %>",
      "description": "<%- metaDescription %>",
      "isPartOf": { "@id": "https://artnshine.pt/#website" },
      "inLanguage": "pt-PT",
      "breadcrumb": { "@id": "<%- canonicalUrl %>/#breadcrumb" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "<%- canonicalUrl %>/#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://artnshine.pt" },
        { "@type": "ListItem", "position": 2, "name": "Catálogo", "item": "https://artnshine.pt/catalog" },
        { "@type": "ListItem", "position": 3, "name": "<%- product.name %>" }
      ]
    },
    {
      "@type": "Product",
      "@id": "<%- canonicalUrl %>/#product",
      "name": "<%- product.name %>",
      "description": "<%- product.description || product.name + ' artesanal em prata 925 — Art & Shine' %>",
      "image": [
        "https://artnshine.pt/uploads/products/<%- product.image %>"
      ],
      "brand": {
        "@type": "Brand",
        "name": "Art & Shine"
      },
      "material": "Prata 925",
      "url": "<%- canonicalUrl %>",
      "sku": "AS-<%- product.id %>",
      "offers": {
        "@type": "Offer",
        "url": "<%- canonicalUrl %>",
        "priceCurrency": "EUR",
        "price": "<%- product.price %>",
        "priceValidUntil": "<%= new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] %>",
        "availability": "<%- product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' %>",
        "seller": { "@id": "https://artnshine.pt/#organization" }
      },
      "isRelatedTo": { "@id": "https://artnshine.pt/#website" }
    }
  ]
}
</script>
```

---

## Task B2 — sameAs com redes sociais

Os URLs exactos das redes sociais da marca devem ser confirmados e inseridos no campo `sameAs` da `Organization`.

**A confirmar:**
- URL completo do Instagram
- URL completo do Facebook
- (Opcional) Pinterest, TikTok se existirem

```json
"sameAs": [
  "https://www.instagram.com/CONFIRMAR_USERNAME/",
  "https://www.facebook.com/CONFIRMAR_USERNAME/"
]
```

---

## Task B3 — Product schema completo

### Propriedades obrigatórias para rich results

| Propriedade | Obrigatória | Valor |
|-------------|-------------|-------|
| `name` | ✅ Sim | Nome do produto |
| `image` | ✅ Sim | URL da imagem (array preferível) |
| `offers.price` | ✅ Sim | Preço numérico |
| `offers.priceCurrency` | ✅ Sim | `"EUR"` |
| `offers.availability` | ✅ Sim | `InStock` / `OutOfStock` |

### Propriedades recomendadas

| Propriedade | Valor sugerido |
|-------------|----------------|
| `brand.name` | `"Art & Shine"` |
| `material` | `"Prata 925"`, `"Ónix"`, `"Pedra Natural"` |
| `sku` | `"AS-" + product.id` |
| `offers.priceValidUntil` | Data +1 ano |
| `offers.seller` | `@id` da Organization |
| `description` | Texto descritivo do produto |

### Material dinâmico (sugestão)

Se a DB tiver campo de material:

```javascript
// routes/catalog.js ou helper
function getMaterials(product) {
  const materials = ['Prata 925'];
  if (product.stone) materials.push(product.stone);
  if (product.category_name) materials.push(product.category_name);
  return materials.join(', ');
}
```

---

## Task B4 — ItemList nas páginas de coleção

Nas páginas `/collection/:id`, adicionar um `ItemList` com todos os produtos da coleção.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "<%- canonicalUrl %>/#webpage",
      "name": "<%- collection.name %> — Art & Shine",
      "url": "<%- canonicalUrl %>",
      "isPartOf": { "@id": "https://artnshine.pt/#website" }
    },
    {
      "@type": "ItemList",
      "@id": "<%- canonicalUrl %>/#itemlist",
      "name": "Produtos da coleção <%- collection.name %>",
      "numberOfItems": "<%- products.length %>",
      "itemListElement": [
        <% products.forEach((p, i) => { %>
        {
          "@type": "ListItem",
          "position": <%- i + 1 %>,
          "url": "https://artnshine.pt/catalog/product/<%- p.id %>",
          "name": "<%- p.name %>"
        }<% if (i < products.length - 1) { %>,<% } %>
        <% }); %>
      ]
    }
  ]
}
</script>
```

---

## Task B5 — WebSite SearchAction (Sitelinks Search Box)

Ao incluir `SearchAction` no schema `WebSite`, o Google pode mostrar uma **caixa de pesquisa do site directamente nos resultados** (sitelinks search box).

```json
"potentialAction": {
  "@type": "SearchAction",
  "target": {
    "@type": "EntryPoint",
    "urlTemplate": "https://artnshine.pt/search?q={search_term_string}"
  },
  "query-input": "required name=search_term_string"
}
```

> ⚠️ Verificar que a rota `/search?q=` funciona correctamente em produção.

---

## Task B6 — AggregateRating (Futura)

Quando implementares sistema de reviews de produtos, adicionar ao schema Product:

```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "reviewCount": "27",
  "bestRating": "5",
  "worstRating": "1"
}
```

Isso ativa as **estrelas douradas** nos resultados de pesquisa — um dos CTR boosters mais eficazes.

---

## Validação

| Ferramenta | URL | O que testar |
|-----------|-----|-------------|
| Rich Results Test | https://search.google.com/test/rich-results | Product rich results |
| Schema Validator | https://validator.schema.org/ | Estrutura @graph |
| Search Console | Experience → Enhancements | Erros de schema em produção |

**Processo de validação:**
1. Implementar schema
2. Testar com Rich Results Test (URL ou código)
3. Confirmar "Product" eligible for rich results
4. Deploy para produção
5. Aguardar 1-4 semanas para aparecer nos resultados

---

## Checklist de Implementação

- [ ] `@graph` unificado em `product-detail.ejs`
- [ ] `Organization` com `sameAs` (URLs reais das redes sociais confirmados)
- [ ] `WebSite` com `SearchAction`
- [ ] `Product` com `offers.availability` dinâmico (InStock/OutOfStock)
- [ ] `Product` com `offers.priceValidUntil` dinâmico (+1 ano)
- [ ] `Product` com `brand`, `material`, `sku`
- [ ] `ItemList` em `collection-detail.ejs`
- [ ] Validado no Rich Results Test
- [ ] Validado no Schema Validator
- [ ] Deploy + monitorização no Search Console

---

**Doc anterior:** `08-fase-a-performance.md`  
**Doc seguinte:** `10-fase-c-urls-onpage.md`
