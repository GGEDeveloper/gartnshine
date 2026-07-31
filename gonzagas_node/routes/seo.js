/**
 * SEO routes: sitemap.xml e robots.txt
 *
 * REGRA DE MANUTENÇÃO:
 * Só adicionar uma rota ao sitemap quando tiver route + view confirmados a retornar HTTP 200.
 *
 * ROTAS ATIVAS (sitemap completo):
 *   /                        → index.ejs
 *   /catalog                 → CatalogController
 *   /catalog/product/:id     → catalog/product-detail.ejs
 *   /galeria                 → collections.ejs  (Galeria de fotografias)
 *   /categoria/:slug         → category.ejs     (categoria da taxonomia)
 *   /colecoes                → curated-collections.ejs (índice de coleções)
 *   /colecao/:slug           → curated-collection.ejs (coleção curada)
 *
 * Categoria, coleção e galeria são três coisas distintas e cada uma tem o
 * seu endereço. /collection/:id e /collections são os endereços antigos e
 * fazem 301 — nunca devem voltar ao sitemap.
 *   /about                   → about.ejs
 *   /privacy-policy          → privacy-policy.ejs
 *   /terms-of-service        → terms-of-service.ejs
 */
const express = require('express');
const router = express.Router();
const brand = require('../config/brand');

/**
 * Escape de XML. Vive ao nível do módulo porque é precisa tanto no sitemap
 * como no feed do Merchant — estava declarada dentro da rota do feed e o
 * sitemap rebentava com ReferenceError ao tentar usá-la.
 */
const escXml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const Product = require('../models/Product');
const ProductFamily = require('../models/ProductFamily');
const Collection = require('../models/Collection');
const { formatSitemapDate } = require('../utils/seo-helpers');

// SITEMAP.XML DINÂMICO
router.get('/sitemap.xml', async (req, res) => {
  try {
    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    });

    const baseUrl = process.env.BASE_URL || 'https://artnshine.pt';

    const [products, families, curatedCollections] = await Promise.all([
      Product.getAllForSitemap(),
      ProductFamily.getAllForSitemap(),
      Collection.getActiveWithCounts()
    ]);

    const today = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Páginas estáticas (apenas views existentes) -->
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/colecoes</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/galeria</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/catalog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms-of-service</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>`;

    // Coleções curadas (/colecao/:slug)
    for (const col of curatedCollections) {
      sitemap += `

  <!-- Coleção curada: ${col.name} -->
  <url>
    <loc>${baseUrl}/colecao/${col.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    // Categorias (/categoria/:slug)
    for (const family of families) {
      const lastmod = formatSitemapDate(family.updated_at);
      const familyPath = family.slug || family.id;
      sitemap += `

  <!-- Categoria: ${family.name} -->
  <url>
    <loc>${baseUrl}/categoria/${familyPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    // Produtos (/catalog/product/:idOrSlug)
    for (const product of products) {
      const lastmod = formatSitemapDate(product.updated_at);
      const productPath = product.slug || product.id;
      const productUrl = `${baseUrl}/catalog/product/${productPath}`;

      sitemap += `

  <!-- Produto: ${product.name} -->
  <url>
    <loc>${productUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;

      if (product.main_image) {
        // As imagens vivem em /media/products/, não /uploads/ — este caminho
        // dava 404 em todas as imagens do sitemap. Usa a variante -medium,
        // como o feed do Merchant Center já fazia.
        const imageUrl = `${baseUrl}/media/products/${product.main_image.replace(/\.[^.]+$/, '')}-medium.jpg`;
        const imageTitle = product.name.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        sitemap += `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${imageTitle}</image:title>
      <image:caption>${escXml(brand.nomeSeo)} — ${imageTitle}</image:caption>
    </image:image>`;
      }

      sitemap += `
  </url>`;
    }

    sitemap += '\n\n</urlset>';

    res.send(sitemap);

  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
});

// ROBOTS.TXT
router.get('/robots.txt', (req, res) => {
  res.set({
    'Content-Type': 'text/plain',
    'Cache-Control': 'public, max-age=86400'
  });

  const baseUrl = process.env.BASE_URL || 'https://artnshine.pt';

  res.send(`User-agent: *
Allow: /
Allow: /catalog
Allow: /about
Allow: /galeria
Allow: /categoria/
Allow: /colecao/
Allow: /colecoes
Disallow: /admin/
Disallow: /api/
Disallow: /uploads/temp/
Disallow: /search?*
Crawl-delay: 1
Sitemap: ${baseUrl}/sitemap.xml`);
});

// GOOGLE MERCHANT CENTER PRODUCT FEED
router.get('/feed/products.xml', async (req, res) => {
  try {
    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    });

    const baseUrl = process.env.BASE_URL || 'https://artnshine.pt';

    const products = await Product.getAllForMerchantFeed();


    let feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escXml(brand.nomeSeo)}</title>
    <link>${baseUrl}</link>
    <description>Joias artesanais em prata 925 e pedras naturais. Elegância que nasce da terra.</description>`;

    const mediumImageUrl = (filename) =>
      `${baseUrl}/media/products/${filename.replace(/\.[^.]+$/, '')}-medium.jpg`;

    for (const product of products) {
      const productPath = product.slug || product.id;
      const productUrl = `${baseUrl}/catalog/product/${productPath}`;
      const imageUrl = product.main_image
        ? mediumImageUrl(product.main_image)
        : `${baseUrl}/images/og-artnshine.jpg`;
      const additionalImageUrl = product.secondary_image ? mediumImageUrl(product.secondary_image) : null;
      const price = product.sale_price ? parseFloat(product.sale_price).toFixed(2) : '0.00';
      const availability = product.current_stock > 0 ? 'in_stock' : 'out_of_stock';
      const desc = product.description
        ? escXml(product.description.substring(0, 5000))
        : escXml(`${product.name} — Joia artesanal ${brand.assinatura}. ${product.material || 'Prata 925'} com pedras naturais.`);

      const familyLower = (product.family_name || '').toLowerCase();
      const color = product.color
        || (familyLower.includes('latão') ? 'Dourado' : 'Prateado');

      feed += `
    <item>
      <g:id>${escXml(product.reference || String(product.id))}</g:id>
      <title>${escXml(product.name)}</title>
      <description>${desc}</description>
      <link>${productUrl}</link>
      <g:image_link>${imageUrl}</g:image_link>${additionalImageUrl ? `
      <g:additional_image_link>${additionalImageUrl}</g:additional_image_link>` : ''}
      <g:price>${price} EUR</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${escXml(brand.nomeSeo)}</g:brand>
      <g:mpn>${escXml(product.reference || String(product.id))}</g:mpn>
      <g:product_type>${escXml(product.family_name || 'Joias')}</g:product_type>
      <g:google_product_category>188</g:google_product_category>
      <g:color>${escXml(color)}</g:color>
      <g:gender>unisex</g:gender>
      <g:age_group>adult</g:age_group>
      <g:shipping>
        <g:country>PT</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 EUR</g:price>
      </g:shipping>
    </item>`;
    }

    feed += `
  </channel>
</rss>`;

    res.send(feed);

  } catch (error) {
    console.error('Product feed generation error:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><rss xmlns:g="http://base.google.com/ns/1.0" version="2.0"><channel></channel></rss>');
  }
});

module.exports = router;
