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
 *   /collections             → collections.ejs  (Galeria de Peças)
 *   /collection/:familyId    → collection.ejs
 *   /about                   → about.ejs
 *   /privacy-policy          → privacy-policy.ejs
 *   /terms-of-service        → terms-of-service.ejs
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { formatSitemapDate } = require('../utils/seo-helpers');

// SITEMAP.XML DINÂMICO
router.get('/sitemap.xml', async (req, res) => {
  try {
    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    });

    const baseUrl = process.env.BASE_URL || 'https://artnshine.pt';

    let products, families;
    try {
      [products] = await pool.execute(`
        SELECT 
          p.id, p.name, p.slug, p.reference, p.updated_at,
          (SELECT pi.image_filename 
           FROM product_images pi 
           WHERE pi.product_id = p.id AND pi.is_primary = 1 
           LIMIT 1) as main_image
        FROM products p
        WHERE p.is_active = 1
        ORDER BY p.updated_at DESC
      `);
    } catch (e) {
      if (e.message && e.message.includes("Unknown column 'slug'")) {
        [products] = await pool.execute(`
          SELECT 
            p.id, p.name, p.reference, p.updated_at,
            (SELECT pi.image_filename 
             FROM product_images pi 
             WHERE pi.product_id = p.id AND pi.is_primary = 1 
             LIMIT 1) as main_image
          FROM products p
          WHERE p.is_active = 1
          ORDER BY p.updated_at DESC
        `);
      } else throw e;
    }

    try {
      [families] = await pool.execute(`
        SELECT id, name, slug, updated_at
        FROM product_families
        ORDER BY updated_at DESC
      `);
    } catch (e) {
      if (e.message && e.message.includes("Unknown column 'slug'")) {
        [families] = await pool.execute(`
          SELECT id, name, updated_at
          FROM product_families
          ORDER BY updated_at DESC
        `);
      } else throw e;
    }

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
    <loc>${baseUrl}/collections</loc>
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

    // Coleções (/collection/:idOrSlug)
    for (const family of families) {
      const lastmod = formatSitemapDate(family.updated_at);
      const familyPath = family.slug || family.id;
      sitemap += `

  <!-- Coleção: ${family.name} -->
  <url>
    <loc>${baseUrl}/collection/${familyPath}</loc>
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
        const imageUrl = `${baseUrl}/uploads/products/${product.main_image}`;
        const imageTitle = product.name.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        sitemap += `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${imageTitle}</image:title>
      <image:caption>Gonzaga's Art &amp; Shine — ${imageTitle}</image:caption>
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
Allow: /collections
Allow: /collection/
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

    let products;
    try {
      [products] = await pool.execute(`
        SELECT 
          p.id, p.name, p.slug, p.reference, p.description,
          p.sale_price, p.current_stock, p.material, p.weight,
          pf.name as family_name,
          (SELECT pi.image_filename 
           FROM product_images pi 
           WHERE pi.product_id = p.id AND pi.is_primary = 1 
           LIMIT 1) as main_image
        FROM products p
        LEFT JOIN product_families pf ON p.family_id = pf.id
        WHERE p.is_active = 1
        ORDER BY p.id ASC
      `);
    } catch (feedErr) {
      if (feedErr.message && feedErr.message.includes("Unknown column 'slug'")) {
        [products] = await pool.execute(`
          SELECT 
            p.id, p.name, p.reference, p.description,
            p.sale_price, p.current_stock, p.material, p.weight,
            pf.name as family_name,
            (SELECT pi.image_filename 
             FROM product_images pi 
             WHERE pi.product_id = p.id AND pi.is_primary = 1 
             LIMIT 1) as main_image
          FROM products p
          LEFT JOIN product_families pf ON p.family_id = pf.id
          WHERE p.is_active = 1
          ORDER BY p.id ASC
        `);
      } else {
        throw feedErr;
      }
    }

    const escXml = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    let feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Gonzaga's Art &amp; Shine</title>
    <link>${baseUrl}</link>
    <description>Joias artesanais em prata 925 e pedras naturais. Elegância que nasce da terra.</description>`;

    for (const product of products) {
      const productPath = product.slug || product.id;
      const productUrl = `${baseUrl}/catalog/product/${productPath}`;
      const imageUrl = product.main_image
        ? `${baseUrl}/uploads/products/${product.main_image}`
        : `${baseUrl}/images/og-artnshine.jpg`;
      const price = product.sale_price ? parseFloat(product.sale_price).toFixed(2) : '0.00';
      const availability = product.current_stock > 0 ? 'in_stock' : 'out_of_stock';
      const desc = product.description
        ? escXml(product.description.substring(0, 5000))
        : escXml(`${product.name} — Joia artesanal Gonzaga's Art & Shine. ${product.material || 'Prata 925'} com pedras naturais.`);

      feed += `
    <item>
      <g:id>${escXml(product.reference || String(product.id))}</g:id>
      <title>${escXml(product.name)}</title>
      <description>${desc}</description>
      <link>${productUrl}</link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:price>${price} EUR</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Gonzaga's Art &amp; Shine</g:brand>
      <g:mpn>${escXml(product.reference || String(product.id))}</g:mpn>
      <g:product_type>${escXml(product.family_name || 'Joias')}</g:product_type>
      <g:google_product_category>188</g:google_product_category>
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
