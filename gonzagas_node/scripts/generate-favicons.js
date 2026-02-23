#!/usr/bin/env node
/**
 * Generate a complete favicon set from logo.svg.
 * Produces: favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png (180x180),
 * android-chrome-192x192.png, android-chrome-512x512.png, site.webmanifest.
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const LOGO_SVG = path.join(__dirname, '..', 'public', 'logo.svg');
const OUTPUT_DIR = path.join(__dirname, '..', 'public');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function generate() {
  for (const { name, size } of sizes) {
    const outPath = path.join(OUTPUT_DIR, name);
    await sharp(LOGO_SVG, { density: 300 })
      .resize(size, size, { fit: 'contain', background: { r: 5, g: 7, b: 10, alpha: 1 } })
      .png()
      .toFile(outPath);
    console.log(`  ${name} (${size}x${size})`);
  }

  const manifest = {
    name: "Gonzaga's Art & Shine",
    short_name: 'Art&Shine',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    theme_color: '#05070a',
    background_color: '#05070a',
    display: 'standalone'
  };

  const manifestPath = path.join(OUTPUT_DIR, 'site.webmanifest');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('  site.webmanifest');

  console.log('\nFavicon set generated successfully.');
}

generate().catch(err => {
  console.error('Failed to generate favicons:', err);
  process.exit(1);
});
