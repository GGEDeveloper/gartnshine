# FASE D — Google Merchant Center

**Objetivo:** Produtos do artnshine.pt aparecem no Google Shopping GRATUITAMENTE  
**Branch:** `dev/seo-merchant-center` _(a criar)_  
**Prioridade:** 🟡 Média — alto impacto visual, zero custo

---

## Contexto

Desde 2020, o Google Shopping mostra produtos **gratuitamente** (listagens orgânicas), não apenas anúncios pagos. Qualquer loja com Google Merchant Center pode aparecer nas pesquisas com imagem + preço + nome da loja diretamente nos resultados.

Para uma loja de joias artesanais, isto é extremamente valioso: o utilizador pesquisa "anel prata 925" e vê a foto do produto, o preço e o link — sem pagar nada.

---

## Passo 1 — Criar conta Google Merchant Center

1. Aceder a https://merchants.google.com
2. Criar conta com o mesmo Google Account do GA4 e Search Console
3. Verificar o domínio `artnshine.pt` (reutiliza a verificação do Search Console)
4. Preencher informações da empresa:
   - Nome: `Art & Shine`
   - País: `Portugal`
   - Moeda: `EUR`
   - URL: `https://artnshine.pt`

---

## Passo 2 — Ligar ao GA4

No Merchant Center:
1. **Configurações** → **Ferramentas** → **Google Analytics**
2. Selecionar a propriedade GA4 `G-VYM82NFR22`
3. Confirmar ligação

Isso permite ver dados de tráfego do Shopping no GA4.

---

## Passo 3 — Criar endpoint `/feed.xml` no Express

### O que é um feed de produtos

Um ficheiro XML com todos os produtos da loja, actualizado automaticamente. O Google lê este ficheiro periodicamente e usa os dados para as listagens.

### Implementação em `routes/seo.js`

Adicionar à rota de SEO existente:

```javascript
// Feed Google Merchant Center
router.get('/feed.xml', async (req, res) => {
  try {
    const products = await Product.findAll({ where: { active: true } });
    const baseUrl = process.env.BASE_URL || 'https://artnshine.pt';

    const items = products.map(p => `
      <item>
        <g:id>${p.id}</g:id>
        <g:title>${escapeXml(p.name)}</g:title>
        <g:description>${escapeXml(p.description || p.name + ' artesanal em prata 925 — Art & Shine')}</g:description>
        <g:link>${baseUrl}/catalog/product/${p.slug || p.id}</g:link>
        <g:image_link>${baseUrl}/uploads/products/${p.image}</g:image_link>
        <g:price>${parseFloat(p.price).toFixed(2)} EUR</g:price>
        <g:availability>${p.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
        <g:brand>Art &amp; Shine</g:brand>
        <g:condition>new</g:condition>
        <g:product_type>Joias &gt; Prata 925</g:product_type>
        <g:google_product_category>188</g:google_product_category>
        <g:identifier_exists>no</g:identifier_exists>
      </item>
    `).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Art &amp; Shine</title>
    <link>${baseUrl}</link>
    <description>Joias artesanais em prata 925 e pedras naturais</description>
    ${items}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    console.error('[FEED] Erro:', err);
    res.status(500).send('Erro ao gerar feed');
  }
});

// Helper: escapar caracteres especiais XML
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
```

### Categoria Google (google_product_category)

| Categoria | Código Google |
|-----------|---------------|
| Joias (geral) | `188` |
| Anéis | `200` |
| Colares e correntes | `196` |
| Brincos | `194` |
| Pulseiras | `191` |

> Usar categoria específica se possível. Pode variar por produto com campo `category_id` da DB.

---

## Passo 4 — Submeter feed no Merchant Center

1. No Merchant Center → **Produtos** → **Feeds**
2. **Adicionar feed principal**:
   - País de destino: `Portugal`
   - Idioma: `Português`
   - Tipo: `Feed programado (URL)`
   - URL do feed: `https://artnshine.pt/feed.xml`
   - Frequência: `Diário`
3. **Clicar em Buscar agora** para validação imediata

---

## Passo 5 — Validar e corrigir erros

O Merchant Center mostra erros e avisos após processar o feed.

### Erros comuns e soluções

| Erro | Causa | Solução |
|------|-------|--------|
| `Missing required attribute: id` | Campo `g:id` vazio | Garantir que `p.id` nunca é null |
| `Invalid price format` | Preço sem formato correto | Usar `"89.90 EUR"` (ponto decimal, espaço, moeda) |
| `Image not accessible` | URL da imagem devolve 404 | Verificar que imagens existem em produção |
| `Landing page not found` | URL do produto devolve 404 | Verificar que slugs funcionam |
| `Missing GTIN` | Google quer código de barras | Adicionar `<g:identifier_exists>no</g:identifier_exists>` |

---

## Robots.txt — Garantir acesso ao feed

Verificar que `/feed.xml` não está bloqueado no `robots.txt`:

```txt
# Em gonzagas_node/public/robots.txt
User-agent: *
Disallow: /admin/
Disallow: /api/
# Sem Disallow para /feed.xml

Sitemap: https://artnshine.pt/sitemap.xml
```

---

## Checklist de Implementação

- [ ] Conta Google Merchant Center criada
- [ ] Domínio `artnshine.pt` verificado no Merchant Center
- [ ] Ligação GA4 (`G-VYM82NFR22`) confirmada
- [ ] Endpoint `/feed.xml` implementado em `routes/seo.js`
- [ ] Feed testado localmente: `http://localhost:3000/feed.xml`
- [ ] Feed validado com [Feed Validator](https://validator.w3.org/feed/)
- [ ] Deploy para produção
- [ ] Feed submetido no Merchant Center
- [ ] "Buscar agora" executado
- [ ] Erros corrigidos (aguardar 24-48h)
- [ ] Produtos aprovados e visíveis no Merchant Center
- [ ] Monitorizar Search Console → Merchant listings

---

## Manutenção

- Feed atualiza automaticamente (diário) — novos produtos entram automaticamente
- Quando stock chega a 0: `availability` muda para `out of stock` automaticamente
- Quando price muda na DB: feed reflete na próxima sincronização

---

**Doc anterior:** `10-fase-c-urls-onpage.md`  
**Doc seguinte:** `12-fase-e-seo-local.md`
