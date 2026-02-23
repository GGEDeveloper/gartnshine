#!/usr/bin/env node
/**
 * Generate branded OG image (1200x630) for social sharing.
 * Uses sharp to composite the logo on a dark branded background.
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'images', 'og-artnshine.jpg');
const LOGO_PATH = path.join(__dirname, '..', 'public', 'logo.svg');
const WIDTH = 1200;
const HEIGHT = 630;

async function generate() {
  const bgColor = { r: 5, g: 7, b: 10, alpha: 1 };  // matches --color-primary #05070a
  const accentColor = '#A8A8A8';

  const svgOverlay = Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0b1016;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#05070a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g)" />
      <!-- Decorative geometric lines -->
      <line x1="60" y1="200" x2="60" y2="430" stroke="${accentColor}" stroke-width="1" opacity="0.3" />
      <line x1="1140" y1="200" x2="1140" y2="430" stroke="${accentColor}" stroke-width="1" opacity="0.3" />
      <line x1="200" y1="530" x2="1000" y2="530" stroke="${accentColor}" stroke-width="0.5" opacity="0.2" />
      <!-- Brand name -->
      <text x="600" y="280" text-anchor="middle" font-family="serif" font-size="56" fill="#f4f6f8" letter-spacing="6">
        GONZAGA'S
      </text>
      <text x="600" y="340" text-anchor="middle" font-family="serif" font-size="40" fill="${accentColor}" letter-spacing="12">
        ART &amp; SHINE
      </text>
      <!-- Tagline -->
      <text x="600" y="420" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#C0C0C0" letter-spacing="2" font-style="italic">
        Elegância que nasce da terra
      </text>
      <!-- Subtle diamond accent -->
      <polygon points="600,470 607,480 600,490 593,480" fill="${accentColor}" opacity="0.4" />
      <!-- URL -->
      <text x="600" y="570" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#888888" letter-spacing="3">
        artnshine.pt
      </text>
    </svg>
  `);

  await sharp(svgOverlay)
    .jpeg({ quality: 92, progressive: true })
    .toFile(OUTPUT_PATH);

  const stats = fs.statSync(OUTPUT_PATH);
  console.log(`OG image generated: ${OUTPUT_PATH} (${Math.round(stats.size / 1024)}KB)`);
}

generate().catch(err => {
  console.error('Failed to generate OG image:', err);
  process.exit(1);
});
