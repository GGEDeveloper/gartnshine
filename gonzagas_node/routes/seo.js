/**
 * SEO routes: sitemap.xml e robots.txt
 * REGRA: Só adicionar ao sitemap rotas cujas views existam (evitar 404/500).
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

    // Produtos ativos com nome e imagem principal
    const [products] = await pool.execute(`
      SELECT 
        p.id, 
        p.name, 
        p.reference,
        p.updated_at,
        (SELECT pi.image_filename 
         FROM product_images pi 
         WHERE pi.product_id = p.id AND pi.is_primary = 1 
         LIMIT 1) as main_image
      FROM products p
      WHERE p.is_active = 1
      ORDER BY p.updated_at DESC
    `);

    // Famílias/coleções com nome
    const [families] = await pool.execute(`
      SELECT id, name, updated_at
      FROM product_families
      ORDER BY updated_at DESC
    `);

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

    // Coleções (/collection/:id)
    for (const family of families) {
      const lastmod = formatSitemapDate(family.updated_at);
      sitemap += `

  <!-- Coleção: ${family.name} -->
  <url>
    <loc>${baseUrl}/collection/${family.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    // Produtos (/catalog/product/:id)
    for (const product of products) {
      const lastmod = formatSitemapDate(product.updated_at);
      const productUrl = `${baseUrl}/catalog/product/${product.id}`;

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
Crawl-delay: 1
Sitemap: ${baseUrl}/sitemap.xml`);
});

module.exports = router;
