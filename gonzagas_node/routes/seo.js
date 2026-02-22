const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// SITEMAP.XML DINÂMICO
router.get('/sitemap.xml', async (req, res) => {
    try {
        res.set({
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600' // Cache por 1 hora
        });

        const baseUrl = process.env.BASE_URL || process.env.PUBLIC_URL || 'https://artnshine.pt';

        // Get all active products
        const [products] = await pool.execute(`
            SELECT id, reference, updated_at
            FROM products
            WHERE is_active = 1
            ORDER BY updated_at DESC
        `);

        // Get product families
        const [families] = await pool.execute(`
            SELECT id, updated_at
            FROM product_families
            ORDER BY updated_at DESC
        `);

        // Build sitemap XML
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

        // Homepage
        sitemap += `
    <url>
        <loc>${baseUrl}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
        <lastmod>${new Date().toISOString()}</lastmod>
    </url>`;

        // Static pages
        const staticPages = [
            { path: '/catalog', priority: '0.9', changefreq: 'daily' },
            { path: '/about', priority: '0.5', changefreq: 'monthly' },
            { path: '/collections', priority: '0.7', changefreq: 'weekly' },
            { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
            { path: '/terms-of-service', priority: '0.3', changefreq: 'yearly' }
        ];

        staticPages.forEach(page => {
            sitemap += `
    <url>
        <loc>${baseUrl}${page.path}</loc>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
        });

        // Product pages
        for (const product of products) {
            const lastmod = new Date(product.updated_at).toISOString();
            sitemap += `
    <url>
        <loc>${baseUrl}/catalog/product/${product.id}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
        }

        // Family pages
        for (const family of families) {
            const lastmod = new Date(family.updated_at).toISOString();
            sitemap += `
    <url>
        <loc>${baseUrl}/catalog/family/${family.id}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
    </url>`;
        }

        sitemap += '\n</urlset>';

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
        'Cache-Control': 'public, max-age=86400' // Cache por 24 horas
    });

    const baseUrl = process.env.BASE_URL || process.env.PUBLIC_URL || 'https://artnshine.pt';

    const robots = `User-agent: *
Allow: /
Allow: /catalog
Allow: /about
Allow: /collections
Disallow: /admin/
Disallow: /api/
Disallow: /uploads/temp/
Crawl-delay: 1
Sitemap: ${baseUrl}/sitemap.xml`;

    res.send(robots);
});

module.exports = router;

